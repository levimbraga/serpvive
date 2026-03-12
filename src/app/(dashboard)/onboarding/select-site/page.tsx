"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Globe, Star } from "lucide-react";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";

type GscProperty = {
  siteUrl: string;
  permissionLevel: string;
  type: "domain" | "url_prefix";
  displayName: string;
};

export default function SelectSitePage() {
  const [properties, setProperties] = useState<GscProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect");

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch("/api/gsc/properties");
        const data = (await res.json()) as { data?: GscProperty[]; error?: string };

        if (!res.ok) {
          setError(data.error ?? "Failed to load properties");
          return;
        }

        setProperties(data.data ?? []);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    void fetchProperties();
  }, []);

  async function handleSelect() {
    if (!selected) return;
    setSubmitting(true);

    const property = properties.find((p) => p.siteUrl === selected);
    if (!property) return;

    try {
      const res = await fetch("/api/gsc/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteUrl: property.siteUrl,
          domain: property.displayName,
        }),
      });

      const data = (await res.json()) as { data?: { siteId: string }; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to start import");
        setSubmitting(false);
        return;
      }

      const importUrl = redirectTarget
        ? `/onboarding/importing?siteId=${data.data!.siteId}&redirect=${redirectTarget}`
        : `/onboarding/importing?siteId=${data.data!.siteId}`;
      router.push(importUrl);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  // Sort: domain properties first
  const sorted = [...properties].sort((a, b) => {
    if (a.type === "domain" && b.type !== "domain") return -1;
    if (a.type !== "domain" && b.type === "domain") return 1;
    return a.displayName.localeCompare(b.displayName);
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <OnboardingProgress currentStep={2} />
      <div className="max-w-lg w-full">
        <h1 className="text-2xl font-semibold text-[#111827] mb-2 text-center">
          Select your site
        </h1>
        <p className="text-[#4B5563] mb-8 text-center">
          Choose the site you want to monitor. Domain properties are recommended.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-white border border-[#E5E7EB] animate-pulse" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 text-center">
            <p className="text-[#4B5563] mb-2">No sites found in your Search Console.</p>
            <p className="text-sm text-[#9CA3AF]">
              Add a site at{" "}
              <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-[#3B82F6] hover:underline">
                Google Search Console
              </a>{" "}
              first, then come back.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {sorted.map((property) => (
                <button
                  key={property.siteUrl}
                  onClick={() => setSelected(property.siteUrl)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 bg-white text-left transition-all ${
                    selected === property.siteUrl
                      ? "border-[#3B82F6] shadow-md"
                      : "border-[#E5E7EB] hover:border-[#D1D5DB]"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    property.type === "domain" ? "bg-[#3B82F6]/10" : "bg-[#F3F4F6]"
                  }`}>
                    <Globe size={20} strokeWidth={1.5} className={
                      property.type === "domain" ? "text-[#3B82F6]" : "text-[#9CA3AF]"
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">
                      {property.displayName}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">
                      {property.type === "domain" ? "Domain property" : "URL prefix"}
                    </p>
                  </div>
                  {property.type === "domain" && (
                    <span className="flex items-center gap-1 text-xs text-[#3B82F6] font-medium bg-[#3B82F6]/5 px-2 py-1 rounded-md">
                      <Star size={12} strokeWidth={1.5} />
                      Recommended
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleSelect}
              disabled={!selected || submitting}
              className="w-full h-12 mt-6 rounded-xl bg-[#3B82F6] text-white text-[15px] font-semibold hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Starting import..." : "Continue with this site"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
