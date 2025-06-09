// Overview.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";

const STATUS_OPTIONS = ["pending", "approved", "paid"];

export default function Overview() {
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndRequests = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setRequests([]);
        setLoading(false);
        return;
      }

      // Get user role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(profile?.role || "user");

      // Fetch requests
      let query = supabase.from("requests").select("*").order("created_at", { ascending: false });
      if (profile?.role !== "admin") {
        query = query.eq("user_id", user.id);
      }
      const { data } = await query;
      setRequests(data || []);
      setLoading(false);
    };

    fetchUserAndRequests();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    await supabase.from("requests").update({ status: newStatus }).eq("id", id);
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (!user) return <div className="text-center mt-8">Please log in to view your requests.</div>;

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Requests Overview</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Brand</th>
              <th className="p-2 border">Invoice #</th>
              <th className="p-2 border">Part #</th>
              <th className="p-2 border">Quantity</th>
              <th className="p-2 border">Reason</th>
              <th className="p-2 border">Status</th>
              {role === "admin" && <th className="p-2 border">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td className="p-2 border">{req.brand}</td>
                <td className="p-2 border">{req.delivery_note_or_invoice_number}</td>
                <td className="p-2 border">{req.part_number}</td>
                <td className="p-2 border">{req.quantity}</td>
                <td className="p-2 border">{req.reason_for_return}</td>
                <td className="p-2 border capitalize">{req.status || "pending"}</td>
                {role === "admin" && (
                  <td className="p-2 border">
                    <select
                      value={req.status || "pending"}
                      onChange={(e) => handleStatusChange(req.id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                )}
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={role === "admin" ? 7 : 6} className="text-center p-4">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}