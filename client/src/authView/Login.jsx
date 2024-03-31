import { useAuthContext } from "@/hooks/useAuthContext";
import axiosApi from "@/utils/axios";
import React, { useState } from "react";
import { Navigate } from "react-router-dom";

const Login = () => {
	const [message, setMessage] = useState("");

	const { user, login } = useAuthContext();

	const handleSubmit = async (e) => {
		e.preventDefault();

		const data = new FormData(e.currentTarget);
		const email = data.get("email");
		const password = data.get("password");

		try {
			const res = await axiosApi.post("/auth/login", { email, password });
			const data = res.data;

			console.log(data);

			if (data.length === 0) {
				throw new Error("Invalid credentials");
			}

			login(data);
		} catch (error) {
			setMessage(error.message);
		}
	};

	return (
		<div className="flex flex-1 flex-col items-center justify-center">
			{!!user && <Navigate to="/" />}

			<div className="mb-10 text-5xl font-medium">Login</div>

			<form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 text-sm">
				{message && <p>{message}</p>}
				<input type="email" name="email" placeholder="Email" className="input" />
				<input type="password" name="password" placeholder="Password" className="input" />
				<button type="submit" className="btn--prim">
					Login
				</button>
			</form>
		</div>
	);
};

export default Login;
