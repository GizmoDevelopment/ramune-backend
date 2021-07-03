// Utils
import { ENDPOINTS } from "@config/constants";

export function getShowCDNEndpoint (showId: string): string {
	return `${ ENDPOINTS.VIDEO_CDN }/shows/${ showId }`;
}