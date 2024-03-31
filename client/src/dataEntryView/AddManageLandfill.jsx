import axiosApi from "@/utils/axios";
import { useEffect, useRef, useState } from "react";

const LandfillEntry = ({ landfill, unassignedLandfillManagers, getUnassignedLandfillManagers }) => {
	const [managers, setManagers] = useState([]);

	const getManagers = async () => {
		try {
			const res = await axiosApi.get(`/managers/landfill/${landfill.id}`);
			setManagers(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	const handleAssign = async (e) => {
		const manager_id = e.target.value;
		if (manager_id === "none") return;
		try {
			const res = await axiosApi.post("/assign/landfill_manager", { landfill_id: landfill.id, user_id: manager_id });

			e.target.value = "none";
			getManagers();
			getUnassignedLandfillManagers();
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getManagers();
		document.title = "Admin Landfill";
	}, []);

	return (
		<div key={landfill.id} className="rounded-md bg-white shadow">
			<div className="flex gap-2 rounded-md p-4 text-center">
				<div className="w-32">Capacity: {landfill.capacity}</div>
				<div className="w-28">Lat: {landfill.latitude}°</div>
				<div className="w-28">Long: {landfill.longitude}°</div>
				<div className="w-32">Operation: {landfill.operational_timespan}Y</div>
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
					{unassignedLandfillManagers.map((manager) => (
						<option key={manager.id} value={manager.id} className="flex gap-2 py-2">
							{manager.username}&nbsp;&nbsp;&nbsp;{manager.email}
						</option>
					))}
				</select>
			</div>
		</div>
	);
};

const AddManageLandfill = () => {
	const [landfillList, setLandfillList] = useState([]);
	const [unassignedLandfillManagers, setUnassignedLandfillManagers] = useState([]);

	const landfillForm = useRef(null);

	const getLandfills = async () => {
		try {
			const res = await axiosApi.get("/landfill");
			setLandfillList(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	const createLandfill = async (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const data = Object.fromEntries(formData);

		try {
			const res = await axiosApi.post("/create/landfill", data);
			getLandfills();
			landfillForm?.current?.reset();
		} catch (error) {
			console.error(error);
		}
	};

	const getUnassignedLandfillManagers = async () => {
		try {
			const res = await axiosApi.get("/managers/landfill/unassigned");
			setUnassignedLandfillManagers(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getLandfills();
		getUnassignedLandfillManagers();
	}, []);

	return (
		<>
			<div className="mb-8">
				<h1 className="mb-4 text-center text-4xl">Create Landfill</h1>
				<form ref={landfillForm} className="flex flex-col items-stretch gap-4" onSubmit={createLandfill}>
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
					<input
						type="number"
						name="operational_timespan"
						placeholder="Operational Timespan (Years)"
						className="input"
						required
					/>
					<button className="btn--prim self-center">Create</button>
				</form>
			</div>
			<div className="mb-8">
				<h1 className="mb-4 text-center text-4xl">Landfill List</h1>
				<div className="flex flex-col gap-2">
					{landfillList.map((landfill) => (
						<LandfillEntry {...{ landfill, unassignedLandfillManagers, getUnassignedLandfillManagers }} />
					))}
				</div>
			</div>
		</>
	);
};

export default AddManageLandfill;
