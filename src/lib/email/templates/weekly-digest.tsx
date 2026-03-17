import {
  Html, Head, Body, Container, Section, Text, Button, Hr, Link, Preview,
} from "@react-email/components";

type UrgentPage = {
  url: string;
  title: string;
  decayScore: number;
  status: string;
};

type RecentResult = {
  url: string;
  clicksDeltaPct: number;
  resultStatus: string;
};

type WeeklyDigestProps = {
  userName: string;
  siteDomain: string;
  healthScore: number;
  healthScoreDelta: number;
  urgentPages: UrgentPage[];
  recentResults: RecentResult[];
  dashboardUrl: string;
  unsubscribeUrl?: string;
};

function scoreColor(score: number): string {
  if (score >= 70) return "#16A34A";
  if (score >= 40) return "#D97706";
  return "#DC2626";
}

function statusBadge(status: string): string {
  const map: Record<string, string> = {
    critical: "Critical",
    dead: "Dead",
    warning: "Warning",
    healthy: "Healthy",
    new: "New",
  };
  return map[status] ?? status;
}

export default function WeeklyDigest({
  userName,
  siteDomain,
  healthScore,
  healthScoreDelta,
  urgentPages,
  recentResults,
  dashboardUrl,
  unsubscribeUrl,
}: WeeklyDigestProps) {
  const deltaStr = healthScoreDelta >= 0
    ? `↑${healthScoreDelta}`
    : `↓${Math.abs(healthScoreDelta)}`;

  return (
    <Html>
      <Head />
      <Preview>
        {`${siteDomain} health: ${healthScore}/100 — Weekly digest from SerpVive`}
      </Preview>
      <Body style={main}>
        {/* Header */}
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>SerpVive</Text>
          </Section>

          {/* Greeting */}
          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>
            <Text style={subtitle}>
              Here&apos;s your weekly health report for <strong>{siteDomain}</strong>
            </Text>

            {/* Health Score */}
            <Section style={scoreCard}>
              <Text style={scoreLabel}>Blog Health Score</Text>
              <Text style={{ ...scoreValue, color: scoreColor(healthScore) }}>
                {healthScore}<span style={scoreMax}>/100</span>
              </Text>
              <Text style={scoreDelta}>
                {deltaStr} vs last week
              </Text>
            </Section>

            {/* Urgent Pages */}
            {urgentPages.length > 0 && (
              <>
                <Text style={sectionTitle}>Pages that need attention</Text>
                {urgentPages.map((page) => (
                  <Section key={page.url} style={pageRow}>
                    <Text style={pageUrl}>{page.title || page.url}</Text>
                    <Text style={pageInfo}>
                      {statusBadge(page.status)} · Decay: {page.decayScore.toFixed(1)}%
                    </Text>
                  </Section>
                ))}
              </>
            )}

            {/* Recent Results */}
            {recentResults.length > 0 && (
              <>
                <Text style={sectionTitle}>Recent refresh results</Text>
                {recentResults.map((r) => {
                  const isPositive = r.clicksDeltaPct > 0;
                  return (
                    <Section key={r.url} style={pageRow}>
                      <Text style={pageUrl}>{r.url}</Text>
                      <Text style={{ ...pageInfo, color: isPositive ? "#16A34A" : "#DC2626" }}>
                        {isPositive ? "+" : ""}{r.clicksDeltaPct.toFixed(1)}% clicks{" "}
                        {r.resultStatus === "success" ? "\u2191" : r.resultStatus === "declined" ? "\u2193" : "\u2192"}
                      </Text>
                    </Section>
                  );
                })}
              </>
            )}

            {/* CTA */}
            <Section style={ctaSection}>
              <Button style={ctaButton} href={dashboardUrl}>
                Open Dashboard
              </Button>
            </Section>

            <Hr style={divider} />

            {/* Footer */}
            <Text style={footer}>
              You&apos;re receiving this because you use SerpVive.{" "}
              <Link href={`${dashboardUrl.replace(/\/dashboard.*/, "")}/settings`} style={footerLink}>
                Manage preferences
              </Link>
              {unsubscribeUrl && (
                <>
                  {" · "}
                  <Link href={unsubscribeUrl} style={footerLink}>
                    Unsubscribe
                  </Link>
                </>
              )}
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
  margin: "0 0 4px",
};

const subtitle: React.CSSProperties = {
  fontSize: "14px",
  color: "#6B7280",
  margin: "0 0 24px",
};

const scoreCard: React.CSSProperties = {
  backgroundColor: "#F9FAFB",
  borderRadius: "12px",
  padding: "24px",
  textAlign: "center" as const,
  marginBottom: "24px",
};

const scoreLabel: React.CSSProperties = {
  fontSize: "12px",
  color: "#6B7280",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 8px",
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

const scoreDelta: React.CSSProperties = {
  fontSize: "14px",
  color: "#6B7280",
  margin: "8px 0 0",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#111827",
  margin: "0 0 12px",
};

const pageRow: React.CSSProperties = {
  backgroundColor: "#F9FAFB",
  borderRadius: "8px",
  padding: "12px 16px",
  marginBottom: "8px",
};

const pageUrl: React.CSSProperties = {
  fontSize: "13px",
  color: "#111827",
  margin: "0 0 4px",
  fontFamily: "monospace",
  wordBreak: "break-all" as const,
};

const pageInfo: React.CSSProperties = {
  fontSize: "12px",
  color: "#6B7280",
  margin: "0",
};

const ctaSection: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "32px 0 24px",
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

const footerLink: React.CSSProperties = {
  color: "#6B7280",
  textDecoration: "underline",
};
