import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY!;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({
        error: "Invalid session",
      });
    }

    // verify admin
    const { data: profile, error: profileError } =
      await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
      return res.status(403).json({
        error: "User profile not found",
      });
    }

    if (profile.role !== "admin") {
      return res.status(403).json({
        error: "Only admins can bulk upload students",
      });
    }

    const { students, collegeId } = req.body;

    if (!students || !Array.isArray(students)) {
      return res.status(400).json({
        error: "Invalid students data",
      });
    }

    if (!collegeId) {
      return res.status(400).json({
        error: "College ID required",
      });
    }

    if (students.length > 500) {
      return res.status(400).json({
        error: "Maximum 500 students allowed",
      });
    }

    const cleanedStudents = students.map((student: any) => ({
      name: String(student.name || "").trim(),
      rank: String(student.rank || "").trim(),
      regimentalNo: String(
        student.regimentalNo ||
          student.regimentalno ||
          student.regimental_number ||
          ""
      ).trim(),

      collegeId,

      attendancePercentage: 0,
      total_classes: 0,
      attended_classes: 0,

      createdBy: user.id,
    }));

    // validate required fields
    for (const student of cleanedStudents) {
      if (
        !student.name ||
        !student.rank ||
        !student.regimentalNo
      ) {
        return res.status(400).json({
          error:
            "Each student must contain name, rank and regimentalNo",
        });
      }
    }

    // remove duplicates inside uploaded file
    const uniqueMap = new Map();

    for (const student of cleanedStudents) {
      uniqueMap.set(student.regimentalNo, student);
    }

    const uniqueStudents = Array.from(uniqueMap.values());

    // check existing regimental numbers
    const regimentalNos = uniqueStudents.map(
      (s) => s.regimentalNo
    );

    const { data: existingStudents } = await supabase
      .from("students")
      .select("regimentalNo")
      .in("regimentalNo", regimentalNos);

    const existingSet = new Set(
      existingStudents?.map((s) => s.regimentalNo)
    );

    const finalStudents = uniqueStudents.filter(
      (s) => !existingSet.has(s.regimentalNo)
    );

    if (finalStudents.length === 0) {
      return res.status(400).json({
        error:
          "All uploaded students already exist",
      });
    }

    const { error: insertError } = await supabase
      .from("students")
      .insert(finalStudents);

    if (insertError) {
      console.error(insertError);

      return res.status(500).json({
        error: insertError.message,
      });
    }

    // activity log
    await supabase.from("activity_logs").insert({
      actor_user_id: user.id,
      action: "bulk_upload_students",
      details: {
        uploaded_count: finalStudents.length,
        collegeId,
      },
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: `${finalStudents.length} students uploaded successfully`,
    });
  } catch (error: any) {
    console.error(
      "Bulk upload API failed:",
      error
    );

    return res.status(500).json({
      error:
        error.message || "Internal server error",
    });
  }
}