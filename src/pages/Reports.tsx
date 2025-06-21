import React, { useState, useEffect } from "react";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  GraduationCap,
  Calendar,
} from "lucide-react";

const Reports = () => {
  const { user, students, colleges } = useAuth();
  const navigate = useNavigate();
  const [selectedCollege, setSelectedCollege] = useState<string>("all");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Filter students based on college selection
  const filteredStudents =
    selectedCollege === "all"
      ? students
      : students.filter((student) => student.collegeId === selectedCollege);

  // Calculate statistics
  const totalStudents = filteredStudents.length;
  const averageAttendance =
    totalStudents > 0
      ? filteredStudents.reduce(
          (sum, student) => sum + student.attendancePercentage,
          0,
        ) / totalStudents
      : 0;

  const excellentAttendance = filteredStudents.filter(
    (s) => s.attendancePercentage >= 90,
  ).length;
  const poorAttendance = filteredStudents.filter(
    (s) => s.attendancePercentage < 75,
  ).length;

  // Prepare chart data
  const collegeData = colleges.map((college) => {
    const collegeStudents = students.filter((s) => s.collegeId === college.id);
    const avgAttendance =
      collegeStudents.length > 0
        ? collegeStudents.reduce(
            (sum, student) => sum + student.attendancePercentage,
            0,
          ) / collegeStudents.length
        : 0;

    return {
      name: college.code,
      attendance: Math.round(avgAttendance),
      students: collegeStudents.length,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Attendance Reports
                </h1>
                <p className="text-gray-600">
                  View detailed attendance analytics and trends
                </p>
              </div>
            </div>
            <Select value={selectedCollege} onValueChange={setSelectedCollege}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select college" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colleges</SelectItem>
                {colleges.map((college) => (
                  <SelectItem key={college.id} value={college.id}>
                    {college.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Attendance</p>
                  <p className="text-2xl font-bold">
                    {averageAttendance.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Excellent (≥90%)</p>
                  <p className="text-2xl font-bold">{excellentAttendance}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Need Attention</p>
                  <p className="text-2xl font-bold">{poorAttendance}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5 text-blue-600" />
              College-wise Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={collegeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="attendance"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Student Performance List */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Student Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStudents
                .sort((a, b) => b.attendancePercentage - a.attendancePercentage)
                .map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-500">
                        #{index + 1}
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {student.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {student.regimentalNo} • {student.rank}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <Progress
                          value={student.attendancePercentage}
                          className="h-2"
                        />
                      </div>
                      <span className="text-lg font-bold text-gray-900 min-w-[50px]">
                        {student.attendancePercentage}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
