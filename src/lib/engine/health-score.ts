type PageStatus = "healthy" | "warning" | "critical" | "dead" | "new" | "unknown";

const STATUS_WEIGHTS: Record<PageStatus, number | null> = {
  healthy: 100,
  warning: 60,
  critical: 20,
  dead: 0,
  new: null,     // excluded from calculation
  unknown: null, // excluded from calculation
};

/**
 * Calculates site-level health score as weighted average of page statuses.
 * healthy=100, warning=60, critical=20, dead=0.
 * "new" and "unknown" pages are excluded.
 * Result is 0–100.
 */
export function calculateHealthScore(
  statuses: Map<string, PageStatus>,
): number {
  let totalWeight = 0;
  let count = 0;

  for (const status of statuses.values()) {
    const weight = STATUS_WEIGHTS[status];
    if (weight !== null) {
      totalWeight += weight;
      count++;
    }
  }

  if (count === 0) return 100; // No qualifying pages → healthy by default

  return Math.round(totalWeight / count);
}
