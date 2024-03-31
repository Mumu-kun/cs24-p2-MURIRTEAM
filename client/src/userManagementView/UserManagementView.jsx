import { useAuthContext } from "@/hooks/useAuthContext";
import Confirmation from "@/my-components/Confirmation";
import axiosApi from "@/utils/axios";
import React, { useEffect, useState } from "react";

const UserManagementView = () => {
	const [users, setUsers] = useState([]);
	const [roles, setRoles] = useState([]);
	const [deletionPrompt, setDeletionPrompt] = useState(null);

	const { user: currentUser } = useAuthContext();

	const handleSubmit = async (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const data = Object.fromEntries(formData);

		try {
			const res = await axiosApi.post("/users", data);
			getUsers();
		} catch (error) {
			console.error(error);
		}
	};

	const changeRole = async (user_id, role_id) => {
		try {
			const res = await axiosApi.post(`/users/${user_id}/roles`, { user_id, role_id });

			getUsers();
		} catch (error) {
			console.error(error);
		}
	};

	const getUsers = async () => {
		try {
			const res = await axiosApi.get("/users");

			setUsers(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	const getRoles = async () => {
		try {
			const res = await axiosApi.get("/rbac/roles");
			const data = res.data;

			setRoles(data);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getUsers();
		getRoles();
		document.title = "User Management";
	}, []);

	return (
		<>
			<div className="mb-8">
				<h1 className="mb-4 text-center text-4xl">Create User</h1>
				<form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 text-sm">
					<input type="username" name="username" placeholder="Username" className="input" />
					<input type="email" name="email" placeholder="Email" className="input" />
					<input type="password" name="password" placeholder="Password" className="input" />
					<button type="submit" className="btn--prim">
						Login
					</button>
				</form>
			</div>
			<div className="mb-8">
				<h1 className="mb-4 text-center text-4xl">Users</h1>
				<div className="flex flex-col gap-2">
					{!!users &&
						users.map((user) => (
							<div key={user.id} className="flex items-center gap-4 bg-white px-4 py-2 shadow">
								<div className="w-14">{user.username}</div>
								<div className="w-40">{user.email}</div>
								<select
									className="px-2 py-1 capitalize shadow"
									value={user.role_id}
									onChange={(e) => {
										changeRole(user.id, e.target.value);
									}}
									disabled={user.id === currentUser.id}
								>
									{!!roles &&
										roles.map((role) => (
											<option key={role.id} value={role.id}>
												{role.name.replace("_", " ")}
											</option>
										))}
								</select>
								<button
									className="btn min-w-0 bg-red-500 px-2"
									onClick={() => {
										setDeletionPrompt(
											<Confirmation
												message={`Are you sure you want to delete ${user.username}?`}
												confirm={async () => {
													try {
														const res = await axiosApi.delete(`/users/${user.id}`);
														setDeletionPrompt(null);
														getUsers();
													} catch (error) {
														console.error(error);
													}
												}}
												cancel={() => {
													setDeletionPrompt(null);
												}}
											/>
										);
									}}
									disabled={user.id === currentUser.id}
								>
									X
								</button>
							</div>
						))}
				</div>
				{deletionPrompt}
			</div>
		</>
	);
};

export default UserManagementView;
