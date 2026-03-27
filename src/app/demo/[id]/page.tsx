import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import DemoResultClient from "./DemoResultClient";
import DemoFeedback from "./DemoFeedback";
import DemoBottomCTA from "./DemoBottomCTA";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const admin = getSupabaseAdmin();

  const { data: demo } = await admin
    .from("demo_analyses")
    .select("url, keyword, diagnosis")
    .eq("id", id)
    .single();

  if (!demo) {
    return { title: "Analysis Expired — SerpVive" };
  }

  const diag = demo.diagnosis as { summary?: string } | null;
  const summary = diag?.summary?.slice(0, 150) ?? `AI content analysis for ${demo.keyword}`;

  return {
    title: `Content Analysis — ${demo.keyword} | SerpVive`,
    description: summary,
    openGraph: {
      title: `Content Analysis — ${demo.keyword}`,
      description: summary,
      images: ["https://serpvive.com/og-image.png"],
    },
    robots: { index: false, follow: false },
  };
}

export default async function DemoPage({ params }: Props) {
  const { id } = await params;
  const admin = getSupabaseAdmin();

  const { data: demo } = await admin
    .from("demo_analyses")
    .select("*")
    .eq("id", id)
    .single();

  // Demo not found or expired
  if (!demo || new Date(demo.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">
        <header className="border-b border-[#1E293B] bg-[#0F172A]">
          <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
            <Link href="/">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Serp<span className="text-[#3B82F6]">Vive</span>
              </span>
            </Link>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-semibold text-[#111827] mb-3">
            This analysis has expired
          </h1>
          <p className="text-[#6B7280] mb-8">
            Demo analyses are available for 21 days. Want your own AI-powered content analysis?
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors"
          >
            Get Started Free &rarr;
          </Link>
        </main>
      </div>
    );
  }

  // Increment view counter (fire-and-forget)
  admin
    .from("demo_analyses")
    .update({ views: (demo.views ?? 0) + 1 })
    .eq("id", id)
    .then(() => {});

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <header className="bg-[#0F172A] border-b border-[#1E293B]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Serp<span className="text-[#3B82F6]">Vive</span>
              </span>
            </Link>
            <span className="text-[13px] text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-4 py-1.5 rounded-full font-semibold">
              Free Content Analysis
            </span>
          </div>
          <div className="space-y-1">
            <p
              className="text-sm text-white font-medium truncate"
              style={{ fontFamily: "var(--font-mono, monospace)" }}
            >
              {demo.url}
            </p>
            <p className="text-xs text-[#64748B]">
              Keyword: <span className="text-[#94A3B8]">{demo.keyword}</span>
              {" "}&middot;{" "}
              {new Date(demo.created_at).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              })}
            </p>
          </div>
        </div>
      </header>

      {/* Analysis content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <DemoResultClient
          url={demo.url}
          keyword={demo.keyword}
          diagnosis={demo.diagnosis as Record<string, unknown>}
          brief={demo.refresh_brief as Record<string, unknown> | null}
          createdAt={demo.created_at}
          demoId={id}
        />
      </main>

      {/* Feedback Section */}
      <section className="max-w-xl mx-auto px-6 pb-8">
        <DemoFeedback
          demoAnalysisId={id}
          pageUrl={demo.url}
          keyword={demo.keyword}
        />
      </section>

      {/* CTA Section */}
      <DemoBottomCTA demoId={id} />

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-[#F9FAFB]">
        <div className="max-w-4xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <Link href="/" className="text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-colors no-underline">
            Serp<span className="text-[#3B82F6]">Vive</span>
            <span className="font-normal text-xs text-[#9CA3AF] ml-2">Revive your rankings.</span>
          </Link>
          <p className="text-xs text-[#9CA3AF]">
            &copy; {new Date().getFullYear()} SerpVive
          </p>
        </div>
      </footer>
    </div>
  );
}
