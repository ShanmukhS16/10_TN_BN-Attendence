import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminApprovalPanel() {
  const [pendingUsers, setPendingUsers] = useState([]);

  const fetchPending = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, regId, role, approved")
      .eq("approved", false);

    if (!error) setPendingUsers(data);
  };

  const approveUser = async (id) => {
    await supabase.from("users").update({ approved: true }).eq("id", id);
    fetchPending();
  };

  const promoteToAdmin = async (id) => {
    await supabase.from("users").update({ role: "admin", approved: true }).eq("id", id);
    fetchPending();
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Pending User Approvals</h2>
      {pendingUsers.length === 0 ? (
        <p>No pending users.</p>
      ) : (
        <table className="w-full border text-left">
          <thead>
            <tr>
              <th className="p-2 border">Reg ID</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map((user) => (
              <tr key={user.id}>
                <td className="p-2 border">{user.regId}</td>
                <td className="p-2 border">{user.role}</td>
                <td className="p-2 border">
                  <button className="mr-2 text-green-700" onClick={() => approveUser(user.id)}>
                    Approve
                  </button>
                  <button className="text-blue-700" onClick={() => promoteToAdmin(user.id)}>
                    Make Admin
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}