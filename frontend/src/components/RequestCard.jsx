function RequestCard({ request }) {
	const { part_number, reason, comment, quantity, created_at, profiles } =
		request;

	const company = profiles?.company_name || "Unknown Company";
	const email = profiles?.email || "Unknown Email";
	const createdAt = created_at
		? new Date(created_at).toLocaleString()
		: "Unknown Date";

	return (
		<div className="border border-sky-200 rounded-xl p-4 space-y-2">
			<h4 className="font-semibold text-sky-800">
				{company} — {email}
			</h4>
			<p>
				<span className="font-medium">Part Number:</span> {part_number}
			</p>
			<p>
				<span className="font-medium">Quantity:</span> {quantity}
			</p>
			<p>
				<span className="font-medium">Reason:</span> {reason}
			</p>
			<p>
				<span className="font-medium">Comment:</span>{" "}
				{comment || "No comment provided."}
			</p>
			<p className="text-xs text-gray-500">Submitted: {createdAt}</p>
		</div>
	);
}

export default RequestCard;
