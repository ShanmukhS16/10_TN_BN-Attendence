import React, { useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { read, utils } from "xlsx";
import { toast } from "sonner";

const StudentImport = () => {
  const { addStudent, colleges } = useAuth();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = utils.sheet_to_json(sheet);

      let addedCount = 0;

      for (const row of rows) {
        const { name, rank, regimentalNo, collegeCode } = row as {
          name: string;
          rank: string;
          regimentalNo: string;
          collegeCode: string;
        };

        if (!name || !rank || !regimentalNo || !collegeCode) continue;

        const college = colleges.find(c => c.code === collegeCode.trim());
        if (!college) continue;

        await addStudent({
          name: name.trim(),
          rank: rank.trim(),
          regimentalNo: regimentalNo.trim(),
          collegeId: college.id,
        });

        addedCount++;
      }

      toast.success(`✅ Successfully imported ${addedCount} student(s).`);
    } catch (error) {
      console.error("Import Error:", error);
      toast.error("❌ Failed to import. Check Excel format.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border p-6 rounded bg-white shadow-md">
      <h2 className="text-lg font-semibold mb-2">📄 Import Students from Excel</h2>
      <p className="text-sm text-gray-600 mb-4">
        File must include columns: <strong>name, rank, regimentalNo, collegeCode</strong>
      </p>

      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          {loading ? "Importing..." : "📁 Upload Excel File"}
        </Button>
      </div>
    </div>
  );
};

export default StudentImport;
