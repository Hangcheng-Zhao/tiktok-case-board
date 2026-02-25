"use client";

import { useState } from "react";
import { Step } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import PollVote from "./PollVote";

interface QuestionDisplayProps {
  step: Step;
  studentName: string;
  hasSubmitted: boolean;
  onSubmitted: () => void;
}

export default function QuestionDisplay({
  step,
  studentName,
  hasSubmitted,
  onSubmitted,
}: QuestionDisplayProps) {
  const [answer, setAnswer] = useState("");
  const [sentiment, setSentiment] = useState<
    "positive" | "negative" | "neutral" | null
  >(null);
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setSubmitting(true);

    const payload: Record<string, unknown> = {
      step: step.id,
      student_name: studentName,
      answer: answer.trim(),
    };

    if (step.type === "sentiment" && sentiment) {
      payload.sentiment = sentiment;
    }

    await supabase.from("responses").insert(payload);
    setAnswer("");
    setSentiment(null);
    setSubmitting(false);
    onSubmitted();
  };

  const handlePollSubmit = async (choice: string) => {
    setSubmitting(true);
    await supabase.from("responses").insert({
      step: step.id,
      student_name: studentName,
      poll_choice: choice,
    });
    setSubmitting(false);
    onSubmitted();
  };

  if (hasSubmitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">&#10003;</div>
        <p className="text-green-800 font-medium">Response submitted!</p>
        <p className="text-green-600 text-sm mt-1">
          Waiting for the next question...
        </p>
      </div>
    );
  }

  if (step.type === "poll") {
    return (
      <PollVote
        step={step}
        onVote={handlePollSubmit}
        disabled={submitting}
      />
    );
  }

  return (
    <form onSubmit={handleTextSubmit} className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
          {step.pasture}
        </p>
        <h2 className="text-xl font-bold text-gray-900">{step.question}</h2>
      </div>

      {step.type === "sentiment" && (
        <div className="flex gap-2">
          {(["positive", "negative", "neutral"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSentiment(s)}
              className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                sentiment === s
                  ? s === "positive"
                    ? "bg-green-100 border-green-400 text-green-800"
                    : s === "negative"
                    ? "bg-red-100 border-red-400 text-red-800"
                    : "bg-gray-100 border-gray-400 text-gray-800"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s === "positive" ? "👍 Positive" : s === "negative" ? "👎 Negative" : "😐 Neutral"}
            </button>
          ))}
        </div>
      )}

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer..."
        rows={3}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        autoFocus
      />

      <button
        type="submit"
        disabled={
          !answer.trim() ||
          submitting ||
          (step.type === "sentiment" && !sentiment)
        }
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
