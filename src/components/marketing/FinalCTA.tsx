"use client";

import posthog from "posthog-js";
import { useWaitlist } from "@/hooks/use-waitlist";

export default function FinalCTA() {
  const { status, message, submit, reset } = useWaitlist();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email") as string;
    if (email) {
      posthog.capture("cta_clicked", { location: "final" });
      void submit(email, "final-cta");
    }
  }

  return (
    <section className="final" id="waitlist">
      <div className="final-inner">
        <h2>
          Your content is decaying right now.<br />
          <span className="dim">Do you know which posts?</span>
        </h2>
        <p className="fsub">Start monitoring your blog — free. No credit card required.</p>

        {status === "success" ? (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#22C55E" }}>{message}</p>
            <button
              onClick={reset}
              style={{ marginTop: 8, fontSize: 13, color: "#64748B", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
            >
              Submit another email
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="final-form">
              <input
                type="email"
                name="email"
                placeholder="you@company.com"
                required
              />
              <button type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Joining..." : "Join Waitlist →"}
              </button>
            </form>

            {status === "duplicate" && (
              <p style={{ fontSize: 13, color: "#F59E0B", marginTop: 8, marginBottom: 8 }}>
                ⚠️ {message}
              </p>
            )}

            {status === "error" && (
              <p style={{ fontSize: 13, color: "#EF4444", marginTop: 8, marginBottom: 8 }}>{message}</p>
            )}
          </>
        )}

        <div className="early">🔥 Get started free — no credit card required</div>

        <div className="f-trust">
          <span>No spam</span>
          <span>Cancel anytime</span>
          <span>First AI diagnosis included</span>
        </div>
      </div>
    </section>
  );
}
