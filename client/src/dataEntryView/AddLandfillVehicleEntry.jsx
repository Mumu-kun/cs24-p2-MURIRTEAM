import { useAuthContext } from "@/hooks/useAuthContext";
import axiosApi from "@/utils/axios";
import { useEffect, useRef, useState } from "react";

const AddLandfillVehicleEntry = () => {
	const { user } = useAuthContext();
	const [landfill, setLandfill] = useState(null);
	const [vehicles, setVehicles] = useState([]);
	const entryForm = useRef(null);

	const getSTS = async () => {
		try {
			const res = await axiosApi.get("/STS/manager/" + user.id);
			setSts(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	const getVehicles = async () => {
		try {
			const res = await axiosApi.get("/vehicles/STS/" + sts.id);
			setVehicles(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	const createEntry = async (e) => {
		try {
			e.preventDefault();
			const formData = new FormData(e.target);
			formData.append("sts_id", sts.id);

			try {
				const res = await axiosApi.post("/entry/STS", formData);

				entryForm?.current?.reset();
			} catch (error) {
				console.error(error);
			}
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getSTS();
		getVehicles();
	}, []);

	return (
		<>
			<div className="mb-8">
				<h3>STS details:</h3>
				<ul>
					<li>ID: {sts.id}</li>
					<li>Ward number: {sts.ward_number}</li>
					<li>Capacity: {sts.capacity}</li>
					<li>Latitude: {sts.latitude}</li>
					<li>Longitude: {sts.longitude}</li>
				</ul>
			</div>
			<div className="mb-8">
				<h3>Vehicle list:</h3>
				<ol>
					{vehicles.forEach((vehicle) => {
						<>
							<li>
								<ul>
									<li>Registration number: {vehicle.reg_num}</li>
									<li>Type: {vehicle.type}</li>
									<li>Capacity: {vehicle.capacity}</li>
									<li>Fuel cost (loaded): {vehicle.fuel_cost_loaded}</li>
									<li>Fuel cost (unloaded): {vehicle.fuel_cost_unloaded}</li>
								</ul>
							</li>
						</>;
					})}
				</ol>
			</div>
			<div className="mb-8">
				<h1>Add entry of a vehicle leaving STS</h1>
				<form ref={entryForm} onSubmit={createEntry} className="flex flex-col items-stretch gap-2">
					<input type="number" name="landfill_id" placeholder="Landfill ID" className="input" required />
					<input type="number" name="vehicle_num" placeholder="Vehicle Registration No" className="input" required />
					<input type="number" name="weight" placeholder="Weight of wastes" className="input" required />
					<input type="datetime" name="sts_arrival_time" className="input" />
					<input type="datetime" name="sts_departure_time" className="input" required />
					<button className="btn btn--prim self-center">Create entry</button>
				</form>
			</div>
		</>
	);
};

export default AddLandfillVehicleEntry;
