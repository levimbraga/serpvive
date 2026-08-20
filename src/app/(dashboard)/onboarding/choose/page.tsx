import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Zap, BarChart3, ArrowRight, Eye } from "lucide-react";
import { getSupabaseServer } from "@/lib/supabase/server";
import ReferralSourcePrompt from "@/components/onboarding/ReferralSourcePrompt";
import { FREE_LIFETIME_DIAGNOSES, FREE_LIFETIME_URL_ANALYSES } from "@/lib/constants";

// A finished public analysis anyone can read without spending any allowance.
const SAMPLE_DEMO_URL = "/demo/7aJVgyy6";

export const metadata: Metadata = {
  title: "Get Started — SerpVive",
};

export default async function OnboardingChoosePage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_source")
    .eq("id", user.id)
    .single();

  const needsReferral = !profile?.referral_source;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      {needsReferral && <ReferralSourcePrompt />}

      <div className="max-w-2xl w-full text-center mb-10">
        <h1 className="text-2xl font-semibold text-[#111827] mb-2">
          How do you want to start?
        </h1>
        <p className="text-[#4B5563]">
          Choose the path that fits your workflow. You can always switch later.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full">
        {/* Card 1 — Quick Analysis */}
        <Link
          href="/pages/analyze"
          className="group bg-white rounded-lg border-2 border-[#E5E7EB] hover:border-[#3B82F6] p-6 text-left transition-all hover:shadow-lg"
        >
          <div className="w-12 h-12 rounded-lg bg-[#EFF6FF] flex items-center justify-center mb-4 group-hover:bg-[#DBEAFE] transition-colors">
            <Zap size={24} strokeWidth={1.5} className="text-[#3B82F6]" />
          </div>
          <h2 className="text-lg font-semibold text-[#111827] mb-2">
            Analyze any page
          </h2>
          <p className="text-sm text-[#4B5563] mb-3">
            Paste any public HTTPS URL and a keyword. You get a full AI
            diagnosis — what the top results do differently, what your page is
            missing, and a refresh brief. No Google account, no setup.
          </p>
          <p className="text-xs text-[#6B7280] mb-6">
            {FREE_LIFETIME_URL_ANALYSES} analyses included · takes ~3 minutes each
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#3B82F6] group-hover:gap-3 transition-all">
            Analyze now <ArrowRight size={16} strokeWidth={1.5} />
          </span>
        </Link>

        {/* Card 2 — Connect GSC */}
        <Link
          href="/onboarding"
          className="group bg-white rounded-lg border-2 border-[#E5E7EB] hover:border-[#3B82F6] p-6 text-left transition-all hover:shadow-lg"
        >
          <div className="w-12 h-12 rounded-lg bg-[#EFF6FF] flex items-center justify-center mb-4 group-hover:bg-[#DBEAFE] transition-colors">
            <BarChart3 size={24} strokeWidth={1.5} className="text-[#3B82F6]" />
          </div>
          <h2 className="text-lg font-semibold text-[#111827] mb-2">
            Connect Google Search Console
          </h2>
          <p className="text-sm text-[#4B5563] mb-3">
            Import your real search data to get a Health Score, decay
            detection across every page, and weekly monitoring that keeps
            running on its own.
          </p>
          <p className="text-xs text-[#6B7280] mb-6">
            {FREE_LIFETIME_DIAGNOSES} AI diagnoses included · requires a site you own in Search Console
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#3B82F6] group-hover:gap-3 transition-all">
            Connect GSC <ArrowRight size={16} strokeWidth={1.5} />
          </span>
        </Link>
      </div>

      <a
        href={SAMPLE_DEMO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-6 max-w-2xl w-full bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] hover:border-[#9CA3AF] p-4 flex items-center gap-3 no-underline transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
          <Eye size={18} strokeWidth={1.5} className="text-[#6B7280]" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-[#111827]">
            Just want to see one first?
          </p>
          <p className="text-xs text-[#6B7280]">
            Read a finished analysis of a real page — uses none of your allowance.
          </p>
        </div>
        <ArrowRight size={16} strokeWidth={1.5} className="text-[#9CA3AF] ml-auto flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </a>

      <p className="text-xs text-[#9CA3AF] mt-8">
        You can always connect GSC later in Settings.
      </p>
    </div>
  );
}
