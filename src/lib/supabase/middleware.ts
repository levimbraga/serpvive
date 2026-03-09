import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\s/g, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.replace(/\s/g, "");

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith("/login") || path.startsWith("/signup");
  const isDashboardRoute = path.startsWith("/dashboard") || path.startsWith("/pages") || path.startsWith("/settings") || path.startsWith("/onboarding") || path.startsWith("/refreshes");

  // TODO: Remove this block when signup is enabled
  // ── PRE-LAUNCH: block signup ──
  if (path.startsWith("/signup")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // ── END PRE-LAUNCH ──

  // Not logged in → redirect to login
  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logged in → redirect away from auth pages
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Logged in + dashboard route (not onboarding) → check if site exists
  if (user && isDashboardRoute && !path.startsWith("/onboarding")) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/\s/g, "");
    if (serviceKey) {
      const admin = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: site } = await admin
        .from("sites")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!site) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }
  }

  return response;
}
