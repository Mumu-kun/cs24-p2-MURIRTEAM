import Confirmation from "@/my-components/Confirmation";
import axiosApi from "@/utils/axios";
import { useEffect, useState } from "react";

export const RoleItem = ({ role, permissions: allPermissions, getRoles }) => {
	const [expanded, setExpanded] = useState(false);
	const [permissions, setPermissions] = useState([]);
	const [permissionPrompt, setPermissionPrompt] = useState(null);

	const otherPermissions = allPermissions.filter(
		(permission) => !permissions.map((perm) => perm.permission_id).includes(permission.permission_id)
	);

	const getPermissions = async () => {
		try {
			const res = await axiosApi.get(`/rbac/roles/${role.id}/permissions`);
			const data = res.data;

			setPermissions(data);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getPermissions();
	}, [role]);

	return (
		<>
			<div className="bg-white  shadow">
				<div className="flex gap-1 px-4 py-2 capitalize">
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
						className={`grid h-fit grid-cols-[repeat(2,max-content)] gap-2 border-t border-gray-500 bg-gray-50 pb-1 pt-2 transition-all duration-500 ${!expanded ? "-mb-[500%]" : "-mb-0"}`}
					>
						{!!permissions && permissions.length > 0 ? (
							permissions.map((permission) => (
								<>
									<div key={`${role.id}${permission.permission_id}`} className="pl-4">
										{permission.permission_id}
									</div>
									<div key={`${role.id}${permission.permission_id}desc`} className="pr-4">
										{permission.description}
									</div>
								</>
							))
						) : (
							<div className="col-span-2">No permissions</div>
						)}
						<select
							className="col-span-2 mt-1 w-full px-4 py-1"
							onChange={(e) => {
								e.preventDefault();
								const permission_id = e.target.value;
								console.log(permission_id);
								if (permission_id === "none") return;

								setPermissionPrompt(
									<Confirmation
										message="Are you sure you want to add this permission?"
										confirm={async (e) => {
											try {
												const res = await axiosApi.post(`/rbac/roles/${role.id}/permissions`, { permission_id });

												getRoles();
												setPermissionPrompt(null);
											} catch (error) {
												console.error(error);
											}
										}}
										cancel={() => {
											setPermissionPrompt(null);
										}}
									/>
								);
							}}
						>
							<option value="none" defaultChecked>
								Add
							</option>
							{!!otherPermissions &&
								otherPermissions.map((permission) => (
									<option key={permission.permission_id} value={permission.permission_id}>
										{permission.description}
									</option>
								))}
						</select>
					</div>
				</div>
			</div>
			{permissionPrompt}
		</>
	);
};
