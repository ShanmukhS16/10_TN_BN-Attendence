"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BulkUpload() {
  const { user, colleges } = useAuth();
  const [collegeId, setCollegeId] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);
    setStudents(json);
  };

  const handleSubmit = async () => {
    if (!collegeId) return alert("⚠️ Please select a college.");
    if (students.length === 0) return alert("⚠️ No students to upload.");

    setLoading(true);

    const res = await fetch("/api/addStudentsBulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        students,
        collegeId,
        createdBy: user?.id,
      }),
    });

    const data = await res.json();
    setLoading(false);
    alert(data.message);
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-xl shadow-xl w-full max-w-3xl mx-auto mt-10">
      <Card className="bg-gray-800 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">
            📦 Bulk Upload Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* College Selector */}
          <label className="block mb-3 text-sm font-medium text-gray-300">
            Select College
          </label>
          <select
            value={collegeId}
            onChange={(e) => setCollegeId(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
          >
            <option value="">-- Select College --</option>
            {colleges.map((college) => (
              <option key={college.id} value={college.id}>
                {college.name}
              </option>
            ))}
          </select>

          {/* File Upload */}
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="mb-4 bg-gray-700 p-2 rounded w-full"
          />

          {students.length > 0 && (
            <>
              <p className="mb-2 text-gray-300">
                {students.length} students ready to upload
              </p>
              <div className="max-h-64 overflow-auto border border-gray-700 rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700">
                    <tr>
                      {Object.keys(students[0]).map((key) => (
                        <th key={key} className="p-2 text-left capitalize">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 5).map((student, i) => (
                      <tr key={i} className="border-t border-gray-700">
                        {Object.values(student).map((value, j) => (
                          <td key={j} className="p-2">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {students.length > 5 && (
                <p className="text-sm mt-1 text-gray-400">
                  Showing first 5 of {students.length} students
                </p>
              )}
            </>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Uploading..." : "Upload to Supabase"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
