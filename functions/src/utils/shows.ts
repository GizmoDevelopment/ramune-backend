// Utils
import { ENDPOINTS } from "@config/constants";

export function getShowCDNEndpoint (showId: string): string {
	return `${ENDPOINTS.RAMUNE_CDN}/shows/${showId}`;
}