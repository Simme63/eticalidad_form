import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";

function AdminPanel() {
  const [pendingUsers, setPendingUsers] = useState([]);

  const fetchPendingUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("status", "pending");

    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setPendingUsers(data);
    }
  };

  const approveUser = async (userId) => {
    const { error } = await supabase
      .from("profiles")
      .update({ status: "approved" })
      .eq("id", userId);

    if (error) {
      console.error("Error approving user:", error);
    } else {
      fetchPendingUsers();
    }
  };

  const rejectUser = async (userId) => {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (error) {
      console.error("Error rejecting user:", error);
    } else {
      fetchPendingUsers();
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <div>
      <h2>Pending User Approvals</h2>
      {pendingUsers.length === 0 && <p>No pending users.</p>}
      {pendingUsers.map((user) => (
        <div key={user.id}>
          <p>{user.email}</p>
          <button onClick={() => approveUser(user.id)}>Approve</button>
          <button onClick={() => rejectUser(user.id)}>Reject</button>
        </div>
      ))}
    </div>
  );
}

export default AdminPanel;
