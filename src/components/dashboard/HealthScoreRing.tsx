"use client";

import { useEffect, useState } from "react";

type HealthScoreRingProps = {
  score: number;
  delta: number | null;
  size?: number;
};

function getScoreColor(score: number): string {
  if (score >= 80) return "#16A34A"; // green
  if (score >= 60) return "#D97706"; // amber
  if (score >= 40) return "#DC2626"; // red
  return "#6B7280";                  // gray
}

export default function HealthScoreRing({ score, delta, size = 200 }: HealthScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    // Animate score from 0 to target
    const duration = 1200;
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [score]);

  const color = getScoreColor(score);
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          {/* Score arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-100"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-[#111827]" style={{ fontFamily: "var(--font-mono, monospace)" }}>
            {animatedScore}
          </span>
          <span className="text-sm text-[#6B7280] mt-0.5">Health Score</span>
        </div>
      </div>

      {/* Delta */}
      {delta !== null && delta !== 0 && (
        <div className={`flex items-center gap-1 text-sm font-medium ${
          delta > 0 ? "text-[#16A34A]" : "text-[#DC2626]"
        }`}>
          <span>{delta > 0 ? "+" : ""}{delta}</span>
          <span>{delta > 0 ? "↑" : "↓"}</span>
          <span className="text-[#9CA3AF] font-normal ml-1">vs last week</span>
        </div>
      )}
    </div>
  );
}
