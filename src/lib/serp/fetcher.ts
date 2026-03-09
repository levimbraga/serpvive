import * as cheerio from "cheerio";

export type PageContent = {
  title: string;
  metaDescription: string;
  headings: { level: string; text: string }[];
  bodyText: string;
  publishedDate: string | null;
  lastModified: string | null;
  wordCount: number;
};

/**
 * Fetches a URL and extracts structured content using Cheerio.
 * Timeout: 5 seconds. Returns null if fetch fails (403, timeout, etc).
 */
export async function fetchPageContent(url: string): Promise<PageContent | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SerpVive/1.0; +https://serpvive.com)",
        "Accept": "text/html",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, nav, footer
    $("script, style, nav, footer, header, aside, [role='navigation']").remove();

    const title = $("title").text().trim() ||
      $("h1").first().text().trim() ||
      "";

    const metaDescription = $('meta[name="description"]').attr("content")?.trim() ?? "";

    const headings: { level: string; text: string }[] = [];
    $("h1, h2, h3").each((_, el) => {
      const text = $(el).text().trim();
      if (text) {
        headings.push({ level: el.tagName.toLowerCase(), text });
      }
    });

    // Extract body text, truncate to 3000 chars
    const bodyText = $("body").text()
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3000);

    const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

    // Try to find published date
    const publishedDate =
      $('meta[property="article:published_time"]').attr("content") ??
      $('meta[name="date"]').attr("content") ??
      $('time[datetime]').first().attr("datetime") ??
      null;

    const lastModified =
      $('meta[property="article:modified_time"]').attr("content") ??
      $('meta[name="last-modified"]').attr("content") ??
      null;

    return {
      title,
      metaDescription,
      headings,
      bodyText,
      publishedDate,
      lastModified,
      wordCount,
    };
  } catch {
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

  return `URL: ${url}
Title: ${content.title}
Meta: ${content.metaDescription}
Published: ${content.publishedDate ?? "unknown"}
Last Modified: ${content.lastModified ?? "unknown"}
Word Count: ${content.wordCount}

HEADINGS:
${headingsStr}

BODY (truncated):
${content.bodyText}`;
}
