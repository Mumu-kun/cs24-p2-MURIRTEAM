import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
	return (
		<div className="my-auto flex flex-col items-center justify-center">
			<h1 className="mb-4 text-4xl font-bold">Home</h1>
			<div>
				<Link to="/role">Roles</Link>
				<Link to="/user">Users</Link>
				<Link to="/vehicle">Vehicle</Link>
				<Link to="/sts">STS</Link>
			</div>
		</div>
	);
};

export default Home;
