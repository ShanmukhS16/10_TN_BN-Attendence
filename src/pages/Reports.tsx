// src/pages/Reports.tsx
"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart as RBarChart,
  Bar,
} from "recharts";

import {
  ArrowLeft,
  TrendingUp,
  Users,
  GraduationCap,
  Calendar,
  BarChart2,
  FileDown,
} from "lucide-react";

import * as XLSX from "xlsx";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------------------------------*/
type College = { id: string | number; name: string; code?: string };
type Student = Record<string, any>;
type AttendanceRecord = {
  studentId: string | number;
  present?: boolean;
} & Record<string, any>;

/* -------------------------------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------------------------------*/
const sanitizeFile = (s: string) =>
  s.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").replace(/\s+/g, "_");

const getNumberField = (obj: any, names: string[]) => {
  for (const n of names) {
    if (!obj) continue;
    if (Object.prototype.hasOwnProperty.call(obj, n) && obj[n] != null) {
      const v = Number(obj[n]);
      return Number.isFinite(v) ? v : 0;
    }
    const foundKey = Object.keys(obj).find((k) => k.toLowerCase() === n.toLowerCase());
    if (foundKey && obj[foundKey] != null) {
      const v = Number(obj[foundKey]);
      return Number.isFinite(v) ? v : 0;
    }
  }
  return 0;
};

const getStringField = (obj: any, names: string[]) => {
  for (const n of names) {
    if (!obj) continue;
    if (Object.prototype.hasOwnProperty.call(obj, n) && obj[n] != null) {
      return String(obj[n]);
    }
    const foundKey = Object.keys(obj).find((k) => k.toLowerCase() === n.toLowerCase());
    if (foundKey && obj[foundKey] != null) return String(obj[foundKey]);
  }
  return "";
};

const pctColor = (pct: number) =>
  pct >= 90 ? "bg-emerald-500" : pct >= 75 ? "bg-amber-400" : "bg-rose-500";

