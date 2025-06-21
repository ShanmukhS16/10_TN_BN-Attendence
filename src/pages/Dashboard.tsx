import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminApprovalPanel from "@/components/admin/AdminApprovalPanel";
import AdminDashboard from "@/components/admin/AdminDashboard";
import UserDashboard from "@/components/user/UserDashboard";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return <div className="p-4">Loading user session...</div>;
  }

  const isAdmin = user.role === "admin";
  const isUser = user.role === "user";

  return (
    <div className="min-h-screen bg-gray-100 p-4 space-y-4">
      <h1 className="text-xl font-semibold">Welcome, {user.name}</h1>
      <p className="text-gray-700">Email: {user.email}</p>
      <p className="text-gray-700">Role: {user.role}</p>
      <div className="flex items-center gap-3 mb-4">
  <img src="/favicon.ico" alt="Logo" className="w-10 h-10 rounded" />
  <h1 className="text-2xl font-bold">10 TN BN Dashboard</h1>
</div>

      {/* Debugging info */}
      <pre className="text-sm bg-white p-2 rounded border">{JSON.stringify(user, null, 2)}</pre>

      {/* Dashboards */}
      {isAdmin && <AdminApprovalPanel />}
      {isAdmin && <AdminDashboard />}
      {isUser && <UserDashboard />}
    </div>
  );
};

export default Dashboard;
