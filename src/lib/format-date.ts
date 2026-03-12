/**
 * Date formatting utilities — always use the user's timezone.
 */

/** "Mar 12" */
export function formatShortDate(date: string | Date, timeZone = "UTC"): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone,
  });
}

/** "Mar 12, 2026" */
export function formatDate(date: string | Date, timeZone = "UTC"): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone,
  });
}

/** "Mar 12, 02:30 PM" */
export function formatDateTime(date: string | Date, timeZone = "UTC"): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  });
}

/** "2 hours ago", "3 days ago", "just now" */
export function formatRelative(date: string | Date): string {
  const ms = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
