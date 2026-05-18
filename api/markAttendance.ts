import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({
        error: "Missing Supabase environment variables",
      });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
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
      return res.status(401).json({ error: "Invalid session" });
    }

    const { studentId, date, present } = req.body;

    if (!studentId || !date || typeof present !== "boolean") {
      return res.status(400).json({ error: "Invalid input" });
    }

    const timestamp = Date.now();

    const { data: existing, error: existingError } = await supabase
      .from("attendance")
      .select("id")
      .eq("studentId", studentId)
      .eq("date", date)
      .maybeSingle();

    if (existingError) throw existingError;

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

    const attended_classes =
      records?.filter((record) => record.present === true).length || 0;

    const attendancePercentage =
      total_classes > 0
        ? Math.round((attended_classes / total_classes) * 100)
        : 0;

    const { data: updatedStudent, error: updateStudentError } = await supabase
  .from("students")
  .update({
    total_classes: total_classes,
    attended_classes: attended_classes,
    attendancePercentage: attendancePercentage,
  })
  .eq("id", studentId)
  .select("id,total_classes,attended_classes,attendancePercentage")
  .single();
    if (updateStudentError) {
      console.error("Student stats update failed:", updateStudentError);
      throw updateStudentError;
    }

    return res.status(200).json({
      success: true,
      student: updatedStudent,
      total_classes,
      attended_classes,
      attendancePercentage,
    });
  } catch (error: any) {
    console.error("markAttendance API failed:", error);

    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
}