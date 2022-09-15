// Modules
import express from "express";
import cors from "cors";
import ratelimit from "express-rate-limit";

// Routes
import { returnAllShows, returnRequestedShow } from "@routes/shows";

// Types
import type { Response } from "express";

// Variables
const app = express();

app.use(cors({
	methods: [ "GET" ],
	origin: "*"
}));

app.use(ratelimit({
	windowMs: 1 * 60 * 1000,
	max: 20,
	standardHeaders: true,
	legacyHeaders: false
}));

app.get("/dango", (_: unknown, res: Response) => {
	res.status(200).send("daikazoku");
});

app.get("/shows", returnAllShows);
app.get("/shows/:showId", returnRequestedShow);
app.get("/shows/:showId/raw", returnRequestedShow);

app.listen(8080);