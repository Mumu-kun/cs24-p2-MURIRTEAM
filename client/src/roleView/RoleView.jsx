import { Fragment, useEffect, useRef, useState } from "react";
import { RoleItem } from "./RoleItem";
import axiosApi from "@/utils/axios";

const RoleView = () => {
	const [roles, setRoles] = useState([]);
	const [permissions, setPermissions] = useState([]);

	const permissionForm = useRef(null);

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

			setPermissions(data);
		} catch (error) {
			console.error(error);
		}
	};

	const addPermission = async (e) => {
		e.preventDefault();
		const permission = e.target.description.value;

		if (!permission) return console.error("Permission cannot be empty");

		try {
			await axiosApi.post("/rbac/permissions", { description: permission });

			getPermissions();
			permissionForm?.current?.reset();
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getRoles();
		document.title = "Role View";
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
					{!!roles &&
						roles.map((role) => <RoleItem key={role.id} role={role} permissions={permissions} getRoles={getRoles} />)}
				</div>
			</div>
			<div>
				<h1 className="mb-4 text-center text-4xl">Permissions</h1>
				<div className="flex flex-col gap-2 rounded bg-white shadow">
					<div className="grid h-[19rem] grid-cols-[repeat(2,max-content)] gap-2 overflow-auto px-4 py-3">
						{!!permissions &&
							permissions.map((permission) => (
								<Fragment key={`${permission.permission_id}`}>
									<div>{permission.permission_id}</div>
									<div>{permission.description}</div>
								</Fragment>
							))}
					</div>
					<form ref={permissionForm} onSubmit={addPermission}>
						<input type="text" placeholder="Permission" name="description" className="input bg-gray-100" />
						<button className="btn--prim">Add</button>
					</form>
				</div>
			</div>
		</>
	);
};

export default RoleView;
