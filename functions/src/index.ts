// Modules
import * as express from "express";
import * as functions from "firebase-functions";
import * as cors from "cors";

// Utils
import { returnAllShows, returnRequestedShow } from "@routes/shows";

// Variables
const app = express();

app.use(cors({
    methods: [ "GET" ]
}));

app.get("/dango", (req: express.Request, res: express.Response) => {
    res.status(200).send("daikazoku");
});

app.get("/shows", returnAllShows);
app.get("/shows/:showId", returnRequestedShow);
app.get("/shows/:showId/episodes/:episodeId/stream", returnRequestedShow);

exports.ramune = functions.region("europe-west1").https.onRequest(app);