// Types
import { Subtitles } from "@typings/subtitles";

export interface ShowHusk {
	id: string;
	title: string;
	description: string;
	poster_url: string;
}

export interface Show extends ShowHusk {
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
	effects: EpisodeEffect[];
}

export interface EpisodeEffect {
	renderer: "tsparticles" | "leaf";
	data: any;
	start: number;
	end: number;
}