import React from "react";
import Header from "./Header";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";

const Layout = () => {
	const { pathname } = useLocation();
	const { user } = useAuthContext();

	if (!["/", "/login"].includes(pathname)) {
		if (!user) {
			return <Navigate to="/login" />;
		}
	}

	if (["/role", "/user"].includes(pathname)) {
		if (user.role_id !== 2) {
			return <Navigate to="/" />;
		}
	}

	return (
		<div className="relative flex min-h-screen flex-col items-center bg-gray-50">
			<Header />
			<div className="flex max-w-[1400px] flex-1 flex-col items-center p-8">
				<Outlet />
			</div>
		</div>
	);
};

export default Layout;
