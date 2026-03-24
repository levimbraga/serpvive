import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { CookieConsentBanner } from "@/components/analytics/cookie-consent-banner";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="landing">
      <GoogleAnalytics />
      {children}
      <CookieConsentBanner />
    </div>
  );
}
