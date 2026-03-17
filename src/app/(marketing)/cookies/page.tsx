import type { Metadata } from "next";
import LegalPage, { H2, P, UL, LI, Strong, A } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy — SerpVive",
  description: "How SerpVive uses cookies.",
};

const SECTIONS = [
  { id: "what-are-cookies", label: "What Are Cookies" },
  { id: "essential", label: "Essential Cookies" },
  { id: "analytics", label: "Analytics Cookies" },
  { id: "no-advertising", label: "No Advertising Cookies" },
  { id: "manage-cookies", label: "Managing Cookies" },
  { id: "contact", label: "Contact" },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy" lastUpdated="March 2026" sections={SECTIONS}>
      <P>
        This Cookie Policy explains how SerpVive uses cookies and similar technologies
        when you visit serpvive.com.
      </P>

      <H2 id="what-are-cookies">What Are Cookies</H2>
      <P>
        Cookies are small text files stored on your device by your web browser. They help websites
        remember information about your visit, like your login status and preferences.
      </P>

      <H2 id="essential">Essential Cookies</H2>
      <P>These cookies are required for the Service to function. They cannot be disabled.</P>
      <UL>
        <LI>
          <Strong>Authentication (Supabase):</Strong> session tokens that keep you logged in.
          These are httpOnly cookies set by Supabase Auth and expire when your session ends or
          after the configured session duration.
        </LI>
        <LI>
          <Strong>Site preference:</Strong> stores your active site selection so the dashboard
          remembers which site to show.
        </LI>
        <LI>
          <Strong>GSC tokens:</Strong> temporary httpOnly cookies used during the Google Search Console
          connection flow. These expire within 1 hour.
        </LI>
      </UL>

      <H2 id="analytics">Analytics Cookies</H2>
      <P>We use <Strong>PostHog</Strong> for product analytics. Key details:</P>
      <UL>
        <LI>PostHog is self-hosted/cloud with data stored in the US.</LI>
        <LI>Analytics are <Strong>anonymous</Strong> — we track feature usage, not personal browsing habits.</LI>
        <LI>PostHog sets a first-party cookie to maintain anonymous session identity.</LI>
        <LI>No data is shared with advertising networks or third-party trackers.</LI>
        <LI>We use analytics to understand which features are used and improve the product.</LI>
      </UL>

      <H2 id="no-advertising">No Advertising Cookies</H2>
      <P>
        SerpVive does <Strong>not</Strong> use:
      </P>
      <UL>
        <LI>Advertising or retargeting cookies.</LI>
        <LI>Third-party tracking pixels (Facebook, Google Ads, etc.).</LI>
        <LI>Cross-site tracking of any kind.</LI>
        <LI>Cookie consent walls (because we don&apos;t need them — we only use essential and anonymous analytics cookies).</LI>
      </UL>

      <H2 id="manage-cookies">Managing Cookies</H2>
      <P>
        You can manage cookies through your browser settings. Note that disabling essential cookies
        will prevent you from logging in to SerpVive.
      </P>
      <P>Common browser cookie settings:</P>
      <UL>
        <LI><A href="https://support.google.com/chrome/answer/95647">Chrome</A></LI>
        <LI><A href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop">Firefox</A></LI>
        <LI><A href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac">Safari</A></LI>
        <LI><A href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09">Edge</A></LI>
      </UL>

      <H2 id="contact">Contact</H2>
      <P>
        For questions about our cookie usage, contact us at:<br />
        <A href="mailto:hello@serpvive.com">hello@serpvive.com</A>
      </P>
    </LegalPage>
  );
}
