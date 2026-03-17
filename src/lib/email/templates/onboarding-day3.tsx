import {
  Html, Head, Body, Container, Section, Text, Button, Hr, Preview,
} from "@react-email/components";

type OnboardingDay3Props = {
  userName: string;
  siteDomain: string;
  pagesMonitored: number;
  criticalCount: number;
  dashboardUrl: string;
};

const PLANS = [
  { name: "Starter", price: "$29/mo", features: "1 site · 100 pages · 10 diagnoses/mo" },
  { name: "Pro", price: "$69/mo", features: "3 sites · 1,000 pages · 40 diagnoses/mo" },
  { name: "Agency", price: "$129/mo", features: "10 sites · 5,000 pages · 120 diagnoses/mo" },
];

export default function OnboardingDay3({
  userName,
  siteDomain,
  pagesMonitored,
  criticalCount,
  dashboardUrl,
}: OnboardingDay3Props) {
  return (
    <Html>
      <Head />
      <Preview>{`Unlock AI diagnoses for ${siteDomain}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Serp<span style={{ color: "#3B82F6" }}>Vive</span></Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>

            <Text style={body}>
              You&apos;ve been monitoring <strong>{siteDomain}</strong> for 3 days now.
              We&apos;re tracking <strong>{pagesMonitored} pages</strong> for you.
            </Text>

            {criticalCount > 0 ? (
              <>
                <Section style={alertCard}>
                  <Text style={alertNumber}>{criticalCount}</Text>
                  <Text style={alertLabel}>
                    page{criticalCount !== 1 ? "s" : ""} need{criticalCount === 1 ? "s" : ""} attention
                  </Text>
                </Section>

                <Text style={body}>
                  Your free diagnosis gave you a taste of what SerpVive can do.
                  Upgrade to run <strong>unlimited AI diagnoses</strong> and get actionable
                  refresh briefs for every decaying page.
                </Text>
              </>
            ) : (
              <Text style={body}>
                Your content is looking healthy! Upgrade to get proactive AI monitoring
                with <strong>automatic diagnoses</strong> when decay is detected — so you
                can fix issues before they cost you traffic.
              </Text>
            )}

            <Section style={ctaSection}>
              <Button
                style={{ ...ctaButton, backgroundColor: "#3B82F6" }}
                href={`${dashboardUrl.replace(/\/dashboard.*/, "")}/settings`}
              >
                Upgrade Now
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={plansTitle}>Choose a plan:</Text>

            {PLANS.map((plan) => (
              <Section key={plan.name} style={planRow}>
                <Text style={planName}>
                  {plan.name} — <strong>{plan.price}</strong>
                </Text>
                <Text style={planFeatures}>{plan.features}</Text>
              </Section>
            ))}

            <Hr style={divider} />

            <Text style={footer}>
              You&apos;re receiving this because you signed up for SerpVive.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#F5F7FA",
  fontFamily: "Arial, sans-serif",
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
};

const header: React.CSSProperties = {
  backgroundColor: "#0F172A",
  padding: "24px 32px",
  borderRadius: "12px 12px 0 0",
};

const logo: React.CSSProperties = {
  color: "#FFFFFF",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0",
};

const content: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  padding: "32px",
  borderRadius: "0 0 12px 12px",
};

const greeting: React.CSSProperties = {
  fontSize: "16px",
  color: "#111827",
  margin: "0 0 16px",
};

const body: React.CSSProperties = {
  fontSize: "14px",
  color: "#374151",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const alertCard: React.CSSProperties = {
  backgroundColor: "#FEF2F2",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center" as const,
  margin: "16px 0 24px",
  borderLeft: "4px solid #DC2626",
};

const alertNumber: React.CSSProperties = {
  fontSize: "36px",
  fontWeight: "bold",
  color: "#DC2626",
  margin: "0",
  lineHeight: "1",
};

const alertLabel: React.CSSProperties = {
  fontSize: "14px",
  color: "#6B7280",
  margin: "4px 0 0",
};

const ctaSection: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#3B82F6",
  color: "#FFFFFF",
  fontSize: "14px",
  fontWeight: "bold",
  padding: "12px 24px",
  borderRadius: "8px",
  textDecoration: "none",
};

const divider: React.CSSProperties = {
  borderColor: "#E5E7EB",
  margin: "24px 0",
};

const plansTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#111827",
  margin: "0 0 12px",
};

const planRow: React.CSSProperties = {
  backgroundColor: "#F9FAFB",
  borderRadius: "8px",
  padding: "12px 16px",
  marginBottom: "8px",
};

const planName: React.CSSProperties = {
  fontSize: "14px",
  color: "#111827",
  margin: "0 0 2px",
};

const planFeatures: React.CSSProperties = {
  fontSize: "12px",
  color: "#6B7280",
  margin: "0",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9CA3AF",
  textAlign: "center" as const,
  margin: "0",
};
