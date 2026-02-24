"use client";

import { Step, Response } from "@/lib/types";
import ResponseList from "./ResponseList";
import PollDisplay from "./PollDisplay";

interface BoardStepProps {
  step: Step;
  responses: Response[];
  isActive: boolean;
}

export default function BoardStep({ step, responses, isActive }: BoardStepProps) {
  const stepResponses = responses.filter((r) => r.step === step.id);

  return (
    <div
      className={`rounded-xl border transition-all duration-500 ${
        isActive
          ? "border-blue-500 bg-gray-800/80 shadow-lg shadow-blue-500/10"
          : "border-gray-700 bg-gray-800/40"
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
              {step.pasture}
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {step.question}
            </h3>
          </div>
          <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded-full">
            {stepResponses.length} responses
          </span>
        </div>

        {step.type === "poll" && step.pollOptions ? (
          <PollDisplay responses={stepResponses} options={step.pollOptions} />
        ) : (
          <ResponseList
            responses={stepResponses}
            showSentiment={step.type === "sentiment"}
          />
        )}
      </div>
    </div>
  );
}
