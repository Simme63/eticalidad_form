import { LayoutDashboard, LogOut, PlusCircle, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import AdminPanel from "./AdminPanel";
import Overview from "./Overview";
import RequestForm from "./RequestForm";

function MainView() {
	const [activeTab, setActiveTab] = useState("request");
	const [role, setRole] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchRole = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (user) {
				const { data: profile, error } = await supabase
					.from("profiles")
					.select("role")
					.eq("id", user.id)
					.single();

				if (error || !profile) {
					setRole("user");
				} else {
					setRole(profile.role || "user");
				}
			}

			setLoading(false);
		};

		fetchRole();
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-sky-300">
				<div className="text-sky-600 text-lg font-semibold">
					Cargando...
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-5xl mx-auto p-4">
			{/* Top Bar */}
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-xl font-bold text-sky-700">
					Repuestos Express
				</h1>
				<button
					onClick={async () => {
						await supabase.auth.signOut();
						window.location.reload();
					}}
					className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-sky-700 font-semibold py-2 px-4 rounded-lg border border-sky-200"
				>
					<LogOut size={18} />
					Cerrar sesión
				</button>
			</div>

			{/* Tab Nav */}
			<div className="flex justify-center gap-6 mb-8">
				<button
					className={`flex flex-col items-center p-4 rounded-2xl transition ${
						activeTab === "request"
							? "bg-sky-600 text-white shadow-lg"
							: "bg-gray-100 text-sky-700 hover:bg-sky-50"
					}`}
					onClick={() => setActiveTab("request")}
				>
					<PlusCircle size={32} />
					<span className="text-sm font-medium mt-1">
						Nueva solicitud
					</span>
				</button>

				<button
					className={`flex flex-col items-center p-4 rounded-2xl transition ${
						activeTab === "overview"
							? "bg-sky-600 text-white shadow-lg"
							: "bg-gray-100 text-sky-700 hover:bg-sky-50"
					}`}
					onClick={() => setActiveTab("overview")}
				>
					<LayoutDashboard size={32} />
					<span className="text-sm font-medium mt-1">Resumen</span>
				</button>

				{role === "admin" && (
					<button
						className={`flex flex-col items-center p-4 rounded-2xl transition ${
							activeTab === "admin"
								? "bg-sky-600 text-white shadow-lg"
								: "bg-gray-100 text-sky-700 hover:bg-sky-50"
						}`}
						onClick={() => setActiveTab("admin")}
					>
						<ShieldCheck size={32} />
						<span className="text-sm font-medium mt-1">
							Panel de administrador
						</span>
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
