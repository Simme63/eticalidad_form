import { useState } from "react";
import { supabase } from "../supabase/client";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);

	const handleLogin = async (e) => {
		e.preventDefault();
		setError(null);

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			setError(error.message);
			return;
		}

		const user = data.user;

		// Check if profile exists
		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.select("status")
			.eq("id", user.id)
			.single();

		if (profileError && profileError.code === "PGRST116") {
			// No profile found, create one with 'pending' status
			const { error: insertError } = await supabase
				.from("profiles")
				.insert([
					{
						id: user.id,
						email: user.email,
						role: "user",
						status: "pending",
					},
				]);

			if (insertError) {
				setError(insertError.message);
				return;
			}

			await supabase.auth.signOut();
			setError("Your account is pending approval.");
			return;
		}

		// If found and status isn't 'approved', block login
		if (profile && profile.status !== "approved") {
			await supabase.auth.signOut();
			setError("Your account is pending approval.");
			return;
		}

		// Success: redirect or update UI as needed
		// ...
	};

	return (
		<form
			onSubmit={handleLogin}
			className="max-w-sm mx-auto mt-8 p-6 bg-white rounded shadow space-y-4"
		>
			<h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
			<input
				type="email"
				placeholder="Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
			/>
			<input
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
			/>
			<button
				type="submit"
				className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
			>
				Login
			</button>
			{error && <div className="text-red-600 text-center">{error}</div>}
		</form>
	);
};

export default Login;
