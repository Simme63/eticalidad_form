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
			alert("Error getting user info");
			return;
		}
		if (!user) {
			alert("You must be logged in");
			return;
		}

		const { error: profileError } = await supabase.from("profiles").upsert([
			{
				id: user.id,
				email: user.email,
			},
		]);

		if (profileError) {
			console.error("Failed to insert profile:", profileError);
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
			alert("Failed to submit request");
		} else {
			alert("Request submitted!");
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
				<option value="">Select Brand</option>
				<option value="Mazda">Mazda</option>
				<option value="Hyundai">Hyundai</option>
				<option value="Audi">Audi</option>
				<option value="Volvo">Volvo</option>
				<option value="Toyota">Toyota</option>
				<option value="Ford">Ford</option>
				<option value="BMW">BMW</option>
				<option value="Mercedes">Mercedes</option>
				<option value="Volkswagen">Volkswagen</option>
				<option value="Honda">Honda</option>
			</select>
			<input
				type="text"
				placeholder="Invoice Number"
				value={invoiceNumber}
				onChange={(e) => setInvoiceNumber(e.target.value)}
				required
				className="p-2 border rounded"
			/>
			<input
				type="text"
				placeholder="Part Number"
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
				<option value="">Select Reason</option>
				<option value="Defective">Defective</option>
				<option value="Wrong Model">Wrong Model</option>
				<option value="Bought Excess">Bought Excess</option>
				<option value="Not Needed">Not Needed</option>
				<option value="Damaged in Transit">Damaged in Transit</option>
				<option value="Other">Other</option>
			</select>
			<input
				type="number"
				placeholder="Quantity"
				value={quantity}
				onChange={(e) => setQuantity(e.target.value)}
				min={1}
				required
				className="p-2 border rounded"
			/>
			<input
				type="text"
				placeholder="Observations"
				value={observations}
				onChange={(e) => setObservations(e.target.value)}
				className="p-2 border rounded"
			/>
			<button
				type="submit"
				className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
			>
				Submit Request
			</button>
		</form>
	);
}

export default RequestForm;
