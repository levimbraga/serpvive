"use client";

import { useState } from "react";

type WaitlistState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

export function useWaitlist() {
  const [state, setState] = useState<WaitlistState>({
    status: "idle",
    message: "",
  });

  async function submit(email: string, source: string) {
    setState({ status: "loading", message: "" });

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok) {
        setState({
          status: "error",
          message: data.error ?? "Something went wrong.",
        });
        return;
      }

      setState({
        status: "success",
        message: "You're on the list! We'll notify you at launch.",
      });
    } catch {
      setState({
        status: "error",
        message: "Network error. Please try again.",
      });
    }
  }

  function reset() {
    setState({ status: "idle", message: "" });
  }

  return { ...state, submit, reset };
}
