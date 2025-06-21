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
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const AttendanceMarking = () => {
  const { user, getStudentsByCollege, colleges, markAttendance } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const collegeId = searchParams.get("college");
  const dateStr = searchParams.get("date");

  const [attendanceState, setAttendanceState] = useState<
    Record<string, boolean>
  >({});
  const [isSaving, setIsSaving] = useState(false);

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
      // Mark attendance for all students
      await Promise.all(
        Object.entries(attendanceState).map(([studentId, present]) =>
          markAttendance(studentId, dateStr, present),
        ),
      );

      toast.success("Attendance saved successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to save attendance. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const presentCount = Object.values(attendanceState).filter(Boolean).length;
  const totalStudents = students.length;
  const attendancePercentage =
    totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

  if (!user || !college || !dateStr) {
    return null;
  }

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
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">College</p>
                    <p className="font-semibold">{college.code}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">{format(date, "MMM dd")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="font-semibold">{totalStudents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Present</p>
                    <p className="font-semibold">
                      {presentCount}/{totalStudents}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <p className="text-gray-500">
                    No students are registered for this college.
                  </p>
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
                          isPresent ? "bg-green-50" : "bg-white",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white text-lg",
                                isPresent ? "bg-green-500" : "bg-gray-400",
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
                                  {student.regimentalNo}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {student.rank}
                                </Badge>
                                <span>
                                  <span className="font-medium">
                                    Attendance:
                                  </span>{" "}
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
                                  isPresent ? "text-green-700" : "text-red-600",
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
