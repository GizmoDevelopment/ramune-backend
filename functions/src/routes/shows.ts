// Modules
import { Request, Response } from "express";
import { DocumentSnapshot } from "@google-cloud/firestore";

// Utils
import { db, constants } from "../config/firebase";

// Types
import { Show } from "../types";

function constructShowFromDocument (doc: DocumentSnapshot): Show | undefined {
    
    const constructedShow = {
        id: doc.id,
        ...doc.data()
    } as Show;

    if (constructedShow.title) {
        return constructedShow;
    } else {
        return;
    }
}

export async function returnAllShows (_: Request, res: Response): Promise<void> {
    try {

        const
            filteredShows: Show[] = [],
            shows = await db.collection("shows").get();

        shows.forEach(doc => {
            const show = constructShowFromDocument(doc);
            if (show) filteredShows.push(show);
        });

        res.status(200).json({ type: "success", data: filteredShows });

    } catch (err) {
        console.error(new Error(err));
        res.status(500).json({ type: "error", message: "Something went wrong" });
    }
}

export async function returnRequestedShow (req: Request, res: Response): Promise<void> {

    const { showId, episodeId } = req.params;

    try {

        const
            show = db.collection("shows").doc(showId),
            showDocument = await show.get(),
            constructedShow = constructShowFromDocument(showDocument);

        if (showDocument.exists && constructedShow) {

            if (episodeId && req.originalUrl.includes("/stream")) {
                res.redirect(`${ constants.OVH_VIDEO_ENDPOINT }/${ constructedShow.id }/episodes/${ episodeId }.mp4`);
            } else {
                res.status(200).json({ type: "success", data: constructedShow });
            }

        } else {
            res.status(404).json({ type: "error", message: "Show not found" });
        }

    } catch (err) {
        console.error(new Error(err));
        res.status(500).json({ type: "error", message: "Something went wrong" });
    }

}