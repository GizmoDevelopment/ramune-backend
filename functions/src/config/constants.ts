// Modules
import * as functions from "firebase-functions";

// Types
import { LanguageCode, LanguageName } from "@typings/subtitles";

export const ENDPOINTS = {
	CDN: functions.config().cdn.endpoint,
	VIDEO_CDN: functions.config().video_cdn.endpoint
};

export const LANGUAGES: Record<LanguageCode, LanguageName> = {
	"en": "English",
	"ja": "Japanese"
};