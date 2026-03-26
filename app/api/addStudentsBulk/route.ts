import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role key (not anon)
);

export async function POST(req: Request) {
  try {
    const { students, collegeId, createdBy } = await req.json();

    if (!students || students.length === 0) {
      return NextResponse.json({ message: "❌ No students provided" }, { status: 400 });
    }

    if (!collegeId || !createdBy) {
      return NextResponse.json({ message: "❌ Missing collegeId or createdBy" }, { status: 400 });
    }

    // ✅ Format and clean incoming data
    const formatted = students.map((s: any) => ({
      name: s.name || s.Name || "",
      rank: s.rank || s.Rank || "",
      regimentalNo:
        s.regimentalNo ||
        s["regimental number"] ||
        s.RegimentalNo ||
        s.Regimental ||
        "",
      collegeId,
      createdBy,
      attended_classes: 0,
      total_classes: 0,
      attendancePercentage: 0,
    }));

    // ✅ Filter out invalid entries
    const valid = formatted.filter(
      (s) => s.name && s.rank && s.regimentalNo && s.collegeId
    );

    if (valid.length === 0) {
      return NextResponse.json(
        { message: "❌ No valid student rows found." },
        { status: 400 }
      );
    }

    // ✅ Optional: Prevent duplicate regimental numbers
    const regNos = valid.map((s) => s.regimentalNo);
    const { data: existing } = await supabase
      .from("students")
      .select("regimentalNo")
      .in("regimentalNo", regNos);

    const existingSet = new Set(existing?.map((e) => e.regimentalNo));
    const newStudents = valid.filter((s) => !existingSet.has(s.regimentalNo));

    if (newStudents.length === 0) {
      return NextResponse.json({
        message: "⚠️ All uploaded students already exist.",
      });
    }

    // ✅ Bulk insert new students
    const { error } = await supabase.from("students").insert(newStudents);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ message: "❌ Upload failed", error }, { status: 500 });
    }

    return NextResponse.json({
      message: `✅ Successfully added ${newStudents.length} new students.`,
    });
  } catch (err) {
    console.error("Error in addStudentsBulk:", err);
    return NextResponse.json(
      { message: "❌ Server error", error: String(err) },
      { status: 500 }
    );
  }
}
