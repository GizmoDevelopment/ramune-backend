// Types
import type { EpisodeEffect, ShowFormat } from "@typings/show";

export interface StoredShow {
	title: string;
	description: string;
	format?: ShowFormat;
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