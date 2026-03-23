"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import posthog from "posthog-js";

const REFERRAL_SOURCES = [
  { value: "google_search", label: "Google Search" },
  { value: "reddit", label: "Reddit" },
  { value: "twitter", label: "Twitter / X" },
  { value: "friend", label: "Friend or colleague" },
  { value: "blog_post", label: "Blog post or article" },
  { value: "youtube", label: "YouTube" },
  { value: "other", label: "Other" },
];

export default function ReferralSourcePrompt() {
  const [selected, setSelected] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const supabase = getSupabaseBrowser();

  async function handleSelect(value: string) {
    setSelected(value);
    setSaved(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ referral_source: value })
        .eq("id", user.id);

      posthog.capture("signup_referral_source", { source: value });
    }
  }

  if (saved) return null;

  return (
    <div className="max-w-2xl w-full mb-8">
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-5">
        <p className="text-sm font-medium text-[#111827] mb-3">
          Quick question — how did you hear about SerpVive?
        </p>
        <div className="flex flex-wrap gap-2">
          {REFERRAL_SOURCES.map((s) => (
            <button
              key={s.value}
              onClick={() => handleSelect(s.value)}
              className={`h-8 px-3.5 rounded-full text-sm font-medium border transition-colors ${
                selected === s.value
                  ? "border-[#3B82F6] bg-[#EFF6FF] text-[#2563EB]"
                  : "border-[#E5E7EB] text-[#4B5563] hover:border-[#3B82F6] hover:text-[#2563EB]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSaved(true)}
          className="mt-3 text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
