// Constants
const RAMUNE_CDN = process.env.RAMUNE_CDN;

export function getShowCDNEndpoint (showId: string): string {
	return `${RAMUNE_CDN}/shows/${showId}`;
}