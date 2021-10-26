// Types
import type { Subtitles } from "@typings/subtitles";

export interface ShowHusk {
	id: string;
	title: string;
	description: string;
	poster_url: string;
	banner_url: string;
}

export interface Show extends ShowHusk {
	format?: ShowFormat;
	seasons: Season[];
}

export interface Season {
	id: number;
	episodes: Episode[];
}

export interface Episode {
	id: number;
	title: string;
	duration: number;
	thumbnail_url: string;
	stream_url: string;
	subtitles: Subtitles[];
	data: EpisodeData;
}

export interface EpisodeData {
	effects?: EpisodeEffect[];
	lyrics?: Lyrics[];
}

export interface EpisodeEffect {
	renderer: "tsparticles" | "leaf";
	data: unknown;
	start: number;
	end: number;
}

export interface Lyrics {
	id: string;
	start: number;
	url: string;
}

export type ShowFormat = "movie";