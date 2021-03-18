// Modules
import * as express from "express";
import * as functions from "firebase-functions";

// Utils
import { returnAllShows, returnRequestedShow } from "./routes/shows";

// Variables
const app = express();

app.get("/dango", (req: express.Request, res: express.Response) => {
    res.status(200).send("daikazoku");
});

app.get("/", returnAllShows);
app.get("/:showId", returnRequestedShow);
app.get("/:showId/episodes/:episodeId/stream", returnRequestedShow);

exports.shows = functions.region("europe-west1").https.onRequest(app);