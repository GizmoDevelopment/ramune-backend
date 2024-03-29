// Modules
import ISO6391 from "iso-639-1";
import type { Request, Response } from "express";
import type { DocumentSnapshot } from "@google-cloud/firestore";
import logger from "@gizmo-dev/logger";

// Utils
import db from "@config/database";
import { getEpisodeById, getShowCDNEndpoint, fetchEpisodeChapters, getSeasonFromEpisodeId } from "@utils/shows";

// Types
import type { Show, Episode, Season, ShowHusk, Lyrics } from "@typings/show";
import type { StoredShow, StoredSeason, StoredEpisode, StoredLyrics } from "@typings/database";
import type { Subtitles } from "@typings/subtitles";

function constructShowFromDocument (doc: DocumentSnapshot, includeEpisodes: boolean): ShowHusk | Show | null {

	const
		SHOW_CDN_ENDPOINT = getShowCDNEndpoint(doc.id),
		showData = doc.data() as StoredShow | undefined;

	if (showData) {

		const constructedShowHusk: ShowHusk = {
			id: doc.id,
			title: showData.title,
			description: showData.description,
			poster_url: `${SHOW_CDN_ENDPOINT}/poster.jpg`,
			banner_url: `${SHOW_CDN_ENDPOINT}/banner.jpg`,
		};

		if (includeEpisodes) {

			const constructedShow: Show = {
				...constructedShowHusk,
				format: showData.format,
				seasons: []
			};

			// Convert types and inject missing properties
			constructedShow.seasons = showData.seasons.map((season: StoredSeason): Season => {
				return {
					id: season.id,
					source: season.source || "N/A",
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

							const subtitles: Subtitles[] = episode.subtitles.map((lang: string): Subtitles => {
								return {
									code: lang,
									language: ISO6391.getName(lang),
									url: `${EPISODE_CDN_ENDPOINT}/subtitles/${lang}.ass`
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

			return constructedShow;
		} else {
			return constructedShowHusk;
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

	} catch (err: unknown) {

		if (typeof err === "string") {
			logger.error(Error(err));
		} else {
			logger.error(err);
		}

		res.status(500).json({ type: "error", message: "Something went wrong" });
	}
}

export async function returnRequestedShow (req: Request, res: Response): Promise<void> {

	const { showId } = req.params;

	try {

		const
			showQuery = db.collection("shows").doc(showId),
			showDocument = await showQuery.get();

		if (!showDocument.exists) {
			res.status(404).json({ type: "error", message: "Show not found" });
			return;
		}

		if (req.originalUrl.match(/\/raw$/i)) {

			const showData = showDocument.data() as StoredShow | undefined;

			if (showData) {
				res.status(200).json({ type: "success", data: { ...showData, id: showDocument.id } });
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

	} catch (err: unknown) {

		if (typeof err === "string") {
			logger.error(Error(err));
		} else {
			logger.error(err);
		}

		res.status(500).json({ type: "error", message: "Something went wrong" });
	}

}

export async function returnRequestedEpisodeChapters (req: Request, res: Response): Promise<void> {
	
	const { showId, episodeId } = req.params;

	try {

		const
			showQuery = db.collection("shows").doc(showId),
			showDocument = await showQuery.get();

		if (!showDocument.exists) {
			res.status(404).json({ type: "error", message: "Show not found" });
			return;
		}
			
		const show = showDocument.data() as StoredShow | undefined;

		if (!show) {
			res.status(500).json({ type: "error", message: "Something went wrong" });
			return;
		}

		const
			season = getSeasonFromEpisodeId(show, parseInt(episodeId)),
			episode = getEpisodeById(show, parseInt(episodeId));

		if (!season || !episode) {
			res.status(404).json({ type: "error", message: "Episode not found" });
			return;
		}

		const episodeChapters = await fetchEpisodeChapters(season.mal_id, episode.id, episode.duration);

		if (episodeChapters) {
			res.status(200).json({ type: "success", data: episodeChapters });
		} else {
			res.status(404).json({ type: "error", message: "Chapters not found" });
		}

	} catch (err: unknown) {

		if (typeof err === "string") {
			logger.error(Error(err));
		} else {
			logger.error(err);
		}

		res.status(500).json({ type: "error", message: "Something went wrong" });
	}
}
