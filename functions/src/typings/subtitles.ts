export type LanguageCode = "en" | "ja";
export type LanguageName = "English" | "Japanese";

export interface Subtitles {
	code: LanguageCode;
	language: LanguageName;
	url: string;
}