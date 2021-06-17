export interface Show {
	id: string;
	title: string;
	description: string;
	poster_url: string;
	seasons: Season[];
}

export interface Season {
	id: number;
	episodes: Episode[];
}

export interface Episode {
	id: number;
	title: string;
	thumbnail_url: string;
	subtitles: Record<string, string>;
	data: EpisodeData;
}

export interface EpisodeData {
	effects: EpisodeEffect[];
}

export interface EpisodeEffect {
	engine: "tsparticles";
	data: any;
	start: number;
	end: number;
}
