import { useEffect, useState } from "react";
import { RoleItem } from "./RoleItem";
import axiosApi from "@/utils/axios";

const RoleView = () => {
	const [roles, setRoles] = useState([]);
	const [permissions, setPermissions] = useState([]);

	const getRoles = async () => {
		try {
			const res = await axiosApi.get("/rbac/roles");
			const data = res.data;

			setRoles(data);
		} catch (error) {
			console.error(error);
		}
	};

	const getPermissions = async () => {
		try {
			const res = await axiosApi.get("/rbac/permissions");
			const data = res.data;

			let uniquePermissions = data.map((permission) => {
				return { permission_id: permission.permission_id, description: permission.description };
			});

			uniquePermissions = uniquePermissions.filter((permission, index, self) => {
				return index === self.findIndex((t) => t.permission_id === permission.permission_id);
			});

			setPermissions(uniquePermissions);

			setRoles(
				roles.map((role) => {
					return {
						...role,
						permissions: data.filter((permission) => permission.role_id === role.id),
					};
				})
			);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getRoles();
	}, []);

	useEffect(() => {
		if (roles.length > 0 && !roles[0].permissions) {
			getPermissions();
		}
	}, [roles]);

	return (
		<>
			<div className="mb-8">
				<h1 className="mb-4 text-center text-4xl">Roles</h1>
				<div className="flex flex-col gap-2">
					{!!roles && roles.map((role) => <RoleItem key={role.id} role={role} permissions={permissions} />)}
				</div>
			</div>
			<div>
				<h1 className="mb-4 text-center text-4xl">Permissions</h1>
				<div className="flex flex-col gap-2">
					{!!permissions &&
						permissions.map((permission) => (
							<div key={permission.permission_id} className="flex px-4 py-1">
								<div>{permission.permission_id}</div>
								<div>{permission.description}</div>
							</div>
						))}
				</div>
			</div>
		</>
	);
};

export default RoleView;
