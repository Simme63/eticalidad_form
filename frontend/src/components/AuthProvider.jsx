import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import Login from "./Login";
import Register from "./Register";

function AuthProvider({ children }) {
	const [session, setSession] = useState(null);
	const [userProfile, setUserProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [authView, setAuthView] = useState(null);

	// ⚠️ brute-force cleanup method
	const nukeEverythingAndReload = async () => {
		console.warn("💣 Nuking everything and reloading");
		await supabase.auth.signOut();
		localStorage.clear();
		sessionStorage.clear();
		indexedDB.databases &&
			indexedDB
				.databases()
				.then((dbs) =>
					dbs.forEach((db) => indexedDB.deleteDatabase(db.name))
				);
		window.location.reload();
	};

	useEffect(() => {
		const hardTimeout = setTimeout(() => {
			console.warn("⚠️ Hard fallback timeout hit");
			nukeEverythingAndReload();
		}, 8000);

		const initAuth = async () => {
			try {
				const { data, error: sessionError } =
					await supabase.auth.getSession();
				console.log("Initial session result:", data);

				if (sessionError) {
					console.error("Session fetch error:", sessionError);
					nukeEverythingAndReload();
					return;
				}

				if (!data.session) {
					console.log("No active session");
					setLoading(false);
					return;
				}

				setSession(data.session);
				await checkUserProfile(data.session.user.id);
			} catch (err) {
				console.error("Unexpected auth error:", err);
				nukeEverythingAndReload();
			}
		};

		const { data: listener } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				console.log("Auth state change:", event, session);
				if (!session) {
					setSession(null);
					setUserProfile(null);
					setLoading(false);
				} else {
					setSession(session);
					await checkUserProfile(session.user.id);
				}
			}
		);

		initAuth();

		return () => {
			listener.subscription.unsubscribe();
			clearTimeout(hardTimeout);
		};
	}, []);

	async function checkUserProfile(userId) {
		if (!userId) {
			console.warn("Missing userId in checkUserProfile");
			setUserProfile(null);
			setLoading(false);
			return;
		}

		console.log("Checking user profile for", userId);

		try {
			const { data: profile, error } = await supabase
				.from("profiles")
				.select("status")
				.eq("id", userId)
				.single();

			if (error) {
				console.error("Profile fetch error:", error);
				nukeEverythingAndReload();
				return;
			}

			if (!profile || profile.status !== "approved") {
				console.warn("Profile not approved or missing:", profile);
				setError(
					"Tu cuenta aún no ha sido aprobada por un administrador."
				);
				await supabase.auth.signOut();
				window.location.reload();
				return;
			}

			console.log("Profile approved:", profile);
			setUserProfile(profile);
			setError(null);
			setLoading(false);
		} catch (e) {
			console.error("Profile check failed:", e);
			nukeEverythingAndReload();
		}
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

	return <>{children}</>;
}

export default AuthProvider;
