"use client";

import AnalysisResultView from "@/components/pages/AnalysisResultView";

type Props = {
  url: string;
  keyword: string;
  diagnosis: Record<string, unknown>;
  brief: Record<string, unknown> | null;
  createdAt: string;
};

export default function DemoResultClient({ url, keyword, diagnosis, brief, createdAt }: Props) {
  return (
    <AnalysisResultView
      url={url}
      keyword={keyword}
      diagnosis={diagnosis}
      brief={brief}
      createdAt={createdAt}
      badge="Free Analysis"
      hideBackLink
    />
  );
}
