export interface Show {
    title: string;
    episodes: Record<string, Episode>;
}

export interface Episode {
    title: string;
    hash: string;
}