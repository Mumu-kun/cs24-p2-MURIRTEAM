import { useState } from "react";

export const RoleItem = ({ role, permissions: allPermissions }) => {
	const permissions = role.permissions;
	const [expanded, setExpanded] = useState(false);

	const handleAddPermission = async (e) => {
		const permission_id = e.target.value;

		if (permission_id === "none") return;

		try {
			const res = await axiosApi.post("/rbac/permissions");
		} catch (error) {}
	};

	return (
		<>
			<div className="bg-white capitalize shadow">
				<div className="flex gap-1 px-4 py-2">
					<div>{role.id}</div>
					<div className="flex-1">{role.name.replace("_", " ")}</div>
					<button
						onClick={() => {
							setExpanded((prev) => !prev);
						}}
					>
						Expand
					</button>
				</div>
				<div className="h-fit overflow-hidden">
					<div
						className={`h-fit border-t border-gray-500 bg-gray-50 pb-1 transition-all duration-500 ${!expanded ? "-mb-[500%]" : "-mb-0"}`}
					>
						{!!permissions && permissions.length > 0 ? (
							permissions.map((permission) => (
								<div key={permission.permission_id} className="flex px-4 py-1">
									<div>{permission.description}</div>
								</div>
							))
						) : (
							<div>No permissions</div>
						)}
						<select className="w-full px-4 py-1" onChange={handleAddPermission}>
							<option value="none" defaultChecked>
								Add
							</option>
							{allPermissions.map((permission) => (
								<option key={permission.permission_id} value={permission.permission_id}>
									{permission.description}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>
		</>
	);
};
