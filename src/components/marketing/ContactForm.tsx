"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || undefined, email, subject: subject || undefined, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-[#D1FAE5] bg-[#ECFDF5] p-8 text-center">
        <CheckCircle2 size={32} strokeWidth={1.5} className="text-[#059669] mx-auto mb-3" />
        <p className="text-[16px] font-semibold text-[#111827] mb-1">
          Message sent
        </p>
        <p className="text-[14px] text-[#4B5563]">
          We&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-[13px] font-medium text-[#2563EB] hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-[#D1D5DB] bg-white px-4 py-2.5 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Name */}
      <div>
        <label htmlFor="contact-name" className="block text-[13px] font-medium text-[#374151] mb-1.5">
          Name <span className="text-[#9CA3AF]">(optional)</span>
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={100}
          className={inputClass}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="contact-email" className="block text-[13px] font-medium text-[#374151] mb-1.5">
          Email <span className="text-[#DC2626]">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          maxLength={200}
          className={inputClass}
        />
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="contact-subject" className="block text-[13px] font-medium text-[#374151] mb-1.5">
          Subject <span className="text-[#9CA3AF]">(optional)</span>
        </label>
        <input
          id="contact-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What's this about?"
          maxLength={200}
          className={inputClass}
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className="block text-[13px] font-medium text-[#374151] mb-1.5">
          Message <span className="text-[#DC2626]">*</span>
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your message..."
          required
          maxLength={2000}
          rows={5}
          className={`${inputClass} resize-y min-h-[120px]`}
        />
        <p className="text-[11px] text-[#9CA3AF] mt-1 text-right">
          {message.length}/2000
        </p>
      </div>

      {/* Error */}
      {status === "error" && errorMsg && (
        <p className="text-[13px] text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-4 py-2.5">
          {errorMsg}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] text-white font-semibold px-6 py-3 text-[15px] hover:bg-[#1D4ED8] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <>
            <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send size={16} strokeWidth={1.5} />
            Send message
          </>
        )}
      </button>
    </form>
  );
}
