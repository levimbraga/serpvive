import { redirect } from "next/navigation";

// Signup is disabled — redirect to login
// Enhanced signup form (with full_name, country, auto-detect) is ready
// in git history. To re-enable: restore from this commit's version of the file.
export default function SignupPage() {
  redirect("/login?msg=signup-disabled");
}
