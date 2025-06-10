import { useState } from "react";
import { supabase } from "../supabase/client";

function Register() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [repeatPassword, setRepeatPassword] = useState("");
	const [companyName, setCompanyName] = useState("");
	const [cif, setCif] = useState("");
	const [error, setError] = useState(null);

	const handleRegister = async (e) => {
		e.preventDefault();
		setError(null);

		if (password !== repeatPassword) {
			setError("Passwords do not match.");
			setPassword("");
			setRepeatPassword("");
			return;
		}

		const { error } = await supabase.auth.signUp({
			email,
			password,
		});

		if (error) {
			console.error(error);
			setPassword("");
			setRepeatPassword("");
			setError("Registration failed. Please try again.");
		} else {
			alert(
				"Registration successful — check your inbox to confirm your email!"
			);
		}
	};

	return (
		<form
			onSubmit={handleRegister}
			className="w-full bg-white rounded-2xl shadow-xl p-6 space-y-5 border border-sky-200"
		>
			<h2 className="text-2xl font-bold text-center text-sky-700 mb-3">
				Register
			</h2>

			<div>
				<label className="block text-sky-800 text-sm mb-1">Email</label>
				<input
					type="email"
					placeholder="you@example.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full px-4 py-2 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
					required
				/>
			</div>

			<div>
				<label className="block text-sky-800 text-sm mb-1">
					Company Name
				</label>
				<input
					type="text"
					placeholder="Company Name"
					value={companyName}
					onChange={(e) => setCompanyName(e.target.value)}
					className="w-full px-4 py-2 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
				/>
			</div>

			<div>
				<label className="block text-sky-800 text-sm mb-1">CIF</label>
				<input
					type="text"
					placeholder="CIF"
					value={cif}
					onChange={(e) => setCif(e.target.value)}
					className="w-full px-4 py-2 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
				/>
			</div>

			<div>
				<label className="block text-sky-800 text-sm mb-1">
					Password
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

			<div>
				<label className="block text-sky-800 text-sm mb-1">
					Repeat Password
				</label>
				<input
					type="password"
					placeholder="••••••••"
					value={repeatPassword}
					onChange={(e) => setRepeatPassword(e.target.value)}
					className="w-full px-4 py-2 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
					required
				/>
			</div>

			<button
				type="submit"
				className="w-full bg-sky-600 text-white py-2 rounded-xl hover:bg-sky-700 transition font-semibold"
			>
				Register
			</button>

			{error && (
				<div className="text-red-600 text-center font-medium">
					{error}
				</div>
			)}
		</form>
	);
}

export default Register;
