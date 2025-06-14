import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import AuthProvider from "./components/AuthProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<AuthProvider>
			{/* <Auth0Provider
				domain="dev-1t0fkwdb3eeoyhn5.us.auth0.com"
				clientId="SQDfUgwM5axnhWTgWjVQRfpauwAdRIYR"
				authorizationParams={{
					redirect_uri: window.location.origin,
				}}
			> */}
			<App />
			{/* </Auth0Provider> */}
		</AuthProvider>
	</React.StrictMode>
);
