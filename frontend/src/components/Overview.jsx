import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";

export default function Overview() {
	const [requests, setRequests] = useState([]);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUserAndRequests = async () => {
			setLoading(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();
			setUser(user);

			if (!user) {
				setRequests([]);
				setLoading(false);
				return;
			}

			// Build query
			let query = supabase
				.from("requests")
				.select("*")
				.order("submitted_at", {
					ascending: false,
				});
			query = query.eq("user_id", user.id);

			const { data, error } = await query;

			if (error) console.error("Error cargando solicitudes:", error);

			setRequests(data || []);
			setLoading(false);
		};

		fetchUserAndRequests();
	}, []);

	if (loading) return <div className="text-center mt-8">Cargando...</div>;
	if (!user)
		return (
			<div className="text-center mt-8">
				Inicia sesión para ver tus solicitudes.
			</div>
		);

	return (
		<div className="max-w-3xl mx-auto mt-8 p-4 bg-white rounded shadow">
			<h2 className="text-2xl font-bold mb-4 text-center">
				Resumen de solicitudes
			</h2>
			<div className="overflow-x-auto">
				<table className="min-w-full border">
					<thead>
						<tr className="bg-gray-100">
							<th className="p-2 border">Marca</th>
							<th className="p-2 border">N° Factura</th>
							<th className="p-2 border">N° Parte</th>
							<th className="p-2 border">Cantidad</th>
							<th className="p-2 border">Motivo</th>
							<th className="p-2 border">Estado</th>
						</tr>
					</thead>
					<tbody>
						{requests.length === 0 ? (
							<tr>
								<td colSpan={6} className="text-center p-4">
									No hay solicitudes.
								</td>
							</tr>
						) : (
							requests.map((req) => (
								<tr key={req.id}>
									<td className="p-2 border">{req.brand}</td>
									<td className="p-2 border">
										{req.delivery_note_or_invoice_number}
									</td>
									<td className="p-2 border">
										{req.part_number}
									</td>
									<td className="p-2 border">
										{req.quantity}
									</td>
									<td className="p-2 border">
										{req.reason_for_return}
									</td>
									<td className="p-2 border capitalize">
										{req.status || "pendiente"}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
