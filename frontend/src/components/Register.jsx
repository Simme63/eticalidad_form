import { useState } from "react";
import { supabase } from "../supabase/client";

function Register() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [repeatPassword, setRepeatPassword] = useState(""); // New state
	const [companyName, setCompanyName] = useState("");
	const [cif, setCif] = useState("");

	const handleRegister = async (e) => {
		e.preventDefault();
		if (password !== repeatPassword) {
			alert("Passwords do not match");
			setPassword("");
			setRepeatPassword("");
			return;
		}
		const { error } = await supabase.auth.signUp({
			email,
			password,
			companyName,
			cif,
		});

		if (error) {
			console.error(error);
			setPassword("");
			setRepeatPassword("");
			alert("Registration failed");
		} else {
			alert(
				"Registration successful — check your inbox to confirm your email!"
			);
		}
	};

	return (
		<form onSubmit={handleRegister}>
			<input
				type="email"
				placeholder="Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<input
				type="text"
				placeholder="Company Name"
				value={companyName}
				onChange={(e) => setCompanyName(e.target.value)}
				className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
			/>
			<input
				type="text"
				placeholder="CIF"
				value={cif}
				onChange={(e) => setCif(e.target.value)}
				className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
			/>
			<input
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<input
				type="password"
				placeholder="Repeat Password"
				value={repeatPassword}
				onChange={(e) => setRepeatPassword(e.target.value)}
			/>
			<button type="submit">Register</button>
		</form>
	);
}

export default Register;
