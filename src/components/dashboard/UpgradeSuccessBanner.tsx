"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

export default function UpgradeSuccessBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      setShow(true);
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete("upgraded");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg px-5 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <CheckCircle2 size={20} strokeWidth={1.5} className="text-[#16A34A] flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-[#16A34A]">
            Welcome to your new plan!
          </p>
          <p className="text-xs text-[#15803D] mt-0.5">
            Daily monitoring is now active. AI diagnoses are unlocked.
          </p>
        </div>
      </div>
      <button onClick={() => setShow(false)} className="text-[#16A34A] hover:text-[#15803D]">
        <X size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}
