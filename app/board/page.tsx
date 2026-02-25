"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SessionConfig, Response } from "@/lib/types";
import { STEPS, PASTURES } from "@/lib/boardPlan";
import BoardStep from "@/components/BoardStep";

export default function BoardPage() {
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [connected, setConnected] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchAll = async () => {
      const [configRes, responsesRes] = await Promise.all([
        supabase.from("session_config").select("*").single(),
        supabase
          .from("responses")
          .select("*")
          .order("created_at", { ascending: true }),
      ]);
      if (configRes.data) setConfig(configRes.data);
      if (responsesRes.data) setResponses(responsesRes.data);
    };

    fetchAll();

    const configChannel = supabase
      .channel("board_config")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "session_config" },
        (payload) => {
          setConfig(payload.new as SessionConfig);
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    const responsesChannel = supabase
      .channel("board_responses")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "responses" },
        (payload) => {
          setResponses((prev) => [...prev, payload.new as Response]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "responses" },
        () => {
          // On mass delete (reset), refetch
          supabase
            .from("responses")
            .select("*")
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
  }, []);

  // Determine which steps to show based on display mode
  const visibleStepIds: number[] = [];
  if (config) {
    if (config.display_mode === "live") {
      // In live mode, show all steps up to current_step
      for (let i = 0; i <= config.current_step; i++) {
        visibleStepIds.push(i);
      }
    } else {
      // In controlled mode, show only up to revealed_step
      for (let i = 0; i <= config.revealed_step; i++) {
        visibleStepIds.push(i);
      }
    }
  }

  const visibleSteps = STEPS.filter((s) => visibleStepIds.includes(s.id));

  // Group visible steps by pasture
  const groupedByPasture = PASTURES.map((pasture) => ({
    ...pasture,
    visibleSteps: visibleSteps.filter((s) =>
      pasture.steps.includes(s.id)
    ),
  })).filter((p) => p.visibleSteps.length > 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">TikTok Case Discussion</h1>
            <p className="text-gray-400 text-sm">Board Plan</p>
          </div>
          <div className="flex items-center gap-4">
            {config && (
              <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                Mode:{" "}
                <span className="capitalize font-medium text-gray-300">
                  {config.display_mode}
                </span>
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${
                connected
                  ? "bg-green-900/50 text-green-300"
                  : "bg-red-900/50 text-red-300"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  connected ? "bg-green-400" : "bg-red-400"
                }`}
              />
              {connected ? "Live" : "Connecting..."}
            </span>
          </div>
        </div>
      </header>

      {/* Board content */}
      <main className="p-6">
        {visibleSteps.length === 0 ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-500 mb-2">
                TikTok Case Discussion
              </h2>
              <p className="text-gray-600">
                Waiting for instructor to begin...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedByPasture.map((pasture) => (
              <div key={pasture.name}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`h-1 w-8 rounded ${pasture.color}`}
                  />
                  <h2 className="text-lg font-bold text-gray-300">
                    {pasture.name}
                  </h2>
                </div>
                <div className="grid gap-4">
                  {pasture.visibleSteps.map((step) => (
                    <BoardStep
                      key={step.id}
                      step={step}
                      responses={responses}
                      isActive={
                        config
                          ? step.id === config.current_step
                          : false
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
