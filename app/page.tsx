"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { STEPS } from "@/lib/boardPlan";
import { SessionConfig } from "@/lib/types";
import StudentForm from "@/components/StudentForm";
import QuestionDisplay from "@/components/QuestionDisplay";

export default function StudentPage() {
  const [studentName, setStudentName] = useState<string | null>(null);
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [submittedSteps, setSubmittedSteps] = useState<Set<number>>(
    new Set()
  );

  const supabase = createClient();

  // Check localStorage for saved name
  useEffect(() => {
    const saved = localStorage.getItem("student_name");
    if (saved) setStudentName(saved);
  }, []);

  // Fetch session config + subscribe to changes
  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from("session_config")
        .select("*")
        .single();
      if (data) setConfig(data);
    };

    fetchConfig();

    const channel = supabase
      .channel("session_config_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "session_config" },
        (payload) => {
          setConfig(payload.new as SessionConfig);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Check which steps this student already submitted
  const checkSubmitted = useCallback(async () => {
    if (!studentName) return;
    const { data } = await supabase
      .from("responses")
      .select("step")
      .eq("student_name", studentName);
    if (data) {
      setSubmittedSteps(new Set(data.map((r) => r.step)));
    }
  }, [studentName]);

  useEffect(() => {
    checkSubmitted();
  }, [checkSubmitted]);

  const handleNameSet = (name: string) => {
    setStudentName(name);
  };

  const handleSubmitted = () => {
    if (config) {
      setSubmittedSteps((prev) => new Set([...prev, config.current_step]));
    }
  };

  const handleChangeName = () => {
    localStorage.removeItem("student_name");
    setStudentName(null);
    setSubmittedSteps(new Set());
  };

  if (!studentName) {
    return <StudentForm onNameSet={handleNameSet} />;
  }

  const currentStep = config ? STEPS[config.current_step] : null;
  const hasSubmitted = config
    ? submittedSteps.has(config.current_step)
    : false;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900">TikTok Case</h1>
            <p className="text-xs text-gray-500">Hi, {studentName}</p>
          </div>
          <button
            onClick={handleChangeName}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Change name
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto p-4 mt-4">
        {!config ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Connecting...</p>
          </div>
        ) : !currentStep ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Discussion hasn&apos;t started yet.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Waiting for instructor...
            </p>
          </div>
        ) : (
          <QuestionDisplay
            step={currentStep}
            studentName={studentName}
            hasSubmitted={hasSubmitted}
            onSubmitted={handleSubmitted}
          />
        )}
      </main>
    </div>
  );
}
