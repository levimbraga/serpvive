"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import posthog from "posthog-js";

type ImportStatus = {
  status: "importing" | "active" | "error";
  pagesCount: number;
  domain: string;
};

export default function ImportingPage() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get("siteId");
  const redirectTarget = searchParams.get("redirect");
  const router = useRouter();
  const [data, setData] = useState<ImportStatus | null>(null);
  const [error, setError] = useState("");
  const trackedComplete = useRef(false);

  const pollStatus = useCallback(async () => {
    if (!siteId) return;

    try {
      const res = await fetch(`/api/gsc/import/status?siteId=${siteId}`);
      const json = (await res.json()) as { data?: ImportStatus; error?: string };

      if (!res.ok) {
        setError(json.error ?? "Failed to check status");
        return;
      }

      if (json.data) {
        setData(json.data);

        if (json.data.status === "active" && !trackedComplete.current) {
          trackedComplete.current = true;
          posthog.capture("onboarding_step_completed", { step: "import_complete", step_number: 3, domain: json.data.domain, pages_count: json.data.pagesCount });
          // Import complete — redirect after a short delay
          const dest = redirectTarget === "settings" ? "/settings" : "/dashboard";
          setTimeout(() => router.push(dest), 2000);
        }
      }
    } catch {
      setError("Network error");
    }
  }, [siteId, router, redirectTarget]);

  useEffect(() => {
    if (!siteId) {
      router.push("/onboarding");
      return;
    }

    // Initial poll on the next tick (async — setState never fires
    // synchronously inside the effect body), then every 3 seconds
    const initial = setTimeout(() => {
      void pollStatus();
    }, 0);
    const interval = setInterval(() => {
      void pollStatus();
    }, 3000);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [siteId, pollStatus, router]);

  const isComplete = data?.status === "active";
  const isError = data?.status === "error";
  const pagesCount = data?.pagesCount ?? 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <OnboardingProgress currentStep={3} />
      <div className="max-w-md w-full text-center">
        {isError ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} strokeWidth={1.5} className="text-[#DC2626]" />
            </div>
            <h1 className="text-2xl font-semibold text-[#111827] mb-2">Import failed</h1>
            <p className="text-[#4B5563] mb-6">
              Something went wrong while importing your data. Please try again.
            </p>
            <button
              onClick={() => router.push("/onboarding")}
              className="h-12 px-8 rounded-lg bg-[#3B82F6] text-white text-[15px] font-semibold hover:bg-[#2563EB] transition-colors"
            >
              Try again
            </button>
          </>
        ) : isComplete ? (
          <>
            <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} strokeWidth={1.5} className="text-[#16A34A]" />
            </div>
            <h1 className="text-2xl font-semibold text-[#111827] mb-2">Import complete!</h1>
            <p className="text-[#4B5563] mb-2">
              Found <span className="font-semibold text-[#111827]">{pagesCount} pages</span> on{" "}
              <span className="font-semibold text-[#111827]">{data?.domain}</span>.
            </p>
            <p className="text-sm text-[#9CA3AF]">
              Redirecting to {redirectTarget === "settings" ? "settings" : "dashboard"}...
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mx-auto mb-6">
              <Loader2 size={32} strokeWidth={1.5} className="text-[#3B82F6] animate-spin" />
            </div>
            <h1 className="text-2xl font-semibold text-[#111827] mb-2">Importing your data</h1>
            <p className="text-[#4B5563] mb-6">
              Pulling 16 months of search data from Google. This may take a minute.
            </p>

            {/* Progress bar */}
            <div className="w-full bg-[#E5E7EB] rounded-full h-2 mb-4 overflow-hidden">
              <div
                className="h-full bg-[#3B82F6] rounded-full transition-all duration-500"
                style={{ width: data ? `${Math.min((pagesCount / 100) * 80 + 10, 95)}%` : "5%" }}
              />
            </div>

            {pagesCount > 0 && (
              <p className="text-sm text-[#4B5563]">
                <span className="font-semibold text-[#111827]">{pagesCount}</span> pages found so far...
              </p>
            )}

            {error && (
              <p className="text-sm text-[#DC2626] mt-4">{error}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
