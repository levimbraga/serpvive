import type { SupabaseClient } from "@supabase/supabase-js";

type CannibalizationResult = {
  query: string;
  pages: { pageId: string; url: string; clicks: number; position: number }[];
};

/**
 * Detects keyword cannibalization: 2+ pages ranking for the same top query.
 * Uses page_queries table to find shared queries across pages of the same site.
 */
export async function detectCannibalization(
  admin: SupabaseClient,
  siteId: string,
): Promise<CannibalizationResult[]> {
  // Get all pages for this site
  const { data: pages } = await admin
    .from("pages")
    .select("id, url, primary_keyword")
    .eq("site_id", siteId)
    .neq("status", "redirected");

  if (!pages || pages.length === 0) return [];

  const pageIds = pages.map((p) => p.id);

  // Get top queries for each page (aggregate across dates)
  const { data: queries } = await admin
    .from("page_queries")
    .select("page_id, query, clicks, position")
    .in("page_id", pageIds)
    .order("clicks", { ascending: false });

  if (!queries || queries.length === 0) return [];

  // Aggregate clicks per page+query
  const queryMap = new Map<string, Map<string, { clicks: number; position: number }>>();

  for (const q of queries) {
    if (!queryMap.has(q.query)) {
      queryMap.set(q.query, new Map());
    }
    const pageMap = queryMap.get(q.query)!;
    const existing = pageMap.get(q.page_id);
    if (existing) {
      existing.clicks += q.clicks;
    } else {
      pageMap.set(q.page_id, { clicks: q.clicks, position: q.position });
    }
  }

  // Find queries with 2+ pages
  const pageUrlMap = new Map(pages.map((p) => [p.id, p.url]));
  const results: CannibalizationResult[] = [];

  for (const [query, pageMap] of queryMap) {
    if (pageMap.size >= 2) {
      results.push({
        query,
        pages: Array.from(pageMap.entries()).map(([pageId, data]) => ({
          pageId,
          url: pageUrlMap.get(pageId) ?? "",
          clicks: data.clicks,
          position: data.position,
        })),
      });
    }
  }

  // Sort by number of conflicting pages (most first), then by total clicks
  return results.sort((a, b) => {
    if (b.pages.length !== a.pages.length) return b.pages.length - a.pages.length;
    const aClicks = a.pages.reduce((s, p) => s + p.clicks, 0);
    const bClicks = b.pages.reduce((s, p) => s + p.clicks, 0);
    return bClicks - aClicks;
  });
}
