import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AttendanceReports = () => {
  const { students, colleges, attendanceRecords } = useAuth();
  const [selectedCollege, setSelectedCollege] = useState<string>("all");

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
  const goodAttendance = filteredStudents.filter(
    (s) => s.attendancePercentage >= 75 && s.attendancePercentage < 90,
  ).length;
  const poorAttendance = filteredStudents.filter(
    (s) => s.attendancePercentage < 75,
  ).length;

  // Prepare data for charts
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

  const attendanceDistribution = [
    { name: "Excellent (≥90%)", value: excellentAttendance, color: "#10b981" },
    { name: "Good (75-89%)", value: goodAttendance, color: "#f59e0b" },
    { name: "Poor (<75%)", value: poorAttendance, color: "#ef4444" },
  ];

  const getCollegeName = (collegeId: string) => {
    const college = colleges.find((c) => c.id === collegeId);
    return college ? college.name : "Unknown College";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Attendance Reports
          </h2>
          <p className="text-gray-600">
            Analyze attendance patterns and performance metrics
          </p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Excellent (≥90%)</p>
                <p className="text-2xl font-bold">{excellentAttendance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Poor (&lt;75%)</p>
                <p className="text-2xl font-bold">{poorAttendance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* College Attendance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5 text-blue-600" />
              College-wise Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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

        {/* Attendance Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Attendance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Student Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            Student Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents
              .sort((a, b) => b.attendancePercentage - a.attendancePercentage)
              .slice(0, 10)
              .map((student, index) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        #{index + 1}
                      </span>
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {student.name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{student.regimentalNo}</span>
                        <Badge variant="outline" className="text-xs">
                          {student.rank}
                        </Badge>
                        <span className="text-xs">
                          {getCollegeName(student.collegeId)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <Progress
                        value={student.attendancePercentage}
                        className="h-2"
                      />
                    </div>
                    <div
                      className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        student.attendancePercentage >= 90
                          ? "bg-green-100 text-green-700"
                          : student.attendancePercentage >= 75
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700",
                      )}
                    >
                      {student.attendancePercentage}%
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceReports;
