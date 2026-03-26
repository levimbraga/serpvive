import Firecrawl from "@mendable/firecrawl-js";
import {
  fetchPageContent as fetchWithCheerio,
  formatContentForPrompt as formatCheerioContent,
  type PageContent,
} from "@/lib/serp/fetcher";

// ── Firecrawl client (lazy init, only if API key is set) ──

let firecrawlClient: InstanceType<typeof Firecrawl> | null = null;
let firecrawlKeyWarningLogged = false;

function getFirecrawl(): InstanceType<typeof Firecrawl> | null {
  if (!process.env.FIRECRAWL_API_KEY) {
    if (!firecrawlKeyWarningLogged) {
      console.warn("[firecrawl-fetcher] No FIRECRAWL_API_KEY set, all fetches will use Cheerio fallback");
      firecrawlKeyWarningLogged = true;
    }
    return null;
  }
  if (!firecrawlClient) {
    firecrawlClient = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
  }
  return firecrawlClient;
}

// ── Types ──

export type FetchedPage = PageContent & {
  markdown: string;
};

// ── Single URL fetch ──

/**
 * Fetch a single URL using Firecrawl (JS-rendered markdown).
 * Falls back to Cheerio if Firecrawl is unavailable or fails.
 */
export async function fetchPage(
  url: string,
  options?: { ssrfProtection?: boolean },
): Promise<FetchedPage | null> {
  const fc = getFirecrawl();

  // No Firecrawl: use Cheerio
  if (!fc) {
    return cheerioFallback(url, options);
  }

  // Demo (SSRF-protected) URLs still go through Firecrawl —
  // Firecrawl fetches from their servers, not ours, so SSRF is not a risk.
  // The URL validation (format, HTTPS, no private IPs) is done by the caller.

  try {
    const result = await fc.scrape(url, {
      formats: ["markdown"],
      onlyMainContent: true,
      timeout: 30000,
    });

    const markdown = result.markdown;
    if (!markdown || markdown.trim().length < 200) {
      console.warn(`[firecrawl-fetcher] ${url} — Firecrawl returned insufficient content (${markdown?.length ?? 0} chars), falling back to Cheerio`);
      return cheerioFallback(url, options);
    }

    const metadata = result.metadata ?? {};
    const headings = extractHeadingsFromMarkdown(markdown);
    const wordCount = markdown.split(/\s+/).filter(Boolean).length;
    const links = extractLinksFromMarkdown(markdown, url);
    const tables = extractTablesFromMarkdown(markdown);
    const images = extractImageAltsFromMarkdown(markdown);

    console.log(`[firecrawl-fetcher] ${url} — Firecrawl: ${wordCount} words, ${headings.length} headings`);

    return {
      title: metadata.title ?? "",
      metaDescription: metadata.description ?? "",
      headings,
      bodyText: markdown.slice(0, 15_000),
      wordCount,
      publishedDate: metadata.publishedTime ?? null,
      lastModified: metadata.modifiedTime ?? null,
      imageAltTexts: images.slice(0, 50),
      internalLinks: links.internal.slice(0, 50),
      externalLinks: links.external.slice(0, 50),
      tables: tables.slice(0, 10),
      markdown,
    };
  } catch (error) {
    console.error(`[firecrawl-fetcher] ${url} — Firecrawl error, falling back to Cheerio:`, error);
    return cheerioFallback(url, options);
  }
}

// ── Batch fetch ──

/**
 * Fetch multiple URLs using Firecrawl batch scrape.
 * Falls back to individual Cheerio fetches if batch fails.
 */
