"use client";

import { useWaitlist } from "@/hooks/use-waitlist";

export default function FinalCTA() {
  const { status, message, submit, reset } = useWaitlist();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email") as string;
    if (email) {
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
        <p className="fsub">Join the waitlist. Be first to revive your rankings.</p>

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
        )}

        {status === "error" && (
          <p style={{ fontSize: 13, color: "#EF4444", marginBottom: 8 }}>{message}</p>
        )}

        <div className="early">🔥 Early subscribers get 14-day trial (instead of 7)</div>

        <div className="f-trust">
          <span>No spam</span>
          <span>Cancel anytime</span>
          <span>First diagnosis free</span>
        </div>
      </div>
    </section>
  );
}
