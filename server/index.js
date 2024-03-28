import express from "express";
import morgan from "morgan";
import cors from "cors";
import dbPromise from "./db_init.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(8000, () => {
	console.log("Server is running at port 8000");
});