/* -------------------------------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------------------------------*/
const Reports: React.FC = () => {
  const {
    user,
    students = [],
    colleges = [],
    attendanceRecords = [],
    fetchData,
  } = useAuth();

  const navigate = useNavigate();

  const [selectedCollege, setSelectedCollege] = useState<string>("all");
  const [downloading, setDownloading] = useState(false);

  /* ---------------------------------- Effects ---------------------------------- */
  // Fresh data once
  useEffect(() => {
    (async () => {
      try {
        if (fetchData) await fetchData();
      } catch (e) {
        console.error("fetchData failed:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auth guard
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  /* ---------------------------------- Core compute ---------------------------------- */
  const computeStudentAttendance = useCallback(
    (student: Student) => {
      // Prefer stored totals if present
      const totalFromCols = getNumberField(student, [
        "total_classes",
        "totalClasses",
        "totalclasses",
      ]);
      const attendedFromCols = getNumberField(student, [
        "attended_classes",
        "attendedClasses",
        "classesAttended",
        "attendedclasses",
      ]);

      if (totalFromCols > 0 || attendedFromCols > 0) {
        const total = totalFromCols;
        const attended = attendedFromCols;
        const pct =
          total > 0
            ? Math.round((attended / total) * 100)
            : Math.round(Number(student.attendancePercentage ?? 0));
        return { total, attended, pct };
      }

      // Fallback to records if no stored totals
      const records = (attendanceRecords as AttendanceRecord[]).filter(
        (r) => String(r.studentId) === String(student.id)
      );
      const total = records.length;
      const attended = records.filter((r) => !!r.present).length;
      const pct =
        total > 0
          ? Math.round((attended / total) * 100)
          : Math.round(Number(student.attendancePercentage ?? 0));
      return { total, attended, pct };
    },
    [attendanceRecords]
  );

  /* ---------------------------------- Filtering & derived ---------------------------------- */
  const filteredStudents: Student[] = useMemo(() => {
    const all = (students as Student[]) || [];
    if (selectedCollege === "all") return all;
    return all.filter((s) => String(s.collegeId) === String(selectedCollege));
  }, [students, selectedCollege]);

  // Compute once for filtered
  const computed = useMemo(() => {
    return filteredStudents.map((s) => {
      const fromProp = Number(s.attendancePercentage ?? NaN);
      const base = computeStudentAttendance(s);
      const percent = Math.round(Number.isFinite(fromProp) ? fromProp : base.pct ?? 0);
      return { student: s, total: base.total, attended: base.attended, percent };
    });
  }, [filteredStudents, computeStudentAttendance]);

  const totalStudents = computed.length;

  const averageAttendance = useMemo(() => {
    if (totalStudents === 0) return 0;
    const sum = computed.reduce((acc, c) => acc + (c.percent ?? 0), 0);
    return sum / totalStudents;
  }, [computed, totalStudents]);

  const excellentAttendance = useMemo(
    () => computed.filter((c) => (c.percent ?? 0) >= 90).length,
    [computed]
  );
  const poorAttendance = useMemo(
    () => computed.filter((c) => (c.percent ?? 0) < 75).length,
    [computed]
  );

  const sorted = useMemo(
    () => [...computed].sort((a, b) => (b.percent ?? 0) - (a.percent ?? 0)),
    [computed]
  );

  // College-wise chart data (use full dataset for a holistic chart)
  const collegeData = useMemo(() => {
    const list = (colleges as College[]) || [];
    const all = (students as Student[]) || [];
    return list.map((college) => {
      const collegeStudents = all.filter((s) => String(s.collegeId) === String(college.id));
      const avg =
        collegeStudents.length > 0
          ? Math.round(
              collegeStudents.reduce((sum, st) => {
                const fromProp = Number(st.attendancePercentage ?? NaN);
                const { pct } = computeStudentAttendance(st);
                return sum + Math.round(Number.isFinite(fromProp) ? fromProp : pct ?? 0);
              }, 0) / collegeStudents.length
            )
          : 0;
      return {
        name: college.code ?? college.name ?? "College",
        attendance: avg,
        students: collegeStudents.length,
      };
    });
  }, [colleges, students, computeStudentAttendance]);

  /* ---------------------------------- Export ---------------------------------- */
  const handleDownloadReport = useCallback(() => {
    try {
      setDownloading(true);

      if (!computed || computed.length === 0) {
        alert(
          selectedCollege === "all"
            ? "No students found."
            : "No students found for the selected college."
        );
        return;
      }

      const rows = computed.map(({ student, total, attended, percent }) => {
        const eligible = (percent ?? 0) >= 75 ? "✅ Yes" : "❌ No";
        return {
          Name: student.name ?? "N/A",
          "Regimental No":
            getStringField(student, ["regimentalNo", "regimental_no", "regimentalno"]) || "N/A",
          Rank: getStringField(student, ["rank"]) || "N/A",
          "Attendance %": percent ?? 0,
          "Total Classes": total ?? 0,
          "Classes Attended": attended ?? 0,
          "Eligible for Certificate Exam": eligible,
        };
      });

      const header = [
        "Name",
        "Regimental No",
        "Rank",
        "Attendance %",
        "Total Classes",
        "Classes Attended",
        "Eligible for Certificate Exam",
      ];
      const ws = XLSX.utils.json_to_sheet(rows, { header });

      // Auto width
      const colWidths = header.map((key) =>
        Math.min(
          Math.max(key.length, ...rows.map((r) => String((r as any)[key] ?? "").length)) + 2,
          40
        )
      );
      (ws as any)["!cols"] = colWidths.map((wch) => ({ wch }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");

      const ts = new Date().toISOString().split("T")[0];
      let fileName = `All_Colleges_Attendance_Report_${ts}.xlsx`;
      if (selectedCollege !== "all") {
        const col = (colleges as College[]).find((c) => String(c.id) === String(selectedCollege));
        const safeName = sanitizeFile(col?.name || col?.code || "College");
        fileName = `${safeName}_Attendance_Report_${ts}.xlsx`;
      }

      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Failed to generate report:", err);
      alert("Failed to generate report. See console for details.");
    } finally {
      setDownloading(false);
    }
  }, [computed, selectedCollege, colleges]);

  /* ---------------------------------- UI ---------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex flex-wrap justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Attendance Reports</h1>
              <p className="text-sm text-gray-600">
                Visual analytics & certificate eligibility overview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Select value={selectedCollege} onValueChange={setSelectedCollege}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select a college" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colleges</SelectItem>
                {(colleges as College[]).map((c) => (
                  <SelectItem key={String(c.id)} value={String(c.id)}>
                    {c.name} {c.code ? `(${c.code})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleDownloadReport}
              disabled={downloading || totalStudents === 0}
              className="bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90 text-white flex items-center gap-2 shadow-md"
              aria-busy={downloading}
            >
              <FileDown className="w-4 h-4" />
              {downloading ? "Generating..." : "Download"}
            </Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="container mx-auto px-6 py-10 space-y-10">
        {/* Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Total Students",
              value: totalStudents,
              icon: <Users className="w-6 h-6 text-blue-600" />,
              chip: "bg-blue-100",
            },
            {
              title: "Average Attendance",
              value: `${averageAttendance.toFixed(1)}%`,
              icon: <TrendingUp className="w-6 h-6 text-green-600" />,
              chip: "bg-green-100",
            },
            {
              title: "Excellent (≥90%)",
              value: excellentAttendance,
              icon: <GraduationCap className="w-6 h-6 text-emerald-600" />,
              chip: "bg-emerald-100",
            },
            {
              title: "Need Attention (<75%)",
              value: poorAttendance,
              icon: <Calendar className="w-6 h-6 text-rose-600" />,
              chip: "bg-rose-100",
            },
          ].map((c, idx) => (
            <Card
              key={idx}
              className={`shadow-md border-0 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 ${c.chip}/60`}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{c.title}</p>
                  <p className="text-3xl font-extrabold text-gray-900">{c.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/80 shadow-inner flex items-center justify-center">
                  {c.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Chart */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              College-wise Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RBarChart data={collegeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: "#374151" }} />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: "#374151" }} />
                  <Tooltip
                    cursor={{ fill: "rgba(99,102,241,0.08)" }}
                    contentStyle={{
                      borderRadius: 8,
                      background: "white",
                      border: "1px solid #e5e7eb",
                    }}
                    formatter={(v: number, name: string) =>
                      name === "attendance" ? [`${v}%`, "Attendance"] : [v, name]
                    }
                  />
                  <Bar dataKey="attendance" radius={[8, 8, 0, 0]} fill="#6366f1" />
                </RBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Student Performance */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Student Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {sorted.length === 0 ? (
              <p className="text-gray-500 text-sm">No students to display.</p>
            ) : (
              <div className="space-y-3">
                {sorted.map(({ student, total, attended, percent }, i) => (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-4 rounded-xl border border-gray-200 ${
                      i % 2 === 0 ? "bg-white/70" : "bg-gray-50/50"
                    } hover:shadow-sm transition`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-medium">#{i + 1}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-600">
                          {getStringField(student, [
                            "regimentalNo",
                            "regimental_no",
                            "regimentalno",
                          ]) || "N/A"}{" "}
                          • {getStringField(student, ["rank"]) || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Color-coded progress bar wrapper */}
                      <div className="w-36">
                        {/* We layer a colored inner bar above the default Progress track for better control */}
                        <div className="relative">
                          <Progress value={percent ?? 0} className="h-2 bg-gray-200" />
                          <div
                            className={`absolute inset-y-0 left-0 ${pctColor(
                              percent ?? 0
                            )} rounded-[inherit]`}
                            style={{
                              width: `${percent ?? 0}%`,
                              transition: "width 300ms ease",
                            }}
                            aria-hidden="true"
                          />
                        </div>
                      </div>

                      <div className="text-right min-w-[110px]">
                        <div className="text-lg font-bold text-gray-900">
                          {percent ?? 0}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {attended ?? 0}/{total ?? 0} classes
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Reports;
