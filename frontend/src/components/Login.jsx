import { useState } from "react";
import { supabase } from "../supabase/client";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);

	const handleLogin = async (e) => {
		e.preventDefault();
		setError(null);

		// Sign in with Supabase
		const {
			data: { user },
			error: signInError,
		} = await supabase.auth.signInWithPassword({ email, password });

		if (signInError) {
			setError(signInError.message);
			return;
		}

		if (user) {
			// Fetch profile with the user's status
			const { data: profile, error: profileError } = await supabase
				.from("profiles")
				.select("status")
				.eq("id", user.id)
				.single();

			if (profileError || !profile) {
				setError("Error al obtener perfil de usuario.");
				await supabase.auth.signOut();
				return;
			}

			if (profile.status !== "approved") {
				setError("Tu cuenta no ha sido aprobada por un administrador.");
				await supabase.auth.signOut();
				return;
			}

			// If approved, redirect or show logged-in UI
			alert("¡Bienvenido! Has iniciado sesión correctamente.");
			// TODO: Redirect or update your app state here
		}
	};

	return (
		<form
			onSubmit={handleLogin}
			className="w-full bg-white rounded-2xl shadow-xl p-6 space-y-5 border border-sky-200"
		>
			<h2 className="text-2xl font-bold text-center text-sky-700 mb-3">
				Iniciar Sesión
			</h2>

			<div>
				<label className="block text-sky-800 text-sm mb-1">
					Correo electrónico
				</label>
				<input
					type="email"
					placeholder="yo@ejemplo.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full px-4 py-2 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
					required
				/>
			</div>

			<div>
				<label className="block text-sky-800 text-sm mb-1">
					Contraseña
				</label>
				<input
					type="password"
					placeholder="••••••••"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full px-4 py-2 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
					required
				/>
			</div>

			<button
				type="submit"
				className="w-full bg-sky-600 text-white py-2 rounded-xl hover:bg-sky-700 transition font-semibold"
			>
				Iniciar Sesión
			</button>

			{error && (
				<div className="text-red-600 text-center font-medium">
					{error}
				</div>
			)}
		</form>
	);
}

export default Login;
