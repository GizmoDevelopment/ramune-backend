import * as dotenv from "dotenv";
dotenv.config();

// Modules
import express from "express";
import cors from "cors";
import ratelimit from "express-rate-limit";
import logger from "@gizmo-dev/logger";

// Routes
import { returnAllShows, returnRequestedShow, returnRequestedEpisodeChapters } from "@routes/shows";

// Types
import type { Response } from "express";

// Variables
const app = express();

app.use(cors({
	methods: [ "GET" ],
	origin: process.env.NODE_ENV !== "production"
		? "*"
		: process.env.RAMUNE_WEBSITE
}));

app.use(ratelimit({
	windowMs: 1 * 60 * 1000,
	max: 20,
	standardHeaders: true,
	legacyHeaders: false
}));

app.use((req, res, next) => {
	logger.info(`${req.method} ${req.originalUrl}`);
	next();
});

app.get("/dango", (_: unknown, res: Response) => {
	res.status(200).send("daikazoku");
});

app.get("/shows", returnAllShows);
app.get("/shows/:showId", returnRequestedShow);
app.get("/shows/:showId/raw", returnRequestedShow);
app.get("/shows/:showId/episodes/:episodeId/chapters", returnRequestedEpisodeChapters);

app.listen(8080);
