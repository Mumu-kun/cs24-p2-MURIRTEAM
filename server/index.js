import express from "express";
import morgan from "morgan";
import cors from "cors";
import dbPromise from "./db_init.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', async(req, res)=>{
	const db = await dbPromise;
	try {
	
		const q1 = await db.all(`SELECT * FROM user`);
		const q2 = await db.all(`SELECT * FROM role`);
		const q3 = await db.all(`SELECT * FROM permission`);
		const q4 = await db.all(`SELECT * FROM role_permission`);
		const q5 = await db.all(`SELECT * FROM vehicle`);
		const q6 = await db.all(`SELECT * FROM sts`);
		res.send({q1, q2, q3, q4, q5, q6});

	} catch (error) {
		console.error('error executing query: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
	}
})

// Get all permissions given to current user
app.get('/permissions/:id', async(req, res)=>{
	const db = await dbPromise;
	try {
		
		const user_id = req.params.id;
		const q = await db.all(`
			SELECT P.*
			FROM user U JOIN role_permission RP 
			ON U.role_id = RP.role_id
			JOIN permission P
			ON P.id = RP.permission_id
			WHERE U.id = ?
		`, [user_id]);
		res.send(q);

	} catch (error) {
		console.error('error executing query: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
	}
})

// List all users
app.get('/users', async(req, res) => {
    const db = await dbPromise;
	try {
		
		const q = await db.all(`SELECT * FROM user`);
		res.send(q);

	} catch (error) {
		console.error('error executing query: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
	}
});

// Get a specific user details
app.get('/users/:id', async(req, res) => {
    const db = await dbPromise;
	try {
		
		const user_id = req.params.id;
		const q = await db.all(`SELECT * FROM user WHERE id = ?`, user_id);
		res.send(q);

	} catch (error) {
		console.error('error executing query: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
	}
});

// Create a new user
app.post('/users', async(req, res) => {
    const db = await dbPromise;
	try {
		
		const {username, email, password} = req.body;
		const q = await db.run(`
			INSERT INTO user (username, email, password) VALUES (?, ?, ?)
		`, [username, email, password]);
		res.send(q);

	} catch (error) {
		console.error('error executing query: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
	}
});

// Assign a role to a user
app.post('/users', async(req, res) => {
    const db = await dbPromise;
	try {
		
		const {user_id, role_id} = req.body;
		const q = await db.run(`
			UPDATE user SET role_id = ? WHERE id = ?
		`, [role_id, user_id]);
		res.send(q);

	} catch (error) {
		console.error('error executing query: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
	}
});

// Create STS
app.post('/create/STS', async(req, res)=>{
	const db = await dbPromise;
	try {
		
		const {ward_number, capacity, latitude, longitude} = req.body;
		const q = await db.run(`
			INSERT INTO sts (ward_number, capacity, latitude, longitude)
			VALUES (?, ?, ?, ?)
		`, [ward_number, capacity, latitude, longitude]);
		res.send(q);

	} catch (error) {
		console.error('error executing query: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
	}
})

// Assign STS manager
app.post('/assign/STS_manager', async(req, res)=>{
	const db = await dbPromise;
	try {
		
		const {user_id, sts_id} = req.body;
		const q = await db.run(`
			INSERT INTO sts_manager (user_id, sts_id)
			VALUES (?, ?)
		`, [user_id, sts_id]);
		res.send(q);

	} catch (error) {
		console.error('error executing query: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
	}
})

// Create vehicle
app.post('/create/vehicle', async(req, res)=>{
	const db = await dbPromise;
	try {
		
		const {reg_num, type, capacity, fuel_cost_loaded, fuel_cost_unloaded} = req.body;
		const q = await db.run(`
			INSERT INTO vehicle (reg_num, type, capacity, fuel_cost_loaded, fuel_cost_unloaded)
			VALUES (?, ?, ?, ?, ?)
		`, [reg_num, type, capacity, fuel_cost_loaded, fuel_cost_unloaded]);
		res.send(q);

	} catch (error) {
		console.error('error executing query: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
	}
})

// Get list of unassigned vehicles
app.get('/vehicles/unassigned', async(req, res)=>{
	const db = await dbPromise;
	try {
		
		const q = await db.all(`SELECT * FROM vehicle WHERE sts_id IS NULL`);
		res.send(q);

	} catch (error) {
		console.error('error executing query: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
	}
})

// Assign vehicle to sts
app.post('/assign/vehicle', async(req, res)=>{
	const db = await dbPromise;
	try {
		
		const {reg_num, sts_id} = req.body;
		const q = await db.run(`
			UPDATE vehicle SET sts_id = ? WHERE reg_num = ?
		`, [sts_id, reg_num]);
		res.send(q);

	} catch (error) {
		console.error('error executing query: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
	}
})

// Add entry of vehicles leaving sts
app.post('/entry/STS', async(req, res)=>{
	const db = await dbPromise;
	try {
		
		const {sts_id, landfill_id, vehicle_num, weight, sts_arrival_time, sts_departure_time} = req.body;
		const q = await db.run(`
			INSERT INTO transport_record (sts_id, landfill_id, vehicle_num, weight, sts_arrival_time, sts_departure_time)
			VALUES (?, ?, ?, ?, ?, ?)
		`, [sts_id, landfill_id, vehicle_num, weight, sts_arrival_time, sts_departure_time]);
		res.send(q);

	} catch (error) {
		console.error('error executing query: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
	}
})

// Create Landfill
app.post('/create/landfil', async(req, res)=>{
	const db = await dbPromise;
	try {
		
		const {capacity, latitude, longitude, operational_span} = req.body;
		const q = await db.run(`
			INSERT INTO landfill (capacity, latitude, longitude, operational_span)
			VALUES (?, ?, ?, ?)
		`, [capacity, latitude, longitude, operational_span]);
		res.send(q);

	} catch (error) {
		console.error('error executing query: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
	}
})

// Assign landfill manager
app.post('/assign/landfill_manager', async(req, res)=>{
	const db = await dbPromise;
	try {
		
		const {user_id, landfill_id} = req.body;
		const q = await db.run(`
			INSERT INTO landfill (user_id, landfill_id)
			VALUES (?, ?)
		`, [user_id, landfill_id]);
		res.send(q);

	} catch (error) {
		console.error('error executing query: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
	}
})

// Add entry of truck dumping
app.post('/entry/landfill', async(req, res)=>{
	const db = await dbPromise;
	try {
		
		const {sts_id, landfill_id, vehicle_num, landfill_arrival_time, landfill_departure_time} = req.body;
		const q = await db.run(`
			UPDATE transport_record SET landfill_arrival_time = ? , landfill_departure_time = ?
			WHERE sts_id = ? AND landfill_id = ? AND vehicle_num = ?
		`, [landfill_arrival_time, landfill_departure_time, sts_id, landfill_id, vehicle_num]);
		res.send(q);

	} catch (error) {
		console.error('error executing query: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
	}
})

app.listen(8000, () => {
	console.log("Server is running at port 8000");
});