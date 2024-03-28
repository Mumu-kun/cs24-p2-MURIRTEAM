import sqlite3 from "sqlite3";
import { open } from "sqlite";

const dbPromise = (async () => {
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
			role TEXT DEFAULT 'unassigned'
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
			reg_num INTEGR PRIMARY KEY AUTOINCREMENT,
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

		DROP TABLE IF EXISTS role_permission;
		CREATE TABLE IF NOT EXISTS role_permission(
			role TEXT,
			permission_id INTEGER,

			PRIMARY KEY (role, permission_id),
			FOREIGN KEY (permission_id) REFERENCES permission(id) 
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
			FOREIGN KEY (vehicle_num) REFERENCES vehicle(reg_num),
		);

		DROP TABLE IF EXISTS sts;
		CREATE TABLE IF NOT EXISTS sts(
			
		);
	`);

	return db;
})();

export default dbPromise;
