import { useAuthContext } from "@/hooks/useAuthContext";
import axiosApi from "@/utils/axios";
import { useEffect, useRef, useState } from "react";
import { VehicleEntry } from "./VehicleEntry";

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
			setSts(res.data[0]);
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
				params: {
					sts_id: sts.id,
					generation_date: new Date().toISOString().split("T")[0],
				},
			});

			setEntries(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	const getRoute = async () => {
		try {
			const res = await axiosApi.get("/route/STS", {
				params: {
					sts_id: sts.id,
				},
			});

			setRoute(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	const generateFleet = async (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		formData.append("sts_id", sts.id);

		const data = Object.fromEntries(formData);

		try {
			const res = await axiosApi.get("/generate/fleet", { params: data });

			setFleet(res.data);
			fleetForm?.current?.reset();
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
		e.preventDefault();

		const formData = {
			sts_id: sts.id,
			time: parseInt(e.target.time.value),
			distance: parseInt(e.target.distance.value),
		};

		try {
			const res = await axiosApi.post("/create/route", formData);

			getRoute();
			routeForm?.current?.reset();
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getSTS();
	}, []);

	useEffect(() => {
		if (sts) {
			getVehicles();
			getRoute();
			getEntries();
		}
	}, [sts]);

	if (!sts) return <div>Loading...</div>;

	return (
		<>
			<div className="mb-8">
				<h3 className="mb-4 text-center text-3xl">STS details:</h3>
				<ul>
					<li>ID: {sts.id}</li>
					<li>Ward number: {sts.ward_number}</li>
					<li>Capacity: {sts.capacity}</li>
					<li>Latitude: {sts.latitude}</li>
					<li>Longitude: {sts.longitude}</li>
				</ul>
			</div>
			<div className="mb-8">
				<h3 className="mb-4 text-center text-xl">Vehicle list:</h3>
				<div className="flex flex-col gap-2">
					{!!vehicles && vehicles.map((vehicle) => <VehicleEntry key={vehicle.reg_num} vehicle={vehicle} />)}
				</div>
			</div>
			{!route && (
				<div className="mb-8">
					<h3>Enter route:</h3>
					<form ref={routeForm} onSubmit={createRoute} className="flex flex-col items-stretch gap-2">
						<input type="number" name="time" placeholder="Total time" className="input" required />
						<input type="number" name="distance" placeholder="Total distance" className="input" required />
						<button className="btn btn--prim self-center">Submit</button>
					</form>
				</div>
			)}
			{route && (
				<div className="mb-8">
					<h3 className="mb-4 text-center text-xl">Route:</h3>
					<ul>
						<li>From (STS ID): {route.sts_id}</li>
						<li>To (Landfill ID): {route.landfill_id}</li>
						<li>Time: {route.time}</li>
						<li>Distance: {route.distance}</li>
					</ul>
				</div>
			)}
			<div className="mb-8">
				<h2 className="mb-4 text-center text-xl">Generate fleet</h2>
				<form ref={fleetForm} onSubmit={generateFleet} className="flex flex-col items-stretch gap-2">
					<input type="number" name="weight" placeholder="Total weight of waste" className="input" required />
					<button className="btn btn--prim self-center">Generate</button>
				</form>
			</div>
			{fleet && (
				<div className="mb-8">
					<h3 className="mb-4 text-center text-xl">Fleet:</h3>
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
				</div>
			)}
			<div className="mb-8">
				<h1 className="mb-4 text-center text-xl">Add entry of a vehicle leaving STS (according to generated fleet)</h1>
				<form ref={entryForm} onSubmit={createEntry} className="flex flex-col items-stretch gap-2">
					<input type="number" name="vehicle_num" placeholder="Vehicle Registration No" className="input" required />
					<input type="number" name="trip_count" placeholder="Trip count" className="input" required />
					<input type="datetime" name="sts_arrival_time" className="input" />
					<input type="datetime" name="sts_departure_time" className="input" required />
					<button className="btn btn--prim self-center">Create entry</button>
				</form>
			</div>
			{!!entries && (
				<div className="mb-8">
					<h3 className="mb-4 text-center text-xl">Entry list:</h3>
					<ol>
						{entries.map((entry) => (
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
						))}
					</ol>
				</div>
			)}
		</>
	);
};

export default AddSTSVehicleEntry;
