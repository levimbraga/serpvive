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
 */
export function formatContentForPrompt(content: PageContent | null, url: string): string {
  if (!content) return `[Failed to fetch content from ${url}]`;

  const headingsStr = content.headings
    .map((h) => `${h.level.toUpperCase()}: ${h.text}`)
    .join("\n");

  const parts = [
    `URL: ${url}`,
    `Title: ${content.title}`,
    `Meta: ${content.metaDescription}`,
    `Published: ${content.publishedDate ?? "unknown"}`,
    `Last Modified: ${content.lastModified ?? "unknown"}`,
    `Word Count: ${content.wordCount}`,
    "",
    "HEADINGS:",
    headingsStr,
  ];

  if (content.imageAltTexts.length > 0) {
    parts.push("", "IMAGE_ALT_TEXTS:", content.imageAltTexts.join(", "));
  }

  if (content.internalLinks.length > 0) {
    parts.push("", `INTERNAL_LINKS (${content.internalLinks.length}):`);
    content.internalLinks.slice(0, 20).forEach((l) => {
      parts.push(`  "${l.text}" → ${l.href}`);
    });
  }

  if (content.externalLinks.length > 0) {
    parts.push("", `EXTERNAL_LINKS (${content.externalLinks.length}):`);
    content.externalLinks.slice(0, 10).forEach((l) => {
      parts.push(`  "${l.text}" → ${l.href}`);
    });
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

  parts.push("", "BODY (truncated):", content.bodyText);

  return parts.join("\n");
}
