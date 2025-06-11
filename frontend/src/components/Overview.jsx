import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";

const STATUS_ORDER = ["approved", "pending", "paid"];
const STATUS_TRANSLATIONS = {
	pending: "Pendiente",
	approved: "Aprobado",
	paid: "Pagado",
};

// Softer border colors using lighter shades and opacity (Tailwind uses alpha in hex)
const STATUS_BORDER_CLASSES = {
	pending: "border-yellow-300",
	approved: "border-red-300",
	paid: "border-green-300",
};

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

			let query = supabase
				.from("requests")
				.select("*")
				.order("submitted_at", { ascending: false })
				.eq("user_id", user.id);

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

	const groupedRequests = STATUS_ORDER.reduce((acc, status) => {
		acc[status] = requests.filter(
			(r) => (r.status?.toLowerCase() || "pending") === status
		);
		return acc;
	}, {});

	// Stub download handler, replace with your actual logic
	const handleDownload = (request) => {
		alert(`Descargando documento para solicitud ID ${request.id}`);
		// TODO: add actual download logic here
	};

	return (
		<div className="max-w-3xl mx-auto mt-8 p-4 bg-white rounded shadow space-y-10">
			<h2 className="text-2xl font-bold mb-4 text-center">
				Resumen de solicitudes
			</h2>

			{STATUS_ORDER.map((status) => {
				const group = groupedRequests[status];
				return (
					<div
						key={status}
						className={`border-2 rounded-lg p-4 ${STATUS_BORDER_CLASSES[status]}`}
					>
						<h3 className="text-xl font-semibold mb-3">
							{STATUS_TRANSLATIONS[status]} ({group.length})
						</h3>
						{group.length === 0 ? (
							<p className="text-center italic text-gray-500 mb-6">
								No hay solicitudes{" "}
								{STATUS_TRANSLATIONS[status].toLowerCase()}.
							</p>
						) : (
							<div className="overflow-x-auto">
								<table className="min-w-full border mb-6">
									<thead>
										<tr className="bg-gray-100">
											<th className="p-2 border">
												Marca
											</th>
											<th className="p-2 border">
												N° Factura
											</th>
											<th className="p-2 border">
												N° Parte
											</th>
											<th className="p-2 border">
												Cantidad
											</th>
											<th className="p-2 border">
												Motivo
											</th>
											<th className="p-2 border">
												Estado
											</th>
											{status === "approved" && (
												<th className="p-2 border">
													Acción
												</th>
											)}
										</tr>
									</thead>
									<tbody>
										{group.map((req) => (
											<tr key={req.id}>
												<td className="p-2 border">
													{req.brand}
												</td>
												<td className="p-2 border">
													{
														req.delivery_note_or_invoice_number
													}
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
													{STATUS_TRANSLATIONS[
														req.status?.toLowerCase()
													] || "Pendiente"}
												</td>
												{status === "approved" && (
													<td className="p-2 border text-center">
														<button
															onClick={() =>
																handleDownload(
																	req
																)
															}
															className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded transition"
														>
															Descargar
														</button>
													</td>
												)}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
