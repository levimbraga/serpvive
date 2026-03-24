import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { CookieConsentBanner } from "@/components/analytics/cookie-consent-banner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090F] px-4">
      <GoogleAnalytics />
      {children}
      <CookieConsentBanner />
    </div>
  );
}
