import Confirmation from "@/my-components/Confirmation";
import axiosApi from "@/utils/axios";
import { useEffect, useRef, useState } from "react";

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
						<div key={vehicle.reg_num} className="flex items-center gap-4 bg-white px-4 py-4 text-sm shadow">
							<div className="w-28 text-center">{vehicle.reg_num}</div>
							<div className="w-[1px] self-stretch bg-gray-400"></div>
							<div className="w-28 text-center">
								<div>{vehicle.type}</div>
								<div>{vehicle.capacity} Ton</div>
							</div>
							<div className="w-[1px] self-stretch bg-gray-400"></div>
							<div className="grid grid-cols-2 justify-items-center gap-x-1">
								<div className="col-span-2">Fuel Cost</div>
								<div>Unloaded</div>
								<div>Loaded</div>
								<div>{vehicle.fuel_cost_unloaded}</div>
								<div>{vehicle.fuel_cost_loaded}</div>
							</div>
							<select
								className="input"
								defaultValue={"none"}
								onChange={(e) => {
									if (e.target.value === "none") return;
									setStsPrompt(
										<Confirmation
											message={`Are you sure you want to set this vehicle to ward ${e.target.selectedOptions[0].getAttribute("ward_no")}?`}
											confirm={async () => {
												try {
													const res = await axiosApi.post(`/assign/vehicle`, {
														reg_num: vehicle.reg_num,
														sts_id: e.target.value,
													});
													setStsPrompt(null);
													getVehicles();
												} catch (error) {
													console.error(error);
												}
											}}
											cancel={() => {
												setStsPrompt(null);
											}}
										/>
									);
								}}
							>
								<option value="none">Select STS</option>
								{stsList.map((sts) => (
									<option key={sts.id} value={sts.id} ward_no={sts.ward_number}>
										{sts.id}: Ward {sts.ward_number}
									</option>
								))}
							</select>
						</div>
					))}
				</div>
			</div>
			{stsPrompt}
		</>
	);
};

export default Vehicle;
