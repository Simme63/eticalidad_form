import { useAtom } from "jotai";
import { useState } from "react";
import { userAtom } from "../atoms/authAtom";
import AdminPanel from "./AdminPanel";
import Login from "./Login";
import Overview from "./Overview";
import Register from "./Register";
import RequestForm from "./RequestForm";

function MainView() {
	const [user] = useAtom(userAtom);
	const [activeTab, setActiveTab] = useState("overview");

	if (!user) {
		return (
			<>
				<Register />
				<Login />
			</>
		);
	}

	return (
		<div>
			<div className="flex gap-2 mb-4">
				<button
					className={`px-4 py-2 rounded ${
						activeTab === "overview"
							? "bg-blue-600 text-white"
							: "bg-gray-200"
					}`}
					onClick={() => setActiveTab("overview")}
				>
					Overview
				</button>
				<button
					className={`px-4 py-2 rounded ${
						activeTab === "request"
							? "bg-blue-600 text-white"
							: "bg-gray-200"
					}`}
					onClick={() => setActiveTab("request")}
				>
					New Request
				</button>
				<button
					className={`px-4 py-2 rounded ${
						activeTab === "admin"
							? "bg-blue-600 text-white"
							: "bg-gray-200"
					}`}
					onClick={() => setActiveTab("admin")}
				>
					Admin Panel
				</button>
			</div>
			{activeTab === "overview" && <Overview />}
			{activeTab === "request" && <RequestForm />}
			{activeTab === "admin" && <AdminPanel />}
		</div>
	);
}

export default MainView;
