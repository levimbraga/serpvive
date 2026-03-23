"use client";

import { useState, useEffect } from "react";
import { List } from "lucide-react";

type Heading = { id: string; text: string; level: number };

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block sticky top-28 w-56 shrink-0 self-start">
      <div className="flex items-center gap-2 text-[12px] font-bold text-[#94A3B8] uppercase tracking-wider mb-4">
        <List size={14} strokeWidth={1.5} />
        On this page
      </div>
      <ul className="flex flex-col gap-1 border-l border-[#1E293B]">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block text-[13px] leading-snug no-underline transition-colors py-1.5 ${
                h.level === 3 ? "pl-6" : "pl-4"
              } ${
                activeId === h.id
                  ? "text-[#3B82F6] border-l-2 border-[#3B82F6] -ml-px font-medium"
                  : "text-[#64748B] hover:text-[#94A3B8]"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
