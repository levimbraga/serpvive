import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { runExternalPipeline } from "@/lib/ai/pipeline";
import { validateUrl } from "@/lib/url-validator";
import { nanoid } from "nanoid";

export const maxDuration = 300; // 5 minutes

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

const CreateDemoSchema = z.object({
  url: z.string().url().startsWith("https://"),
  keyword: z.string().min(2).max(200),
});

async function getAdminUser() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return null;
  }
  return user;
}

// POST — Create new demo analysis
export async function POST(request: Request) {
  try {
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = (await request.json()) as unknown;
    const parsed = CreateDemoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Valid URL and keyword required." }, { status: 400 });
    }

    // SSRF / URL validation
    const urlCheck = await validateUrl(parsed.data.url);
    if (!urlCheck.ok) {
      return NextResponse.json({ error: urlCheck.error }, { status: 400 });
    }

    const url = urlCheck.url;
    const { keyword } = parsed.data;
    const admin = getSupabaseAdmin();

    const result = await runExternalPipeline(url, keyword);
    const demoId = nanoid(8);

    const { error: insertErr } = await admin
      .from("demo_analyses")
      .insert({
        id: demoId,
        url,
        keyword,
        diagnosis: result.diagnosis,
        refresh_brief: result.brief,
        serp_snapshot: result.serpSnapshot,
        created_by: user.id,
      });

    if (insertErr) {
      console.error("[api/admin/demo] Insert error:", insertErr.message);
      return NextResponse.json({ error: `Failed to save demo: ${insertErr.message}` }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        id: demoId,
        diagnosis: result.diagnosis,
        brief: result.brief,
        processingTimeMs: result.processingTimeMs,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/admin/demo] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET — List all demo analyses
export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  const { data: demos } = await admin
    .from("demo_analyses")
    .select("id, url, keyword, created_at, expires_at, views, diagnosis, refresh_brief")
    .order("created_at", { ascending: false });

  return NextResponse.json({ data: demos ?? [] });
}

// DELETE — Remove a demo analysis
export async function DELETE(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  await admin.from("demo_analyses").delete().eq("id", id);

  return NextResponse.json({ data: { ok: true } });
}
