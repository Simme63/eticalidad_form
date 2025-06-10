export default function RequestRow({ request, role, onStatusChange }) {
	return (
		<tr>
			{/* Status first */}
			<td className="p-2 border capitalize">
				{request.status || "pending"}
			</td>

			{/* Show these only if admin */}
			{role === "admin" && (
				<>
					<td className="p-2 border">
						{request.profiles?.company_name || "No Company"}
					</td>
					<td className="p-2 border">{request.profiles?.email}</td>
				</>
			)}

			<td className="p-2 border">{request.brand}</td>
			<td className="p-2 border">
				{request.delivery_note_or_invoice_number}
			</td>
			<td className="p-2 border">{request.part_number}</td>
			<td className="p-2 border">{request.quantity}</td>
			<td className="p-2 border">{request.reason_for_return}</td>

			{/* Only admins get the status editing dropdown */}
			{role === "admin" && (
				<td className="p-2 border">
					<select
						value={request.status || "pending"}
						onChange={(e) =>
							onStatusChange(request.id, e.target.value)
						}
						className="border rounded px-2 py-1"
					>
						{["pending", "approved", "paid"].map((status) => (
							<option key={status} value={status}>
								{status.charAt(0).toUpperCase() +
									status.slice(1)}
							</option>
						))}
					</select>
				</td>
			)}
		</tr>
	);
}
