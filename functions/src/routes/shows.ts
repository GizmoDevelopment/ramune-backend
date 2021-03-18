// Modules
import { Request, Response } from "express";

// Utils
import { db } from "../config/firebase";

// Types
import { Show } from "../types";

export async function returnAllShows (_: Request, res: Response): Promise<void> {
    try {

        const
            filteredShows: Show[] = [],
            shows = await db.collection("shows").get();

        shows.forEach(doc => {
            filteredShows.push(doc.data() as Show);
        });

        res.status(200).json(filteredShows);

    } catch (err) {
        console.error(new Error(err));
        res.status(500).send("Something went wrong");
    }
}

export async function returnRequestedShow (req: Request, res: Response): Promise<void> {

    const { showId } = req.params;

    try {

        const
            show = db.collection("shows").doc(showId),
            showDocument = await show.get();

        if (showDocument.exists) {
            res.status(200).json(showDocument.data());
        } else {
            res.status(404).send("Show not found");
        }

    } catch (err) {
        console.error(new Error(err));
        res.status(500).send("Something went wrong");
    }

}