import * as cheerio from "cheerio";
import { safeFetchHtml } from "@/lib/url-validator";

export type LinkInfo = {
  text: string;
  href: string;
};

export type TableData = {
  headers: string[];
  rows: string[][];
};

export type PageContent = {
  title: string;
  metaDescription: string;
  headings: { level: string; text: string }[];
  bodyText: string;
  publishedDate: string | null;
  lastModified: string | null;
  wordCount: number;
  imageAltTexts: string[];
  internalLinks: LinkInfo[];
  externalLinks: LinkInfo[];
  tables: TableData[];
  statusCode?: number;
};

/**
 * Fetches a URL and extracts structured content using Cheerio.
 * When ssrfProtection is true, uses safeFetchHtml (SSRF-safe redirect
 * following, DNS checks, 10s timeout, 5MB limit, HTML-only) and
 * propagates errors to the caller instead of returning null.
 */
export async function fetchPageContent(
  url: string,
  options?: { ssrfProtection?: boolean },
): Promise<PageContent | null> {
  try {
    let html: string;

    if (options?.ssrfProtection) {
      html = await safeFetchHtml(url);
    } else {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; SerpVive/1.0; +https://serpvive.com)",
          "Accept": "text/html",
        },
      });

      clearTimeout(timeout);

      if (!res.ok) return null;

      html = await res.text();
    }
    console.log(`[fetcher] ${url} raw HTML: ${html.length} chars`);
    const $ = cheerio.load(html);

    // Extract structured data (JSON-LD) before removing <script> tags
    let jsonLdPublished: string | null = null;
    let jsonLdModified: string | null = null;
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const raw = $(el).text();
        const data = JSON.parse(raw) as Record<string, unknown>;
        if (data.datePublished && typeof data.datePublished === "string") {
          jsonLdPublished = data.datePublished;
        }
        if (data.dateModified && typeof data.dateModified === "string") {
          jsonLdModified = data.dateModified;
        }
      } catch {
        // ignore malformed JSON-LD
      }
    });

    // Remove dangerous/hidden elements (prompt injection defense)
    $("script, style, noscript, iframe, object, embed, svg, nav, footer, header, aside, [role='navigation']").remove();
    $('[style*="display:none"], [style*="display: none"]').remove();
    $('[style*="visibility:hidden"], [style*="visibility: hidden"]').remove();
    $("[hidden]").remove();

    // Remove HTML comments (can contain hidden instructions)
    $("*")
      .contents()
      .filter(function () {
        return this.type === "comment";
      })
      .remove();

    // Remove event handler attributes
    $("*").each(function () {
      const el = $(this);
      const attrs = el.attr();
      if (attrs) {
        Object.keys(attrs).forEach((attr) => {
          if (attr.startsWith("on")) el.removeAttr(attr);
        });
      }
    });

    const title = $("title").text().trim() ||
      $("h1").first().text().trim() ||
      "";

    const metaDescription = $('meta[name="description"]').attr("content")?.trim() ?? "";

    // Extract all headings (h1-h6)
    const headings: { level: string; text: string }[] = [];
    $("h1, h2, h3, h4, h5, h6").each((_, el) => {
      const text = $(el).text().trim();
      if (text) {
        headings.push({ level: el.tagName.toLowerCase(), text });
      }
    });

    // Extract image alt texts
    const imageAltTexts: string[] = [];
    $("img").each((_, el) => {
      const alt = $(el).attr("alt")?.trim();
      if (alt) imageAltTexts.push(alt);
    });

    // Extract links (internal vs external)
    const pageHostname = new URL(url).hostname;
    const internalLinks: LinkInfo[] = [];
    const externalLinks: LinkInfo[] = [];
    $("a[href]").each((_, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr("href") ?? "";
      if (!text || !href || href.startsWith("#") || href.startsWith("javascript:")) return;

      try {
        const linkUrl = new URL(href, url);
        const info = { text: text.slice(0, 200), href: linkUrl.href };
        if (linkUrl.hostname === pageHostname) {
          internalLinks.push(info);
        } else {
          externalLinks.push(info);
        }
      } catch {
        // relative link without valid base
        if (text) internalLinks.push({ text: text.slice(0, 200), href });
      }
    });

    // Extract tables
    const tables: TableData[] = [];
    $("table").each((_, tableEl) => {
      const headers: string[] = [];
      $(tableEl).find("thead th, thead td, tr:first-child th").each((_, th) => {
        headers.push($(th).text().trim());
      });

      const rows: string[][] = [];
      const rowSelector = headers.length > 0 ? "tbody tr, tr:not(:first-child)" : "tr";
      $(tableEl).find(rowSelector).each((_, tr) => {
        const cells: string[] = [];
        $(tr).find("td, th").each((_, td) => {
          cells.push($(td).text().trim());
        });
        if (cells.length > 0) rows.push(cells);
      });

      if (headers.length > 0 || rows.length > 0) {
        tables.push({ headers, rows: rows.slice(0, 20) }); // limit rows
      }
    });

    // Remove head for body text extraction
    $("head").remove();

    // Extract body text — calculate word count from full text, then truncate for prompt
    const fullBodyText = $("body").text()
      .replace(/\s+/g, " ")
      .trim();

    const wordCount = fullBodyText.split(/\s+/).filter(Boolean).length;
    const bodyText = fullBodyText.slice(0, 15_000);

    // Try to find published date (multiple sources)
    const publishedDate =
      $('meta[property="article:published_time"]').attr("content") ??
      $('meta[name="date"]').attr("content") ??
      $('time[datetime]').first().attr("datetime") ??
      jsonLdPublished ??
      null;

    const lastModified =
      $('meta[property="article:modified_time"]').attr("content") ??
      $('meta[name="last-modified"]').attr("content") ??
      jsonLdModified ??
      null;

    return {
      title,
      metaDescription,
      headings,
      bodyText,
      publishedDate,
      lastModified,
      wordCount,
      imageAltTexts: imageAltTexts.slice(0, 50),
      internalLinks: internalLinks.slice(0, 50),
      externalLinks: externalLinks.slice(0, 50),
      tables: tables.slice(0, 10),
    };
  } catch (err) {
    // Propagate descriptive errors from SSRF-safe fetch to the caller
    if (options?.ssrfProtection) throw err;
    return null;
  }
}

