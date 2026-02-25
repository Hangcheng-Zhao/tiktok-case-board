"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SessionConfig, Response, VALID_SESSIONS, SESSION_LABELS } from "@/lib/types";
import { STEPS } from "@/lib/boardPlan";
import InstructorControls from "@/components/InstructorControls";

export default function InstructorPage() {
  const params = useParams();
  const sessionId = params.session as string;

  if (!VALID_SESSIONS.includes(sessionId as typeof VALID_SESSIONS[number])) {
    notFound();
  }

  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);

  const supabase = createClient();

  // Fetch initial data
  useEffect(() => {
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

    // Subscribe to config changes
    const configChannel = supabase
      .channel(`instructor_config_${sessionId}`)
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
      .subscribe();

    // Subscribe to new responses
    const responsesChannel = supabase
      .channel(`instructor_responses_${sessionId}`)
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
      .subscribe();

    return () => {
      supabase.removeChannel(configChannel);
      supabase.removeChannel(responsesChannel);
    };
  }, [sessionId]);

  const updateConfig = async (updates: Partial<SessionConfig>) => {
    if (!config) return;
    await supabase
      .from("session_config")
      .update(updates)
      .eq("session_id", sessionId);
  };

  const handleAdvance = () => {
    if (!config || config.current_step >= STEPS.length - 1) return;
    updateConfig({ current_step: config.current_step + 1 });
  };

  const handleGoBack = () => {
    if (!config || config.current_step <= 0) return;
    updateConfig({ current_step: config.current_step - 1 });
  };

  const handleReveal = () => {
    if (!config || config.revealed_step >= config.current_step) return;
    updateConfig({ revealed_step: config.revealed_step + 1 });
  };

  const handleToggleMode = () => {
    if (!config) return;
    updateConfig({
      display_mode:
        config.display_mode === "controlled" ? "live" : "controlled",
    });
  };

  const handleReset = async () => {
    if (!confirm("Reset the entire session? This will delete all responses."))
      return;
    await supabase
      .from("responses")
      .delete()
      .eq("session_id", sessionId)
      .neq("id", 0);
    await updateConfig({
      current_step: 0,
      revealed_step: -1,
      display_mode: "controlled",
    });
    setResponses([]);
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900">
            Instructor Control Panel &mdash; {SESSION_LABELS[sessionId] || sessionId}
          </h1>
          <p className="text-sm text-gray-500">TikTok Case Discussion</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 mt-4">
        <InstructorControls
          config={config}
          responses={responses}
          onAdvance={handleAdvance}
          onGoBack={handleGoBack}
          onReveal={handleReveal}
          onToggleMode={handleToggleMode}
          onReset={handleReset}
        />
      </main>
    </div>
  );
}
