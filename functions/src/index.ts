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

exports.app = functions.https.onRequest(app);