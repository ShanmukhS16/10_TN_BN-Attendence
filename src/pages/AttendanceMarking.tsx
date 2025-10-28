import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  GraduationCap,
  Calendar,
  Users,
  Save,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const AttendanceMarking = () => {
  const {
    user,
    getStudentsByCollege,
    getAttendanceForDate,
    colleges,
    markAttendance,
    fetchData,
    updateStudentAttendanceStats, // ✅ make sure this exists in AuthContext
  } = useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const collegeId = searchParams.get("college");
  const dateStr = searchParams.get("date");

  const [attendanceState, setAttendanceState] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!collegeId || !dateStr) {
      navigate("/college-selection");
      return;
    }
  }, [user, collegeId, dateStr, navigate]);

  const college = colleges.find((c) => c.id === collegeId);
  const students = collegeId ? getStudentsByCollege(collegeId) : [];
  const date = dateStr ? new Date(dateStr) : new Date();

  // ✅ Prefill only once
  useEffect(() => {
    if (!dateStr || students.length === 0) return;
    if (Object.keys(attendanceState).length > 0) return;

    try {
      const existing = getAttendanceForDate(dateStr) || [];
      const initial: Record<string, boolean> = {};
      for (const rec of existing) {
        if (students.some((s) => s.id === rec.studentId)) {
          initial[rec.studentId] = !!rec.present;
        }
      }
      setAttendanceState(initial);
    } catch (err) {
      console.error("Failed to prefill attendance:", err);
    }
  }, [dateStr, students.length]); // removed getAttendanceForDate dependency

  const handleAttendanceToggle = (studentId: string, present: boolean) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: present,
    }));
  };

  const handleSaveAttendance = async () => {
    if (!dateStr) return;
    setIsSaving(true);
    try {
      // Save attendance records
      await Promise.all(
        Object.entries(attendanceState).map(([studentId, present]) =>
          markAttendance(studentId, dateStr, present)
        )
      );

      // ✅ Recalculate attendance for each student after marking
      for (const student of students) {
        const records = getAttendanceForDate(null, student.id); // pass null to get all dates
        const total = records.length;
        const presentCount = records.filter((r: any) => r.present).length;
        const percentage = total > 0 ? ((presentCount / total) * 100).toFixed(1) : "0";

        if (updateStudentAttendanceStats) {
          await updateStudentAttendanceStats(student.id, {
            totalClasses: total,
            presentCount,
            attendancePercentage: percentage,
          });
        }
      }

      // ✅ Refresh context after save
      await fetchData();

      toast.success("✅ Attendance saved & updated successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed to save attendance. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = async () => {
    if (!fetchData) return;
    setIsRefreshing(true);
    try {
      await fetchData();
      toast.success("🔄 Data refreshed!");
      setAttendanceState({});
    } catch (err) {
      toast.error("Failed to refresh data.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const presentCount = Object.values(attendanceState).filter(Boolean).length;
  const totalStudents = students.length;
  const attendancePercentage = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

  if (!user || !college || !dateStr) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/college-selection")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Mark Attendance
              </h1>
              <p className="text-gray-600 mt-1">
                {college.name} • {format(date, "EEEE, MMMM do, yyyy")}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={cn("w-4 h-4", isRefreshing && "animate-spin text-blue-600")}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: <GraduationCap className="w-5 h-5 text-blue-600" />,
                label: "College",
                value: college.code,
                color: "bg-blue-100",
              },
              {
                icon: <Calendar className="w-5 h-5 text-purple-600" />,
                label: "Date",
                value: format(date, "MMM dd"),
                color: "bg-purple-100",
              },
              {
                icon: <Users className="w-5 h-5 text-green-600" />,
                label: "Total Students",
                value: totalStudents,
                color: "bg-green-100",
              },
              {
                icon: <CheckCircle2 className="w-5 h-5 text-orange-600" />,
                label: "Present",
                value: `${presentCount}/${totalStudents}`,
                color: "bg-orange-100",
              },
            ].map((item, i) => (
              <Card key={i} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{item.label}</p>
                      <p className="font-semibold">{item.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Attendance Progress */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Today's Attendance</h3>
                <span className="text-2xl font-bold text-blue-600">
                  {attendancePercentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={attendancePercentage} className="h-3" />
              <p className="text-sm text-gray-600 mt-2">
                {presentCount} out of {totalStudents} students marked present
              </p>
            </CardContent>
          </Card>

          {/* Student List */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Student Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {students.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Students Found
                  </h3>
                  <p className="text-gray-500">No students are registered for this college.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {students.map((student, index) => {
                    const isPresent = attendanceState[student.id] || false;
                    return (
                      <div
                        key={student.id}
                        className={cn(
                          "p-6 transition-colors duration-200",
                          isPresent ? "bg-green-50" : "bg-white"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white text-lg",
                                isPresent ? "bg-green-500" : "bg-gray-400"
                              )}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                {student.name}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span>
                                  <span className="font-medium">Reg:</span>{" "}
                                  {student.regimentalNo || "N/A"}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {student.rank}
                                </Badge>
                                <span>
                                  <span className="font-medium">Attendance:</span>{" "}
                                  {student.attendancePercentage}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {isPresent ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                              <span
                                className={cn(
                                  "font-medium",
                                  isPresent ? "text-green-700" : "text-red-600"
                                )}
                              >
                                {isPresent ? "Present" : "Absent"}
                              </span>
                            </div>
                            <Switch
                              checked={isPresent}
                              onCheckedChange={(checked) =>
                                handleAttendanceToggle(student.id, checked)
                              }
                              className="data-[state=checked]:bg-green-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          {students.length > 0 && (
            <div className="mt-8 text-center">
              <Button
                onClick={handleSaveAttendance}
                disabled={isSaving || Object.keys(attendanceState).length === 0}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 h-auto shadow-lg"
              >
                <Save className="mr-2 w-4 h-4" />
                {isSaving ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceMarking;
