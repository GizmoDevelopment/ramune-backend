// Modules
import { Request, Response } from "express";
import { DocumentSnapshot } from "@google-cloud/firestore";

// Utils
import { db } from "@config/firebase";
import { LANGUAGES } from "@config/constants";
import { getShowCDNEndpoint } from "@utils/shows";

// Types
import { Show, Episode, Season, ShowHusk, Lyrics } from "@typings/show";
import { StoredShow, StoredSeason, StoredEpisode, StoredLyrics } from "@typings/database";
import { LanguageCode, Subtitles } from "@typings/subtitles";

function constructShowFromDocument (doc: DocumentSnapshot, includeEpisodes: boolean): ShowHusk | Show | null {

	const
		SHOW_CDN_ENDPOINT = getShowCDNEndpoint(doc.id),
		showData = doc.data() as StoredShow | undefined;

	if (showData) {

		const constructedShow: ShowHusk = {
			id: doc.id,
			title: showData.title,
			description: showData.description,
			poster_url: `${SHOW_CDN_ENDPOINT}/poster.jpg`,
			banner_url: `${SHOW_CDN_ENDPOINT}/banner.jpg`,
		};

		if (includeEpisodes) {

			// Convert types and inject missing properties
			(constructedShow as Show).seasons = showData.seasons.map((season: StoredSeason): Season => {
				return {
					...season,
					episodes: season.episodes.map((episode: StoredEpisode): Episode => {

						const
							EPISODE_CDN_ENDPOINT = `${SHOW_CDN_ENDPOINT}/seasons/${season.id}/episodes/${episode.id}`,
							constructedEpisode: Episode = {
								...episode,
								thumbnail_url: `${EPISODE_CDN_ENDPOINT}/thumbnail.jpg`,
								stream_url: `${EPISODE_CDN_ENDPOINT}/${episode.id}.mp4`,
								subtitles: [],
								data: {}
							};

						if (episode.subtitles.length > 0) {

							const subtitles: Subtitles[] = episode.subtitles.map((lang: LanguageCode): Subtitles => {
								return {
									code: lang,
									language: LANGUAGES[lang],
									url: `${EPISODE_CDN_ENDPOINT}/subtitles/${lang}.vtt`
								};
							});

							constructedEpisode.subtitles = subtitles;
						}

						if (episode.data.lyrics) {

							const lyrics: Lyrics[] = episode.data.lyrics.map((_lyrics: StoredLyrics): Lyrics => {
								return {
									id: _lyrics.id,
									start: _lyrics.start,
									url: `${SHOW_CDN_ENDPOINT}/lyrics/${_lyrics.id}.lrc`
								};
							});

							constructedEpisode.data.lyrics = lyrics;
						}

						if (episode.data.effects) {
							constructedEpisode.data.effects = episode.data.effects;
						}

						return constructedEpisode;
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

	const { showId } = req.params;

	try {

		const
			showQuery = db.collection("shows").doc(showId),
			showDocument = await showQuery.get();

		if (showDocument.exists) {
			if (req.originalUrl.match(/\/raw$/i)) {

				const showData = showDocument.data() as StoredShow | undefined;

				if (showData) {
					res.status(200).json({ type: "success", data: showData });
				} else {
					res.status(400).json({ type: "error", message: "Something went wrong" });
				}

			} else {

				const show = constructShowFromDocument(showDocument, true);

				if (show) {
					res.status(200).json({ type: "success", data: show });
				} else {
					res.status(404).json({ type: "error", message: "Show not found" });
				}
			}
		} else {
			res.status(404).json({ type: "error", message: "Show not found" });
		}

	} catch (err) {
		console.error(new Error(err));
		res.status(500).json({ type: "error", message: "Something went wrong" });
	}

}
