import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, date, present } = body;

    if (!studentId || !date || typeof present !== "boolean") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const timestamp = Date.now();

    const { data: existing, error: existingError } = await supabase
      .from("attendance")
      .select("id")
      .eq("studentId", studentId)
      .eq("date", date)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing) {
      const { error } = await supabase
        .from("attendance")
        .update({
          present,
          markedBy: user.id,
          timestamp,
        })
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from("attendance").insert({
        studentId,
        date,
        present,
        markedBy: user.id,
        timestamp,
      });

      if (error) throw error;
    }

    const { data: records, error: recordsError } = await supabase
      .from("attendance")
      .select("present")
      .eq("studentId", studentId);

    if (recordsError) throw recordsError;

    const total_classes = records?.length || 0;
    const attended_classes = records?.filter((r) => r.present).length || 0;

    const attendancePercentage = total_classes
      ? Math.round((attended_classes / total_classes) * 100)
      : 0;

    const { error: updateStudentError } = await supabase
      .from("students")
      .update({
        total_classes,
        attended_classes,
        attendancePercentage,
      })
      .eq("id", studentId);

    if (updateStudentError) throw updateStudentError;

    return NextResponse.json({
      success: true,
      total_classes,
      attended_classes,
      attendancePercentage,
    });
  } catch (error: any) {
    console.error("markAttendance API failed:", error);

    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}