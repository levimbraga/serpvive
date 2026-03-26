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

// ── Timeout wrapper ──

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`[Timeout] ${label} exceeded ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

// ── Exclude tags: strip noise from main content area ──

const EXCLUDE_TAGS = [
  // Comments
  ".comments", "#comments", ".comment-section", "#disqus_thread",
  ".disqus-comment-count", ".comment-list", ".comment-form",
  // Related/recommended
  ".related-posts", ".recommended", ".you-may-also-like",
  ".more-stories", ".suggested-posts", ".related-articles",
  // Newsletter/popups
  ".newsletter", ".subscribe", ".popup", ".modal", ".overlay",
  ".newsletter-signup", ".subscribe-form", ".email-signup",
  // Social sharing
  ".social-share", ".share-buttons", ".sharing", ".share-bar",
  ".social-links", ".share-icons",
  // Author bio
  ".author-bio", ".author-box", ".about-author", ".author-info",
  // Navigation
  ".breadcrumb", ".breadcrumbs",
  // Ads
  ".ad", ".ads", ".advertisement", ".sponsored",
  ".ad-container", ".ad-wrapper", ".adsbygoogle",
  // Cookie/consent banners
  ".cookie-banner", ".cookie-notice", ".consent-banner",
  ".cookie-consent", ".gdpr-banner",
  // Table of contents
  ".toc", ".table-of-contents", ".toc-container",
  // Sidebar widgets
  ".widget", ".sidebar-widget",
];

// ── Types ──

export type FetchedPage = PageContent & {
  markdown: string;
  fetchMethod: "firecrawl" | "cheerio";
};

export type FetchOptions = {
  ssrfProtection?: boolean;
  forceRefresh?: boolean;
  timeout?: number;
};

// ── Single URL fetch ──

/**
 * Fetch a single URL using Firecrawl (JS-rendered markdown).
 * Falls back to Cheerio if Firecrawl is unavailable, fails, or times out.
 *
 * @param options.forceRefresh  Bypass Firecrawl cache (maxAge: 0). Use for user's own page.
 * @param options.timeout       Firecrawl timeout in ms (default 30000). Use 15000 for competitors.
 */
export async function fetchPage(
  url: string,
  options?: FetchOptions,
): Promise<FetchedPage | null> {
  const fc = getFirecrawl();

  if (!fc) {
    return cheerioFallback(url, options);
  }

  const scrapeTimeout = options?.timeout ?? 30000;

  try {
    const result = await withTimeout(
      fc.scrape(url, {
        formats: ["markdown", "links"],
        onlyMainContent: true,
        excludeTags: EXCLUDE_TAGS,
        removeBase64Images: true,
        blockAds: true,
        timeout: scrapeTimeout,
        ...(options?.forceRefresh ? { maxAge: 0 } : {}),
      }),
      scrapeTimeout + 5000, // 5s grace over Firecrawl's internal timeout
      `Firecrawl ${url}`,
    );

    const markdown = result.markdown;
    if (!markdown || markdown.trim().length < 200) {
      console.warn(`[firecrawl-fetcher] ${url} — Firecrawl returned insufficient content (${markdown?.length ?? 0} chars), falling back to Cheerio`);
      return cheerioFallback(url, options);
    }

    const metadata = result.metadata ?? {};
    const nativeLinks = result.links ?? [];
    const headings = extractHeadingsFromMarkdown(markdown);
    const wordCount = markdown.split(/\s+/).filter(Boolean).length;
    const links = splitLinks(nativeLinks, url);
    const tables = extractTablesFromMarkdown(markdown);
    const images = extractImageAltsFromMarkdown(markdown);

    const cacheHit = options?.forceRefresh ? "" : (metadata.cacheState === "hit" ? " (cache hit)" : "");
    console.log(`[firecrawl-fetcher] ${url} — Firecrawl: ${wordCount} words, ${headings.length} headings, ${nativeLinks.length} links${cacheHit}`);

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
      statusCode: metadata.statusCode,
      markdown,
      fetchMethod: "firecrawl",
    };
  } catch (error) {
    console.error(`[firecrawl-fetcher] ${url} — Firecrawl error, falling back to Cheerio:`, error);
    return cheerioFallback(url, options);
  }
}

// ── Parallel fetch (competitors) ──

/**
 * Fetch multiple competitor URLs in parallel with shorter timeout.
 * Each URL is independent — if one fails, others still return.
 * Uses Firecrawl's default cache (2-day) and 15s timeout.
 */
export async function fetchCompetitors(urls: string[]): Promise<(FetchedPage | null)[]> {
  if (urls.length === 0) return [];

  const results = await Promise.allSettled(
    urls.map((u) => fetchPage(u, { timeout: 15000 })),
  );

  return results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    console.error(`[firecrawl-fetcher] ${urls[i]} — competitor fetch rejected:`, r.reason);
    return null;
  });
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

// ── Link splitting from Firecrawl native links ──

function splitLinks(
  links: string[],
  pageUrl: string,
): { internal: { text: string; href: string }[]; external: { text: string; href: string }[] } {
  const internal: { text: string; href: string }[] = [];
  const external: { text: string; href: string }[] = [];

  let pageDomain: string;
  try {
    pageDomain = new URL(pageUrl).hostname.replace("www.", "");
  } catch {
    pageDomain = "";
  }

  for (const link of links) {
    try {
      const linkUrl = new URL(link);
      const linkDomain = linkUrl.hostname.replace("www.", "");
      const entry = { text: "", href: linkUrl.href };
      if (linkDomain === pageDomain) {
        internal.push(entry);
      } else {
        external.push(entry);
      }
    } catch {
      internal.push({ text: "", href: link });
    }
  }

  return { internal, external };
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
  options?: FetchOptions,
): Promise<FetchedPage | null> {
  console.log(`[firecrawl-fetcher] ${url} — Cheerio fallback`);
  const result = await fetchWithCheerio(url, options?.ssrfProtection ? { ssrfProtection: true } : undefined);
  if (!result) return null;
  return {
    ...result,
    markdown: result.bodyText,
    fetchMethod: "cheerio",
  };
}
