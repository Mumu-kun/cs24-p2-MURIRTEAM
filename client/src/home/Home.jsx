import { useAuthContext } from "@/hooks/useAuthContext";
import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
	const { user } = useAuthContext();

	return (
		<div className="my-auto flex flex-col items-center justify-center">
			<h1 className="mb-4 text-4xl font-bold">Home</h1>
			<div className="grid grid-cols-2 justify-items-center gap-2">
				<Link to="/profile" className="btn--prim">
					Profile
				</Link>
				{user?.role_id === 2 && (
					<>
						<Link to="/role" className="btn--prim">
							Roles
						</Link>
						<Link to="/user" className="btn--prim">
							Users
						</Link>
						<Link to="/vehicle" className="btn--prim">
							Vehicle
						</Link>
						<Link to="/manage-landfill" className="btn--prim">
							Manage Landfills
						</Link>
						<Link to="/manage-sts" className="btn--prim">
							Manage STS
						</Link>
					</>
				)}

				{user?.role_id === 3 && (
					<Link to="/sts" className="btn--prim">
						STS
					</Link>
				)}
				{user?.role_id === 4 && (
					<Link to="/landfill" className="btn--prim">
						Landfill
					</Link>
				)}
			</div>
		</div>
	);
};

export default Home;
