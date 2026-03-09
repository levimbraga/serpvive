import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { exchangeCodeForTokens } from "@/lib/gsc/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // user ID
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

  // User denied access
  if (error) {
    return NextResponse.redirect(`${appUrl}/onboarding?error=access_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/onboarding?error=missing_params`);
  }

  // Verify the user is authenticated and matches the state
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== state) {
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
    const response = NextResponse.redirect(`${appUrl}/onboarding/select-site`);

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
