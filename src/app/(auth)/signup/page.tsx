import type { Metadata } from "next";
import SignupForm from "./_signup-form";

export const metadata: Metadata = {
  title: "Sign Up Free — SerpVive",
  description: "Create your free SerpVive account. Monitor content decay, get AI-powered diagnosis, and protect your blog traffic.",
  alternates: { canonical: "https://serpvive.com/signup" },
};

export default function SignupPage() {
  return <SignupForm />;
}
