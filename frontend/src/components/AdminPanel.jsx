import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";

const STATUS_OPTIONS = ["pending", "approved", "paid"];

const STATUS_COLORS = {
	pending: "rgba(250, 204, 21, 0.3)", // softer yellow
	approved: "rgba(239, 68, 68, 0.3)", // softer red
	paid: "rgba(34, 197, 94, 0.3)", // softer green
};

export default function AdminPanel() {
	// Requests state
	const [requests, setRequests] = useState([]);
	const [loadingRequests, setLoadingRequests] = useState(true);
	const [filters, setFilters] = useState({
		company: "",
		email: "",
		brand: "",
		partNumber: "",
		date: "",
	});

	// Pending users state
	const [pendingUsers, setPendingUsers] = useState([]);
	const [loadingUsers, setLoadingUsers] = useState(true);

	// Fetch requests
	useEffect(() => {
		async function fetchRequests() {
			setLoadingRequests(true);
			const { data, error } = await supabase
				.from("requests")
				.select("*, profiles:user_id ( email, company_name )")
				.order("submitted_at", { ascending: false });
			if (error) console.error("Error fetching requests:", error);
			else setRequests(data || []);
			setLoadingRequests(false);
		}
		fetchRequests();
	}, []);

	// Fetch pending users
	useEffect(() => {
		async function fetchPendingUsers() {
			setLoadingUsers(true);
			const { data, error } = await supabase
				.from("profiles")
				.select("id, company_name, email, status")
				.eq("status", "pending")
				.order("company_name", { ascending: true });
			if (error) console.error("Error fetching pending users:", error);
			else setPendingUsers(data || []);
			setLoadingUsers(false);
		}
		fetchPendingUsers();
	}, []);

	// Approve user
	const approveUser = async (userId) => {
		const { error } = await supabase
			.from("profiles")
			.update({ status: "approved" })
			.eq("id", userId);
		if (error) {
			console.error("Error approving user:", error);
			alert("Error al aprobar el usuario");
		} else {
			setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
			alert("Usuario aprobado");
		}
	};

	const denyUser = async (userId) => {
		// Delete from profiles
		const { error: profileError } = await supabase
			.from("profiles")
			.delete()
			.eq("id", userId);

		if (profileError) {
			console.error("Error deleting from profiles:", profileError);
			alert("Error eliminando perfil");
			return;
		}

		// Delete from auth.users (needs service role key)
		const { error: authError } = await supabase.auth.admin.deleteUser(
			userId
		);

		if (authError) {
			console.error("Error deleting from auth.users:", authError);
			alert("Error eliminando usuario");
			return;
		}

		// Remove user from local state
		setPendingUsers((prev) => prev.filter((u) => u.id !== userId));

		alert("Usuario denegado y eliminado");
	};

	// Update request status
	const handleStatusChange = async (id, newStatus) => {
		const { error } = await supabase
			.from("requests")
			.update({ status: newStatus })
			.eq("id", id);
		if (error) console.error("Error updating status:", error);
		else
			setRequests((prev) =>
				prev.map((req) =>
					req.id === id ? { ...req, status: newStatus } : req
				)
			);
	};

	// Download document placeholder
	const downloadDocument = (id) => {
		alert(`Descargando documento para solicitud ${id}`);
	};

	// Filter requests by status and filters
	const filteredRequests = (status) => {
		return requests
			.filter((r) => (r.status || "pending") === status)
			.filter((r) =>
				r.profiles?.company_name
					?.toLowerCase()
					.includes(filters.company.toLowerCase())
			)
			.filter((r) =>
				r.profiles?.email
					?.toLowerCase()
					.includes(filters.email.toLowerCase())
			)
			.filter((r) =>
				r.brand?.toLowerCase().includes(filters.brand.toLowerCase())
			)
			.filter((r) =>
				r.part_number
					?.toLowerCase()
					.includes(filters.partNumber.toLowerCase())
			)
			.filter((r) =>
				filters.date
					? r.submitted_at?.slice(0, 10) === filters.date
					: true
			)
			.sort((a, b) =>
				(a.profiles?.company_name || "").localeCompare(
					b.profiles?.company_name || ""
				)
			);
	};

	if (loadingRequests || loadingUsers)
		return <div className="text-center mt-8">Cargando...</div>;

	return (
		<div className="max-w-7xl mx-auto mt-8 p-4 bg-white rounded shadow space-y-10">
			{/* Pending Users Approval Section */}
			{pendingUsers.length > 0 && (
				<div className="mb-12 border border-yellow-400 rounded p-4">
					<h2 className="text-2xl font-bold mb-4 text-yellow-700">
						Usuarios Pendientes de Aprobación
					</h2>
					{pendingUsers.map((user) => (
						<div
							key={user.id}
							className="flex flex-col md:flex-row md:items-center justify-between border border-yellow-300 rounded p-3 mb-3"
						>
							<div className="mb-2 md:mb-0">
								<div>
									<strong>Empresa:</strong>{" "}
									{user.company_name || "(no especificado)"}
								</div>
								<div>
									<strong>Email:</strong> {user.email}
								</div>
							</div>
							<div className="flex space-x-3">
								<button
									onClick={() => approveUser(user.id)}
									className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
								>
									Aprobar
								</button>
								<button
									onClick={() => denyUser(user.id)}
									className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
								>
									Denegar
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Filters */}
			<div>
				<h2 className="text-2xl font-bold mb-6">Filtros</h2>
				<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
					<input
						type="text"
						placeholder="Empresa"
						value={filters.company}
						onChange={(e) =>
							setFilters({ ...filters, company: e.target.value })
						}
						className="border rounded px-2 py-1"
					/>
					<input
						type="text"
						placeholder="Email"
						value={filters.email}
						onChange={(e) =>
							setFilters({ ...filters, email: e.target.value })
						}
						className="border rounded px-2 py-1"
					/>
					<input
						type="text"
						placeholder="Marca"
						value={filters.brand}
						onChange={(e) =>
							setFilters({ ...filters, brand: e.target.value })
						}
						className="border rounded px-2 py-1"
					/>
					<input
						type="text"
						placeholder="N° Parte"
						value={filters.partNumber}
						onChange={(e) =>
							setFilters({
								...filters,
								partNumber: e.target.value,
							})
						}
						className="border rounded px-2 py-1"
					/>
					<input
						type="date"
						value={filters.date}
						onChange={(e) =>
							setFilters({ ...filters, date: e.target.value })
						}
						className="border rounded px-2 py-1"
					/>
				</div>
			</div>

			{/* Requests sections by status */}
			{STATUS_OPTIONS.map((status) => (
				<div
					key={status}
					className="rounded border"
					style={{
						borderColor: STATUS_COLORS[status],
						backgroundColor: STATUS_COLORS[status],
					}}
				>
					<h2 className="text-2xl font-bold mb-4 capitalize text-gray-800">
						{status === "pending"
							? "Pendiente"
							: status === "approved"
							? "Aprobado"
							: "Pagado"}
					</h2>
					<div className="overflow-x-auto">
						<table className="min-w-full border table-fixed">
							<thead>
								<tr className="bg-gray-100">
									<th className="p-2 border w-32">Estado</th>
									<th className="p-2 border">Empresa</th>
									<th className="p-2 border">Email</th>
									<th className="p-2 border">Marca</th>
									<th className="p-2 border">N° Factura</th>
									<th className="p-2 border">N° Parte</th>
									<th className="p-2 border">Cantidad</th>
									<th className="p-2 border">Fecha</th>
									<th className="p-2 border w-32">
										Documento
									</th>
								</tr>
							</thead>
							<tbody>
								{filteredRequests(status).length === 0 ? (
									<tr>
										<td
											colSpan={9}
											className="text-center p-3 border italic text-gray-500"
										>
											No hay solicitudes {status}
										</td>
									</tr>
								) : (
									filteredRequests(status).map((request) => (
										<tr key={request.id}>
											<td className="p-2 border">
												<select
													value={request.status}
													onChange={(e) =>
														handleStatusChange(
															request.id,
															e.target.value
														)
													}
													className="w-full border rounded px-1"
												>
													{STATUS_OPTIONS.map(
														(opt) => (
															<option
																key={opt}
																value={opt}
															>
																{opt
																	.charAt(0)
																	.toUpperCase() +
																	opt.slice(
																		1
																	)}
															</option>
														)
													)}
												</select>
											</td>
											<td className="p-2 border">
												{request.profiles
													?.company_name ||
													"(no especificado)"}
											</td>
											<td className="p-2 border">
												{request.profiles?.email || "-"}
											</td>
											<td className="p-2 border">
												{request.brand || "-"}
											</td>
											<td className="p-2 border">
												{request.invoice_number || "-"}
											</td>
											<td className="p-2 border">
												{request.part_number || "-"}
											</td>
											<td className="p-2 border">
												{request.quantity || "-"}
											</td>
											<td className="p-2 border">
												{request.submitted_at?.slice(
													0,
													10
												) || "-"}
											</td>
											<td className="p-2 border text-center">
												{request.status ===
												"approved" ? (
													<button
														onClick={() =>
															downloadDocument(
																request.id
															)
														}
														className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
													>
														Descargar
													</button>
												) : (
													"-"
												)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			))}
		</div>
	);
}
