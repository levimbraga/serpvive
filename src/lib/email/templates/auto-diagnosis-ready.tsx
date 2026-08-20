import {
  Html, Head, Body, Container, Section, Text, Button, Hr, Preview,
} from "@react-email/components";

type AutoDiagnosisReadyProps = {
  userName: string;
  pageUrl: string;
  pagePath: string;
  causeCount: number;
  summary: string;
  diagnosisUrl: string;
};

export default function AutoDiagnosisReady({
  userName,
  pageUrl,
  pagePath,
  causeCount,
  summary,
  diagnosisUrl,
}: AutoDiagnosisReadyProps) {
  const hasIssues = causeCount > 0;

  return (
    <Html>
      <Head />
      <Preview>
        {hasIssues
          ? `We found ${causeCount} issue${causeCount > 1 ? "s" : ""} on ${pagePath}`
          : `Your page ${pagePath} looks healthy!`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Serp<span style={{ color: "#3B82F6" }}>Vive</span></Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>
            <Text style={bodyText}>
              Your first AI analysis is ready! We analyzed:
            </Text>

            <Section style={urlCard}>
              <Text style={urlText}>{pageUrl}</Text>
            </Section>

            {hasIssues ? (
              <Text style={bodyText}>
                We found <strong style={{ color: "#DC2626" }}>{causeCount} issue{causeCount > 1 ? "s" : ""}</strong> affecting
                your traffic. Here&apos;s what we found:
              </Text>
            ) : (
              <Text style={bodyText}>
                <strong style={{ color: "#16A34A" }}>Good news!</strong> Your page looks healthy.
                We didn&apos;t find any critical issues.
              </Text>
            )}

            <Section style={summaryCard}>
              <Text style={summaryText}>{summary}</Text>
            </Section>

            {hasIssues && (
              <Text style={bodyText}>
                We also generated a <strong>Refresh Brief</strong> with specific actions
                and micro-drafts you can copy-paste to fix these issues.
              </Text>
            )}

            <Section style={ctaSection}>
              <Button style={ctaButton} href={diagnosisUrl}>
                View Full Diagnosis
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={footer}>
              This diagnosis was run automatically when your site finished importing. Your account includes more — run them on the pages that matter most.
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

const bodyText: React.CSSProperties = {
  fontSize: "14px",
  color: "#374151",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const urlCard: React.CSSProperties = {
  backgroundColor: "#F9FAFB",
  borderRadius: "8px",
  padding: "12px 16px",
  margin: "0 0 16px",
};

const urlText: React.CSSProperties = {
  fontSize: "13px",
  fontFamily: "monospace",
  color: "#374151",
  margin: "0",
  wordBreak: "break-all" as const,
};

const summaryCard: React.CSSProperties = {
  backgroundColor: "#F9FAFB",
  borderLeft: "3px solid #7C3AED",
  borderRadius: "0 8px 8px 0",
  padding: "16px",
  margin: "0 0 16px",
};

const summaryText: React.CSSProperties = {
  fontSize: "14px",
  color: "#374151",
  lineHeight: "1.6",
  margin: "0",
  fontStyle: "italic",
};

const ctaSection: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#7C3AED",
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
