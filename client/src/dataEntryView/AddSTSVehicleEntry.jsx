import { useAuthContext } from "@/hooks/useAuthContext";
import axiosApi from "@/utils/axios";
import { useEffect, useRef, useState } from "react";

const AddSTSVehicleEntry = () => {
	const { user } = useAuthContext();
	const [sts, setSts] = useState(null);
	const [vehicles, setVehicles] = useState([]);
	const [fleet, setFleet] = useState([]);
	const [entries, setEntries] = useState([]);
	const [route, setRoute] = useState(null);
	const entryForm = useRef(null);
	const fleetForm = useRef(null);
	const routeForm = useRef(null);

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

	const getEntries = async () => {
		try {
			const res = await axiosApi.get("/entry/all/STS", {
				params:{
					sts_id: sts.id
				}
			});
			setEntries(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	const getRoute = async () => {
		try {
			const res = await axiosApi.get("/route/STS", {
				params:{
					sts_id: sts.id
				}
			});
			setRoute(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	const generateFleet = async (e) => {
		try {
			e.preventDefault();
			const formData = new FormData(e.target);
			formData.append("sts_id", sts.id);

			try {
				const res = await axiosApi.get("/generate/fleet", { params: formData });

				setFleet(res.data);
				fleetForm?.current?.reset();
			} catch (error) {
				console.error(error);
			}
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

				getEntries();
				entryForm?.current?.reset();
			} catch (error) {
				console.error(error);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const createRoute = async (e) => {
		try {
			e.preventDefault();
			const formData = new FormData(e.target);
			formData.append("sts_id", sts.id);

			try {
				const res = await axiosApi.post("/create/route", formData);

				getRoute();
				routeForm?.current?.reset();
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
		getRoute();
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
			{!route &&
			<div className="mb-8">
				<h3>Enter route:</h3>
				<form ref={routeForm} onSubmit={createRoute} className="flex flex-col items-stretch gap-2">
					<input type="number" name="time" placeholder="Total time" className="input" required />
					<input type="number" name="distance" placeholder="Total distance" className="input" required />
					<button className="btn btn--prim self-center">Submit</button>
				</form>
			</div>}
			{route && 
			<div className="mb-8">
				<h3>Route:</h3>
				<ul>
					<li>From (STS ID): {route.sts_id}</li>
					<li>To (Landfill ID): {route.landfill_id}</li>
					<li>Time: {route.time}</li>
					<li>Distance: {route.distance}</li>
				</ul>
			</div>
			}
			<div className="mb-8">
				<h2>Generate fleet</h2>
				<form ref={fleetForm} onSubmit={generateFleet} className="flex flex-col items-stretch gap-2">
					<input type="number" name="weight" placeholder="Total weight of waste" className="input" required />
					<button className="btn btn--prim self-center">Generate</button>
				</form>
			</div>
			{fleet && 
			<div className="mb-8">
				<h3>Fleet:</h3>
				<ol>
					{fleet.forEach((vehicle) => {
						<>
							<li>
								<ul>
									<li>Registration number: {vehicle.reg_num}</li>
									<li>Type: {vehicle.type}</li>
									<li>Capacity: {vehicle.capacity}</li>
									<li>Fuel cost (loaded): {vehicle.fuel_cost_loaded}</li>
									<li>Fuel cost (unloaded): {vehicle.fuel_cost_unloaded}</li>
									<li>Weight of waste: {vehicle.weight}</li>
									<li>Trip count: {vehicle.trip_count}</li>
								</ul>
							</li>
						</>;
					})}
				</ol>
			</div>}
			<div className="mb-8">
				<h1>Add entry of a vehicle leaving STS (according to generated fleet)</h1>
				<form ref={entryForm} onSubmit={createEntry} className="flex flex-col items-stretch gap-2">
					<input type="number" name="vehicle_num" placeholder="Vehicle Registration No" className="input" required />
					<input type="number" name="trip_count" placeholder="Trip count" className="input" required />
					<input type="datetime" name="sts_arrival_time" className="input" />
					<input type="datetime" name="sts_departure_time" className="input" required />
					<button className="btn btn--prim self-center">Create entry</button>
				</form>
			</div>
			{entries && 
			<div className="mb-8">
				<h3>Entry list:</h3>
				<ol>
					{entries.forEach((entry) => {
						<>
							<li>
								<ul>
									<li>Vehicle registration number: {entry.vehicle_num}</li>
									<li>STS ID: {entry.sts_id}</li>
									<li>Trip count: {entry.trip_count}</li>
									<li>Weight of waste: {entry.weight}</li>
									<li>STS arrival time: {entry.sts_arrival_time}</li>
									<li>STS departure time: {entry.sts_departure_time}</li>
								</ul>
							</li>
						</>;
					})}
				</ol>
			</div>
			}
		</>
	);
};

export default AddSTSVehicleEntry;
