import { Reveal } from "@/hooks/useReveal";
import {
  Activity,
  TrendingDown,
  Brain,
  FileEdit,
  Sun,
  BarChart3,
  Copy,
  Mail,
} from "lucide-react";

const FEATURES = [
  {
    icon: Activity,
    title: "Health Score",
    desc: "Site-wide health metric updated daily",
    accent: "blue" as const,
  },
  {
    icon: TrendingDown,
    title: "Decay Velocity",
    desc: "Know if a page is declining slowly or fast",
    accent: "orange" as const,
  },
  {
    icon: Brain,
    title: "AI Diagnosis",
    desc: "Claude Opus 4.6 analyzes your content vs top 10 SERP",
    accent: "purple" as const,
  },
  {
    icon: FileEdit,
    title: "Micro-Drafts",
    desc: "Copy-paste-ready fixes, not vague advice",
    accent: "purple" as const,
  },
  {
    icon: Sun,
    title: "Seasonal Detection",
    desc: "Distinguishes real decay from seasonal dips",
    accent: "amber" as const,
  },
  {
    icon: BarChart3,
    title: "Result Tracking",
    desc: "Automatic before/after comparison in 28 days",
    accent: "green" as const,
  },
  {
    icon: Copy,
    title: "Cannibalization",
    desc: "Detects when your own pages compete",
    accent: "red" as const,
  },
  {
    icon: Mail,
    title: "Weekly Digest",
    desc: "Email summary of what needs attention",
    accent: "blue" as const,
  },
];

const ACCENT_MAP = {
  blue: {
    text: "text-[#3B82F6]",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.2)",
  },
  purple: {
    text: "text-[#7C3AED]",
    bg: "rgba(124,58,237,0.1)",
    border: "rgba(124,58,237,0.2)",
  },
  orange: {
    text: "text-[#F97316]",
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.2)",
  },
  amber: {
    text: "text-[#F59E0B]",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.2)",
  },
  green: {
    text: "text-[#22C55E]",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.2)",
  },
  red: {
    text: "text-[#EF4444]",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.2)",
  },
};

export default function FeaturesGrid() {
  return (
    <section className="py-20 sm:py-28 px-5 sm:px-12">
      <div className="mx-auto" style={{ maxWidth: "min(1600px, 90vw)" }}>
        <Reveal>
          <h2
            className="font-extrabold leading-[1.1] text-center mb-5"
            style={{ fontSize: "clamp(2rem, 4vw, 4rem)", letterSpacing: "-0.04em" }}
          >
            Everything you need to{" "}
            <span className="text-[#3B82F6]">protect your traffic</span>
          </h2>
        </Reveal>
        <Reveal>
          <p className="text-[16px] sm:text-[18px] text-[#94A3B8] leading-relaxed text-center max-w-[520px] mx-auto mb-14">
            One platform. Detection to proof. No spreadsheets needed.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {FEATURES.map((feat) => {
            const a = ACCENT_MAP[feat.accent];
            const Icon = feat.icon;
            return (
              <Reveal key={feat.title}>
                <div
                  className="rounded-xl p-6 border border-[#1E293B] transition-all duration-300 hover:border-[#334155] hover:-translate-y-0.5 h-full"
                  style={{ background: "#0F1219" }}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${a.text}`}
                    style={{ background: a.bg, border: `1px solid ${a.border}` }}
                  >
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[15px] font-bold text-[#F1F5F9] mb-1.5">
                    {feat.title}
                  </h3>
                  <p className="text-[13px] text-[#94A3B8] leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
