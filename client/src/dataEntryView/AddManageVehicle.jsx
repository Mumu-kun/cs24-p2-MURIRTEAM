import axiosApi from "@/utils/axios";
import { useEffect, useRef, useState } from "react";
import { VehicleEntry } from "./VehicleEntry";

const typeToCap = {
	"Open Truck": 3,
	"Dump Truck": 5,
	Compactor: 7,
	"Container Carrier": 15,
};

const Vehicle = () => {
	const [vehicles, setVehicles] = useState([]);
	const [stsList, setStsList] = useState([]);
	const [stsPrompt, setStsPrompt] = useState(null);
	const [formType, setFormType] = useState("none");

	const vehicleForm = useRef(null);

	const getVehicles = async () => {
		try {
			const res = await axiosApi.get("/vehicles/unassigned");
			setVehicles(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	const getSts = async () => {
		try {
			const res = await axiosApi.get("/STS");
			setStsList(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	const createVehicle = async (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const data = Object.fromEntries(formData);

		if (data.type === "none") return alert("Select Type");
		if (data.fuel_cost_loaded < 0 || data.fuel_cost_unloaded < 0) return alert("Fuel cost cannot be negative");

		data.capacity = typeToCap[data.type];

		try {
			const res = await axiosApi.post("/create/vehicle", data);
			getVehicles();

			setFormType("none");
			vehicleForm?.current?.reset();
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getVehicles();
		getSts();
	}, []);

	return (
		<>
			<div className="mb-8">
				<h1 className="mb-4 text-center text-4xl">Create Vehicle</h1>
				<form ref={vehicleForm} onSubmit={createVehicle} className="flex flex-col items-stretch gap-2">
					<input type="number" name="reg_num" placeholder="Vehicle Registration No" className="input" required />
					<select
						name="type"
						className="input"
						defaultValue={"none"}
						value={formType}
						onChange={(e) => {
							setFormType(e.target.value);
						}}
					>
						<option value="none">Select Type</option>
						{Array.from(Object.keys(typeToCap)).map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>
					<input
						type="number"
						name="capacity"
						value={formType === "none" ? "" : typeToCap[formType]}
						disabled
						className="input"
					/>
					<div className="font-semibold">Fuel cost per KM</div>
					<input type="number" name="fuel_cost_unloaded" placeholder="Unloaded" className="input" required />
					<input type="number" name="fuel_cost_loaded" placeholder="Loaded" className="input" required />
					<button className="btn btn--prim self-center">Create</button>
				</form>
			</div>

			<div className="mb-8">
				<h1 className="mb-4 text-center text-3xl">Unassigned Vehicles</h1>
				<div className="flex flex-col gap-2">
					{vehicles.map((vehicle) => (
						<VehicleEntry key={vehicle.reg_num} vehicle={vehicle} stsList={stsList} />
					))}
				</div>
			</div>
			{stsPrompt}
		</>
	);
};

export default Vehicle;
