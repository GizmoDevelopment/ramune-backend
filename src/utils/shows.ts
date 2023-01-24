// Constants
const RAMUNE_CDN = process.env.RAMUNE_CDN;

// Types
import type { Episode, Show } from "@typings/show";
import type { StoredEpisode, StoredShow } from "@typings/database";

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
