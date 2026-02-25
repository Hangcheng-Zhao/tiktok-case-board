export type StepType = "sentiment" | "text" | "poll";

export interface Step {
  id: number;
  pasture: string;
  question: string;
  type: StepType;
  pollOptions?: string[];
}

export interface SessionConfig {
  session_id: string;
  current_step: number;
  display_mode: "controlled" | "live";
  revealed_step: number;
}

export interface Response {
  id: number;
  session_id: string;
  step: number;
  student_name: string;
  answer: string | null;
  sentiment: "positive" | "negative" | "neutral" | null;
  poll_choice: string | null;
  created_at: string;
}

export const VALID_SESSIONS = ["A", "B", "C"] as const;
export type SessionId = (typeof VALID_SESSIONS)[number];

export const SESSION_LABELS: Record<string, string> = {
  A: "Section A",
  B: "Section B",
  C: "Section C",
};
