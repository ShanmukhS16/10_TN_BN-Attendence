import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  GraduationCap,
  TrendingUp,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";
import StudentManagement from "./StudentManagement";
import AttendanceReports from "./AttendanceReports";
import CollegeManagement from "./CollegeManagement";
import AddStudentModal from "./AddStudentModal";

const AdminDashboard = () => {
  const { user, logout, students, colleges } = useAuth();
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  const totalStudents = students.length;
  const totalColleges = colleges.length;

  // Calculate overall attendance percentage
  const overallAttendance =
    students.length > 0
      ? students.reduce(
          (sum, student) => sum + student.attendancePercentage,
          0,
        ) / students.length
      : 0;

  // Calculate students with low attendance (< 75%)
  const lowAttendanceCount = students.filter(
    (student) => student.attendancePercentage < 75,
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowAddStudentModal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
              <Button
                variant="outline"
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Colleges</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalColleges}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Overall Attendance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overallAttendance.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Low Attendance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {lowAttendanceCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <Tabs defaultValue="students" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="students"
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Students
                </TabsTrigger>
                <TabsTrigger
                  value="colleges"
                  className="flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  Colleges
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Reports
                </TabsTrigger>
              </TabsList>
              <TabsContent value="students" className="p-6">
                <StudentManagement />
              </TabsContent>
              <TabsContent value="colleges" className="p-6">
                <CollegeManagement />
              </TabsContent>
              <TabsContent value="reports" className="p-6">
                <AttendanceReports />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <AddStudentModal
        open={showAddStudentModal}
        onOpenChange={setShowAddStudentModal}
      />
    </div>
  );
};

export default AdminDashboard;
