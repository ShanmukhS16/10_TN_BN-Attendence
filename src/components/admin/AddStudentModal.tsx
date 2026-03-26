import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface AddStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { addStudent, colleges = [] } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    regimentalNo: "",
    rank: "",
    collegeId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkStudents, setBulkStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ---- BULK UPLOAD HANDLERS ----
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setBulkStudents(json);
      toast.success(`${json.length} students ready for upload`);
    } catch {
      toast.error("Invalid file format or corrupted Excel");
    }
  };

  const handleBulkUpload = async () => {
    if (bulkStudents.length === 0) {
      toast.error("No students to upload");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/addStudentsBulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: bulkStudents }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Bulk upload successful!");
        setBulkStudents([]);
      } else {
        toast.error(data.error || "Failed to upload students");
      }
    } catch {
      toast.error("Error uploading students");
    } finally {
      setLoading(false);
    }
  };

  // ---- SINGLE ADD HANDLERS ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (
        !formData.name ||
        !formData.regimentalNo ||
        !formData.rank ||
        !formData.collegeId
      ) {
        toast.error("Please fill in all fields");
        return;
      }

      await addStudent(formData);
      toast.success("Student added successfully!");

      setFormData({
        name: "",
        regimentalNo: "",
        rank: "",
        collegeId: "",
      });
      onOpenChange(false);
    } catch {
      toast.error("Failed to add student. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const commonRanks = [
    "Cadet",
    "Senior Cadet",
    "Cadet Captain",
    "Cadet Major",
    "Cadet Lieutenant Colonel",
    "Lieutenant",
    "Captain",
    "Major",
    "Lieutenant Colonel",
    "Colonel",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Dark container, but DO NOT set text-white globally */}
      <DialogContent className="sm:max-w-[760px] bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Add New Student / Bulk Upload
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Manual Add Section */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-name" className="text-slate-200">
                Full Name
              </Label>
              <Input
                id="student-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter student's full name"
                className="bg-white text-gray-900 placeholder:text-gray-500 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regimental-no" className="text-slate-200">
                Regimental Number
              </Label>
              <Input
                id="regimental-no"
                type="text"
                value={formData.regimentalNo}
                onChange={(e) =>
                  handleInputChange("regimentalNo", e.target.value)
                }
                placeholder="e.g., REG001"
                className="bg-white text-gray-900 placeholder:text-gray-500 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rank" className="text-slate-200">
                Rank
              </Label>
              <Select
                value={formData.rank}
                onValueChange={(value) => handleInputChange("rank", value)}
              >
                <SelectTrigger className="bg-white text-gray-900">
                  <SelectValue placeholder="Select rank" />
                </SelectTrigger>
                <SelectContent>
                  {commonRanks.map((rank) => (
                    <SelectItem key={rank} value={rank}>
                      {rank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="college" className="text-slate-200">
                College
              </Label>
              <Select
                value={formData.collegeId}
                onValueChange={(value) =>
                  handleInputChange("collegeId", value)
                }
              >
                <SelectTrigger className="bg-white text-gray-900">
                  <SelectValue placeholder="Select college" />
                </SelectTrigger>
                <SelectContent>
                  {colleges.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No colleges found
                    </div>
                  )}
                  {colleges.map((college: any) => (
                    <SelectItem key={college.id} value={college.id}>
                      {college.name} ({college.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Student"}
              </Button>
            </div>
          </form>

          {/* Bulk Upload Section */}
          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold mb-3 text-white">📦 Bulk Upload</h3>

            <label className="block">
              <span className="sr-only">Choose file</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="mb-3 w-full cursor-pointer rounded-md border-0 bg-white px-3 py-2 text-sm font-medium text-gray-900 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </label>

            {bulkStudents.length > 0 && (
              <div className="max-h-48 overflow-auto text-xs border border-slate-700 rounded bg-white">
                <table className="w-full">
                  <thead className="bg-slate-100 text-gray-900">
                    <tr>
                      {Object.keys(bulkStudents[0] || {}).map((key) => (
                        <th key={key} className="p-1 text-left capitalize">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-gray-900">
                    {bulkStudents.slice(0, 5).map((student, i) => (
                      <tr key={i} className="border-t border-slate-200">
                        {Object.values(student).map((value, j) => (
                          <td key={j} className="p-1">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {bulkStudents.length > 0 && (
              <p className="text-sm text-slate-300 mt-1">
                Showing {Math.min(5, bulkStudents.length)} of {bulkStudents.length}
              </p>
            )}

            <Button
              onClick={handleBulkUpload}
              disabled={loading}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Uploading..." : "Upload to Supabase"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentModal;
