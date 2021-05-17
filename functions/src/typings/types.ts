export interface StoredShow {
	title: string;
	description: string;
	seasons: StoredSeason[];
}

export interface StoredSeason {
	title: string;
	episodes: StoredEpisode[];
}

export interface StoredEpisode {
	title: string;
	subtitles: string[];
}

export interface Show {
	id: string;
	title: string;
	description: string;
	poster_url: string;
	seasons: Season[];
}

export interface Season {
	title: string;
	episodes: Episode[];
}

export interface Episode {
	title: string;
	thumbnail_url: string;
	subtitles: Record<string, string>;
}