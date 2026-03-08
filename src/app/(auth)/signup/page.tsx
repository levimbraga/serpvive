import { redirect } from "next/navigation";

// TODO: Remove this redirect when signup is enabled
export default function SignupPage() {
  redirect("/login?msg=signup-disabled");
}

/* ═══════════════════════════════════════════════════════════════
 * ORIGINAL SIGNUP CODE — preserved for when we enable signups.
 * To re-enable: replace this entire file with the version from
 * git commit 06806aa (or remove the redirect above and restore
 * the original "use client" component below).
 * ═══════════════════════════════════════════════════════════════ */
