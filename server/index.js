import cors from "cors";
import express from "express";
import session from "express-session";
import morgan from "morgan";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbPromise = (async () => {
	const db = await open({
		filename: "./database.db",
		driver: sqlite3.Database,
	});

	return db;
})();

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
		//await db.run(`DELETE FROM transport_record`);
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
		res.send(q[0]);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Change password
app.post("/change/password", async (req, res) => {
	const db = await dbPromise;
	try {
		const { user_id, password } = req.body;
		const q = db.run(`UPDATE user SET password = ? WHERE id = ?`, [password, user_id]);
		res.send({
			success: true,
			message: "Password change successful",
		});
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
		res.send({
			success: true,
			message: "Registration successful",
		});
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

// Delete a specific user
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

// Get all roles
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

// For defining and managing roles
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
		const { ward_number, capacity, latitude, longitude, landfill_id } = req.body;
		const q = await db.run(
			`
			INSERT INTO sts (ward_number, capacity, latitude, longitude, landfill_id)
			VALUES (?, ?, ?, ?, ?)
		`,
			[ward_number, capacity, latitude, longitude, landfill_id]
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
			INSERT INTO sts_manager (id, sts_id)
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

// Get all managers not assigned to any STS
app.get("/managers/STS/unassigned", async (req, res) => {
	const db = await dbPromise;
	try {
		const q = await db.all(`
		SELECT * 
		FROM user U
		WHERE U.id IN (
			SELECT id 
			FROM user 
			WHERE role_id = 3
		) AND U.id NOT IN (
			SELECT id 
			FROM sts_manager
		);

		`);
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
		const q = await db.all(`SELECT S.* FROM sts S JOIN sts_manager SM ON SM.sts_id = S.id WHERE SM.id = ?`, [
			manager_id,
		]);
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
		const q = await db.all(`SELECT * FROM vehicle WHERE sts_id = ?`, [sts_id]);
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
		const { sts_id, vehicle_num, trip_count, sts_arrival_time, sts_departure_time } = req.body;
		console.log(req.body);
		const q2 = await db.get(`SELECT landfill_id FROM sts WHERE id = ?`, [sts_id]);
		const landfill_id = q2.landfill_id;
		const q = await db.run(
			`
			UPDATE transport_record SET sts_arrival_time = ? , sts_departure_time = ?
			WHERE sts_id = ? AND landfill_id = ? AND vehicle_num = ? AND trip_count = ? AND generation_date = CURRENT_DATE
		`,
			[sts_arrival_time, sts_departure_time, sts_id, landfill_id, vehicle_num, trip_count]
		);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

//(sts_departure_time IS null or sts_arrival_time IS null)

// Get all entries for all vehicles from an STS to a landfill
app.get("/entry/all/sts", async (req, res) => {
	const db = await dbPromise;
	try {
		const { sts_id, generation_date } = req.query;
		console.log(req.query);
		const q2 = await db.get(`SELECT landfill_id FROM sts WHERE id = ?`, [sts_id]);
		const landfill_id = q2.landfill_id;
		const q = await db.all(
			`SELECT * FROM transport_record WHERE sts_id = ? AND landfill_id = ? AND generation_date = ?
			AND sts_departure_time IS NOT NULL
			order by vehicle_num asc, trip_count ASC`,
			[sts_id, landfill_id, generation_date]
		);
		console.log(q2, q);
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
			INSERT INTO landfill_manager (id, landfill_id)
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

// Get all managers not assigned to any landfill
app.get("/managers/landfill/unassigned", async (req, res) => {
	const db = await dbPromise;
	try {
		const q = await db.all(`
		SELECT * 
		FROM user U
		WHERE U.id IN (
			SELECT id 
			FROM user 
			WHERE role_id = 4
		) AND U.id NOT IN (
			SELECT id 
			FROM landfill_manager
		);

		`);
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
		const q = await db.all(`SELECT U.* FROM landfill_manager LM JOIN user U ON LM.id = U.id WHERE LM.landfill_id = ?`, [
			landfill_id,
		]);
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
		const q = await db.all(
			`SELECT L.* FROM landfill L JOIN landfill_manager LM ON LM.landfill_id = L.id WHERE LM.id = ?`,
			[manager_id]
		);
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
		const { sts_id, vehicle_num, trip_count, landfill_arrival_time, landfill_departure_time } = req.body;
		const q2 = await db.get(`SELECT landfill_id FROM sts WHERE id = ?`, [sts_id]);
		const landfill_id = q2.landfill_id;
		const q = await db.run(
			`
			UPDATE transport_record SET landfill_arrival_time = ? , landfill_departure_time = ?
			WHERE sts_id = ? AND landfill_id = ? AND vehicle_num = ? AND trip_count = ? AND generation_date = CURRENT_DATE
		`,
			[landfill_arrival_time, landfill_departure_time, sts_id, landfill_id, vehicle_num, trip_count]
		);
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get all vehicles currently in landfill
app.get("/entry/all/landfill", async (req, res) => {
	const db = await dbPromise;
	try {
		const { landfill_id } = req.query;
		const q = await db.all(
			`SELECT * FROM transport_record WHERE landfill_id = ? AND sts_departure_time IS NOT NULL AND landfill_departure_time IS NULL`,
			[landfill_id]
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
			res.status(500).send({ message: "No login available for unassigned role" });
		} else {
			console.log(q);
			req.session.user = q[0]; //storing user details in session
			console.log(req.session.user);
			res.send(q[0]);
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

// Add a permission to a role
app.post("/rbac/roles/:roleId/permissions", async (req, res) => {
	const db = await dbPromise;
	try {
		const {permission_id} = req.body;
		const {roleId} = req.params;
		const q = await db.run(`INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?)`, [roleId, permission_id]);
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
		res.send(q);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get route from STS to landfill
app.get("/route/STS", async (req, res) => {
	const db = await dbPromise;
	try {
		const { sts_id } = req.query;
		const q = await db.get(`SELECT * FROM route WHERE sts_id = ?`, [sts_id]);
		const landfill_id = q.landfill_id;
		const q2 = await db.get(`SELECT * FROM route WHERE sts_id = ? AND landfill_id = ?`, [sts_id, landfill_id]);
		res.send(q2);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Create route from STS to landfill
app.post("/create/route", async (req, res) => {
	const db = await dbPromise;
	try {
		const { sts_id, time, distance } = req.body;
		const q2 = await db.get(`SELECT landfill_id FROM sts WHERE id = ?`, [sts_id]);

		const landfill_id = q2.landfill_id;

		let q = await db.run(`INSERT INTO route (sts_id, landfill_id, time, distance) VALUES (?, ?, ?, ?)`, [
			sts_id,
			landfill_id,
			time,
			distance,
		]);
		res.send({ success: true, message: "Route created" });
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Generate fleet
app.get("/generate/fleet", async (req, res) => {
	const db = await dbPromise;
	try {
		const { sts_id, total_weight } = req.query;
		const q2 = await db.get(`SELECT landfill_id FROM sts WHERE id = ?`, [sts_id]);
		const landfill_id = q2.landfill_id;

		const vehicles = await db.all(
			`
			SELECT * 
			FROM vehicle
			WHERE sts_id = ?
			ORDER BY capacity / fuel_cost_loaded DESC;
		`,
			[sts_id]
		);

		console.log(total_weight);

		let v_total_weight = total_weight;
		let fleet = [];
		for (let i = 0; i < vehicles.length; i++) {
			if (v_total_weight == 0) {
				break;
			}
			vehicles[i].weight = 0;
			for (let j = 1; j <= 3; j++) {
				if (v_total_weight - vehicles[i].capacity >= 0) {
					vehicles[i].weight = vehicles[i].capacity;
					fleet.push({
						reg_num: vehicles[i].reg_num,
						type: vehicles[i].type,
						capacity: vehicles[i].capacity,
						fuel_cost_loaded: vehicles[i].fuel_cost_loaded,
						fuel_cost_unloaded: vehicles[i].fuel_cost_unloaded,
						weight: vehicles[i].capacity,
						trip_count: j,
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
						weight: v_total_weight,
						trip_count: j,
					});
					v_total_weight = 0;
					break;
				}
			}
		}

		for (let i = 0; i < fleet.length; i++) {
			const q = await db.run(
				`
				INSERT INTO transport_record (sts_id, landfill_id, vehicle_num, trip_count, weight)
				VALUES (?, ?, ?, ?, ?)
			`,
				[sts_id, landfill_id, fleet[i].reg_num, fleet[i].trip_count, fleet[i].weight]
			);
		}

		console.log(fleet);
		res.send({ fleet });
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get created fleet
app.get("/get/fleet", async (req, res) => {
	const db = await dbPromise;
	try {
		const { sts_id } = req.query;
		const q = await db.get(`SELECT * FROM route WHERE sts_id = ?`, [sts_id]);
		const landfill_id = q.landfill_id;

		const dt = await db.get(`SELECT CURRENT_DATE AS cd FROM landfill`);
		console.log(dt.cd);

		const q2 = await db.all(`
			SELECT V.*, TR.trip_count, TR.weight
			FROM transport_record TR JOIN vehicle V ON TR.vehicle_num = V.reg_num
			WHERE TR.sts_id = ? AND TR.landfill_id = ? AND TR.generation_date = CURRENT_DATE
		`, [sts_id, landfill_id]);
		console.log(q2);
		res.send(q2);
	} catch (error) {
		console.error("error executing query: ", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Generate slip for each transport from STS to landfill
app.get("/generate/slip", async (req, res) => {
	const db = await dbPromise;
	try {
		const { sts_id, vehicle_num, trip_count } = req.query;
		console.log(req.query);

		const q2 = await db.get(`SELECT landfill_id FROM sts WHERE id = ?`, [sts_id]);
		const landfill_id = q2.landfill_id;

		const q = await db.get(
			`
			SELECT TR.sts_id, TR.landfill_id, TR.vehicle_num, TR.weight, TR.landfill_arrival_time, TR.landfill_departure_time, R.distance, 
				V.type, V.capacity, V.fuel_cost_loaded, V.fuel_cost_unloaded
			FROM transport_record TR
			JOIN route R ON R.sts_id = TR.sts_id AND R.landfill_id = TR.landfill_id
			JOIN vehicle V ON V.reg_num = TR.vehicle_num
			WHERE TR.sts_id = ? AND TR.landfill_id = ? AND TR.vehicle_num = ? AND TR.trip_count = ? AND TR.generation_date = CURRENT_DATE
		`,
			[sts_id, landfill_id, vehicle_num, trip_count]
		);

		console.log(sts_id, landfill_id, vehicle_num, trip_count);
		console.log(q);

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
