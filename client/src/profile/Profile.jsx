import { useAuthContext } from "@/hooks/useAuthContext";
import axiosApi from "@/utils/axios";
import { useEffect, useState } from "react";

const Profile = () => {
	const { user } = useAuthContext();
	const [userData, setUserData] = useState(null);

	const getUserData = async () => {
		try {
			const res = await axiosApi.get("/users/" + user.id);
			setUserData(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	const handleChangePassword = async (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const data = Object.fromEntries(formData);
		data["user_id"] = user.id;

		try {
			const res = await axiosApi.post("/change/password", data);
			console.log(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getUserData();
		document.title = "Profile";
	}, []);

	if (!userData) return <div>Loading...</div>;

	return (
		<>
			<div className="mb-8">
				<h1 className="mb-4 text-center text-4xl">Profile</h1>
				<div className="grid grid-cols-[repeat(3,max-content)] gap-4">
					<div>ID</div>
					<div>:</div>
					<div>{userData.id}</div>
					<div>Username</div>
					<div>:</div>
					<div>{userData.username}</div>
					<div>Email</div>
					<div>:</div>
					<div>{userData.email}</div>
					<div>Role</div>
					<div>:</div>
					<div className="capitalize">{userData.name}</div>
				</div>
			</div>
			<form className="mb-8 space-x-2" onClick={handleChangePassword}>
				<input type="password" name="password" className="input" placeholder="New Password" />
				<button className="btn--prim">Change Password</button>
			</form>
		</>
	);
};

export default Profile;
