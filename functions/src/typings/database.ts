// Types
import { EpisodeEffect } from "@typings/show";
import { LanguageCode } from "@typings/subtitles";

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
	subtitles: LanguageCode[];
	duration: number;
	data: StoredEpisodeData;
}

export interface StoredEpisodeData {
	effects?: EpisodeEffect[];
	lyrics?: StoredLyrics[];
}

export interface StoredLyrics {
	id: string;
	start: number;
}