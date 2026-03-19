import { z } from "zod";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GSC_API_BASE = "https://www.googleapis.com/webmasters/v3";
const SEARCH_ANALYTICS_URL = "https://searchconsole.googleapis.com/webmasters/v3";

const clientId = process.env.GOOGLE_CLIENT_ID!;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;

// ── Token Management ──

type TokenResult = {
  access_token: string;
  expires_in: number;
};

export async function refreshAccessToken(refreshToken: string): Promise<TokenResult> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as TokenResult;
  return data;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Code exchange failed (${res.status}): ${body}`);
  }

  return (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
  };
}

// ── GSC API Calls ──

async function gscFetch(accessToken: string, url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    throw new Error("GSC_TOKEN_EXPIRED");
  }

  if (res.status === 403) {
    const body = await res.text();
    if (body.includes("quota")) {
      throw new Error("GSC_QUOTA_EXCEEDED");
    }
    throw new Error(`GSC access forbidden: ${body}`);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GSC API error (${res.status}): ${body}`);
  }

  return res.json();
}

// ── Property Schema ──

const SiteEntrySchema = z.object({
  siteUrl: z.string(),
  permissionLevel: z.string(),
});

export type GscProperty = {
  siteUrl: string;
  permissionLevel: string;
  type: "domain" | "url_prefix";
  displayName: string;
};

export async function listProperties(accessToken: string): Promise<GscProperty[]> {
  const data = (await gscFetch(accessToken, `${GSC_API_BASE}/sites`)) as {
    siteEntry?: unknown[];
  };

  const entries = z.array(SiteEntrySchema).parse(data.siteEntry ?? []);

  // Filter out unverified sites — they return no data from Search Analytics
  return entries
    .filter((entry) => entry.permissionLevel !== "siteUnverifiedUser")
    .map((entry) => ({
      siteUrl: entry.siteUrl,
      permissionLevel: entry.permissionLevel,
      type: entry.siteUrl.startsWith("sc-domain:") ? "domain" : "url_prefix",
      displayName: entry.siteUrl.replace("sc-domain:", "").replace(/\/$/, ""),
    }));
}

// ── Search Analytics ──

export type SearchAnalyticsRow = {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type QueryRow = {
  page: string;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export async function getSearchAnalyticsByPage(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  rowLimit = 5000
): Promise<SearchAnalyticsRow[]> {
  const data = (await gscFetch(
    accessToken,
    `${SEARCH_ANALYTICS_URL}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ["page"],
        rowLimit,
        dataState: "final",
      }),
    }
  )) as { rows?: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[] };

  return (data.rows ?? []).map((row) => ({
    page: row.keys[0]!,
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));
}

export async function getSearchAnalyticsByPageAndDate(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  rowLimit = 25000
): Promise<{ page: string; date: string; clicks: number; impressions: number; ctr: number; position: number }[]> {
  const data = (await gscFetch(
    accessToken,
    `${SEARCH_ANALYTICS_URL}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ["page", "date"],
        rowLimit,
        dataState: "final",
      }),
    }
  )) as { rows?: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[] };

  return (data.rows ?? []).map((row) => ({
    page: row.keys[0]!,
    date: row.keys[1]!,
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));
}

export async function getTopQueriesByPage(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  rowLimit = 25000
): Promise<QueryRow[]> {
  const data = (await gscFetch(
    accessToken,
    `${SEARCH_ANALYTICS_URL}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ["page", "query"],
        rowLimit,
        dataState: "final",
      }),
    }
  )) as { rows?: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[] };

  return (data.rows ?? []).map((row) => ({
    page: row.keys[0]!,
    query: row.keys[1]!,
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));
}
