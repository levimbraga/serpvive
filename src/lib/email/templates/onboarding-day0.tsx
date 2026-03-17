import {
  Html, Head, Body, Container, Section, Text, Button, Hr, Preview,
} from "@react-email/components";

type OnboardingDay0Props = {
  userName: string;
  siteDomain: string;
  healthScore: number;
  pagesMonitored: number;
  criticalCount: number;
  dashboardUrl: string;
};

function scoreColor(score: number): string {
  if (score >= 70) return "#16A34A";
  if (score >= 40) return "#D97706";
  return "#DC2626";
}

export default function OnboardingDay0({
  userName,
  siteDomain,
  healthScore,
  pagesMonitored,
  criticalCount,
  dashboardUrl,
}: OnboardingDay0Props) {
  return (
    <Html>
      <Head />
      <Preview>
        {`Your blog health score: ${healthScore}/100 — SerpVive`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Serp<span style={{ color: "#3B82F6" }}>Vive</span></Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>
            <Text style={body}>
              We just analyzed <strong>{pagesMonitored} pages</strong> on{" "}
              <strong>{siteDomain}</strong>. Here&apos;s your blog health score:
            </Text>

            {/* Health Score */}
            <Section style={scoreCard}>
              <Text style={{ ...scoreValue, color: scoreColor(healthScore) }}>
                {healthScore}<span style={scoreMax}>/100</span>
              </Text>
            </Section>

            {criticalCount > 0 ? (
              <Text style={body}>
                <strong style={{ color: "#DC2626" }}>{criticalCount} page{criticalCount > 1 ? "s" : ""} need{criticalCount === 1 ? "s" : ""} attention right now.</strong>{" "}
                These pages are losing significant traffic and could benefit from a refresh.
              </Text>
            ) : (
              <Text style={body}>
                <strong style={{ color: "#16A34A" }}>Good news — your content looks healthy!</strong>{" "}
                We&apos;ll keep monitoring and alert you if anything changes.
              </Text>
            )}

            <Section style={ctaSection}>
              <Button style={ctaButton} href={dashboardUrl}>
                View Dashboard
              </Button>
            </Section>

            <Text style={ps}>
              P.S. We already ran a free AI diagnosis on your most important page. Check it out in your dashboard.
            </Text>

            <Hr style={divider} />

            <Text style={footer}>
              Welcome to SerpVive — your AI-powered content decay monitor.
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

const scoreCard: React.CSSProperties = {
  backgroundColor: "#F9FAFB",
  borderRadius: "12px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "16px 0 24px",
};

const scoreValue: React.CSSProperties = {
  fontSize: "48px",
  fontWeight: "bold",
  margin: "0",
  lineHeight: "1",
};

const scoreMax: React.CSSProperties = {
  fontSize: "20px",
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

const ps: React.CSSProperties = {
  fontSize: "13px",
  color: "#6B7280",
  fontStyle: "italic",
  margin: "0 0 16px",
};

const divider: React.CSSProperties = {
  borderColor: "#E5E7EB",
  margin: "24px 0",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9CA3AF",
  textAlign: "center" as const,
  margin: "0",
};
