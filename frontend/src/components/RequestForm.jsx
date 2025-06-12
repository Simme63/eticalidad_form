import { useState } from "react";
import { supabase } from "../supabase/client";

function RequestForm() {
	const [brand, setBrand] = useState("");
	const [invoiceNumber, setInvoiceNumber] = useState("");
	const [partNumber, setPartNumber] = useState("");
	const [reason, setReason] = useState("");
	const [quantity, setQuantity] = useState("");
	const [observations, setObservations] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Get current logged-in user
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		console.log(user);

		if (userError) {
			console.error("Error fetching user:", userError);
			alert("Error obteniendo informacion del usuario");
			return;
		}
		if (!user) {
			alert("¡Debes iniciar sesión!");
			return;
		}

		const { error: profileError } = await supabase.from("profiles").upsert([
			{
				id: user.id,
				email: user.email,
			},
		]);

		if (profileError) {
			console.error("Error al insertar perfil:", profileError);
		}

		// Insert new request
		const { error } = await supabase.from("requests").insert([
			{
				user_id: user.id,
				brand: brand,
				delivery_note_or_invoice_number: invoiceNumber,
				part_number: partNumber,
				quantity: parseInt(quantity, 10),
				reason_for_return: reason,
				observations: observations || null,
			},
		]);

		if (error) {
			console.error("Insert error:", error);
			alert("Error al enviar la solicitud");
		} else {
			alert("¡Solicitud enviada!");
			// Optionally clear form fields here
			setBrand("");
			setInvoiceNumber("");
			setPartNumber("");
			setReason("");
			setQuantity("");
			setObservations("");
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-4 max-w-md mx-auto p-4 bg-white rounded shadow"
		>
			<select
				value={brand}
				onChange={(e) => setBrand(e.target.value)}
				required
				className="p-2 border rounded"
			>
				<option value="">Seleccionar Marca</option>
				<option value="Renault">Renault</option>
				<option value="Dacia">Dacia</option>
				<option value="Nissan">Nissan</option>
				<option value="Kia">Kia</option>
				<option value="Peugeot">Peugeot</option>
				<option value="Citroën">Citroën</option>
				<option value="Leadmotor">Leadmotor</option>
				<option value="DS">DS</option>
				<option value="Opel">Opel</option>
				<option value="Fiat">Fiat</option>
				<option value="Abarth">Abarth</option>
				<option value="Jeep">Jeep</option>
				<option value="Alfa Romeo">Alfa Romeo</option>
				<option value="MG">MG</option>
				<option value="Omoda">Omoda</option>
				<option value="Jaecoo">Jaecoo</option>
			</select>
			<input
				type="text"
				placeholder="Número de factura"
				value={invoiceNumber}
				onChange={(e) => setInvoiceNumber(e.target.value)}
				required
				className="p-2 border rounded"
			/>
			<input
				type="text"
				placeholder="Número de parte"
				value={partNumber}
				onChange={(e) => setPartNumber(e.target.value)}
				required
				className="p-2 border rounded"
			/>
			<select
				value={reason}
				onChange={(e) => setReason(e.target.value)}
				required
				className="p-2 border rounded"
			>
				<option value="">Seleccionar Motivo</option>
				<option value="Defectuoso">Defectuoso</option>
				<option value="Modelo incorrecto">Modelo incorrecto</option>
				<option value="Compra en exceso">Compra en exceso</option>
				<option value="Innecesario">Innecesario</option>
				<option value="Dañado durante el envíot">
					Dañado durante el envío
				</option>
				<option value="Otro">Otro</option>
			</select>
			<input
				type="number"
				placeholder="Cantidad"
				value={quantity}
				onChange={(e) => setQuantity(e.target.value)}
				min={1}
				required
				className="p-2 border rounded"
			/>
			<input
				type="text"
				placeholder="Observaciones"
				value={observations}
				onChange={(e) => setObservations(e.target.value)}
				className="p-2 border rounded"
			/>
			<button
				type="submit"
				className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
			>
				Enviar solicitud
			</button>
		</form>
	);
}

export default RequestForm;
