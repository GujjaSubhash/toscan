import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const http = axios.create({ baseURL: API });

export interface AnalyzeResult {
  document_id: string;
  clause_count: number;
  high_risk_count: number;
  overall_risk_score: number;
}

export interface Clause {
  id: string;
  clause_index: number | null;
  clause_text: string | null;
  category: string | null;
  risk_score: number | null;
  plain_explanation: string | null;
  risk_reason: string | null;
}

export interface DocumentDetail {
  id: string;
  source_url: string | null;
  content_hash: string | null;
  raw_text: string | null;
  created_at: string | null;
  overall_risk_score: number | null;
  clause_count: number | null;
  high_risk_count: number | null;
  clauses: Clause[];
}

export interface AnalyzePayload {
  url?: string;
  raw_text?: string;
}

export async function analyzeDocument(
  payload: AnalyzePayload
): Promise<AnalyzeResult> {
  const { data } = await http.post<AnalyzeResult>("/analyze", payload);
  return data;
}

export async function getDocument(id: string): Promise<DocumentDetail> {
  const { data } = await http.get<DocumentDetail>(`/document/${id}`);
  return data;
}

export async function getDemo(slug: string): Promise<{ document_id: string }> {
  const { data } = await http.get<{ document_id: string }>(
    `/demo/clause-risk-engine`,
    { params: { slug } }
  );
  return data;
}

export function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 429) {
      return "Rate limit reached. Try again in 1 hour.";
    }
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}
