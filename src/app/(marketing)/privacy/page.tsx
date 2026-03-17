import type { Metadata } from "next";
import LegalPage, { H2, P, UL, LI, Strong, A } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — SerpVive",
  description: "How SerpVive collects, uses, and protects your data.",
};

const SECTIONS = [
  { id: "what-we-collect", label: "What We Collect" },
  { id: "how-we-use", label: "How We Use It" },
  { id: "google-search-console", label: "Google Search Console" },
  { id: "ai-processing", label: "AI Processing" },
  { id: "third-party-services", label: "Third-Party Services" },
  { id: "cookies", label: "Cookies" },
  { id: "data-retention", label: "Data Retention" },
  { id: "your-rights", label: "Your Rights" },
  { id: "contact", label: "Contact" },
];

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="March 2026" sections={SECTIONS}>
      <P>
        SerpVive (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is operated by Levi Braga, based in Brazil.
        This Privacy Policy explains how we collect, use, and protect your personal information
        when you use serpvive.com and our services.
      </P>

      <H2 id="what-we-collect">What We Collect</H2>
      <P>We collect the following information:</P>
      <UL>
        <LI><Strong>Account information:</Strong> your name, email address, and country (provided at signup).</LI>
        <LI><Strong>Google Search Console data:</Strong> search performance data (clicks, impressions, positions, CTR) for the sites you connect. We request <Strong>read-only</Strong> access only.</LI>
        <LI><Strong>Usage data:</Strong> pages you visit, features you use, and diagnoses you request (via PostHog, anonymized).</LI>
        <LI><Strong>Payment information:</Strong> processed entirely by Stripe. We never see or store your credit card number.</LI>
      </UL>

      <H2 id="how-we-use">How We Use Your Data</H2>
      <P>We use your data to:</P>
      <UL>
        <LI>Monitor your content performance and calculate Health Scores and Decay Scores.</LI>
        <LI>Run AI-powered diagnoses that compare your content with competitors.</LI>
        <LI>Generate Refresh Briefs with actionable recommendations.</LI>
        <LI>Send weekly digest emails with your site&apos;s health status.</LI>
        <LI>Improve the product based on anonymized usage patterns.</LI>
      </UL>
      <P>We do <Strong>not</Strong> sell your data to third parties. We do <Strong>not</Strong> use your data for advertising.</P>

      <H2 id="google-search-console">Google Search Console</H2>
      <P>
        When you connect your Google Search Console, we request <Strong>read-only access</Strong> (scope: <code className="text-[13px] bg-[#F3F4F6] px-1.5 py-0.5 rounded">webmasters.readonly</code>).
        We cannot modify your Search Console data, submit URLs, or change any settings.
      </P>
      <P>
        We store your GSC OAuth tokens securely and use them to pull search performance data.
        You can disconnect your GSC at any time from Settings, which revokes our access immediately.
      </P>

      <H2 id="ai-processing">AI Processing</H2>
      <P>
        When you request a diagnosis, we send your page content and competitor content to
        Anthropic&apos;s Claude API for analysis. Important details:
      </P>
      <UL>
        <LI>Anthropic does <Strong>not</Strong> use API inputs/outputs to train their models (per their <A href="https://www.anthropic.com/policies/privacy-policy">privacy policy</A>).</LI>
        <LI>Content is processed in real-time and not stored by Anthropic after the request completes.</LI>
        <LI>We store the diagnosis results (causes, brief, recommendations) in our database tied to your account.</LI>
      </UL>

      <H2 id="third-party-services">Third-Party Services</H2>
      <P>We use the following third-party services:</P>
      <UL>
        <LI><Strong>Supabase</Strong> (database and authentication) — hosted on AWS, PostgreSQL.</LI>
        <LI><Strong>Vercel</Strong> (hosting and deployment) — serves the web application.</LI>
        <LI><Strong>Stripe</Strong> (payments) — processes all payment transactions. We never store card data.</LI>
        <LI><Strong>Anthropic Claude</Strong> (AI) — processes content for diagnosis. Data not used for training.</LI>
        <LI><Strong>Serper.dev</Strong> (SERP data) — retrieves Google search results for competitor analysis.</LI>
        <LI><Strong>Resend</Strong> (email) — sends transactional and digest emails.</LI>
        <LI><Strong>PostHog</Strong> (analytics) — anonymized usage analytics. No personal data shared.</LI>
      </UL>

      <H2 id="cookies">Cookies</H2>
      <P>We use only essential cookies:</P>
      <UL>
        <LI><Strong>Authentication cookies:</Strong> Supabase session tokens to keep you logged in.</LI>
        <LI><Strong>Preference cookies:</Strong> active site selection, UI preferences.</LI>
        <LI><Strong>Analytics:</Strong> PostHog uses a first-party cookie for anonymous session tracking. No cross-site tracking.</LI>
      </UL>
      <P>
        We do <Strong>not</Strong> use advertising cookies or third-party tracking cookies.
        See our <A href="/cookies">Cookie Policy</A> for full details.
      </P>

      <H2 id="data-retention">Data Retention</H2>
      <UL>
        <LI><Strong>Active accounts:</Strong> data is retained as long as your account is active.</LI>
        <LI><Strong>Deleted accounts:</Strong> all data is permanently deleted within 30 days of account deletion.</LI>
        <LI><Strong>Free accounts:</Strong> inactive accounts with no login for 12 months may be deleted with 30 days notice.</LI>
        <LI><Strong>GSC data:</Strong> search performance data is deleted immediately when you disconnect a site.</LI>
      </UL>

      <H2 id="your-rights">Your Rights</H2>
      <P>
        Depending on your location, you may have the following rights under GDPR (EU), LGPD (Brazil), or similar laws:
      </P>
      <UL>
        <LI><Strong>Access:</Strong> request a copy of all data we hold about you.</LI>
        <LI><Strong>Correction:</Strong> update or correct your personal information.</LI>
        <LI><Strong>Deletion:</Strong> request permanent deletion of your account and all associated data.</LI>
        <LI><Strong>Export:</Strong> request a machine-readable export of your data.</LI>
        <LI><Strong>Objection:</Strong> object to data processing for specific purposes.</LI>
      </UL>
      <P>
        You can delete your account directly from Settings &gt; Danger Zone. For data export or other requests,
        email us at <A href="mailto:serpvive@gmail.com">serpvive@gmail.com</A>.
      </P>

      <H2 id="contact">Contact</H2>
      <P>
        For any privacy-related questions or requests, contact us at:<br />
        <A href="mailto:serpvive@gmail.com">serpvive@gmail.com</A>
      </P>
      <P>
        Levi Braga<br />
        SerpVive — serpvive.com<br />
        Brazil
      </P>
    </LegalPage>
  );
}
