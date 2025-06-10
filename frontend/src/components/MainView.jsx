import { useAtom } from "jotai";
import { LayoutDashboard, PlusCircle, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { userAtom } from "../atoms/authAtom";
import { supabase } from "../supabase/client";
import AdminPanel from "./AdminPanel";
import Login from "./Login";
import Overview from "./Overview";
import Register from "./Register";
import RequestForm from "./RequestForm";

function MainView() {
  const [user] = useAtom(userAtom);
  const [activeTab, setActiveTab] = useState("overview");
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        setRole(profile?.role || "user");
      }
    };
    fetchRole();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-sky-300">
        <div className="bg-white rounded-2xl shadow-2xl p-10 border border-sky-200 w-full max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-sky-700 mb-8">
            ¡Bienvenido! — Por favor, registrate o inicia sesión
          </h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 min-w-[280px]">
              <Register />
            </div>
            <div className="flex-1 min-w-[280px] border-t md:border-t-0 md:border-l border-sky-100 md:pl-8 pt-8 md:pt-0">
              <Login />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Tab Nav */}
      <div className="flex justify-center gap-6 mb-8">
        <button
          className={`flex flex-col items-center p-4 rounded-2xl transition ${
            activeTab === "overview" ? "bg-sky-600 text-white shadow-lg" : "bg-gray-100 text-sky-700 hover:bg-sky-50"
          }`}
          onClick={() => setActiveTab("overview")}>
          <LayoutDashboard size={32} />
          <span className="text-sm font-medium mt-1">Resumen</span>
        </button>

        <button
          className={`flex flex-col items-center p-4 rounded-2xl transition ${
            activeTab === "request" ? "bg-sky-600 text-white shadow-lg" : "bg-gray-100 text-sky-700 hover:bg-sky-50"
          }`}
          onClick={() => setActiveTab("request")}>
          <PlusCircle size={32} />
          <span className="text-sm font-medium mt-1">Nueva solicitud</span>
        </button>

        {role === "admin" && (
          <button
            className={`flex flex-col items-center p-4 rounded-2xl transition ${
              activeTab === "admin" ? "bg-sky-600 text-white shadow-lg" : "bg-gray-100 text-sky-700 hover:bg-sky-50"
            }`}
            onClick={() => setActiveTab("admin")}>
            <ShieldCheck size={32} />
            <span className="text-sm font-medium mt-1">Panel de administrador</span>
          </button>
        )}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && <Overview />}
      {activeTab === "request" && <RequestForm />}
      {activeTab === "admin" && role === "admin" && <AdminPanel />}
    </div>
  );
}

export default MainView;
