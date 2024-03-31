import { useAuthContext } from "@/hooks/useAuthContext";
import axiosApi from "@/utils/axios";
import { useEffect, useRef, useState } from "react";

const AddLandfillVehicleEntry = () => {
	const { user } = useAuthContext();
	const [landfill, setLandfill] = useState(null);
	const [vehicles, setVehicles] = useState([]);
	const [slip, setSlip] = useState(null);
	const entryForm = useRef(null);
	const slipForm = useRef(null);

	const getLandfill = async () => {
		try {
			const res = await axiosApi.get("/landfill/manager/" + user.id);
			setLandfill(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	const getVehicles = async () => {
		try {
			const res = await axiosApi.get("/entry/all/landfill", {
				params: {
					landfill_id: landfill.id
				}
			});
			setVehicles(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	const createEntry = async (e) => {
		try {
			e.preventDefault();
			const formData = new FormData(e.target);

			try {
				const res = await axiosApi.post("/entry/landfill", formData);

				getVehicles();
				entryForm?.current?.reset();
			} catch (error) {
				console.error(error);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const generateSlip = async (e) => {
		try {
			e.preventDefault();
			const formData = new FormData(e.target);

			try {
				const res = await axiosApi.post("/generate/slip", formData);

				setSlip(res.data);
				slipForm?.current?.reset();
			} catch (error) {
				console.error(error);
			}
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getLandfill();
		getVehicles();
	}, []);

	return (
		<>
			<div className="mb-8">
				<h3>Landfill details:</h3>
				<ul>
					<li>ID: {landfill.id}</li>
					<li>Capacity: {landfill.capacity}</li>
					<li>Latitude: {landfill.latitude}</li>
					<li>Longitude: {landfill.longitude}</li>
					<li>Operational timespan: {landfill.operational_timespan}</li>
				</ul>
			</div>
			<div className="mb-8">
				<h3>Vehicle list:</h3>
				<ol>
					{vehicles.forEach((vehicle) => {
						<>
							<li>
								<ul>
									<li>Vehicle registration number: {vehicle.vehicle_num}</li>
									<li>STS ID: {vehicle.sts_id}</li>
									<li>Trip count: {vehicle.trip_count}</li>
									<li>Weight of waste: {vehicle.weight}</li>
									<li>STS departure time: {vehicle.sts_departure_time}</li>
								</ul>
							</li>
						</>;
					})}
				</ol>
			</div>
			<div className="mb-8">
				<h1>Add entry of a vehicle leaving Landfill</h1>
				<form ref={entryForm} onSubmit={createEntry} className="flex flex-col items-stretch gap-2">
					<input type="number" name="sts_id" placeholder="STS ID" className="input" required />
					<input type="number" name="vehicle_num" placeholder="Vehicle Registration No" className="input" required />
					<input type="number" name="trip_count" placeholder="Trip count" className="input" required />
					<input type="datetime" name="landfill_arrival_time" className="input" />
					<input type="datetime" name="landfill_departure_time" className="input" required />
					<button className="btn btn--prim self-center">Create entry</button>
				</form>
			</div>
			<div className="mb-8">
				<h2>Generate slip</h2>
				<form ref={slipForm} onSubmit={generateSlip} className="flex flex-col items-stretch gap-2">
					<input type="number" name="sts_id" placeholder="STS ID" className="input" required />
					<input type="number" name="vehicle_num" placeholder="Vehicle Registration No" className="input" required />
					<input type="number" name="trip_count" placeholder="Trip count" className="input" required />
					<button className="btn btn--prim self-center">Generate</button>
				</form>
			</div>
			{slip &&
			<div className="mb-8">
				<h2>Slip:</h2>
				<ul>
					<li>Timestamps: 
						<ul>
							<li>Arrival: {slip.timestamp.arrival}</li>
							<li>Departure: {slip.timestamp.departure}</li>
						</ul>
					</li>
					<li>Weight of waste: {slip.weight_of_waste}</li>
					<li>Truck: 
						<ul>
							<li>Registration number: {slip.truck.reg_num}</li>
							<li>Type: {slip.truck.type}</li>
							<li>Capacity: {slip.truck.capacity}</li>
							<li>Fuel cost (loaded): {slip.truck.fuel_cost_loaded}</li>
							<li>Fuel cost (unloaded): {slip.truck.fuel_cost_unloaded}</li>
						</ul>
					</li>
					<li>Fuel allocation:
						<ul>
							<li>Total distance: {slip.truck.total_distance}</li>
							<li>Total cost: {slip.truck.total_cost}</li>
						</ul>
					</li>
				</ul>
			</div>}
		</>
	);
};

export default AddLandfillVehicleEntry;
