import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";

const STATUS_OPTIONS = ["pendiente", "aprobado", "pagado"];

export default function Overview() {
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndRequests = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setRequests([]);
        setLoading(false);
        return;
      }

      // Get user role
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

      setRole(profile?.role || "user");

      // Build query and chain all modifiers before await
      let query = supabase.from("requests").select("*");
      if (profile?.role !== "admin") {
        query = query.eq("user_id", user.id);
      }
      const { data, error } = await query.order("submitted_at", {
        ascending: false,
      });

      if (error) console.error("Error cargando solicitudes:", error);

      setRequests(data || []);
      setLoading(false);
    };

    fetchUserAndRequests();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    await supabase.from("requests").update({ status: newStatus }).eq("id", id);
    setRequests((prev) => prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req)));
  };

  if (loading) return <div className="text-center mt-8">Cargando...</div>;
  if (!user) return <div className="text-center mt-8">Inicia sesión para ver tus solicitudes.</div>;

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Resumen de solicitudes</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Marca</th>
              <th className="p-2 border">N° Factura</th>
              <th className="p-2 border">N° Parte</th>
              <th className="p-2 border">Cantidad</th>
              <th className="p-2 border">Motivo</th>
              <th className="p-2 border">Estado</th>
              {role === "admin" && <th className="p-2 border">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={role === "admin" ? 7 : 6} className="text-center p-4">
                  No hay solicitudes.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id}>
                  <td className="p-2 border">{req.brand}</td>
                  <td className="p-2 border">{req.delivery_note_or_invoice_number}</td>
                  <td className="p-2 border">{req.part_number}</td>
                  <td className="p-2 border">{req.quantity}</td>
                  <td className="p-2 border">{req.reason_for_return}</td>
                  <td className="p-2 border capitalize">{req.status || "pendiente"}</td>
                  {role === "admin" && (
                    <td className="p-2 border">
                      <select
                        value={req.status || "pendiente"}
                        onChange={(e) => handleStatusChange(req.id, e.target.value)}
                        className="border rounded px-2 py-1">
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
