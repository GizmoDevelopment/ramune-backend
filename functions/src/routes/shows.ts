// Modules
import { Request, Response } from "express";
import { DocumentSnapshot } from "@google-cloud/firestore";

// Utils
import { db } from "@config/firebase";
import { ENDPOINTS } from "@config/constants";
import { getShowCDNEndpoint } from "@utils/shows";

// Types
import { Show, Episode, Season, ShowHusk } from "@typings/show";
import { StoredShow, StoredSeason, StoredEpisode } from "@typings/database";

function constructShowFromDocument(doc: DocumentSnapshot, includeEpisodes: boolean): ShowHusk | Show | null {

	const
		SHOW_CDN_ENDPOINT = getShowCDNEndpoint(doc.id),
		showData = doc.data() as StoredShow | undefined;

	if (showData) {

		const constructedShow: ShowHusk = {
			id: doc.id,
			poster_url: `${SHOW_CDN_ENDPOINT}/poster.jpg`,
			...showData
		};

		if (includeEpisodes) {

			// Convert types and inject missing properties
			(constructedShow as Show).seasons = showData.seasons.map((season: StoredSeason): Season => {
				return {
					...season,
					episodes: season.episodes.map((episode: StoredEpisode): Episode => {

						const EPISODE_CDN_ENDPOINT = `${SHOW_CDN_ENDPOINT}/episodes/${episode.id}`;

						const subtitles: Record<string, string> = {};

						episode.subtitles.forEach((lang: string): string => {
							return `${EPISODE_CDN_ENDPOINT}/subtitles/${lang}.vtt`;
						});

						return {
							...episode,
							thumbnail_url: `${EPISODE_CDN_ENDPOINT}/thumbnail.jpg`,
							subtitles
						};
					})
				};
			});

			return constructedShow as Show;
		} else {
			return constructedShow as ShowHusk;
		}

	} else {
		return null;
	}
}

export async function returnAllShows (_: Request, res: Response): Promise<void> {
	try {

		const
			filteredShows: ShowHusk[] = [],
			shows = await db.collection("shows").get();

		shows.forEach(doc => {
			const show = constructShowFromDocument(doc, false);
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
			showQuery = db.collection("shows").doc(showId),
			showDocument = await showQuery.get();

		if (showDocument.exists) {

			const show = constructShowFromDocument(showDocument, true);

			if (show) {
				if (episodeId && req.originalUrl.includes("/stream")) {
					res.redirect(`${ ENDPOINTS.VIDEO_CDN }/shows/${ show.id }/episodes/${ episodeId }.mp4`);
				} else {
					res.status(200).json({ type: "success", data: show });
				}
			} else {
				res.status(404).json({ type: "error", message: "Show not found" });
			}

		} else {
			res.status(404).json({ type: "error", message: "Show not found" });
		}

	} catch (err) {
		console.error(new Error(err));
		res.status(500).json({ type: "error", message: "Something went wrong" });
	}

}
