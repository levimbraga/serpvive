"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

type PostHogIdentifyProps = {
  userId: string;
  email: string;
  plan: string;
};

export function PostHogIdentify({ userId, email, plan }: PostHogIdentifyProps) {
  useEffect(() => {
    posthog.identify(userId, { email, plan });
  }, [userId, email, plan]);

  return null;
}
