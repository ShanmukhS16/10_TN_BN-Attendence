import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { id, total_classes, attended_classes } = req.body;

    const { error } = await supabase
      .from("students")
      .update({
        total_classes,
        attended_classes,
      })
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({ message: "Attendance updated successfully" });
  } catch (err: any) {
    console.error("Update attendance error:", err);
    res.status(500).json({ message: err.message || "Failed to update attendance" });
  }
}
