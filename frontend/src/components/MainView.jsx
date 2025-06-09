import { useAtom } from "jotai";
import { userAtom } from "../atoms/authAtom";
import AdminPanel from "./AdminPanel";
import Login from "./Login";
import Register from "./Register";
import RequestForm from "./RequestForm";

function MainView() {
	const [user] = useAtom(userAtom);
	console.log(user);

	return user ? (
		<>
			<RequestForm />
			<AdminPanel />
		</>
	) : (
		<>
			<Register />
			<Login />
			<AdminPanel />
		</>
	);
}

export default MainView;
