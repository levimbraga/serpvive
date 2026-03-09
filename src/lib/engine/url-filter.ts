/**
 * URL filter for content pages.
 * Filters out non-content URLs (assets, structural pages, file extensions).
 * Future: allow users to customize which paths to monitor.
 */

// Path segments that indicate non-content URLs
const EXCLUDED_PATH_SEGMENTS = [
  "/_next/",
  "/api/",
  "/static/",
  "/assets/",
  "/images/",
  "/img/",
  "/css/",
  "/js/",
  "/fonts/",
  "/_vercel/",
];

// File extensions that are not content pages
const EXCLUDED_EXTENSIONS = [
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico", ".avif",
  ".pdf", ".css", ".js", ".map",
  ".xml", ".json", ".txt", ".rss",
  ".woff", ".woff2", ".ttf", ".eot",
  ".mp4", ".mp3", ".wav", ".webm",
  ".zip", ".gz", ".tar",
];

// Exact paths that are structural (not content)
const EXCLUDED_EXACT_PATHS = new Set([
  "/",
  "/home",
  "/about",
  "/contact",
  "/features",
  "/pricing",
  "/terms",
  "/privacy",
  "/login",
  "/signup",
  "/register",
  "/download",
  "/404",
  "/500",
  "/sitemap",
  "/search",
]);

/**
 * Returns true if the URL path should be monitored as content.
 * Returns false if it should be excluded.
 */
export function isContentUrl(urlOrPath: string): boolean {
  let path: string;

  try {
    // Handle full URLs
    if (urlOrPath.startsWith("http")) {
      path = new URL(urlOrPath).pathname;
    } else {
      path = urlOrPath;
    }
  } catch {
    return false;
  }

  // Normalize: remove trailing slash (except root)
  const normalized = path.length > 1 && path.endsWith("/")
    ? path.slice(0, -1)
    : path;

  // Check exact excluded paths
  if (EXCLUDED_EXACT_PATHS.has(normalized.toLowerCase())) {
    return false;
  }

  // Check path segments
  const lower = normalized.toLowerCase();
  for (const segment of EXCLUDED_PATH_SEGMENTS) {
    if (lower.includes(segment)) {
      return false;
    }
  }

  // Check file extensions
  for (const ext of EXCLUDED_EXTENSIONS) {
    if (lower.endsWith(ext)) {
      return false;
    }
  }

  return true;
}

/**
 * Filters an array of URLs, keeping only content pages.
 */
export function filterContentUrls<T extends { page: string }>(rows: T[]): T[] {
  return rows.filter((row) => isContentUrl(row.page));
}
