import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";

function AdminPanel() {
  const [pendingUsers, setPendingUsers] = useState([]);

  const fetchPendingUsers = async () => {
    const { data, error } = await supabase.from("profiles").select("*").eq("status", "pending");

    if (error) {
      console.error("Error obteniendo usuarios:", error);
    } else {
      setPendingUsers(data);
    }
  };

  const approveUser = async (userId) => {
    const { error } = await supabase.from("profiles").update({ status: "approved" }).eq("id", userId);

    if (error) {
      console.error("Error aprobando usuario:", error);
    } else {
      fetchPendingUsers();
    }
  };

  const rejectUser = async (userId) => {
    const { error } = await supabase.from("profiles").delete().eq("id", userId);

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
      <h2>Aprobaciones de Usuario Pendientes</h2>
      {pendingUsers.length === 0 && <p>No hay usuarios pendientes.</p>}
      {pendingUsers.map((user) => (
        <div key={user.id}>
          <p>{user.email}</p>
          <button onClick={() => approveUser(user.id)}>Aprobar</button>
          <button onClick={() => rejectUser(user.id)}>Rechazar</button>
        </div>
      ))}
    </div>
  );
}

export default AdminPanel;
