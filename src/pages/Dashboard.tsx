"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/components/admin/AdminDashboard";
import UserDashboard from "@/components/user/UserDashboard";
import { supabase } from "@/lib/supabase";
import About from "./About";
import { logActivity } from "@/lib/activityLogs";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  UploadCloud,
  FileBarChart2,
  LogOut,
  UserPlus,
  ArrowRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import * as XLSX from "xlsx";

type SectionKey = "overview" | "users" | "upload";

const Dashboard: React.FC = () => {
  const { user, colleges = [], fetchData } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [section, setSection] = useState<SectionKey>("overview");

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [message, setMessage] = useState("");

  const [studentsPreview, setStudentsPreview] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, role, approved");

      if (!error && data) setAllUsers(data);
    };

    fetchUsers();
  }, [isAdmin]);

  const pickString = (obj: any, keys: string[]) => {
    for (const k of keys) {
      if (obj == null) break;
      if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null) {
        return String(obj[k]);
      }
      const found = Object.keys(obj).find(
        (kk) => kk.toLowerCase() === k.toLowerCase()
      );
      if (found && obj[found] != null) return String(obj[found]);
    }
    return "";
  };

  const pickNumber = (obj: any, keys: string[]) => {
    const s = pickString(obj, keys);
    if (!s) return 0;
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  };

  const promoteToAdmin = async () => {
    if (!selectedUserId) return;

    const { error } = await supabase
      .from("users")
      .update({ role: "admin" })
      .eq("id", selectedUserId);

    if (error) {
      setMessage("❌ Failed to promote: " + error.message);
    } else {
      setMessage("✅ User promoted to admin successfully!");
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUserId ? { ...u, role: "admin" } : u
        )
      );
      setSelectedUserId("");
    }
  };

 const deleteUser = async (id: string) => {
  if (!user) return;

  const targetUser = allUsers.find((u) => u.id === id);

  const { error } = await supabase.from("users").delete().eq("id", id);

  if (error) {
    alert("Failed to delete user: " + error.message);
  } else {
    await logActivity({
      actorUserId: user.id,
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      action: "DELETE_USER",
      entityType: "user",
      entityId: id,
      targetName: targetUser?.name ?? null,
      details: {
        targetEmail: targetUser?.email ?? null,
        targetRole: targetUser?.role ?? null,
      },
    });

    setAllUsers((prev) => prev.filter((u) => u.id !== id));
  }
};

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: null });
      setStudentsPreview(json as any[]);
    } catch (err) {
      console.error("Failed to parse file:", err);
      alert("Failed to read Excel file. Make sure it's a valid .xlsx/.xls/.csv");
    }
  };

  const handleBulkUpload = async () => {
    if (!studentsPreview.length) {
      alert("No students to upload");
      return;
    }

    if (!user) {
      alert("You must be logged in to upload");
      return;
    }

    setUploading(true);

    try {
      const rowsToInsert: any[] = studentsPreview.map((r: any) => {
        const name = pickString(r, [
          "name",
          "Name",
          "studentName",
          "student_name",
        ]);
        const regimentalNo = pickString(r, [
          "regimentalNo",
          "regimental_no",
          "regimentalno",
          "Regimental No",
          "Regimental",
        ]);
        const rank = pickString(r, ["rank", "Rank"]);
        const collegeRaw = pickString(r, [
          "collegeId",
          "college_id",
          "college",
          "College",
        ]);
        const total_classes = pickNumber(r, [
          "total_classes",
          "totalClasses",
          "total classes",
        ]);
        const attended_classes = pickNumber(r, [
          "attended_classes",
          "attendedClasses",
          "attended classes",
        ]);

        return {
          name,
          regimentalNo,
          rank,
          collegeRaw,
          total_classes,
          attended_classes,
          createdBy: user.id,
        };
      });

      const collegeMap = new Map<string, string>();
      (colleges || []).forEach((c: any) => {
        if (!c) return;
        collegeMap.set(String(c.id).toLowerCase(), c.id);
        if (c.name) collegeMap.set(String(c.name).toLowerCase(), c.id);
        if (c.code) collegeMap.set(String(c.code).toLowerCase(), c.id);
      });

      const finalInsert: any[] = [];
      const skipped: any[] = [];

      const regNos = rowsToInsert.map((r) => r.regimentalNo).filter(Boolean);
      const existingQuery = regNos.length
        ? await supabase
            .from("students")
            .select("regimentalNo")
            .in("regimentalNo", regNos)
        : { data: [], error: null };

      const existingSet = new Set(
        (existingQuery.data || []).map((x: any) => String(x.regimentalNo))
      );

      for (const row of rowsToInsert) {
        if (!row.name || !row.regimentalNo) {
          skipped.push({ row, reason: "missing_name_or_regimentalNo" });
          continue;
        }

        if (existingSet.has(row.regimentalNo)) {
          skipped.push({ row, reason: "already_exists" });
          continue;
        }

        let collegeId = "";

        if (row.collegeRaw) {
          collegeId = collegeMap.get(row.collegeRaw.toLowerCase()) || "";

          if (!collegeId) {
            const found = (colleges || []).find(
              (c: any) =>
                (c.name &&
                  c.name.toLowerCase().includes(row.collegeRaw.toLowerCase())) ||
                (c.code &&
                  c.code.toLowerCase().includes(row.collegeRaw.toLowerCase()))
            );
            if (found) collegeId = found.id;
          }
        }

        finalInsert.push({
          name: row.name,
          regimentalNo: row.regimentalNo,
          rank: row.rank || null,
          collegeId: collegeId || null,
          total_classes: row.total_classes || 0,
          attended_classes: row.attended_classes || 0,
          attendancePercentage:
            row.total_classes && row.total_classes > 0
              ? Math.round((row.attended_classes / row.total_classes) * 100)
              : 0,
          createdBy: row.createdBy,
        });
      }

      if (!finalInsert.length) {
        let msg = "No rows to insert.";
        if (skipped.length) {
          msg += ` Skipped ${skipped.length} rows (missing/duplicates).`;
        }
        alert(msg);
        setUploading(false);
        return;
      }

      const { error } = await supabase.from("students").insert(finalInsert);
    if (error) throw error;

    await logActivity({
      actorUserId: user.id,
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      action: "BULK_UPLOAD_STUDENTS",
      entityType: "student",
      targetName: "bulk_upload",
      details: {
        insertedCount: finalInsert.length,
        skippedCount: skipped.length,
        previewRows: studentsPreview.length,
        },
      });

      await fetchData?.();
      alert(
        `✅ Inserted ${finalInsert.length} students. Skipped ${skipped.length} rows.`
      );
      setStudentsPreview([]);
    } catch (err: any) {
      console.error("Bulk upload failed:", err);
      alert("❌ Upload failed: " + (err?.message || String(err)));
    } finally {
      setUploading(false);
    }
  };

  const closeSidebarAnd = (next: () => void) => {
    setSidebarOpen(false);
    next();
  };

  const SectionTitle = useMemo(() => {
    switch (section) {
      case "overview":
        return "Overview";
      case "users":
        return "Manage Users";
      case "upload":
        return "Upload Students";
      default:
        return "Dashboard";
    }
  }, [section]);

  if (!user) return <div className="p-6">Loading user session...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open menu"
              className="p-2 rounded-lg bg-white/80 shadow hover:shadow-md transition md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>

            <img src="/favicon.ico" alt="Logo" className="w-8 h-8 rounded" />

            <div>
              <h1 className="text-xl font-extrabold text-gray-900">
                10 TN BN Dashboard
              </h1>
              <p className="text-xs text-gray-600">
                Welcome, {user.name} • {user.email} •{" "}
                <span className="uppercase">{user.role}</span>
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => closeSidebarAnd(() => navigate("/login"))}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 bg-white/90 backdrop-blur-md border-r border-gray-200 shadow-xl",
          "w-3/4 max-w-[18rem] md:max-w-none",
          "transform transition-transform duration-300 md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          sidebarCollapsed ? "md:w-20" : "md:w-72",
          "md:fixed",
        ].join(" ")}
      >
        <div className="px-4 py-4 flex items-center justify-between md:justify-end">
          <button
            aria-label="Toggle sidebar"
            className="hidden md:flex items-center gap-2 px-2 py-1 rounded-lg bg-white/80 border border-gray-200 shadow hover:shadow-md transition"
            onClick={() => setSidebarCollapsed((v) => !v)}
            title={sidebarCollapsed ? "Expand" : "Collapse"}
          >
            {sidebarCollapsed ? (
              <ChevronsRight className="w-4 h-4 text-gray-700" />
            ) : (
              <ChevronsLeft className="w-4 h-4 text-gray-700" />
            )}
          </button>

          <button
            aria-label="Close menu"
            className="p-2 rounded-lg bg-white/80 shadow hover:shadow-md transition md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        <nav className="px-3 py-2 space-y-1">
          <Button
            variant={section === "overview" ? "default" : "ghost"}
            className={`w-full justify-start gap-2 ${
              sidebarCollapsed ? "md:justify-center" : ""
            }`}
            onClick={() => closeSidebarAnd(() => setSection("overview"))}
          >
            <LayoutDashboard className="w-4 h-4" />
            {!sidebarCollapsed && <span>Overview</span>}
          </Button>

          {isAdmin && (
            <>
              <Button
                variant={section === "users" ? "default" : "ghost"}
                className={`w-full justify-start gap-2 ${
                  sidebarCollapsed ? "md:justify-center" : ""
                }`}
                onClick={() => closeSidebarAnd(() => setSection("users"))}
              >
                <Users className="w-4 h-4" />
                {!sidebarCollapsed && <span>Manage Users</span>}
              </Button>

              <Button
                variant={section === "upload" ? "default" : "ghost"}
                className={`w-full justify-start gap-2 ${
                  sidebarCollapsed ? "md:justify-center" : ""
                }`}
                onClick={() => closeSidebarAnd(() => setSection("upload"))}
              >
                <UploadCloud className="w-4 h-4" />
                {!sidebarCollapsed && <span>Upload Students</span>}
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            className={`w-full justify-start gap-2 ${
              sidebarCollapsed ? "md:justify-center" : ""
            }`}
            onClick={() => closeSidebarAnd(() => navigate("/reports"))}
          >
            <FileBarChart2 className="w-4 h-4" />
            {!sidebarCollapsed && <span>Reports</span>}
          </Button>

          <div className="pt-2">
            <Button
              variant="destructive"
              className={`w-full justify-start gap-2 ${
                sidebarCollapsed ? "md:justify-center" : ""
              }`}
              onClick={() => closeSidebarAnd(() => navigate("/login"))}
            >
              <LogOut className="w-4 h-4" />
              {!sidebarCollapsed && <span>Logout</span>}
            </Button>
          </div>
        </nav>
      </aside>

      <main className={`${sidebarCollapsed ? "md:pl-20" : "md:pl-72"}`}>
        <div className="container mx-auto px-6 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900">
              {SectionTitle}
            </h2>
            <p className="text-sm text-gray-600">
              {section === "overview" &&
                "Organization snapshot and quick actions."}
              {section === "users" &&
                "Promote, remove, and view all users."}
              {section === "upload" &&
                "Bulk import students from Excel/CSV."}
            </p>
          </div>

          {section === "overview" && (
            <div className="space-y-6">
              {isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-md p-5 hover:shadow-lg transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Manage Users
                        </h3>
                        <p className="text-sm text-gray-600">
                          Promote admins, remove users
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>
                    <Button
                      onClick={() => setSection("users")}
                      variant="outline"
                      className="mt-4 w-full"
                    >
                      Go to Users <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-md p-5 hover:shadow-lg transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Upload Students
                        </h3>
                        <p className="text-sm text-gray-600">
                          Bulk add via Excel/CSV
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <UploadCloud className="w-5 h-5 text-amber-600" />
                      </div>
                    </div>
                    <Button
                      onClick={() => setSection("upload")}
                      variant="outline"
                      className="mt-4 w-full"
                    >
                      Open Uploader <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {isAdmin ? <AdminDashboard /> : null}
              {isUser ? <UserDashboard /> : null}

              <div className="mt-16 border-t border-gray-200 pt-12">
                <About />
              </div>
            </div>
          )}

          {section === "users" && isAdmin && (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  Promote User to Admin
                </h3>

                <div className="grid md:grid-cols-[1fr_auto] gap-3 items-center">
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
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
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={promoteToAdmin}
                    disabled={!selectedUserId}
                  >
                    Promote
                  </Button>
                </div>

                {message && (
                  <p className="mt-2 text-sm text-gray-700">{message}</p>
                )}
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  All Users
                </h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100/80 text-left">
                      <tr>
                        <th className="p-2 border-b">Name</th>
                        <th className="p-2 border-b">Email</th>
                        <th className="p-2 border-b">Role</th>
                        <th className="p-2 border-b">Approved</th>
                        <th className="p-2 border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((u) => (
                        <tr key={u.id} className="bg-white/60 hover:bg-gray-50">
                          <td className="p-2 border-b">{u.name}</td>
                          <td className="p-2 border-b">{u.email}</td>
                          <td className="p-2 border-b">{u.role}</td>
                          <td className="p-2 border-b">
                            {u.approved ? "✅" : "⛔"}
                          </td>
                          <td className="p-2 border-b">
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
                      {allUsers.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-4 text-center text-gray-500"
                          >
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {section === "upload" && isAdmin && (
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-md p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Bulk Upload Students
                </h3>
                <p className="text-sm text-gray-600">
                  Upload .xlsx / .xls / .csv with columns like:{" "}
                  <code>name</code>, <code>regimentalNo</code>, <code>rank</code>,{" "}
                  <code>college</code>, <code>total_classes</code>,{" "}
                  <code>attended_classes</code>.
                </p>
              </div>

              <label className="block">
                <span className="sr-only">Choose file</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0 file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100
                  cursor-pointer"
                />
              </label>

              {studentsPreview.length > 0 && (
                <div className="text-sm text-gray-700">
                  <p className="mb-2">
                    <strong>Preview:</strong> {studentsPreview.length} rows loaded.
                  </p>
                  <div className="max-h-64 overflow-auto rounded border border-gray-200 bg-white/70">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-100">
                        <tr>
                          {Object.keys(studentsPreview[0] || {}).map((k) => (
                            <th
                              key={k}
                              className="px-2 py-1 border-b text-left"
                            >
                              {k}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {studentsPreview.slice(0, 10).map((row, idx) => (
                          <tr
                            key={idx}
                            className="odd:bg-white/70 even:bg-gray-50/60"
                          >
                            {Object.keys(studentsPreview[0] || {}).map((k) => (
                              <td key={k} className="px-2 py-1 border-b">
                                {String(row[k] ?? "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {studentsPreview.length > 10 && (
                      <div className="p-2 text-center text-gray-500 text-xs">
                        ...and {studentsPreview.length - 10} more rows
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setStudentsPreview([])}
                  disabled={!studentsPreview.length || uploading}
                >
                  Clear
                </Button>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={handleBulkUpload}
                  disabled={!studentsPreview.length || uploading}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;