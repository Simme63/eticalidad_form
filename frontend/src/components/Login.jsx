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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      const { error: insertError } = await supabase.from("profiles").insert([
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
      setError("Tu cuenta espera aprobación.");
      return;
    }

    if (profile && profile.status !== "approved") {
      await supabase.auth.signOut();
      setError("Tu cuenta espera aprobación.");
      return;
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full bg-white rounded-2xl shadow-xl p-6 space-y-5 border border-sky-200">
      <h2 className="text-2xl font-bold text-center text-sky-700">Iniciar sesión</h2>

      <div>
        <label className="block text-sky-800 text-sm mb-1">Correo electrónico</label>
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
        <label className="block text-sky-800 text-sm mb-1">Contraseña</label>
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
        className="w-full bg-sky-600 text-white py-2 rounded-xl hover:bg-sky-700 transition font-semibold">
        Iniciar sesión
      </button>

      {error && <div className="text-red-600 text-center font-medium">{error}</div>}
    </form>
  );
};

export default Login;
