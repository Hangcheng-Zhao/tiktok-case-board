"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SessionConfig, Response, VALID_SESSIONS, SESSION_LABELS } from "@/lib/types";
import { STEPS, PASTURES } from "@/lib/boardPlan";
import BoardStep from "@/components/BoardStep";

// Map pasture bg classes to border/header colors for the grid layout
const PASTURE_COLORS: Record<string, { border: string; headerBg: string }> = {
  "bg-purple-600": { border: "border-purple-500", headerBg: "bg-purple-900/50" },
  "bg-blue-600":   { border: "border-blue-500",   headerBg: "bg-blue-900/50" },
  "bg-green-600":  { border: "border-green-500",  headerBg: "bg-green-900/50" },
  "bg-orange-500": { border: "border-orange-500", headerBg: "bg-orange-900/50" },
  "bg-red-600":    { border: "border-red-500",    headerBg: "bg-red-900/50" },
};

const DEFAULT_COLORS = { border: "border-gray-500", headerBg: "bg-gray-800/50" };

export default function BoardPage() {
  const params = useParams();
  const sessionId = params.session as string;

  if (!VALID_SESSIONS.includes(sessionId as typeof VALID_SESSIONS[number])) {
    notFound();
  }

  const sessionLabel = SESSION_LABELS[sessionId] || sessionId;

  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [connected, setConnected] = useState(false);
  const [focusedQuadrant, setFocusedQuadrant] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    const fetchAll = async () => {
      const [configRes, responsesRes] = await Promise.all([
        supabase
          .from("session_config")
          .select("*")
          .eq("session_id", sessionId)
          .single(),
        supabase
          .from("responses")
          .select("*")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true }),
      ]);
      if (configRes.data) setConfig(configRes.data);
      if (responsesRes.data) setResponses(responsesRes.data);
    };

    fetchAll();

    const configChannel = supabase
      .channel(`board_config_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_config",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setConfig(payload.new as SessionConfig);
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    const responsesChannel = supabase
      .channel(`board_responses_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "responses",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setResponses((prev) => [...prev, payload.new as Response]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "responses",
        },
        () => {
          supabaseRef.current
            .from("responses")
            .select("*")
            .eq("session_id", sessionId)
            .order("created_at", { ascending: true })
            .then(({ data }) => {
              if (data) setResponses(data);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(configChannel);
      supabase.removeChannel(responsesChannel);
    };
  }, [sessionId]);

  // Determine visible steps
  const visibleStepIds = new Set<number>();
  if (config) {
    if (config.display_mode === "live") {
      for (let i = 0; i <= config.current_step; i++) visibleStepIds.add(i);
    } else {
      for (let i = 0; i <= config.revealed_step; i++) visibleStepIds.add(i);
    }
  }

  const stepsById = Object.fromEntries(STEPS.map((s) => [s.id, s]));
  const isTopicVisible = (stepIds: number[]) =>
    stepIds.some((s) => visibleStepIds.has(s));

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-700 px-6 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              TikTok Case Discussion &mdash; {sessionLabel}
            </h1>
            <p className="text-gray-500 text-xs">Board Plan</p>
          </div>
          <div className="flex items-center gap-3">
            {config && (
              <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
                Step {config.current_step}/{STEPS.length - 1}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                connected ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
              {connected ? "Live" : "..."}
            </span>
          </div>
        </div>
      </header>

      {/* Board grid */}
      <main
        className={`flex-1 p-4 min-h-0 ${
          focusedQuadrant
            ? ""
            : PASTURES.length <= 2
            ? "grid grid-cols-2 grid-rows-1 gap-4"
            : PASTURES.length <= 4
            ? "grid grid-cols-2 grid-rows-2 gap-4"
            : "grid grid-cols-3 grid-rows-2 gap-4"
        }`}
      >
        {PASTURES.map((pasture) => {
          const colors = PASTURE_COLORS[pasture.color] ?? DEFAULT_COLORS;
          const visible = isTopicVisible(pasture.steps);
          const visibleSteps = pasture.steps.filter((s) => visibleStepIds.has(s));
          const isFocused = focusedQuadrant === pasture.name;
          const isHidden = focusedQuadrant && !isFocused;

          if (isHidden) return null;

          return (
            <div
              key={pasture.name}
              onClick={() => setFocusedQuadrant(isFocused ? null : pasture.name)}
              className={`rounded-xl border-2 flex flex-col min-h-0 transition-all duration-700 cursor-pointer ${
                isFocused ? "h-full" : ""
              } ${visible ? `${colors.border} bg-gray-800/60` : "border-gray-700/30 bg-gray-800/20"}`}
            >
              {/* Quadrant header */}
              <div
                className={`px-4 py-2 rounded-t-xl border-b border-gray-700/50 shrink-0 flex items-center justify-between ${
                  visible ? colors.headerBg : "bg-gray-800/30"
                }`}
              >
                <h2 className={`font-bold ${isFocused ? "text-2xl" : "text-lg"} ${visible ? "text-white" : "text-gray-600"}`}>
                  {pasture.name}
                </h2>
                {isFocused && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setFocusedQuadrant(null); }}
                    className="text-gray-400 hover:text-white text-sm bg-gray-700/60 hover:bg-gray-700 px-3 py-1 rounded-lg transition-colors"
                  >
                    Back to grid
                  </button>
                )}
              </div>

              {/* Steps */}
              <div className="flex-1 overflow-y-auto px-4 py-2 min-h-0">
                {!visible ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-700 text-sm italic">Waiting...</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {visibleSteps.map((stepId) => {
                      const step = stepsById[stepId];
                      if (!step) return null;
                      return (
                        <BoardStep
                          key={step.id}
                          step={step}
                          responses={responses}
                          isActive={config ? step.id === config.current_step : false}
                          compact={!isFocused}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
