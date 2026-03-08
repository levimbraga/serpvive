import type { Metadata } from "next";
import { getSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard — SerpVive",
};

export default async function DashboardPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, plan, trial_ends_at")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name || profile?.email || user.email;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-2xl font-semibold text-[#111827] mb-2">
        Welcome to SerpVive
      </h1>
      <p className="text-[#4B5563] mb-6">
        Hey {displayName}, your account is ready.
      </p>
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 max-w-md w-full shadow-sm">
        <div className="space-y-3 text-sm text-left">
          <div className="flex justify-between">
            <span className="text-[#9CA3AF]">Plan</span>
            <span className="font-medium text-[#111827] capitalize">{profile?.plan ?? "trial"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9CA3AF]">Email</span>
            <span className="font-medium text-[#111827]">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9CA3AF]">Status</span>
            <span className="inline-flex items-center gap-1.5 text-[#16A34A] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
              Active
            </span>
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mt-4 pt-4 border-t border-[#E5E7EB]">
          Next step: Connect your Google Search Console to start monitoring.
        </p>
      </div>
    </div>
  );
}
