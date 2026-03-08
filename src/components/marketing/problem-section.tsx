"use client";

import { AlertTriangle } from "lucide-react";
import { useFadeIn } from "@/hooks/use-fade-in";
import { useEffect, useRef, useState } from "react";

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1200;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setValue(target);
        clearInterval(interval);
      } else {
        setValue(Math.floor(current * 100) / 100);
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [started, target]);

  const display = target === 90.63 ? value.toFixed(2) : Math.round(value).toString();

  return (
    <span ref={ref}>
      {started ? display : "0"}
      {suffix}
    </span>
  );
}

const STATS = [
  {
    value: 90.63,
    suffix: "%",
    label: "of content gets zero traffic from Google",
    source: "Ahrefs",
    color: "text-[#DC2626]",
    borderColor: "border-[#DC2626]/15",
  },
  {
    value: -20,
    suffix: "%",
    label: "organic traffic lost yearly by neglected blogs",
    source: "Conductor",
    color: "text-[#D97706]",
    borderColor: "border-[#D97706]/15",
  },
  {
    value: -25,
    suffix: "%",
    label: "search volume drop predicted by 2026",
    source: "Gartner",
    color: "text-[#DC2626]",
    borderColor: "border-[#DC2626]/15",
  },
];

export default function ProblemSection() {
  const { ref, isVisible } = useFadeIn();

  return (
    <section className="relative bg-[#0F1424] py-28">
      {/* Noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      <div
        ref={ref}
        className={`relative mx-auto max-w-[1200px] px-6 transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <h2 className="text-center text-[32px] font-extrabold tracking-[-0.02em] text-white sm:text-[40px]">
          Your blog is losing traffic{" "}
          <span className="text-[#DC2626]">right now.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[520px] text-center text-[16px] leading-[1.7] text-[#94A3B8]">
          Content decay is silent. By the time you notice, you&apos;ve already lost months of
          rankings and revenue.
        </p>

        {/* Stat cards */}
        <div className="mt-16 grid gap-5 sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <div
              key={stat.source}
              className={`rounded-2xl border ${stat.borderColor} bg-[#111827] p-7 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]`}
              style={{
                transitionDelay: isVisible ? `${i * 120}ms` : "0ms",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
              }}
            >
              <p className={`font-mono text-[42px] font-extrabold leading-none ${stat.color}`}>
                <CountUp target={Math.abs(stat.value)} suffix={stat.suffix} />
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-[#94A3B8]">{stat.label}</p>
              <p className="mt-4 border-t border-[#1E293B]/60 pt-3 text-[11px] font-semibold tracking-[0.1em] text-[#475569]">
                SOURCE: {stat.source.toUpperCase()}
              </p>
            </div>
          ))}
        </div>

        {/* AI Search alert */}
        <div className="mt-12 rounded-2xl border border-[#D97706]/15 bg-[#D97706]/[0.04] p-6">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D97706]/10">
              <AlertTriangle size={18} strokeWidth={1.5} className="text-[#D97706]" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#D97706]">
                AI Search is accelerating decay
              </p>
              <p className="mt-2 text-[14px] leading-[1.7] text-[#94A3B8]">
                ChatGPT cites content 25.7% more recent than traditional Google. 76.4% of pages
                cited by AI were updated in the last 30 days. Old content is becoming invisible — not
                just in Google, but in AI answers too.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
