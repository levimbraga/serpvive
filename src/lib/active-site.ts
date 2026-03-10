import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

const COOKIE_NAME = "active_site_id";

/**
 * Resolves the active site ID for a user.
 * Reads from cookie, validates it belongs to the user,
 * falls back to the user's first active site.
 */
export async function getActiveSiteId(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(COOKIE_NAME)?.value;

  if (cookieValue) {
    // Validate cookie site belongs to user
    const { data } = await supabase
      .from("sites")
      .select("id")
      .eq("id", cookieValue)
      .eq("user_id", userId)
      .single();

    if (data) return data.id;
  }

  // Fallback: first active site
  const { data: fallback } = await supabase
    .from("sites")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return fallback?.id ?? null;
}
