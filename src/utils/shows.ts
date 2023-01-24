// Modules
import axios from "axios";
import logger from "@gizmo-dev/logger";

// Constants
const RAMUNE_CDN = process.env.RAMUNE_CDN;

// Types
import type { Episode, EpisodeChapters, Show, Season } from "@typings/show";
import type { StoredEpisode, StoredShow, StoredSeason } from "@typings/database";

interface AniSkipResponse {
	found: boolean;
	statusCode: number;
	message: string;
	results: AniSkipChapter[];
}

interface AniSkipChapter {
	interval: {
		startTime: number;
		endTime: number;
	};
	skipType: "op" | "ed" | "recap";
	skipId: string;
	episodeLength: number;
}

export function getShowCDNEndpoint (showId: string): string {
	return `${RAMUNE_CDN}/shows/${showId}`;
}

export function getEpisodeById (show: StoredShow, episodeId: number): StoredEpisode | null;
export function getEpisodeById (show: Show, episodeId: number): Episode | null;
export function getEpisodeById (show: Show | StoredShow, episodeId: number): Episode | StoredEpisode | null {

	let accumulativeLength = 0;

	for (let i = 0; i <= show.seasons.length; i++) {

		const season = show.seasons[i];

		if (season) {

			const _accumulativeLength = accumulativeLength;
			accumulativeLength += season.episodes.length;

			if (episodeId <= accumulativeLength) {
				return season.episodes[episodeId - _accumulativeLength - 1];
			}
		}
	}

	return null;
}

export function getSeasonFromEpisodeId (show: StoredShow, episodeId: number): StoredSeason | null;
export function getSeasonFromEpisodeId (show: Show, episodeId: number): Season | null;
export function getSeasonFromEpisodeId (show: Show | StoredShow, episodeId: number): Season | StoredSeason | null {

	let accumulativeLength = 0;

	for (let i = 0; i <= show.seasons.length; i++) {

		const season = show.seasons[i];

		if (season) {

			accumulativeLength += season.episodes.length;

			if (episodeId <= accumulativeLength) {
				return season;
			}
		}
	}

	return null;
}

export async function fetchEpisodeChapters (showMalId: number, episodeId: number, duration: number): Promise<EpisodeChapters> {

	const chapters: EpisodeChapters = [];

	try {

		const { data } = await axios.get<AniSkipResponse>(`https://api.aniskip.com/v2/skip-times/${showMalId}/${episodeId}/?episodeLength=${duration}&types=op&types=ed&types=recap`);
	
		if (data.found) {
			data.results.forEach(ch => {
				// Just in case...
				if (typeof ch.skipType === "string" && typeof ch.interval.startTime === "number" && typeof ch.interval.endTime === "number") {
					chapters.push({
						type: ch.skipType,
						start: ch.interval.startTime,
						end: ch.interval.endTime
					});
				}
			});
		}
		
	} catch (err: unknown) {
		if (typeof err === "string") {
			logger.error(Error(err));
		} else {
			logger.error(err);
		}
	}

	return chapters;
}
