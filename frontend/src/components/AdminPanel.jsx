import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";

const STATUS_OPTIONS = ["pending", "approved", "paid"];

export default function AdminPanel() {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState({
		company: "",
		email: "",
		brand: "",
		partNumber: "",
		date: "",
	});

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);

			const { data, error } = await supabase
				.from("requests")
				.select("*, profiles:user_id ( email, company_name )")
				.order("submitted_at", { ascending: false });

			if (error) console.error("Error fetching requests:", error);
			else setRequests(data || []);

			setLoading(false);
		};

		fetchData();
	}, []);

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

	const downloadDocument = (id) => {
		// replace with real download link logic if stored in Supabase Storage or URL field
		alert(`Descargando documento para solicitud ${id}`);
	};

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

	if (loading) return <div className="text-center mt-8">Cargando...</div>;

	return (
		<div className="max-w-7xl mx-auto mt-8 p-4 bg-white rounded shadow space-y-10">
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

			{STATUS_OPTIONS.map((status) => (
				<div key={status}>
					<h2 className="text-2xl font-bold mb-4">
						{status.charAt(0).toUpperCase() + status.slice(1)}
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
									<th className="p-2 border">Motivo</th>
									<th className="p-2 border">Fecha</th>
									{status === "approved" && (
										<th className="p-2 border">
											Documento
										</th>
									)}
								</tr>
							</thead>
							<tbody>
								{filteredRequests(status).length === 0 ? (
									<tr>
										<td
											colSpan="{status === 'approved' ? 10 : 9}"
											className="text-center p-4"
										>
											No se encontraron solicitudes.
										</td>
									</tr>
								) : (
									filteredRequests(status).map((req) => (
										<tr key={req.id}>
											<td className="p-2 border">
												<select
													value={
														req.status || "pending"
													}
													onChange={(e) =>
														handleStatusChange(
															req.id,
															e.target.value
														)
													}
													className="border rounded px-2 py-1"
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
												{req.profiles?.company_name ||
													"N/A"}
											</td>
											<td className="p-2 border">
												{req.profiles?.email || "N/A"}
											</td>
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
											<td className="p-2 border">
												{req.submitted_at?.slice(0, 10)}
											</td>
											{status === "approved" && (
												<td className="p-2 border">
													<button
														onClick={() =>
															downloadDocument(
																req.id
															)
														}
														className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
													>
														Descargar
													</button>
												</td>
											)}
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
