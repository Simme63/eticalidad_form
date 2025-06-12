import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import Login from "./Login";
import Register from "./Register";

function AuthProvider({ children }) {
	const [session, setSession] = useState(null);
	const [, setUserProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [authView, setAuthView] = useState(null); // 'login' | 'register' | null

	useEffect(() => {
		supabase.auth.getSession().then(({ data }) => {
			setSession(data.session);
			if (data.session?.user?.id) {
				checkUserProfile(data.session.user.id);
			} else {
				setLoading(false);
			}
		});

		const { data: listener } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				setSession(session);
				if (session?.user?.id) {
					await checkUserProfile(session.user.id);
				} else {
					setUserProfile(null);
					setLoading(false);
				}
			}
		);

		return () => {
			listener.subscription.unsubscribe();
		};
	}, []);

	async function checkUserProfile(userId) {
		if (!userId) {
			setUserProfile(null);
			setLoading(false);
			return;
		}

		setLoading(true);

		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.select("status")
			.eq("id", userId)
			.single();

		if (profileError || !profile) {
			setError("Error al cargar el perfil de usuario.");
			await supabase.auth.signOut();
			setUserProfile(null);
			setLoading(false);
			return;
		}

		if (profile.status !== "approved") {
			setError("Tu cuenta aún no ha sido aprobada por un administrador.");
			await supabase.auth.signOut();
			setUserProfile(null);
			setLoading(false);
			return;
		}

		setUserProfile(profile);
		setError(null);
		setLoading(false);
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-sky-300">
				<div className="text-sky-600 text-lg font-semibold">
					Cargando...
				</div>
			</div>
		);
	}

	if (!session) {
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

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-sky-300">
				<div className="text-center bg-white rounded-2xl shadow-2xl p-10 border border-sky-200 w-full max-w-xl">
					<h2 className="text-2xl font-bold text-sky-700 mb-4">
						Acceso denegado
					</h2>
					<p className="text-gray-700 mb-6">{error}</p>
					<button
						onClick={async () => {
							await supabase.auth.signOut();
							window.location.reload();
						}}
						className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-xl"
					>
						Volver
					</button>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}

export default AuthProvider;
