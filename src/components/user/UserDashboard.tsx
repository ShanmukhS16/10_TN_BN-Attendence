import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GraduationCap,
  LogOut,
  Calendar,
  Users,
  TrendingUp,
  Plus,
} from "lucide-react";

const UserDashboard = () => {
  const { user, logout, students, colleges } = useAuth();
  const navigate = useNavigate();

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

  const handleMarkAttendance = () => {
    navigate("/college-selection");
  };

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
                  Faculty Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>
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

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Ready to mark attendance?
                </h2>
                <p className="text-blue-100 mb-4">
                  Select a college and date to begin marking student attendance.
                </p>
                <Button
                  onClick={handleMarkAttendance}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Mark Attendance
                </Button>
              </div>
              <div className="hidden md:block">
                <Calendar className="w-24 h-24 text-blue-200" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-blue-600" />
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                {totalStudents}
              </p>
              <p className="text-sm text-gray-600 mt-1">Across all colleges</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                Colleges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                {totalColleges}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Available institutions
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Overall Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                {overallAttendance.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 mt-1">System average</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleMarkAttendance}
                className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <div className="text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-2" />
                  <span className="font-medium">Mark Today's Attendance</span>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/reports")}
                className="h-20 border-gray-200"
              >
                <div className="text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                  <span className="font-medium">View Reports</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* College List */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Available Colleges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {colleges.map((college) => (
                <div
                  key={college.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {college.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {college.location}
                      </p>
                      <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {college.code}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Students</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {
                          students.filter((s) => s.collegeId === college.id)
                            .length
                        }
                      </p>
                    </div>
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

export default UserDashboard;
