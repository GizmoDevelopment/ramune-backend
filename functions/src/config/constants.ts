// Modules
import * as functions from "firebase-functions";

// Types
import { LanguageCode, LanguageName } from "@typings/subtitles";

export const ENDPOINTS = {
	RAMUNE_CDN: functions.config().cdn.ramune,
};

export const LANGUAGES: Record<LanguageCode, LanguageName> = {
	"en": "English",
	"ja": "Japanese"
};