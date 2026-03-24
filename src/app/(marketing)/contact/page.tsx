import type { Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import ContactForm from "@/components/marketing/ContactForm";
import { Mail, Twitter } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — SerpVive",
  description:
    "Get in touch with the SerpVive team. Questions, feedback, or partnership inquiries.",
  alternates: { canonical: "https://serpvive.com/contact" },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <>
      <Navbar />

      {/* Dark hero */}
      <header
        className="pt-36 pb-12 sm:pt-40 sm:pb-16 px-5 sm:px-12 text-center"
        style={{ background: "#07090F" }}
      >
        <div className="mx-auto" style={{ maxWidth: "720px" }}>
          <h1
            className="font-extrabold text-[#F1F5F9] tracking-tight mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
          >
            Get in touch
          </h1>
          <p
            className="text-[#94A3B8] mx-auto"
            style={{ fontSize: "clamp(15px, 1.2vw, 18px)", maxWidth: "480px" }}
          >
            Questions, feedback, or partnership inquiries. We&apos;ll get back
            to you within 24 hours.
          </p>
        </div>
      </header>

      {/* Content (Light) */}
      <section className="bg-white px-5 sm:px-12 pt-12 sm:pt-16 pb-20 sm:pb-28">
        <div
          className="mx-auto grid md:grid-cols-5 gap-10 md:gap-14"
          style={{ maxWidth: "820px" }}
        >
          {/* Form (3 cols) */}
          <div className="md:col-span-3">
            <h2 className="text-lg font-bold text-[#111827] mb-5">
              Send us a message
            </h2>
            <ContactForm />
          </div>

          {/* Direct contact (2 cols) */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-bold text-[#111827] mb-5">
              Or reach out directly
            </h2>

            <div className="flex flex-col gap-4">
              <a
                href="mailto:serpvive@gmail.com"
                className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 no-underline group hover:border-[#2563EB]/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
                  <Mail size={16} strokeWidth={1.5} className="text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors">
                    Email
                  </p>
                  <p className="text-[13px] text-[#6B7280]">
                    serpvive@gmail.com
                  </p>
                </div>
              </a>

              <a
                href="https://x.com/levimbraga"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 no-underline group hover:border-[#2563EB]/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
                  <Twitter size={16} strokeWidth={1.5} className="text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors">
                    Twitter / X
                  </p>
                  <p className="text-[13px] text-[#6B7280]">
                    @levimbraga
                  </p>
                </div>
              </a>
            </div>

            <p className="text-[13px] text-[#9CA3AF] mt-6">
              We typically respond within 24 hours on business days.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