export async function batchFetch(urls: string[]): Promise<(FetchedPage | null)[]> {
  if (urls.length === 0) return [];

  const fc = getFirecrawl();
  if (!fc) {
    return Promise.all(urls.map((u) => cheerioFallback(u)));
  }

  try {
    const job = await fc.batchScrape(urls, {
      options: { formats: ["markdown"], onlyMainContent: true, timeout: 60000 },
    });

    if (!job.data || job.data.length === 0) {
      console.warn("[firecrawl-fetcher] Batch scrape returned no data, falling back to Cheerio");
      return Promise.all(urls.map((u) => cheerioFallback(u)));
    }

    // Map results back to the original URL order
    const results: (FetchedPage | null)[] = [];
    for (let i = 0; i < urls.length; i++) {
      const docUrl = urls[i] as string;
      const doc = job.data[i];
      const markdown = doc?.markdown;

      if (!markdown || markdown.trim().length < 200) {
        console.warn(`[firecrawl-fetcher] ${docUrl} — batch: insufficient content, will use Cheerio`);
        results.push(null);
        continue;
      }

      const metadata = doc.metadata ?? {};
      const headings = extractHeadingsFromMarkdown(markdown);
      const wordCount = markdown.split(/\s+/).filter(Boolean).length;
      const links = extractLinksFromMarkdown(markdown, docUrl);
      const tables = extractTablesFromMarkdown(markdown);
      const images = extractImageAltsFromMarkdown(markdown);

      console.log(`[firecrawl-fetcher] ${docUrl} — Firecrawl batch: ${wordCount} words`);

      results.push({
        title: metadata.title ?? "",
        metaDescription: metadata.description ?? "",
        headings,
        bodyText: markdown.slice(0, 15_000),
        wordCount,
        publishedDate: metadata.publishedTime ?? null,
        lastModified: metadata.modifiedTime ?? null,
        imageAltTexts: images.slice(0, 50),
        internalLinks: links.internal.slice(0, 50),
        externalLinks: links.external.slice(0, 50),
        tables: tables.slice(0, 10),
        markdown,
      });
    }
    return results;
  } catch (error) {
    console.error("[firecrawl-fetcher] Batch scrape failed, falling back to Cheerio:", error);
    return Promise.all(urls.map((u) => cheerioFallback(u)));
  }
}

// ── Format for AI prompt ──

/**
 * Formats a FetchedPage into a string for the AI prompt.
 * Delegates to the existing Cheerio formatter for consistent structure.
 */
export function formatPageForPrompt(page: FetchedPage | null, url: string): string {
  if (!page) return `[Failed to fetch content from ${url}]`;
  return formatCheerioContent(page, url);
}

// ── Markdown extraction helpers ──

function extractHeadingsFromMarkdown(markdown: string): { level: string; text: string }[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: { level: string; text: string }[] = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const hashes = match[1]!;
    const text = match[2]!;
    headings.push({ level: `h${hashes.length}`, text: text.trim() });
  }
  return headings;
}

function extractLinksFromMarkdown(
  markdown: string,
  pageUrl: string,
): { internal: { text: string; href: string }[]; external: { text: string; href: string }[] } {
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  const internal: { text: string; href: string }[] = [];
  const external: { text: string; href: string }[] = [];
  let match;

  let domain: string;
  try {
    domain = new URL(pageUrl).hostname;
  } catch {
    domain = "";
  }

  while ((match = linkRegex.exec(markdown)) !== null) {
    const text = (match[1] ?? "").slice(0, 200);
    const href = match[2] ?? "";
    try {
      const linkUrl = new URL(href, pageUrl);
      if (linkUrl.hostname === domain) {
        internal.push({ text, href: linkUrl.href });
      } else {
        external.push({ text, href: linkUrl.href });
      }
    } catch {
      if (text) internal.push({ text, href });
    }
  }
  return { internal, external };
}

function extractTablesFromMarkdown(markdown: string): { headers: string[]; rows: string[][] }[] {
  const tableRegex = /(\|.+\|\n\|[-:| ]+\|\n(?:\|.+\|\n?)+)/g;
  const tables: { headers: string[]; rows: string[][] }[] = [];
  let match;

  while ((match = tableRegex.exec(markdown)) !== null) {
    const lines = match[0].trim().split("\n");
    if (lines.length < 2) continue;

    const headers = (lines[0] ?? "").split("|").map((s) => s.trim()).filter(Boolean);
    const rows = lines.slice(2).map((line) =>
      line.split("|").map((s) => s.trim()).filter(Boolean)
    ).slice(0, 20);

    if (headers.length > 0) {
      tables.push({ headers, rows });
    }
  }
  return tables;
}

function extractImageAltsFromMarkdown(markdown: string): string[] {
  const imgRegex = /!\[([^\]]*)\]/g;
  const alts: string[] = [];
  let match;
  while ((match = imgRegex.exec(markdown)) !== null) {
    if (match[1]) alts.push(match[1]);
  }
  return alts;
}

// ── Cheerio fallback ──

async function cheerioFallback(
  url: string,
  options?: { ssrfProtection?: boolean },
): Promise<FetchedPage | null> {
  console.log(`[firecrawl-fetcher] ${url} — Cheerio fallback`);
  const result = await fetchWithCheerio(url, options);
  if (!result) return null;
  return {
    ...result,
    markdown: result.bodyText,
  };
}
