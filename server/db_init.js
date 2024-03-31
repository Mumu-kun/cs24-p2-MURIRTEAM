import { open } from "sqlite";
import sqlite3 from "sqlite3";

(async () => {
	const db = await open({
		filename: "./database.db",
		driver: sqlite3.Database,
	});

	await db.exec(`
		DROP TABLE IF EXISTS user;
		CREATE TABLE IF NOT EXISTS user(
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT NOT NULL,
			email TEXT NOT NULL,
			password TEXT NOT NULL,
			role_id INTEGER DEFAULT 1,

			FOREIGN KEY (role_id) REFERENCES role(id)
		);

		DROP TABLE IF EXISTS admin;
		CREATE TABLE IF NOT EXISTS admin(
			id INTEGER PRIMARY KEY,

			FOREIGN KEY (id) REFERENCES user(id)
		);

		DROP TABLE IF EXISTS sts_manager;
		CREATE TABLE IF NOT EXISTS sts_manager(
			id INTEGER PRIMARY KEY,
			sts_id INTEGER,

			FOREIGN KEY (id) REFERENCES user(id),
			FOREIGN KEY (sts_id) REFERENCES sts(id)
		);

		DROP TABLE IF EXISTS landfill_manager;
		CREATE TABLE IF NOT EXISTS landfill_manager(
			id INTEGER PRIMARY KEY,
			landfill_id INTEGER,

			FOREIGN KEY (id) REFERENCES user(id),
			FOREIGN KEY (landfill_id) REFERENCES landfill(id)
		);

		DROP TABLE IF EXISTS sts;
		CREATE TABLE IF NOT EXISTS sts(
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			ward_number INTEGER UNIQUE NOT NULL,
			capacity INTEGER,
			latitude REAL NOT NULL,
			longitude REAL NOT NULL
		);

		DROP TABLE IF EXISTS landfill;
		CREATE TABLE IF NOT EXISTS landfill(
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			capacity INTEGER NOT NULL,
			latitude REAL NOT NULL,
			longitude REAL NOT NULL,
			operational_timespan REAL
		);

		DROP TABLE IF EXISTS vehicle;
		CREATE TABLE IF NOT EXISTS vehicle(
			reg_num INTEGER PRIMARY KEY AUTOINCREMENT,
			type TEXT NOT NULL,
			capacity INTEGER NOT NULL,
			fuel_cost_loaded REAL NOT NULL,
			fuel_cost_unloaded REAL NOT NULL,
			sts_id INTEGER,

			FOREIGN KEY (sts_id) REFERENCES sts(id)
		);

		DROP TABLE IF EXISTS permission;
		CREATE TABLE IF NOT EXISTS permission(
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			description TEXT NOT NULL
		);

		DROP TABLE IF EXISTS role;
		CREATE TABLE IF NOT EXISTS role(
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT
		);

		DROP TABLE IF EXISTS permission;
		CREATE TABLE IF NOT EXISTS permission(
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			description TEXT
		);
		
		DROP TABLE IF EXISTS role_permission;
		CREATE TABLE IF NOT EXISTS role_permission(
			role_id INTEGER,
			permission_id INTEGER,

			PRIMARY KEY (role_id, permission_id),
			FOREIGN KEY (permission_id) REFERENCES permission(id),
			FOREIGN KEY (role_id) REFERENCES role(id) 
		);

		DROP TABLE IF EXISTS route;
		CREATE TABLE IF NOT EXISTS route(
			sts_id INTEGER,
			landfill_id INTEGER,
			time REAL NOT NULL,
			distance REAL NOT NULL,

			PRIMARY KEY (sts_id, landfill_id),
			FOREIGN KEY (sts_id) REFERENCES sts(id),
			FOREIGN KEY (landfill_id) REFERENCES landfill(id)
		);

		DROP TABLE IF EXISTS transport_record;
		CREATE TABLE IF NOT EXISTS transport_record(
			sts_id INTEGER,
			landfill_id INTEGER,
			vehicle_num INTEGER,
			weight INTEGER,
			sts_arrival_time DATETIME,
			sts_departure_time DATETIME,
			landfill_arrival_time DATETIME,
			landfill_departure_time DATETIME,

			PRIMARY KEY (sts_id, landfill_id, vehicle_num)
			FOREIGN KEY (sts_id) REFERENCES route(sts_id),
			FOREIGN KEY (landfill_id) REFERENCES route(landfill_id),
			FOREIGN KEY (vehicle_num) REFERENCES vehicle(reg_num)
		);

	`);

	await db.exec(`
		INSERT INTO role (name) VALUES ('unassigned');
		INSERT INTO role (name) VALUES ('admin');
		INSERT INTO role (name) VALUES ('sts_manager');
		INSERT INTO role (name) VALUES ('landfill_manager');

		INSERT INTO user (username, email, password, role_id) VALUES ('admin', 'admin@gmail.com', '1234', 2);

		INSERT INTO permission (description) VALUES ('List all users');
		INSERT INTO permission (description) VALUES ('View a specific user');
		INSERT INTO permission (description) VALUES ('Create a new user');
		INSERT INTO permission (description) VALUES ('Update a specific user details');
		INSERT INTO permission (description) VALUES ('Delete a user');
		INSERT INTO permission (description) VALUES ('Update a user roles');
		INSERT INTO permission (description) VALUES ('Define and manage roles');
		INSERT INTO permission (description) VALUES ('Define and manage permissions');
		INSERT INTO permission (description) VALUES ('Assign permissions to a role');
		INSERT INTO permission (description) VALUES ('Add vehicle');
		INSERT INTO permission (description) VALUES ('Add STS');
		INSERT INTO permission (description) VALUES ('Assign STS manager');
		INSERT INTO permission (description) VALUES ('Assign truck to STS');
		INSERT INTO permission (description) VALUES ('Create landfill site');
		INSERT INTO permission (description) VALUES ('Assign landfill manager');

		INSERT INTO permission (description) VALUES ('Add entry of vehicles leaving');
		INSERT INTO permission (description) VALUES ('View and select optimized route');
		INSERT INTO permission (description) VALUES ('Generate fleet of trucks');

		INSERT INTO permission (description) VALUES ('Add entry of truck dumping');
		INSERT INTO permission (description) VALUES ('Generate slip');

		INSERT INTO permission (description) VALUES ('Change password');
		INSERT INTO permission (description) VALUES ('Get all available roles');
		INSERT INTO permission (description) VALUES ('Update profile details');
		INSERT INTO permission (description) VALUES ('See assigned roles');
	`);

	for (let i = 1; i <= 15; i++) {
		await db.run(`INSERT INTO role_permission (role_id, permission_id) VALUES (2, ?)`, [i]);
	}
	await db.exec(`INSERT INTO role_permission (role_id, permission_id) VALUES (3, 16)`);
	await db.exec(`INSERT INTO role_permission (role_id, permission_id) VALUES (3, 17)`);
	await db.exec(`INSERT INTO role_permission (role_id, permission_id) VALUES (3, 18)`);
	await db.exec(`INSERT INTO role_permission (role_id, permission_id) VALUES (4, 19)`);
	await db.exec(`INSERT INTO role_permission (role_id, permission_id) VALUES (4, 20)`);
	for (let i = 21; i <= 24; i++) {
		for (let j = 1; j <= 4; j++) {
			await db.run(`INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?)`, [j, i]);
		}
	}

	db.close();
})();
