import axiosApi from "@/utils/axios";
import { useEffect, useRef, useState } from "react";

const STSEntry = ({ sts, unassignedStsManagers, getUnassignedStsManagers }) => {
	const [managers, setManagers] = useState([]);

	const getManagers = async () => {
		try {
			const res = await axiosApi.get(`/managers/STS/${sts.id}`);
			setManagers(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	const handleAssign = async (e) => {
		const manager_id = e.target.value;
		if (manager_id === "none") return;
		try {
			const res = await axiosApi.post("/assign/STS_manager", { sts_id: sts.id, user_id: manager_id });

			e.target.value = "none";
			getManagers();
			getUnassignedStsManagers();
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getManagers();
		document.title = "Admin STS";
	}, []);

	return (
		<div key={sts.id} className="rounded-md bg-white shadow">
			<div className="flex gap-2 rounded-md p-4 text-center">
				<div className="w-28">Ward {sts.ward_number}</div>
				<div className="w-32">Capacity: {sts.capacity}</div>
				<div className="w-28">Lat: {sts.latitude}</div>
				<div className="w-28">Long: {sts.longitude}</div>
			</div>
			<div className="flex w-full flex-col bg-gray-50 px-4 py-2">
				<h4 className="font-semibold">Managers</h4>
				{managers.map((manager) => (
					<div key={manager.id} className="flex gap-2 py-2">
						<div className="w-32">{manager.username}</div>
						<div className="flex-1">{manager.email}</div>
					</div>
				))}
				<select className="input bg-gray-50" onChange={handleAssign}>
					<option value="none" defaultValue>
						Add Manager
					</option>
					{unassignedStsManagers.map((manager) => (
						<option key={manager.id} value={manager.id} className="flex gap-2 py-2">
							{manager.username}&nbsp;&nbsp;&nbsp;{manager.email}
						</option>
					))}
				</select>
			</div>
		</div>
	);
};

const AddManageSTS = () => {
	const [stsList, setStsList] = useState([]);
	const [landfills, setLandfills] = useState([]);
	const [unassignedStsManagers, setUnassignedStsManagers] = useState([]);

	const stsForm = useRef(null);

	const getSts = async () => {
		try {
			const res = await axiosApi.get("/STS");
			setStsList(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	const getLandfills = async () => {
		try {
			const res = await axiosApi.get("/landfill");
			setLandfills(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	const createSts = async (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const data = Object.fromEntries(formData);

		if (data.landfill_id === "none") return alert("Select a landfill");

		try {
			const res = await axiosApi.post("/create/STS", data);
			getSts();
			stsForm?.current?.reset();
		} catch (error) {
			console.error(error);
		}
	};

	const getUnassignedStsManagers = async () => {
		try {
			const res = await axiosApi.get("/managers/STS/unassigned");
			setUnassignedStsManagers(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getSts();
		getLandfills();
		getUnassignedStsManagers();
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
					<select name="landfill_id">
						<option value="none" defaultValue>
							Select Landfill
						</option>
						{landfills.map((landfill) => (
							<option key={landfill.id} value={landfill.id}>
								{landfill.id} {landfill.latitude}° {landfill.longitude}°
							</option>
						))}
					</select>
					<button className="btn--prim self-center">Create</button>
				</form>
			</div>
			<div className="mb-8">
				<h1 className="mb-4 text-center text-4xl">STS List</h1>
				<div className="flex flex-col gap-2">
					{stsList.map((sts) => (
						<STSEntry {...{ sts, unassignedStsManagers, getUnassignedStsManagers }} />
					))}
				</div>
			</div>
		</>
	);
};

export default AddManageSTS;
