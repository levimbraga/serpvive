import {
  Html, Head, Body, Container, Section, Text, Button, Hr, Preview,
} from "@react-email/components";

type UrgentPage = {
  url: string;
  title: string;
  decayScore: number;
  clicksLost: number;
  pageId: string;
};

type OnboardingDay2Props = {
  userName: string;
  siteDomain: string;
  topUrgentPage: UrgentPage | null;
  dashboardUrl: string;
};

export default function OnboardingDay2({
  userName,
  topUrgentPage,
  dashboardUrl,
}: OnboardingDay2Props) {
  const hasUrgent = topUrgentPage && topUrgentPage.decayScore > 10;

  return (
    <Html>
      <Head />
      <Preview>
        {hasUrgent
          ? `Your post is losing ${topUrgentPage.clicksLost} clicks/month`
          : "How SerpVive keeps your content performing"}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Serp<span style={{ color: "#3B82F6" }}>Vive</span></Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>

            {hasUrgent ? (
              <>
                <Text style={body}>
                  Your page <strong>&quot;{topUrgentPage.title || topUrgentPage.url}&quot;</strong> has
                  lost <strong style={{ color: "#DC2626" }}>{topUrgentPage.decayScore.toFixed(0)}%</strong> of
                  its peak traffic.
                </Text>

                {topUrgentPage.clicksLost > 0 && (
                  <Section style={lostCard}>
                    <Text style={lostNumber}>~{topUrgentPage.clicksLost}</Text>
                    <Text style={lostLabel}>clicks/month you could recover</Text>
                  </Section>
                )}

                <Text style={body}>
                  Run an AI diagnosis to find out exactly why — and get specific actions to fix it.
                </Text>

                <Section style={ctaSection}>
                  <Button
                    style={ctaButton}
                    href={`${dashboardUrl.replace(/\/dashboard.*/, "")}/pages/${topUrgentPage.pageId}`}
                  >
                    Diagnose This Page
                  </Button>
                </Section>
              </>
            ) : (
              <>
                <Text style={body}>
                  Your content is looking good. SerpVive keeps re-scoring your pages on every sync so traffic drops show up early.
                </Text>
                <Text style={body}>
                  If any page starts losing traffic, it will surface on your
                  dashboard, where an AI diagnosis can tell you exactly what to fix.
                </Text>
                <Section style={ctaSection}>
                  <Button style={ctaButton} href={dashboardUrl}>
                    Check Your Dashboard
                  </Button>
                </Section>
              </>
            )}

            <Hr style={divider} />

            <Text style={footer}>
              You&apos;re receiving this as part of your SerpVive onboarding.
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

const lostCard: React.CSSProperties = {
  backgroundColor: "#FEF2F2",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center" as const,
  margin: "16px 0 24px",
  borderLeft: "4px solid #DC2626",
};

const lostNumber: React.CSSProperties = {
  fontSize: "36px",
  fontWeight: "bold",
  color: "#DC2626",
  margin: "0",
  lineHeight: "1",
};

const lostLabel: React.CSSProperties = {
  fontSize: "13px",
  color: "#991B1B",
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
