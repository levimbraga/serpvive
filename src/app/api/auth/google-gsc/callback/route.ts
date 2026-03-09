import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { exchangeCodeForTokens } from "@/lib/gsc/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // userId or userId:redirect
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

  // Parse state: "userId" or "userId:settings"
  const [stateUserId, redirectTarget] = (state ?? "").split(":");

  // User denied access
  if (error) {
    const fallback = redirectTarget === "settings" ? "/settings" : "/onboarding";
    return NextResponse.redirect(`${appUrl}${fallback}?error=access_denied`);
  }

  if (!code || !stateUserId) {
    return NextResponse.redirect(`${appUrl}/onboarding?error=missing_params`);
  }

  // Verify the user is authenticated and matches the state
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== stateUserId) {
    return NextResponse.redirect(`${appUrl}/onboarding?error=auth_mismatch`);
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    if (!tokens.refresh_token) {
      return NextResponse.redirect(`${appUrl}/onboarding?error=no_refresh_token`);
    }

    // Store tokens temporarily in a cookie for the select-site step
    // (we don't have a site yet to save to the sites table)
    const selectSiteUrl = redirectTarget
      ? `${appUrl}/onboarding/select-site?redirect=${redirectTarget}`
      : `${appUrl}/onboarding/select-site`;
    const response = NextResponse.redirect(selectSiteUrl);

    response.cookies.set("gsc_access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expires_in,
      path: "/",
    });

    response.cookies.set("gsc_refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour — enough for onboarding
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[gsc-callback] Token exchange failed:", err);
    return NextResponse.redirect(`${appUrl}/onboarding?error=token_exchange`);
  }
}
