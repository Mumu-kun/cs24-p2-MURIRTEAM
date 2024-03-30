import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Layout from "./my-components/Layout";
import LazyLoadRoutes from "./my-components/LazyLoadRoutes";
import { AuthProvider } from "./context/AuthContext";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{
				path: "/",
				element: LazyLoadRoutes("@/home/Home"),
			},
			{
				path: "/login",
				element: LazyLoadRoutes("@/authView/Login"),
			},
			{
				path: "/role",
				element: LazyLoadRoutes("@/roleView/RoleView"),
			},
			{
				path: "/user",
				element: LazyLoadRoutes("@/userManagementView/UserManagementView"),
			},
			{
				path: "/vehicle",
				element: LazyLoadRoutes("@/dataEntryView/AddManageVehicle"),
			},
			{
				path: "/sts",
				element: LazyLoadRoutes("@/dataEntryView/AddManageSTS"),
			},
		],
	},
]);

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<AuthProvider>
			<RouterProvider router={router} />
		</AuthProvider>
	</React.StrictMode>
);
