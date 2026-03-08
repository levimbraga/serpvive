import Link from "next/link";

// TODO: Remove this gate when app is launched — restore original login from git commit 06806aa
export default function LoginPage() {
  return (
    <div className="w-full max-w-[480px]">
      <div className="text-center mb-10">
        <h1 className="text-[32px] font-extrabold tracking-tight text-white">
          Serp<span className="text-[#3B82F6]">Vive</span>
        </h1>
        <p className="text-[#94A3B8] text-base mt-3">App coming soon</p>
      </div>

      <div className="bg-[#0F1219] border border-[#1E293B] rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        <h2 className="text-white text-lg font-semibold mb-2">App coming soon.</h2>
        <p className="text-[#94A3B8] text-[15px] leading-relaxed mb-6">
          We&apos;re building something great. Join the waitlist to be the first to know when we launch.
        </p>

        <Link
          href="https://serpvive.com/#waitlist"
          className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-[#3B82F6] text-white text-[15px] font-semibold hover:bg-[#2563EB] transition-colors"
        >
          Join the Waitlist
        </Link>
      </div>
    </div>
  );
}
