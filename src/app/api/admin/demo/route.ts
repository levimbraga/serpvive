import { NextResponse, after } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { runExternalPipeline } from "@/lib/ai/pipeline";
import { validateUrl } from "@/lib/url-validator";
import { nanoid } from "nanoid";

export const maxDuration = 300; // 5 minutes

// Deny-by-default: unset ADMIN_EMAIL means no one passes the guard below.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const PIPELINE_TIMEOUT_MS = 270 * 1000; // 4.5 min — leaves 30s buffer before Vercel's 300s maxDuration
const STALE_MS = 6 * 60 * 1000; // 6 minutes — must exceed PIPELINE_TIMEOUT + overhead

const CreateDemoSchema = z.object({
  url: z.string().url().startsWith("https://"),
  keyword: z.string().min(2).max(200),
});

async function getAdminUser() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!ADMIN_EMAIL || !user || user.email !== ADMIN_EMAIL) {
    return null;
  }
  return user;
}

// POST — Create demo and run pipeline in background
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

    const urlCheck = await validateUrl(parsed.data.url);
    if (!urlCheck.ok) {
      return NextResponse.json({ error: urlCheck.error }, { status: 400 });
    }

    const url = urlCheck.url;
    const { keyword } = parsed.data;
    const admin = getSupabaseAdmin();
    const demoId = nanoid(8);

    // Create pending record immediately
    const { error: insertErr } = await admin
      .from("demo_analyses")
      .insert({
        id: demoId,
        url,
        keyword,
        status: "pending",
        created_by: user.id,
      });

    if (insertErr) {
      console.error("[api/admin/demo] Insert error:", insertErr.message);
      return NextResponse.json({ error: `Failed to create demo: ${insertErr.message}` }, { status: 500 });
    }

    // Run pipeline in background — after() keeps the function alive on Vercel
    after(async () => {
      try {
        await admin
          .from("demo_analyses")
          .update({ status: "processing" })
          .eq("id", demoId);

        console.log(`[api/admin/demo] Starting pipeline for ${demoId}: ${url}`);

        const pipeline = runExternalPipeline(url, keyword);
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Demo pipeline timed out after ${PIPELINE_TIMEOUT_MS / 1000}s`)), PIPELINE_TIMEOUT_MS),
        );
        const result = await Promise.race([pipeline, timeout]);

        await admin
          .from("demo_analyses")
          .update({
            status: "completed",
            diagnosis: result.diagnosis,
            refresh_brief: result.brief,
            serp_snapshot: result.serpSnapshot,
          })
          .eq("id", demoId);

        console.log(`[api/admin/demo] Completed ${demoId} in ${(result.processingTimeMs / 1000).toFixed(1)}s`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[api/admin/demo] Failed ${demoId}:`, message);

        await admin
          .from("demo_analyses")
          .update({ status: "failed", error_message: message })
          .eq("id", demoId);
      }
    });

    return NextResponse.json({ data: { id: demoId, status: "pending" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/admin/demo] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET — List all demos, or poll one demo's status
export async function GET(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const pollId = searchParams.get("poll");

  // Poll mode: return status for a single demo
  if (pollId) {
    const { data: demo } = await admin
      .from("demo_analyses")
      .select("id, status, error_message")
      .eq("id", pollId)
      .single();

    if (!demo) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Stale detection: if processing for >5 min, treat as failed
    if (demo.status === "processing" || demo.status === "pending") {
      const { data: fullDemo } = await admin
        .from("demo_analyses")
        .select("created_at")
        .eq("id", pollId)
        .single();

      if (fullDemo) {
        const elapsed = Date.now() - new Date(fullDemo.created_at).getTime();
        if (elapsed > STALE_MS) {
          await admin
            .from("demo_analyses")
            .update({ status: "failed", error_message: "Pipeline timed out" })
            .eq("id", pollId);
          return NextResponse.json({ data: { id: pollId, status: "failed", error_message: "Pipeline timed out" } });
        }
      }
    }

    return NextResponse.json({ data: demo });
  }

  // List mode: return all demos
  const { data: demos } = await admin
    .from("demo_analyses")
    .select("id, url, keyword, created_at, expires_at, views, diagnosis, refresh_brief, serp_snapshot, status")
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
