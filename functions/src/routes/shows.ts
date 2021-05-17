// Modules
import { Request, Response } from "express";
import { DocumentSnapshot } from "@google-cloud/firestore";

// Utils
import { db } from "@config/firebase";
import { ENDPOINTS } from "@config/constants";
import { getShowCDNEndpoint } from "@utils/shows";

// Types
import { Show, Episode, StoredShow, StoredSeason, StoredEpisode, Season } from "@typings/types";

function constructShowFromDocument (doc: DocumentSnapshot): Show | null {

	const
		showCDNEndpoint = getShowCDNEndpoint(doc.id),
		showData = doc.data() as StoredShow | undefined;

	if (showData) {

		// Convert types and inject missing properties
		const constructedSeasons: Season[] = showData.seasons.map((season: StoredSeason): Season => {
			return {
				...season,
				episodes: season.episodes.map((episode: StoredEpisode, index: number): Episode => {

					const
						episodeCDNEndpoint = `${ showCDNEndpoint }/episodes/${ index + 1 }`,
						subtitleMap: Record<string, string> = {};

					episode.subtitles.forEach((lang: string) => {
						subtitleMap[lang] = `${ episodeCDNEndpoint }/subtitles/${ lang }.vtt`;
					});

					return {
						...episode,
						thumbnail_url: `${ episodeCDNEndpoint }/thumbnail.jpg`,
						subtitles: subtitleMap
					};

				})
			};
		});

		const constructedShow = {
			id: doc.id,
			poster_url: `${ showCDNEndpoint }/poster.jpg`,
			...showData,
			seasons: constructedSeasons
		} as Show;
	
		return constructedShow;
	} else {
		return null;
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
				res.redirect(`${ ENDPOINTS.VIDEO_CDN }/shows/${ constructedShow.id }/episodes/${ episodeId }.mp4`);
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