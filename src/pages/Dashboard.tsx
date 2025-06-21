import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminApprovalPanel from "@/components/admin/AdminApprovalPanel";
import AdminDashboard from "@/components/admin/AdminDashboard";
import UserDashboard from "@/components/user/UserDashboard";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"dashboard" | "users">("dashboard");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.role === "admin") {
        const { data, error } = await supabase
          .from("users")
          .select("id, name, email, role, approved");
        if (data) setAllUsers(data);
      }
    };
    fetchUsers();
  }, [user]);

  const promoteToAdmin = async () => {
    if (!selectedUserId) return;
    const { error } = await supabase
      .from("users")
      .update({ role: "admin" })
      .eq("id", selectedUserId);

    if (error) {
      setMessage("\u274C Failed to promote: " + error.message);
    } else {
      setMessage("\u2705 User promoted to admin successfully!");
      setAllUsers((prev) =>
        prev.map((u) => (u.id === selectedUserId ? { ...u, role: "admin" } : u))
      );
    }
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) {
      alert("Failed to delete user: " + error.message);
    } else {
      setAllUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  if (!user) return <div className="p-4">Loading user session...</div>;

  const isAdmin = user.role === "admin";
  const isUser = user.role === "user";

  return (
    <div className="min-h-screen bg-gray-100 p-4 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <img src="/favicon.ico" alt="Logo" className="w-10 h-10 rounded" />
        <h1 className="text-2xl font-bold">10 TN BN Dashboard</h1>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Welcome, {user.name}</h1>
          <p className="text-gray-700">Email: {user.email}</p>
          <p className="text-gray-700">Role: {user.role}</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant={activeTab === "dashboard" ? "default" : "outline"}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </Button>
            <Button
              variant={activeTab === "users" ? "default" : "outline"}
              onClick={() => setActiveTab("users")}
            >
              Users
            </Button>
          </div>
        )}
      </div>

      {isAdmin && activeTab === "dashboard" && (
        <>
          <AdminApprovalPanel />
          <AdminDashboard />

          <div className="bg-white p-4 rounded-lg shadow-md mt-8">
            <h2 className="text-lg font-semibold mb-2">Promote User to Admin</h2>

            <Select onValueChange={(value) => setSelectedUserId(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {allUsers
                  .filter((u) => u.role !== "admin")
                  .map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Button
              className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={promoteToAdmin}
              disabled={!selectedUserId}
            >
              Promote to Admin
            </Button>

            {message && <p className="mt-2 text-sm">{message}</p>}
          </div>
        </>
      )}

      {isAdmin && activeTab === "users" && (
        <div className="bg-white p-6 rounded-lg shadow-md mt-4">
          <h2 className="text-xl font-semibold mb-4">All Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-300">
              <thead className="bg-gray-200 text-left">
                <tr>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Role</th>
                  <th className="p-2 border">Approved</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u.id} className="bg-white hover:bg-gray-50">
                    <td className="p-2 border">{u.name}</td>
                    <td className="p-2 border">{u.email}</td>
                    <td className="p-2 border">{u.role}</td>
                    <td className="p-2 border">{u.approved ? "✅ Yes" : "⛔ No"}</td>
                    <td className="p-2 border">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteUser(u.id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isUser && <UserDashboard />}
    </div>
  );
};

export default Dashboard;
