import type { Metadata } from "next";
import LegalPage, { H2, P, UL, LI, Strong, A } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — SerpVive",
  description: "Terms and conditions for using SerpVive.",
};

const SECTIONS = [
  { id: "service", label: "The Service" },
  { id: "accounts", label: "Accounts" },
  { id: "plans-pricing", label: "Plans & Pricing" },
  { id: "cancellation", label: "Cancellation & Refunds" },
  { id: "acceptable-use", label: "Acceptable Use" },
  { id: "limits", label: "Service Limits" },
  { id: "availability", label: "Availability" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "changes", label: "Changes to Terms" },
  { id: "governing-law", label: "Governing Law" },
  { id: "contact", label: "Contact" },
];

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="March 2026" sections={SECTIONS}>
      <P>
        These Terms of Service (&quot;Terms&quot;) govern your use of SerpVive (&quot;the Service&quot;),
        operated by Levi Braga (&quot;we&quot;, &quot;us&quot;). By creating an account or using the Service,
        you agree to these Terms.
      </P>

      <H2 id="service">The Service</H2>
      <P>
        SerpVive is a SaaS platform that monitors blog content performance, detects traffic decline (content decay),
        provides AI-powered diagnoses explaining why pages are losing traffic, and generates actionable Refresh Briefs
        with specific recommendations to recover rankings.
      </P>

      <H2 id="accounts">Accounts</H2>
      <UL>
        <LI>You must provide accurate information when creating an account.</LI>
        <LI>You are responsible for maintaining the security of your account credentials.</LI>
        <LI>One person or entity per account. Sharing accounts is not permitted.</LI>
        <LI>You must be at least 18 years old to use the Service.</LI>
      </UL>

      <H2 id="plans-pricing">Plans & Pricing</H2>
      <P>SerpVive offers the following plans:</P>
      <UL>
        <LI><Strong>Free:</Strong> 1 site, 100 pages, 1 AI diagnosis, weekly monitoring.</LI>
        <LI><Strong>Starter ($29/mo):</Strong> 1 site, 100 pages, 10 AI diagnoses/month, daily monitoring.</LI>
        <LI><Strong>Pro ($69/mo):</Strong> 3 sites, 1,000 pages, 40 AI diagnoses/month, daily monitoring.</LI>
        <LI><Strong>Agency ($129/mo):</Strong> 10 sites, 5,000 pages, 120 AI diagnoses/month, daily monitoring.</LI>
      </UL>
      <P>
        Annual billing is available at a 17% discount. Prices are in USD and may be subject to applicable taxes.
        We reserve the right to change pricing with 30 days notice to existing subscribers.
      </P>

      <H2 id="cancellation">Cancellation & Refunds</H2>
      <UL>
        <LI>You can cancel your subscription at any time from Settings &gt; Plan &amp; Usage.</LI>
        <LI>After cancellation, you retain access to paid features until the end of your current billing period.</LI>
        <LI>After the billing period ends, your account reverts to the Free plan. Your data is preserved.</LI>
        <LI>We do not offer pro-rata refunds for partial billing periods.</LI>
        <LI>If you believe you were charged in error, contact <A href="mailto:serpvive@gmail.com">serpvive@gmail.com</A> within 7 days.</LI>
      </UL>

      <H2 id="acceptable-use">Acceptable Use</H2>
      <P>You agree <Strong>not</Strong> to:</P>
      <UL>
        <LI>Use the Service for spam, phishing, or any illegal activity.</LI>
        <LI>Abuse the AI diagnosis feature by submitting content you do not own or have rights to analyze.</LI>
        <LI>Attempt to reverse-engineer, scrape, or extract data from the Service beyond normal use.</LI>
        <LI>Share your account credentials with others or resell access to the Service.</LI>
        <LI>Circumvent usage limits or rate limits through automation or multiple accounts.</LI>
        <LI>Use the Service in any way that violates Google&apos;s Terms of Service or Search Console policies.</LI>
      </UL>
      <P>
        We reserve the right to suspend or terminate accounts that violate these terms without prior notice.
      </P>

      <H2 id="limits">Service Limits</H2>
      <P>
        Each plan has specific limits on the number of sites, monitored pages, and AI diagnoses per month.
        These limits are enforced automatically. Exceeding limits requires upgrading to a higher plan.
      </P>
      <P>
        AI diagnoses are subject to availability and may be temporarily limited due to high demand or
        third-party API constraints.
      </P>

      <H2 id="availability">Availability</H2>
      <P>
        We strive to maintain high availability but do not guarantee 100% uptime. The Service is provided
        on a &quot;best effort&quot; basis. We do not offer formal SLAs at this time.
      </P>
      <P>
        Planned maintenance will be communicated in advance when possible. We are not liable for
        downtime caused by third-party services (Google, Stripe, Anthropic, etc.).
      </P>

      <H2 id="intellectual-property">Intellectual Property</H2>
      <UL>
        <LI><Strong>Your data:</Strong> you own all data you provide to the Service, including your content, GSC data, and analysis results.</LI>
        <LI><Strong>Our software:</Strong> the SerpVive platform, including its code, design, algorithms, and AI prompts, is our intellectual property.</LI>
        <LI><Strong>AI outputs:</Strong> diagnosis results and Refresh Briefs generated for you are yours to use freely.</LI>
      </UL>

      <H2 id="liability">Limitation of Liability</H2>
      <P>
        To the maximum extent permitted by law, SerpVive shall not be liable for any indirect, incidental,
        special, consequential, or punitive damages, including loss of profits, revenue, or data, arising
        from your use of the Service.
      </P>
      <P>
        Our total liability for any claim related to the Service shall not exceed the amount you paid us
        in the 12 months preceding the claim.
      </P>
      <P>
        AI-generated diagnoses and recommendations are informational only. We do not guarantee specific
        traffic or ranking outcomes from following our recommendations.
      </P>

      <H2 id="changes">Changes to Terms</H2>
      <P>
        We may update these Terms from time to time. If we make material changes, we will notify you by
        email at least 30 days before the changes take effect. Continued use of the Service after the
        effective date constitutes acceptance of the updated Terms.
      </P>

      <H2 id="governing-law">Governing Law</H2>
      <P>
        These Terms are governed by the laws of Brazil. Any disputes shall be resolved in the courts of Brazil.
      </P>

      <H2 id="contact">Contact</H2>
      <P>
        For questions about these Terms, contact us at:<br />
        <A href="mailto:serpvive@gmail.com">serpvive@gmail.com</A>
      </P>
    </LegalPage>
  );
}
