import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Inactivity pause — see supabase/migrations/20260819_add_last_seen_at_and_dormant.sql
 * for the why. Two halves live here: marking a user as seen, and waking their
 * sites back up.
 */

/** Sites of an account untouched for this long stop being ingested. */
export const DORMANT_AFTER_DAYS = 60;

/**
 * Records that the user opened the app. Called from the dashboard layout on
 * every page load, so it must stay cheap: the UPDATE only fires when the
 * stored timestamp is from an earlier day, making it at most one write per
 * user per day rather than one per navigation.
 *
 * Best-effort — a failure here must never block rendering the dashboard.
 */
export async function touchLastSeen(
  supabase: SupabaseClient,
  userId: string,
  lastSeenAt: string | null | undefined,
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  if (lastSeenAt && lastSeenAt.slice(0, 10) === today) return;

  try {
    await supabase
      .from("profiles")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", userId);
  } catch (err) {
    console.error("[activity] Failed to update last_seen_at:", err);
  }
}

/**
 * Reactivates any dormant sites for this user. Called on login, so coming back
 * is the whole ritual — nobody has to find a setting or ask for anything.
 *
 * Returns how many sites woke up (0 in the overwhelming majority of logins).
 */
export async function wakeDormantSites(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("sites")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("status", "dormant")
      .select("id");

    if (error) {
      console.error("[activity] Failed to wake dormant sites:", error.message);
      return 0;
    }

    const count = data?.length ?? 0;
    if (count > 0) {
      console.log(`[activity] Woke ${count} dormant site(s) for user ${userId}`);
    }
    return count;
  } catch (err) {
    console.error("[activity] wakeDormantSites threw:", err);
    return 0;
  }
}
