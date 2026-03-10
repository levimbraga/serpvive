import {
  Html, Head, Body, Container, Section, Text, Button, Hr, Preview,
} from "@react-email/components";

type OnboardingDay5Props = {
  userName: string;
  trialEndsAt: string;
  diagnosesUsed: number;
  diagnosesLimit: number;
  dashboardUrl: string;
};

const PLANS = [
  { name: "Starter", price: "$29/mo", features: "1 site · 100 pages · 10 diagnoses/mo" },
  { name: "Pro", price: "$69/mo", features: "3 sites · 1,000 pages · 40 diagnoses/mo" },
  { name: "Agency", price: "$129/mo", features: "10 sites · 5,000 pages · 120 diagnoses/mo" },
];

export default function OnboardingDay5({
  userName,
  trialEndsAt,
  diagnosesUsed,
  diagnosesLimit,
  dashboardUrl,
}: OnboardingDay5Props) {
  const remaining = diagnosesLimit - diagnosesUsed;

  return (
    <Html>
      <Head />
      <Preview>Your SerpVive trial ends soon</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>SerpVive</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>

            <Text style={body}>
              Your SerpVive trial ends on <strong>{trialEndsAt}</strong>.
            </Text>

            <Section style={usageCard}>
              <Text style={usageLabel}>AI Diagnoses Used</Text>
              <Text style={usageValue}>
                {diagnosesUsed} <span style={usageMax}>/ {diagnosesLimit}</span>
              </Text>
            </Section>

            {remaining > 0 ? (
              <Text style={body}>
                You still have <strong>{remaining} diagnosis{remaining !== 1 ? "es" : ""}</strong> left
                — use them before your trial ends!
              </Text>
            ) : (
              <Text style={body}>
                You&apos;ve used all your trial diagnoses. Upgrade to keep monitoring and diagnosing your content.
              </Text>
            )}

            <Section style={ctaSection}>
              <Button style={ctaButton} href={dashboardUrl}>
                {remaining > 0 ? "Use Your Remaining Diagnoses" : "View Dashboard"}
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={plansTitle}>Choose a plan to keep monitoring:</Text>

            {PLANS.map((plan) => (
              <Section key={plan.name} style={planRow}>
                <Text style={planName}>
                  {plan.name} — <strong>{plan.price}</strong>
                </Text>
                <Text style={planFeatures}>{plan.features}</Text>
              </Section>
            ))}

            <Section style={ctaSection}>
              <Button
                style={{ ...ctaButton, backgroundColor: "#0D9488" }}
                href={`${dashboardUrl.replace(/\/dashboard.*/, "")}/settings`}
              >
                Choose a Plan
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={footer}>
              You&apos;re receiving this as part of your SerpVive trial.
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

const usageCard: React.CSSProperties = {
  backgroundColor: "#F9FAFB",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center" as const,
  margin: "16px 0 24px",
};

const usageLabel: React.CSSProperties = {
  fontSize: "12px",
  color: "#6B7280",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 8px",
};

const usageValue: React.CSSProperties = {
  fontSize: "36px",
  fontWeight: "bold",
  color: "#111827",
  margin: "0",
  lineHeight: "1",
};

const usageMax: React.CSSProperties = {
  fontSize: "18px",
  color: "#9CA3AF",
  fontWeight: "normal",
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
