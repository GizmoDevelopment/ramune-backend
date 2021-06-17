// Types
import { EpisodeData } from "@typings/show";

export interface StoredShow {
	title: string;
	description: string;
	seasons: StoredSeason[];
}

export interface StoredSeason {
	id: number;
	episodes: StoredEpisode[];
}

export interface StoredEpisode {
	id: number;
	title: string;
	subtitles: string[];
	data: EpisodeData;
}
