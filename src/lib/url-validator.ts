import { lookup } from "dns/promises";

// ── Private IP detection ──

const PRIVATE_IPV4 = [
  /^127\./, // loopback
  /^10\./, // Class A private
  /^172\.(1[6-9]|2\d|3[01])\./, // Class B private
  /^192\.168\./, // Class C private
  /^0\./, // "this" network
  /^169\.254\./, // link-local
];

const PRIVATE_IPV6 = [
  /^::1$/, // loopback
  /^fc00:/i, // unique local
  /^fd/i, // unique local
  /^fe80:/i, // link-local
];

function isPrivateIp(ip: string): boolean {
  // IPv4-mapped IPv6 (::ffff:x.x.x.x)
  if (ip.startsWith("::ffff:")) {
    const ipv4 = ip.slice(7);
    return PRIVATE_IPV4.some((r) => r.test(ipv4));
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    return PRIVATE_IPV4.some((r) => r.test(ip));
  }

  return PRIVATE_IPV6.some((r) => r.test(ip));
}

// ── URL format validation ──

export type UrlValidationResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Validates a user-supplied URL: format, HTTPS-only, no IPs, no private hosts,
 * and DNS resolution check against private IP ranges.
 */
export async function validateUrl(rawUrl: string): Promise<UrlValidationResult> {
  if (rawUrl.length > 2000) {
    return { ok: false, error: "URL too long (max 2000 characters)." };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ok: false, error: "Invalid URL format." };
  }

  if (parsed.protocol !== "https:") {
    return { ok: false, error: "Only HTTPS URLs are supported." };
  }

  const hostname = parsed.hostname;

  // No direct IP addresses
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.startsWith("[")) {
    return { ok: false, error: "Direct IP addresses are not allowed. Use a domain name." };
  }

  // Block localhost and internal TLDs
  if (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".localhost")
  ) {
    return { ok: false, error: "Local/internal URLs are not allowed." };
  }

  // DNS resolution — verify hostname resolves to a public IP
  try {
    const { address } = await lookup(hostname);
    if (isPrivateIp(address)) {
      return { ok: false, error: "This URL cannot be analyzed." };
    }
  } catch {
    return { ok: false, error: "Could not resolve hostname. Please check the URL." };
  }

  return { ok: true, url: parsed.href };
}

// ── Safe HTML fetch with SSRF-protected redirect following ──

const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_BODY_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Fetches HTML from a URL with full SSRF protection:
 * - Manual redirect following (max 3 hops)
 * - Re-verifies DNS/SSRF on each redirect target
 * - HTTPS-only (blocks HTTP redirect targets)
 * - 10s timeout, 5MB body limit, HTML content-type required
 * - Clear error messages for 401/403/404
 *
 * Throws on any failure — caller should catch and surface the message.
 */
export async function safeFetchHtml(url: string): Promise<string> {
  let currentUrl = url;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const parsed = new URL(currentUrl);
    const hostname = parsed.hostname;

    // Block IPs and private hosts on every hop
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.startsWith("[")) {
      throw new Error("Redirect to IP address blocked.");
    }
    if (
      hostname === "localhost" ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".localhost")
    ) {
      throw new Error("Redirect to local/internal address blocked.");
    }

    let resolvedIp: string;
    try {
      const result = await lookup(hostname);
      resolvedIp = result.address;
    } catch {
      throw new Error("Could not resolve hostname.");
    }

    if (isPrivateIp(resolvedIp)) {
      throw new Error("URL resolves to a private/internal network.");
    }

    // Fetch with manual redirect
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(currentUrl, {
        signal: controller.signal,
        redirect: "manual",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; SerpVive/1.0; +https://serpvive.com)",
          Accept: "text/html",
        },
      });
    } catch {
      clearTimeout(timeout);
      throw new Error("Failed to fetch the page (timeout or network error).");
    }
    clearTimeout(timeout);

    // ── Handle redirects ──
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get("location");
      if (!location) throw new Error("Redirect without Location header.");

      const nextUrl = new URL(location, currentUrl).href;
      if (!nextUrl.startsWith("https://")) {
        throw new Error("Redirect to non-HTTPS URL blocked.");
      }
      currentUrl = nextUrl;
      continue; // next hop will re-verify DNS/SSRF
    }

    // ── HTTP error handling ──
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        "Page is blocking access (login required or forbidden).",
      );
    }
    if (res.status === 404) {
      throw new Error("Page not found (404). Check the URL.");
    }
    if (!res.ok) {
      throw new Error(`Page returned HTTP ${res.status}.`);
    }

    // ── Content-type check ──
    const contentType = res.headers.get("content-type") ?? "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("text/xhtml")
    ) {
      throw new Error(
        "URL does not serve HTML content. Make sure it points to a web page.",
      );
    }

    // ── Body size check (header + actual) ──
    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      throw new Error("Response too large (max 5MB).");
    }

    const html = await res.text();
    if (html.length > MAX_BODY_BYTES) {
      throw new Error("Response too large (max 5MB).");
    }

    return html;
  }

  throw new Error("Too many redirects (max 3).");
}

// ── Content quality validation ──

/**
 * Checks that fetched content meets the minimum quality bar.
 * Returns an error message, or null if valid.
 */
export function validateContent(wordCount: number): string | null {
  if (wordCount < 50) {
    return (
      "Page has too little content to analyze (minimum 50 words). " +
      "Make sure the URL points to a content page, not a login wall or error page."
    );
  }
  return null;
}
