import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";

const STATUS_OPTIONS = [
	{ value: "pending", label: "Pendiente" },
	{ value: "approved", label: "Aprobado" },
	{ value: "paid", label: "Pagado" },
];

export default function AdminPanel() {
	const [pendingUsers, setPendingUsers] = useState([]);
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);

			const { data: pendingData, error: pendingError } = await supabase
				.from("profiles")
				.select("*")
				.eq("status", "pending");

			if (pendingError)
				console.error("Error obteniendo usuarios:", pendingError);
			else setPendingUsers(pendingData || []);

			const { data: requestData, error: requestError } = await supabase
				.from("requests")
				.select("*, profiles:user_id ( email, company_name )")
				.order("submitted_at", { ascending: false });

			if (requestError)
				console.error("Error obteniendo solicitudes:", requestError);
			else setRequests(requestData || []);

			setLoading(false);
		};

		fetchData();
	}, []);

	const approveUser = async (userId) => {
		const { error } = await supabase
			.from("profiles")
			.update({ status: "approved" })
			.eq("id", userId);
		if (error) console.error("Error aprobando usuario:", error);
		else setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
	};

	const rejectUser = async (userId) => {
		const { error } = await supabase
			.from("profiles")
			.delete()
			.eq("id", userId);
		if (error) console.error("Error rechazando usuario:", error);
		else setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
	};

	const handleStatusChange = async (id, newStatus) => {
		const { error } = await supabase
			.from("requests")
			.update({ status: newStatus })
			.eq("id", id);
		if (error) {
			console.error("Error actualizando estado de solicitud:", error);
			return;
		}
		setRequests((prev) =>
			prev.map((req) =>
				req.id === id ? { ...req, status: newStatus } : req
			)
		);
	};

	const renderRequestsByStatus = (statusValue, statusLabel) => {
		const filteredRequests = requests
			.filter((req) => (req.status || "pending") === statusValue)
			.sort((a, b) => {
				const companyA =
					a.profiles?.company_name?.toLowerCase() ||
					a.profiles?.email?.toLowerCase() ||
					"";
				const companyB =
					b.profiles?.company_name?.toLowerCase() ||
					b.profiles?.email?.toLowerCase() ||
					"";
				return companyA.localeCompare(companyB);
			});

		if (filteredRequests.length === 0) return null;

		return (
			<div key={statusValue} className="mb-8">
				<h3 className="text-xl font-semibold mb-2">{statusLabel}</h3>
				<div className="overflow-x-auto">
					<table className="min-w-full border table-fixed">
						<thead>
							<tr className="bg-gray-100">
								<th className="p-2 border w-20">Estado</th>
								<th className="p-2 border">Empresa</th>
								<th className="p-2 border">Email</th>
								<th className="p-2 border">Marca</th>
								<th className="p-2 border">N° Factura</th>
								<th className="p-2 border">N° Parte</th>
								<th className="p-2 border">Cantidad</th>
								<th className="p-2 border">Motivo</th>
								{statusValue === "approved" && (
									<th className="p-2 border">Documento</th>
								)}
							</tr>
						</thead>
						<tbody>
							{filteredRequests.map((req) => (
								<tr key={req.id}>
									<td className="p-2 border w-40">
										<select
											value={req.status || "pending"}
											onChange={(e) =>
												handleStatusChange(
													req.id,
													e.target.value
												)
											}
											className="border rounded px-2 py-1 w-full"
											style={{ minWidth: "110px" }}
										>
											{STATUS_OPTIONS.map((option) => (
												<option
													key={option.value}
													value={option.value}
												>
													{option.label}
												</option>
											))}
										</select>
									</td>
									<td className="p-2 border">
										{req.profiles?.company_name || "N/A"}
									</td>
									<td className="p-2 border">
										{req.profiles?.email || "N/A"}
									</td>
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
									{statusValue === "approved" && (
										<td className="p-2 border">
											<a
												href={`/documents/${
													req.document_path ||
													"placeholder.pdf"
												}`}
												download
												className="text-blue-500 underline"
											>
												Descargar
											</a>
										</td>
									)}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		);
	};

	if (loading) return <div className="text-center mt-8">Cargando...</div>;

	return (
		<div className="max-w-5xl mx-auto mt-8 p-4 bg-white rounded shadow space-y-8">
			<div>
				<h2 className="text-2xl font-bold mb-4">
					Aprobaciones de Usuario Pendientes
				</h2>
				{pendingUsers.length === 0 ? (
					<p>No hay usuarios pendientes.</p>
				) : (
					pendingUsers.map((user) => (
						<div
							key={user.id}
							className="border border-sky-200 rounded-xl p-4 flex items-center justify-between mb-3"
						>
							<div>
								<p className="font-medium">
									{user.company_name || "Sin Empresa"}
								</p>
								<p className="text-gray-600 text-sm">
									{user.email}
								</p>
							</div>
							<div className="space-x-2">
								<button
									onClick={() => approveUser(user.id)}
									className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
								>
									Aprobar
								</button>
								<button
									onClick={() => rejectUser(user.id)}
									className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
								>
									Rechazar
								</button>
							</div>
						</div>
					))
				)}
			</div>

			<div>
				<h2 className="text-2xl font-bold mb-4">
					Solicitudes Enviadas
				</h2>
				{STATUS_OPTIONS.map((option) =>
					renderRequestsByStatus(option.value, option.label)
				)}
			</div>
		</div>
	);
}
