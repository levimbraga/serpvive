import type { DiagnosisResult } from "../diagnose";

export type PromptData = {
  isNewPage: boolean;
  url: string;
  keyword: string;
  clicks28d: number;
  position: number;
  ctr: number;
  peakClicks: number;
  peakMonth: string;
  decayScore: number;
  serpResults: string;
  competitors: string;
  userContent: string;
  queryData: string;
};

export type PromptVersion = {
  buildDiagnosisPrompt: (data: PromptData) => string;
  buildBriefPrompt: (data: PromptData, diagnosis: DiagnosisResult) => string;
};
