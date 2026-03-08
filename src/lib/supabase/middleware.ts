import { createServerClient } from "@supabase/ssr";
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

  // TODO: Remove this block when app is launched
  // ── PRE-LAUNCH GATE: block all dashboard routes ──
  const path = request.nextUrl.pathname;
  const isDashboardRoute = path.startsWith("/dashboard") || path.startsWith("/pages") || path.startsWith("/settings") || path.startsWith("/onboarding") || path.startsWith("/refreshes");

  if (isDashboardRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // ── END PRE-LAUNCH GATE ──

  const { data: { user } } = await supabase.auth.getUser();

  const isAuthRoute = path.startsWith("/login") || path.startsWith("/signup");

  // Not logged in → redirect to login
  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logged in → redirect away from auth pages
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
