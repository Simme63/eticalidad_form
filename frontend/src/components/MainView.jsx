import { useAtom } from "jotai";
import { LayoutDashboard, LogOut, PlusCircle, ShieldCheck } from "lucide-react";
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
	const [activeTab, setActiveTab] = useState("request");
	const [role, setRole] = useState(null);
	const [authView, setAuthView] = useState(null); // 'login' | 'register' | null

	useEffect(() => {
		const fetchRole = async () => {
			if (user) {
				const { data: profile } = await supabase
					.from("profiles")
					.select("role")
					.eq("id", user.id)
					.single();
				setRole(profile?.role || "user");
			}
		};
		fetchRole();
	}, [user]);

	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-sky-300">
				<div className="bg-white rounded-2xl shadow-2xl p-10 border border-sky-200 w-full max-w-3xl text-center">
					<h2 className="text-3xl font-bold text-sky-700 mb-8">
						¡Bienvenido a Repuestos Express!
					</h2>

					{!authView && (
						<div className="space-y-6">
							<p className="text-lg text-gray-700">
								¿Ya tienes una cuenta?
							</p>
							<button
								onClick={() => setAuthView("login")}
								className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-xl"
							>
								Iniciar sesión
							</button>
							<p className="text-gray-600">o si no...</p>
							<button
								onClick={() => setAuthView("register")}
								className="w-full bg-gray-100 hover:bg-gray-200 text-sky-700 font-semibold py-3 rounded-xl border border-sky-200"
							>
								Registrarse
							</button>
						</div>
					)}

					{authView === "login" && (
						<div className="mt-8">
							<Login />
							<button
								onClick={() => setAuthView(null)}
								className="mt-6 text-sky-600 hover:underline"
							>
								← Volver
							</button>
						</div>
					)}

					{authView === "register" && (
						<div className="mt-8">
							<Register />
							<button
								onClick={() => setAuthView(null)}
								className="mt-6 text-sky-600 hover:underline"
							>
								← Volver
							</button>
						</div>
					)}
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
