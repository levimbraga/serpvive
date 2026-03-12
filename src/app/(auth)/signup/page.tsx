import type { Metadata } from "next";
import SignupForm from "./_signup-form";

export const metadata: Metadata = {
  title: "Sign Up — SerpVive",
};

export default function SignupPage() {
  return <SignupForm />;
}
