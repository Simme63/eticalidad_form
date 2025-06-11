import { useState } from "react";
import { supabase } from "../supabase/client";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [cif, setCif] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden.");
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
      setError("Registro fallido, por favor, inténtalo de nuevo.");
    } else {
      alert("Registro exitoso — Revisa tu correo para verificar tu cuenta!");
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="w-full bg-white rounded-2xl shadow-xl p-6 space-y-5 border border-sky-200">
      <h2 className="text-2xl font-bold text-center text-sky-700 mb-3">Registrarse</h2>

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
        <label className="block text-sky-800 text-sm mb-1">Nombre de Compañía</label>
        <input
          type="text"
          placeholder="Nombre de tu Compañía"
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
        <label className="block text-sky-800 text-sm mb-1">Dirección</label>
        <input
          type="text"
          placeholder="Calle y número"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-4 py-2 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
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

      <div>
        <label className="block text-sky-800 text-sm mb-1">Confirmar Cotraseña</label>
        <input
          type="password"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          className="w-full px-4 py-2 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-sky-600 text-white py-2 rounded-xl hover:bg-sky-700 transition font-semibold">
        Registrarse
      </button>

      {error && <div className="text-red-600 text-center font-medium">{error}</div>}
    </form>
  );
}

export default Register;
