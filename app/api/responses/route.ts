import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const body = await request.json();

  const { session_id, step, student_name, answer, sentiment, poll_choice } = body;

  if (!student_name || step === undefined || !session_id) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Check for duplicate submission
  const { data: existing } = await supabase
    .from("responses")
    .select("id")
    .eq("session_id", session_id)
    .eq("step", step)
    .eq("student_name", student_name)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Already submitted for this step" },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("responses")
    .insert({ session_id, step, student_name, answer, sentiment, poll_choice })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const sessionId = request.nextUrl.searchParams.get("session_id");

  let query = supabase
    .from("responses")
    .select("*")
    .order("created_at", { ascending: true });

  if (sessionId) {
    query = query.eq("session_id", sessionId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
