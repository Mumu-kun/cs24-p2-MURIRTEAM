import { useAuthContext } from "@/hooks/useAuthContext";
import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
	const { user, logout } = useAuthContext();

	return (
		<header className={`sticky top-0 z-30 w-full bg-white shadow-md shadow-gray-200 transition-all duration-75`}>
			<div className="mx-auto flex max-w-7xl items-center justify-between gap-4 p-4 px-8">
				<Link to="/">Home</Link>
				<div className="flex gap-4">
					{!user ? <Link to="/login">Login</Link> : <button onClick={logout}>Logout</button>}
				</div>
			</div>
		</header>
	);
};

export default Header;