/**
 * Formats page content into a string for the AI prompt.
 * Compact format: saves ~700 tokens per page vs verbose format.
 */
export function formatContentForPrompt(content: PageContent | null, url: string): string {
  if (!content) return `[Failed to fetch content from ${url}]`;

  // Change 6: Explicit missing data
  const pubLine = content.publishedDate
    ? `Published: ${content.publishedDate}`
    : "Published: not detected (no meta tag found)";
  const modLine = content.lastModified
    ? `Last modified: ${content.lastModified}`
    : "Last modified: not detected (no meta tag found)";
  const wcLine = content.wordCount < 100
    ? `Word count: ${content.wordCount} (possibly incomplete extraction)`
    : `Word count: ${content.wordCount}`;

  const parts = [
    `URL: ${url}`,
    `Title: ${content.title}`,
    `Meta: ${content.metaDescription}`,
    pubLine,
    modLine,
    wcLine,
  ];

  // Change 7: StatusCode when abnormal
  if (content.statusCode && content.statusCode !== 200) {
    parts.push(`HTTP Status: ${content.statusCode} (not a normal 200 response)`);
  }

  // Change 4: Compact headings — grouped by level
  if (content.headings.length > 0) {
    const byLevel: Record<string, string[]> = {};
    for (const h of content.headings) {
      const lvl = h.level.toUpperCase();
      if (!byLevel[lvl]) byLevel[lvl] = [];
      byLevel[lvl].push(h.text);
    }
    const levelCounts = Object.entries(byLevel)
      .map(([lvl, texts]) => `${texts.length}x${lvl}`)
      .join(", ");
    parts.push("", `HEADINGS (${content.headings.length} total — ${levelCounts}):`);
    for (const [lvl, texts] of Object.entries(byLevel)) {
      if (texts.length === 1) {
        parts.push(`  ${lvl}: ${texts[0]}`);
      } else {
        parts.push(`  ${lvl}: ${texts.join(" | ")}`);
      }
    }
  }

  if (content.imageAltTexts.length > 0) {
    parts.push("", `IMAGE_ALT_TEXTS (${content.imageAltTexts.length}): ${content.imageAltTexts.slice(0, 15).join(", ")}`);
  }

  // Change 3: Compact links — counts + paths/domains only
  const intCount = content.internalLinks.length;
  const extCount = content.externalLinks.length;
  if (intCount > 0 || extCount > 0) {
    parts.push("", `LINKS: ${intCount} internal, ${extCount} external`);
    if (intCount > 0) {
      const paths = content.internalLinks.slice(0, 10).map((l) => {
        try { return new URL(l.href).pathname; } catch { return l.href; }
      });
      parts.push(`  Internal (top ${Math.min(intCount, 10)}): ${paths.join(", ")}`);
    }
    if (extCount > 0) {
      const domains = content.externalLinks.slice(0, 5).map((l) => {
        try { return new URL(l.href).hostname.replace("www.", ""); } catch { return l.href; }
      });
      parts.push(`  External (top ${Math.min(extCount, 5)}): ${domains.join(", ")}`);
    }
  }

  if (content.tables.length > 0) {
    parts.push("", `TABLES (${content.tables.length}):`);
    content.tables.slice(0, 3).forEach((t, i) => {
      parts.push(`  Table ${i + 1}:`);
      if (t.headers.length > 0) parts.push(`  Headers: ${t.headers.join(" | ")}`);
      t.rows.slice(0, 5).forEach((r) => {
        parts.push(`  Row: ${r.join(" | ")}`);
      });
    });
  }

  // Change 1: Signal markdown structure
  parts.push("", "BODY (content preserves original heading structure in markdown — ## = H2, ### = H3):", content.bodyText);

  return parts.join("\n");
}
