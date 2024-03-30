import express from "express";
import morgan from "morgan";
import session from "express-session";
import cors from "cors";
import dbPromise from "./db_init.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create a session for user
const userSession = session({
	name: "userSession",
	secret: "user-secret-key",
	resave: false,
	saveUninitialized: false,
});

app.use("/auth", userSession);

app.get("/", async (req, res) => {
	const db = await dbPromise;
	try {
		const q1 = await db.all(`SELECT * FROM user`);
		const q2 = await db.all(`SELECT * FROM role`);
		const q3 = await db.all(`SELECT * FROM permission`);
		const q4 = await db.all(`SELECT * FROM role_permission`);
		const q5 = await db.all(`SELECT * FROM vehicle`);
		const q6 = await db.all(`SELECT * FROM sts`);
		const q7 = await db.all(`SELECT * FROM landfill`);
		const q8 = await db.all(`SELECT * FROM route`);
		const q9 = await db.all(`SELECT * FROM transport_record`);
		res.send({ q1, q2, q3, q4, q5, q6, q7, q8, q9 });
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get all permissions given to current user
app.get("/permissions/:id", async (req, res) => {
	const db = await dbPromise;
	try {
		const user_id = req.params.id;
		const q = await db.all(
			`
			SELECT P.*
			FROM user U JOIN role_permission RP 
			ON U.role_id = RP.role_id
			JOIN permission P
			ON P.id = RP.permission_id
			WHERE U.id = ?
		`,
			[user_id]
		);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// List all users
app.get("/users", async (req, res) => {
	const db = await dbPromise;
	try {
		const q = await db.all(`SELECT * FROM user`);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get a specific user details
app.get("/users/:id", async (req, res) => {
	const db = await dbPromise;
	try {
		const user_id = req.params.id;
		const q = await db.all(`SELECT U.*, R.name FROM user U JOIN role R ON U.role_id = R.id WHERE U.id = ?`, user_id);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Create a new user
app.post("/users", async (req, res) => {
	const db = await dbPromise;
	try {
		const { username, email, password } = req.body;
		const q = await db.run(
			`
			INSERT INTO user (username, email, password) VALUES (?, ?, ?)
		`,
			[username, email, password]
		);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Assign a role to a user
app.post("/users/:userID/roles", async (req, res) => {
	const db = await dbPromise;
	try {
		const { user_id, role_id } = req.body;
		const q = await db.run(
			`
			UPDATE user SET role_id = ? WHERE id = ?
		`,
			[role_id, user_id]
		);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

app.delete("/users/:id", async (req, res) => {
	const db = await dbPromise;
	try {
		const user_id = req.params.id;
		const q = await db.run(`DELETE FROM user WHERE id = ?`, user_id);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

app.get("/users/roles", async (req, res) => {
	const db = await dbPromise;
	try {
		const q = await db.all(`SELECT * FROM role`);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

app.post("/rbac/roles", async (req, res) => {
	const db = await dbPromise;
	try {
		const { id, name } = req.body;
		const q = await db.all(`SELECT * FROM role where id = ?`, [id]);
		if (q.length > 0) {
			const r = await db.run(`UPDATE role SET name = ? WHERE id = ?`, [name, id]);
		} else {
			const r = await db.run(`INSERT INTO role (name) VALUES (?)`, [name]);
		}
		res.send(r);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Create STS
app.post("/create/STS", async (req, res) => {
	const db = await dbPromise;
	try {
		const { ward_number, capacity, latitude, longitude } = req.body;
		const q = await db.run(
			`
			INSERT INTO sts (ward_number, capacity, latitude, longitude)
			VALUES (?, ?, ?, ?)
		`,
			[ward_number, capacity, latitude, longitude]
		);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get all STS
app.get("/STS", async (req, res) => {
	const db = await dbPromise;
	try {
		const q = await db.all(`SELECT * FROM sts`);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Assign STS manager
app.post("/assign/STS_manager", async (req, res) => {
	const db = await dbPromise;
	try {
		const { user_id, sts_id } = req.body;
		const q = await db.run(
			`
			INSERT INTO sts_manager (user_id, sts_id)
			VALUES (?, ?)
		`,
			[user_id, sts_id]
		);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get all managers of a particular STS
app.get("/managers/STS/:id", async (req, res) => {
	const db = await dbPromise;
	try {
		const sts_id = req.params.id;
		const q = await db.all(`SELECT U.* FROM sts_manager SM JOIN user U ON SM.id = U.id WHERE SM.sts_id = ?`, [sts_id]);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get the STS of a particular STS_manager
app.get("/STS/manager/:id", async (req, res) => {
	const db = await dbPromise;
	try {
		const manager_id = req.params.id;
		const q = await db.all(`SELECT S.* FROM sts S JOIN sts_manager SM ON SM.sts_id = S.id WHERE SM.id = ?`, [manager_id]);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Create vehicle
app.post("/create/vehicle", async (req, res) => {
	const db = await dbPromise;
	try {
		const { reg_num, type, capacity, fuel_cost_loaded, fuel_cost_unloaded } = req.body;
		const q = await db.run(
			`
			INSERT INTO vehicle (reg_num, type, capacity, fuel_cost_loaded, fuel_cost_unloaded)
			VALUES (?, ?, ?, ?, ?)
		`,
			[reg_num, type, capacity, fuel_cost_loaded, fuel_cost_unloaded]
		);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get list of unassigned vehicles
app.get("/vehicles/unassigned", async (req, res) => {
	const db = await dbPromise;
	try {
		const q = await db.all(`SELECT * FROM vehicle WHERE sts_id IS NULL`);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Assign vehicle to sts
app.post("/assign/vehicle", async (req, res) => {
	const db = await dbPromise;
	try {
		const { reg_num, sts_id } = req.body;
		const q = await db.run(
			`
			UPDATE vehicle SET sts_id = ? WHERE reg_num = ?
		`,
			[sts_id, reg_num]
		);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get all vehicles assigned to an STS
app.get("/vehicles/STS/:id", async (req, res) => {
	const db = await dbPromise;
	try {
		const sts_id = req.params.id;
		const q = await db.all(`SELECT * FROM vehicles WHERE sts_id = ?`, [sts_id]);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Add entry of vehicles leaving sts
app.post("/entry/STS", async (req, res) => {
	const db = await dbPromise;
	try {
		const { sts_id, landfill_id, vehicle_num, weight, sts_arrival_time, sts_departure_time } = req.body;
		const q = await db.run(
			`
			INSERT INTO transport_record (sts_id, landfill_id, vehicle_num, weight, sts_arrival_time, sts_departure_time)
			VALUES (?, ?, ?, ?, ?, ?)
		`,
			[sts_id, landfill_id, vehicle_num, weight, sts_arrival_time, sts_departure_time]
		);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Create Landfill
app.post("/create/landfill", async (req, res) => {
	const db = await dbPromise;
	try {
		const { capacity, latitude, longitude, operational_timespan } = req.body;
		const q = await db.run(
			`
			INSERT INTO landfill (capacity, latitude, longitude, operational_timespan)
			VALUES (?, ?, ?, ?)
		`,
			[capacity, latitude, longitude, operational_timespan]
		);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get all Landfills
app.get("/landfill", async (req, res) => {
	const db = await dbPromise;
	try {
		const q = await db.all(`SELECT * FROM landfill`);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Assign landfill manager
app.post("/assign/landfill_manager", async (req, res) => {
	const db = await dbPromise;
	try {
		const { user_id, landfill_id } = req.body;
		const q = await db.run(
			`
			INSERT INTO landfill (user_id, landfill_id)
			VALUES (?, ?)
		`,
			[user_id, landfill_id]
		);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get all managers of a particular landfill
app.get("/managers/landfill/:id", async (req, res) => {
	const db = await dbPromise;
	try {
		const landfill_id = req.params.id;
		const q = await db.all(`SELECT U.* FROM landfill_manager LM JOIN user U ON LM.id = U.id WHERE LM.landfill_id = ?`, [landfill_id]);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get the landfill of a particular landfill_manager
app.get("/landfill/manager/:id", async (req, res) => {
	const db = await dbPromise;
	try {
		const manager_id = req.params.id;
		const q = await db.all(`SELECT L.* FROM landfill L JOIN landfill_manager LM ON LM.landfill_id = L.id WHERE LM.id = ?`, [manager_id]);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Add entry of truck dumping
app.post("/entry/landfill", async (req, res) => {
	const db = await dbPromise;
	try {
		const { sts_id, landfill_id, vehicle_num, landfill_arrival_time, landfill_departure_time } = req.body;
		const q = await db.run(
			`
			UPDATE transport_record SET landfill_arrival_time = ? , landfill_departure_time = ?
			WHERE sts_id = ? AND landfill_id = ? AND vehicle_num = ?
		`,
			[landfill_arrival_time, landfill_departure_time, sts_id, landfill_id, vehicle_num]
		);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

//AUTH ROUTES
app.post("/auth/login", async (req, res) => {
	const db = await dbPromise;
	try {
		const { email, password } = req.body;
		const q = await db.all(
			`
			SELECT * FROM user WHERE email = ? AND password = ?
		`,
			[email, password]
		);
		if (q.length > 0 && q[0].role_id == 1) {
			res.send({ message: "No login available for unassigned role" });
		} else {
			console.log(q);
			req.session.user = q[0]; //storing user details in session
			console.log(req.session.user);
			res.send(q);
		}
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

app.get("/auth/logout", async (req, res) => {
	req.session.destroy();
	res.send({ message: "Logged out" });
});

//CHANGE PASSWORD IMPLEMENTATION REMAINING
//END OF AUTH ROUTES

//ROLE + PERMISSION ROUTES
app.get("/rbac/roles", async (req, res) => {
	const db = await dbPromise;
	try {
		const q = await db.all(`SELECT * FROM role`);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

app.get("/rbac/permissions", async (req, res) => {
	const db = await dbPromise;
	try {
		const q = await db.all(
			`SELECT RP.role_id, RP.permission_id, P.description FROM role_permission RP JOIN permission P ON RP.permission_id = P.id`
		);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// FIX INSERTING INTO ROLE_PERMISSION TABLE
app.post("rbac/permissions", async (req, res) => {
	const db = await dbPromise;
	try {
		const { role_id, permission_id, description } = req.body;

		let q = await db.run(`INSERT INTO permission (description) VALUES (?)`, [description]);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Create route from STS to landfill
app.post("/create/route", async (req, res) => {
	const db = await dbPromise;
	try {
		const { sts_id, landfill_id, time, distance } = req.body;

		let q = await db.run(`INSERT INTO route (sts_id, landfill_id, time, distance) VALUES (?, ?, ?, ?)`, [
			sts_id,
			landfill_id,
			time,
			distance,
		]);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Generate fleet
app.get("/generate/fleet", async (req, res) => {
	const db = await dbPromise;
	try {
		const { sts_id, landfill_id, total_weight } = req.query;

		const vehicles = await db.all(
			`
			SELECT * 
			FROM vehicle
			WHERE sts_id = ?
			ORDER BY capacity / fuel_cost_loaded DESC;
		`,
			[sts_id]
		);

		let v_total_weight = total_weight;
		let fleet = [];
		for (let i = 0; i < vehicles.length; i++) {
			if (v_total_weight == 0) {
				break;
			}
			vehicles[i].weight = 0;
			for (let j = 0; j < 3; j++) {
				if (v_total_weight - vehicles[i].capacity >= 0) {
					vehicles[i].weight = vehicles[i].capacity;
					fleet.push({
						reg_num: vehicles[i].reg_num,
						type: vehicles[i].type,
						capacity: vehicles[i].capacity,
						fuel_cost_loaded: vehicles[i].fuel_cost_loaded,
						fuel_cost_unloaded: vehicles[i].fuel_cost_unloaded,
						weight: vehicles[i].capacity
					});
					v_total_weight -= vehicles[i].capacity;
				} else {
					vehicles[i].weight = v_total_weight;
					fleet.push({
						reg_num: vehicles[i].reg_num,
						type: vehicles[i].type,
						capacity: vehicles[i].capacity,
						fuel_cost_loaded: vehicles[i].fuel_cost_loaded,
						fuel_cost_unloaded: vehicles[i].fuel_cost_unloaded,
						weight: v_total_weight
					});
					v_total_weight = 0;
					break;
				}
			}
		}
		if (v_total_weight > 0) {
			fleet = [];
		}

		res.send({ fleet });
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Generate slip for each transport from STS to landfill
app.get("/generate/slip", async (req, res) => {
	const db = await dbPromise;
	try {
		const { sts_id, landfill_id, vehicle_num } = req.query;

		const q = await db.get(
			`
			SELECT TR.sts_id, TR.landfill_id, TR.vehicle_num, TR.weight, TR.landfill_arrival_time, TR.landfill_departure_time, R.distance, 
				V.type, V.capacity, V.fuel_cost_loaded, V.fuel_cost_unloaded
			FROM transport_record TR
			JOIN route R ON R.sts_id = TR.sts_id AND R.landfill_id = TR.landfill_id
			JOIN vehicle V ON V.reg_num = TR.vehicle_num
			WHERE TR.sts_id = ? AND TR.landfill_id = ? AND TR.vehicle_num = ?
		`,
			[sts_id, landfill_id, vehicle_num]
		);

		const cost =
			(q.fuel_cost_unloaded + (q.weight / q.capacity) * (q.fuel_cost_loaded - q.fuel_cost_unloaded)) * q.distance;

		res.send({
			timestamps: {
				arrival: q.landfill_arrival_time,
				departure: q.landfill_departure_time,
			},
			weight_of_waste: q.weight,
			truck: {
				reg_num: q.vehicle_num,
				type: q.type,
				capacity: q.capacity,
				fuel_cost_loaded: q.fuel_cost_loaded,
				fuel_cost_unloaded: q.fuel_cost_unloaded,
			},
			fuel_allocation: {
				total_distance: q.distance,
				total_cost: cost,
			},
		});
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

app.listen(8000, () => {
	console.log("Server is running at port 8000");
});
