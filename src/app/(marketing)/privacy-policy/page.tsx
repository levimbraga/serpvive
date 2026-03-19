import type { Metadata } from "next";
import LegalPage, { H2, P, UL, LI, Strong, A } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — SerpVive",
  description: "How SerpVive collects, uses, and protects your data, including Google User Data.",
};

const SECTIONS = [
  { id: "what-we-collect", label: "What We Collect" },
  { id: "google-user-data", label: "Google User Data We Access" },
  { id: "how-we-use", label: "How We Use Your Data" },
  { id: "how-we-use-google", label: "How We Use Google User Data" },
  { id: "data-sharing", label: "How We Share Google User Data" },
  { id: "data-storage", label: "How We Store and Protect Your Data" },
  { id: "data-retention", label: "Data Retention and Deletion" },
  { id: "google-api-compliance", label: "Google API Services Compliance" },
  { id: "ai-processing", label: "AI Processing" },
  { id: "cookies", label: "Cookies" },
  { id: "your-rights", label: "Your Rights" },
  { id: "contact", label: "Contact" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="March 2026" sections={SECTIONS}>
      <P>
        SerpVive (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is operated by Levi Braga, based in Brazil.
        This Privacy Policy explains how we collect, use, store, and protect your personal information
        when you use serpvive.com and our services.
      </P>

      {/* ── What We Collect ── */}
      <H2 id="what-we-collect">What We Collect</H2>
      <P>We collect the following information:</P>
      <UL>
        <LI><Strong>Account information:</Strong> your name, email address, and country (provided at signup or via Google Sign-In).</LI>
        <LI><Strong>Google Search Console data:</Strong> search performance data (clicks, impressions, positions, CTR) for the sites you connect. We request <Strong>read-only</Strong> access only.</LI>
        <LI><Strong>Usage data:</Strong> pages you visit, features you use, and diagnoses you request (via PostHog, anonymized).</LI>
        <LI><Strong>Payment information:</Strong> processed entirely by Stripe. We never see or store your credit card number.</LI>
      </UL>

      {/* ── Google User Data We Access ── */}
      <H2 id="google-user-data">Google User Data We Access</H2>

      <P><Strong>Google Search Console:</Strong></P>
      <P>
        We access your search performance data through the Google Search Console API with read-only
        permission (scope: <code className="text-[13px] bg-[#F3F4F6] px-1.5 py-0.5 rounded">webmasters.readonly</code>).
        This includes:
      </P>
      <UL>
        <LI>Search queries that lead to your website</LI>
        <LI>Click counts, impressions, average position, and CTR per page</LI>
        <LI>Page-level performance metrics over the last 16 months</LI>
      </UL>

      <P><Strong>Google Account (for login):</Strong></P>
      <P>
        When you sign in with Google, we access your name, email address, and profile picture solely
        for authentication purposes.
      </P>

      <P><Strong>We do NOT access:</Strong></P>
      <UL>
        <LI>Gmail, Google Drive, Google Ads, Google Analytics, or any other Google service data.</LI>
        <LI>We cannot modify your Search Console data, submit URLs, or change any settings — our access is strictly read-only.</LI>
      </UL>

      {/* ── How We Use Your Data ── */}
      <H2 id="how-we-use">How We Use Your Data</H2>
      <P>We use your data to:</P>
      <UL>
        <LI>Monitor your content performance and calculate Health Scores and Decay Scores.</LI>
        <LI>Run AI-powered diagnoses that compare your content with competitors.</LI>
        <LI>Generate Refresh Briefs with actionable recommendations and micro-drafts.</LI>
        <LI>Measure the results of content updates (before/after comparison).</LI>
        <LI>Send weekly digest emails with your site&apos;s health status.</LI>
        <LI>Improve the product based on anonymized usage patterns.</LI>
      </UL>
      <P>We do <Strong>not</Strong> sell your data to third parties. We do <Strong>not</Strong> use your data for advertising.</P>

      {/* ── How We Use Google User Data ── */}
      <H2 id="how-we-use-google">How We Use Google User Data</H2>
      <P>Search Console data is used exclusively to:</P>
      <UL>
        <LI>Monitor your website&apos;s search performance over time.</LI>
        <LI>Calculate decay scores and health scores for your pages.</LI>
        <LI>Identify pages that are losing traffic.</LI>
        <LI>Generate AI-powered diagnoses that explain why pages are declining.</LI>
        <LI>Measure the results of content updates (before/after comparison).</LI>
      </UL>
      <P>
        Google account data (name, email) is used solely for authentication and account identification.
      </P>
      <P>
        We do <Strong>not</Strong> use Google user data for advertising, marketing to third parties,
        or any purpose unrelated to providing the SerpVive service.
      </P>

      {/* ── How We Share Google User Data ── */}
      <H2 id="data-sharing">How We Share Google User Data</H2>
      <P>
        We share Google user data with the following third-party services, solely to provide the SerpVive service:
      </P>
      <UL>
        <LI>
          <Strong>Supabase (database hosting):</Strong> Stores your search performance data securely
          in PostgreSQL with Row Level Security. Hosted on AWS infrastructure.
        </LI>
        <LI>
          <Strong>Anthropic (AI analysis):</Strong> When you request an AI diagnosis, your page&apos;s
          performance data and content are sent to Claude AI for analysis. Anthropic does not use API
          inputs/outputs to train their models (per their{" "}
          <A href="https://www.anthropic.com/policies/privacy-policy">privacy policy</A>).
        </LI>
        <LI>
          <Strong>Vercel (hosting):</Strong> Processes API requests. Does not persistently store Google user data.
        </LI>
      </UL>
      <P>
        We do <Strong>not</Strong> sell, rent, or share Google user data with advertisers, data brokers,
        or any third party for their own purposes.
      </P>
      <P>
        We do <Strong>not</Strong> share your Google Search Console data with other SerpVive users.
        Each user&apos;s data is isolated via Row Level Security.
      </P>

      {/* ── How We Store and Protect Your Data ── */}
      <H2 id="data-storage">How We Store and Protect Your Data</H2>
      <P>All Google user data is stored in Supabase (PostgreSQL) with:</P>
      <UL>
        <LI>Row Level Security (RLS) ensuring each user can only access their own data.</LI>
        <LI>Encrypted connections (TLS/SSL) for all data in transit.</LI>
        <LI>Google OAuth refresh tokens are stored encrypted in the database.</LI>
        <LI>Access tokens are short-lived (1 hour) and refreshed automatically.</LI>
      </UL>
      <P>We use industry-standard security practices including:</P>
      <UL>
        <LI>HTTPS everywhere — all connections are encrypted.</LI>
        <LI>Secure HTTP-only cookies for authentication sessions.</LI>
        <LI>Rate limiting on all API endpoints.</LI>
        <LI>Input validation and sanitization on all user inputs (via Zod schema validation).</LI>
        <LI>No secret keys or API credentials are ever exposed to the client/browser.</LI>
      </UL>

      {/* ── Data Retention and Deletion ── */}
      <H2 id="data-retention">Data Retention and Deletion</H2>
      <UL>
        <LI><Strong>Active accounts:</Strong> we retain your Google Search Console data for as long as your account is active.</LI>
        <LI>
          <Strong>Disconnect GSC:</Strong> you can disconnect your Google Search Console at any time from Settings.
          This removes the OAuth connection but retains historical performance data in your account.
        </LI>
        <LI>
          <Strong>Delete account:</Strong> you can delete your entire account at any time from Settings &gt; Danger Zone.
          This permanently deletes <Strong>all</Strong> your data, including:
          <UL>
            <LI>All Google Search Console data (metrics, queries, page performance data)</LI>
            <LI>All AI diagnoses and refresh history</LI>
            <LI>Your profile and account information</LI>
            <LI>OAuth tokens and connections</LI>
          </UL>
        </LI>
        <LI><Strong>Free accounts:</Strong> inactive accounts with no login for 12 months may be deleted with 30 days notice.</LI>
      </UL>
      <P>
        After account deletion, we retain no Google user data. To request data deletion without
        deleting your account, contact us at <A href="mailto:serpvive@gmail.com">serpvive@gmail.com</A>.
      </P>

      {/* ── Google API Services Compliance ── */}
      <H2 id="google-api-compliance">Google API Services Compliance</H2>
      <P>
        SerpVive&apos;s use and transfer to any other app of information received from Google APIs will
        adhere to the{" "}
        <A href="https://developers.google.com/terms/api-services-user-data-policy">
          Google API Services User Data Policy
        </A>
        , including the Limited Use requirements.
      </P>
      <P>
        We only request the minimum scopes necessary:{" "}
        <code className="text-[13px] bg-[#F3F4F6] px-1.5 py-0.5 rounded">webmasters.readonly</code>{" "}
        for Search Console data access, and standard sign-in scopes (email, profile) for Google authentication.
      </P>

      {/* ── AI Processing ── */}
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

      {/* ── Cookies ── */}
      <H2 id="cookies">Cookies</H2>
      <P>We use only essential cookies:</P>
      <UL>
        <LI><Strong>Authentication cookies:</Strong> Supabase session tokens to keep you logged in.</LI>
        <LI><Strong>Preference cookies:</Strong> active site selection, UI preferences.</LI>
        <LI><Strong>Analytics:</Strong> PostHog uses a first-party cookie for anonymous session tracking. No cross-site tracking.</LI>
      </UL>
      <P>
        We do <Strong>not</Strong> use advertising cookies or third-party tracking cookies.
        See our <A href="/cookie-policy">Cookie Policy</A> for full details.
      </P>

      {/* ── Your Rights ── */}
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

      {/* ── Contact ── */}
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
