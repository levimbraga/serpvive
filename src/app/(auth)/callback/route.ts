import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\s/g, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.replace(/\s/g, "");

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next"); // explicit redirect takes priority

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });

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
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // If caller specified an explicit redirect, use it
  if (next) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Otherwise, check if user has any sites to decide where to go
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: site } = await supabase
      .from("sites")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (!site) {
      return NextResponse.redirect(`${origin}/onboarding`);
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
