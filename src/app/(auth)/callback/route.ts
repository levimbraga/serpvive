import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { wakeDormantSites } from "@/lib/activity";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\s/g, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.replace(/\s/g, "");

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next");

  // Buffer cookie mutations so we can attach them to whatever redirect we
  // ultimately return. Writing through cookies() from next/headers is not
  // reliable in Next.js 15+ route handlers that return an explicit redirect —
  // the fresh NextResponse doesn't always inherit those mutations, which
  // dropped the session cookies and caused Google login to fail on the first
  // attempt.
  const pendingCookies: Array<{ name: string; value: string; options: CookieOptions }> = [];

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const c of cookiesToSet) {
          pendingCookies.push(c);
        }
      },
    },
  });

  const redirect = (path: string) => {
    const res = NextResponse.redirect(`${origin}${path}`);
    for (const { name, value, options } of pendingCookies) {
      res.cookies.set(name, value, options);
    }
    return res;
  };

  let authenticated = false;

  // Email confirmation (magic link / signup confirmation)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "signup" | "email",
    });
    if (!error) authenticated = true;
  }

  // OAuth callback (Google)
  if (!authenticated && code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) authenticated = true;
  }

  if (!authenticated) {
    return redirect("/login?error=auth");
  }

  if (next) {
    return redirect(next);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Coming back is the only thing required to resume: any site paused for
    // inactivity wakes up here, with no setting to find and nothing to buy.
    await wakeDormantSites(supabase, user.id);

    const { data: site } = await supabase
      .from("sites")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (!site) {
      return redirect("/onboarding/choose");
    }
  }

  return redirect("/dashboard");
}
