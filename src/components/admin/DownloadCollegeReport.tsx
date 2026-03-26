import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { saveAs } from "file-saver";

interface DownloadCollegeReportProps {
  colleges: { id: string; name: string }[];
}

const DownloadCollegeReport: React.FC<DownloadCollegeReportProps> = ({ colleges }) => {
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!selectedCollegeId) {
      toast.error("Please select a college");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("students")
        .select("name, regimentalno, rank, total_classes, attended_classes, attendencepercentage")
        .eq("collegeid", selectedCollegeId);

      if (error) throw error;
      if (!data || data.length === 0) {
        toast.error("No students found for this college");
        return;
      }

      // Transform data for Excel
      const excelData = data.map((s) => ({
        Name: s.name,
        "Regimental Number": s.regimentalno,
        Rank: s.rank,
        "Attendance %": `${s.attendencepercentage}%`,
        "Total Classes": s.total_classes || 0,
        "Classes Attended": s.attended_classes || 0,
        "Eligible for Certificate Exam": s.attendencepercentage >= 75 ? "✅ Yes" : "❌ No",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

      const excelBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

      const selectedCollege = colleges.find((c) => c.id === selectedCollegeId);
      const filename = `${selectedCollege?.name || "College"}_Report.xlsx`;

      saveAs(blob, filename);
      toast.success("Report downloaded successfully!");
    } catch (err: any) {
      toast.error("Failed to download report: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-lg font-semibold mb-3">📊 Download College Report</h2>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <Select onValueChange={setSelectedCollegeId}>
          <SelectTrigger className="w-full md:w-72">
            <SelectValue placeholder="Select a college" />
          </SelectTrigger>
          <SelectContent>
            {colleges.map((college) => (
              <SelectItem key={college.id} value={college.id}>
                {college.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleDownload}
          disabled={loading || !selectedCollegeId}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? "Generating..." : "Download Report"}
        </Button>
      </div>
    </div>
  );
};

export default DownloadCollegeReport;
