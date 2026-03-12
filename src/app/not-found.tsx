import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center text-center px-6">
      <p className="text-8xl font-extrabold text-[#1E293B] select-none">404</p>
      <h1 className="text-2xl font-semibold text-white mt-4">
        Page not found
      </h1>
      <p className="text-[#94A3B8] mt-2 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex items-center gap-4 mt-8">
        <Link
          href="/"
          className="h-11 px-6 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold transition-colors inline-flex items-center"
        >
          Go home
        </Link>
        <Link
          href="/dashboard"
          className="h-11 px-6 rounded-xl border border-[#1E293B] text-[#94A3B8] hover:text-white hover:border-[#334155] text-sm font-medium transition-colors inline-flex items-center"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
