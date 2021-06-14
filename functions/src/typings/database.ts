// Types
import { EpisodeData } from "@typings/show";

export interface StoredShow {
	title: string;
	description: string;
	seasons: StoredSeason[];
}

export interface StoredSeason {
	id: string;
	title: string;
	episodes: StoredEpisode[];
}

export interface StoredEpisode {
	title: string;
	subtitles: string[];
	data: EpisodeData;
}