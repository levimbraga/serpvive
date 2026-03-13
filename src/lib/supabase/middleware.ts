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

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith("/login") || path.startsWith("/signup") || path.startsWith("/forgot-password");
  // /reset-password is intentionally NOT in isAuthRoute (user needs active session from recovery link)
  const isDashboardRoute = path.startsWith("/dashboard") || path.startsWith("/pages") || path.startsWith("/settings") || path.startsWith("/onboarding") || path.startsWith("/refreshes") || path.startsWith("/feedback") || path.startsWith("/admin");

  // Not logged in → redirect to login
  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logged in → redirect away from auth pages
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Note: we no longer force redirect to onboarding when no site exists.
  // Users can now use "Analyze any URL" without connecting GSC.
  // The auth callback handles the initial redirect to /onboarding/choose for new users.

  return response;
}
