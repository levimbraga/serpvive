"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

type PostHogIdentifyProps = {
  userId: string;
  email: string;
  plan: string;
  sitesCount?: number;
  diagnosesUsed?: number;
};

export function PostHogIdentify({ userId, email, plan, sitesCount, diagnosesUsed }: PostHogIdentifyProps) {
  useEffect(() => {
    posthog.identify(userId, {
      email,
      plan,
      sites_count: sitesCount ?? 0,
      diagnoses_used_this_month: diagnosesUsed ?? 0,
    });
  }, [userId, email, plan, sitesCount, diagnosesUsed]);

  return null;
}
