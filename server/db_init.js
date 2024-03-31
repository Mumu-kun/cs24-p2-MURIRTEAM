import { open } from "sqlite";
import sqlite3 from "sqlite3";

(async () => {
	const db = await open({
		filename: "./database.db",
		driver: sqlite3.Database,
	});

	db.close();
})();
