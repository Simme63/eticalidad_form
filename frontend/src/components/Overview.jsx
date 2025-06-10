import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";

const STATUS_OPTIONS = ["pending", "approved", "paid"];

export default function Overview() {
	const [requests, setRequests] = useState([]);
	const [user, setUser] = useState(null);
	const [, setRole] = useState("user");
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

			// Get user role
			const { data: profile } = await supabase
				.from("profiles")
				.select("role")
				.eq("id", user.id)
				.single();

			setRole(profile?.role || "user");

			// Get only requests tied to logged-in user
			const { data, error } = await supabase
				.from("requests")
				.select("*")
				.eq("user_id", user.id)
				.order("submitted_at", { ascending: false });

			if (error) console.error("Error loading requests:", error);

			setRequests(data || []);
			setLoading(false);
		};

		fetchUserAndRequests();
	}, []);

	if (loading) return <div className="text-center mt-8">Loading...</div>;
	if (!user)
		return (
			<div className="text-center mt-8">
				Please log in to view your requests.
			</div>
		);

	return (
		<div className="max-w-3xl mx-auto mt-8 p-4 bg-white rounded shadow">
			<h2 className="text-2xl font-bold mb-4 text-center">
				Requests Overview
			</h2>
			<div className="overflow-x-auto">
				<table className="min-w-full border">
					<thead>
						<tr className="bg-gray-100">
							<th className="p-2 border">Status</th>
							<th className="p-2 border">Brand</th>
							<th className="p-2 border">Invoice #</th>
							<th className="p-2 border">Part #</th>
							<th className="p-2 border">Quantity</th>
							<th className="p-2 border">Reason</th>
						</tr>
					</thead>
					<tbody>
						{requests.length === 0 ? (
							<tr>
								<td colSpan="6" className="text-center p-4">
									No requests found.
								</td>
							</tr>
						) : (
							requests.map((req) => (
								<tr key={req.id}>
									<td className="p-2 border capitalize">
										{req.status || "pending"}
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
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
