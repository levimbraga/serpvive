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
      <Preview>{`Your decay report for ${siteDomain}`}</Preview>
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
                  Each diagnosis tells you <strong>why</strong> a page is losing
                  traffic — what the pages outranking it cover that yours
                  doesn&apos;t — and gives you a refresh brief you can act on.
                  Your account includes a set number of them; run one on the
                  page that matters most.
                </Text>
              </>
            ) : (
              <Text style={body}>
                Your content is looking healthy. SerpVive keeps monitoring in
                the background and will flag pages as they start to decay, so
                you can fix issues before they cost you traffic.
              </Text>
            )}

            <Section style={ctaSection}>
              <Button
                style={{ ...ctaButton, backgroundColor: "#3B82F6" }}
                href={dashboardUrl}
              >
                Open your dashboard
              </Button>
            </Section>

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

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9CA3AF",
  textAlign: "center" as const,
  margin: "0",
};
