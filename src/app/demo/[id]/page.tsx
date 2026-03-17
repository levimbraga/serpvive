import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import DemoResultClient from "./DemoResultClient";

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
      <header className="border-b border-[#1E293B] bg-[#0F172A]">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/">
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Serp<span className="text-[#3B82F6]">Vive</span>
            </span>
          </Link>
          <span className="text-[13px] text-[#94A3B8] bg-[#1E293B] px-4 py-1.5 rounded-full font-medium">
            Free Content Analysis
          </span>
        </div>
      </header>

      {/* Subtitle */}
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-2">
        <p className="text-xs text-[#9CA3AF]">
          Analysis of{" "}
          <span className="text-[#6B7280]" style={{ fontFamily: "var(--font-mono, monospace)" }}>
            {demo.url}
          </span>{" "}
          &middot;{" "}
          {new Date(demo.created_at).toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric",
          })}
        </p>
      </div>

      {/* Analysis content */}
      <main className="max-w-4xl mx-auto px-6 pb-8">
        <DemoResultClient
          url={demo.url}
          keyword={demo.keyword}
          diagnosis={demo.diagnosis as Record<string, unknown>}
          brief={demo.refresh_brief as Record<string, unknown> | null}
          createdAt={demo.created_at}
        />
      </main>

      {/* CTA Section */}
      <section className="border-t border-[#E5E7EB]" style={{ background: "linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)" }}>
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <div className="border border-[#BFDBFE] rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-[#111827] mb-3">
              Want this for your entire blog?
            </h2>
            <p className="text-[#4B5563] mb-8 max-w-md mx-auto">
              SerpVive monitors your blog automatically, detects pages losing traffic, and tells you exactly WHY and WHAT to fix — with AI.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mb-8 text-left">
              {[
                "Automatic daily monitoring",
                "AI diagnosis with competitor analysis",
                "Micro-drafts so you write without researching",
                "Before/after proof that fixes worked",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-[#16A34A] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-[#374151]">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center h-11 px-8 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold transition-colors"
              >
                Get Started Free &rarr;
              </Link>
              <Link
                href="/#pricing"
                className="inline-flex items-center justify-center h-11 px-8 rounded-lg border border-[#E5E7EB] hover:border-[#3B82F6] text-[#374151] text-sm font-medium transition-colors"
              >
                See Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-[#F9FAFB]">
        <div className="max-w-4xl mx-auto px-6 py-4 text-center">
          <p className="text-xs text-[#9CA3AF]">
            &copy; {new Date().getFullYear()} SerpVive. AI-powered content decay monitoring.
          </p>
        </div>
      </footer>
    </div>
  );
}
