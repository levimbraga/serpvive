import type { Metadata } from "next";
import Link from "next/link";
import { Zap, BarChart3, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Get Started — SerpVive",
};

export default function OnboardingChoosePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
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
          <p className="text-sm text-[#4B5563] mb-6">
            Paste any public HTTPS URL and get an AI diagnosis with
            actionable recommendations. No setup required.
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
          <p className="text-sm text-[#4B5563] mb-6">
            Automatic monitoring, Health Score, and decay alerts
            for your entire blog.
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#3B82F6] group-hover:gap-3 transition-all">
            Connect GSC <ArrowRight size={16} strokeWidth={1.5} />
          </span>
        </Link>
      </div>

      <p className="text-xs text-[#9CA3AF] mt-8">
        You can always connect GSC later in Settings.
      </p>
    </div>
  );
}
