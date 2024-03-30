import axiosApi from "@/utils/axios";
import { useEffect, useRef, useState } from "react";

const AddManageSTS = () => {
	const [stsList, setStsList] = useState([]);
	const [users, setUsers] = useState([]);

	const stsForm = useRef(null);

	const getSts = async () => {
		try {
			const res = await axiosApi.get("/");
			setStsList(res.data.q6);
		} catch (error) {
			console.error(error);
		}
	};

	const createSts = async (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const data = Object.fromEntries(formData);

		try {
			const res = await axiosApi.post("/create/STS", data);
			getSts();
			stsForm?.current?.reset();
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

	useEffect(() => {
		getSts();
		getUsers();
	}, []);

	return (
		<>
			<div className="mb-8">
				<h1 className="mb-4 text-center text-4xl">Create STS</h1>
				<form ref={stsForm} className="flex flex-col items-stretch gap-4" onSubmit={createSts}>
					<input type="number" name="ward_number" placeholder="Ward Number" className="input" required />
					<input type="number" name="capacity" placeholder="Capacity" className="input" required />
					<div className="space-x-4">
						<input
							type="number"
							name="latitude"
							step="0.00001"
							placeholder="Latitude"
							className="input w-32"
							required
						/>
						<input
							type="number"
							name="longitude"
							step="0.00001"
							placeholder="Longitude"
							className="input w-32"
							required
						/>
					</div>
					<button className="btn--prim self-center">Create</button>
				</form>
			</div>
			<div className="mb-8">
				<h1 className="mb-4 text-center text-4xl">STS List</h1>
				<div className="flex flex-col gap-2">
					{stsList.map((sts) => (
						<div key={sts.id} className="rounded-md shadow">
							<div className="flex gap-2 rounded-md p-4">
								<div className="w-28">Ward {sts.ward_number}</div>
								<div className="w-32">Capacity: {sts.capacity}</div>
								<div className="w-28">Lat: {sts.latitude}</div>
								<div className="w-28">Long: {sts.longitude}</div>
							</div>
							<div></div>
						</div>
					))}
				</div>
			</div>
		</>
	);
};

export default AddManageSTS;
