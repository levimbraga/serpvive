"use client";

import Navbar from "./Navbar";
import Footer from "./Footer";

type Section = { id: string; label: string };

export default function LegalPage({
  title,
  lastUpdated,
  sections,
  children,
}: {
  title: string;
  lastUpdated?: string;
  sections?: Section[];
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />

      {/* Dark header */}
      <section
        className="pt-[140px] sm:pt-[160px] pb-12 px-5 sm:px-12 text-center"
        style={{ background: "#07090F" }}
      >
        <h1
          className="text-[28px] sm:text-[36px] font-extrabold text-white mb-2"
          style={{ letterSpacing: "-0.03em" }}
        >
          {title}
        </h1>
        {lastUpdated && (
          <p className="text-[14px] text-[#64748B]">Last updated: {lastUpdated}</p>
        )}
      </section>

      {/* White content area */}
      <section className="bg-white px-5 sm:px-12 py-12 sm:py-16 min-h-[60vh]">
        <div className="max-w-[1000px] mx-auto flex gap-12">
          {/* Sticky sidebar */}
          {sections && sections.length > 0 && (
            <aside className="hidden lg:block w-[180px] flex-shrink-0">
              <nav className="sticky top-28 space-y-1.5">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block text-[13px] text-[#6B7280] hover:text-[#111827] transition-colors py-1 no-underline"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            </aside>
          )}

          {/* Content */}
          <article className="flex-1 max-w-[800px]">
            {children}
          </article>
        </div>
      </section>

      <Footer />
    </>
  );
}

/* ── Reusable styled elements for legal prose ── */

export function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-[20px] sm:text-[22px] font-bold text-[#111827] mt-10 mb-4 scroll-mt-28"
      style={{ letterSpacing: "-0.02em" }}
    >
      {children}
    </h2>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[15px] sm:text-[16px] text-[#374151] leading-[1.7] mb-4">
      {children}
    </p>
  );
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-6 mb-4 space-y-1.5">{children}</ul>;
}

export function LI({ children }: { children: React.ReactNode }) {
  return (
    <li className="text-[15px] sm:text-[16px] text-[#374151] leading-[1.7]">
      {children}
    </li>
  );
}

export function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-[#111827]">{children}</strong>;
}

export function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-[#3B82F6] hover:underline">
      {children}
    </a>
  );
}
