import { useState } from "react";
import { supabase } from "../supabase/client";

function Register() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [repeatPassword, setRepeatPassword] = useState(""); // New state

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
		});

		if (error) {
			console.error(error);
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
