export type LanguageCode = "en" | "jp";
export type LanguageName = "English" | "日本語";

export interface Subtitles {
	code: LanguageCode;
	language: LanguageName;
	url: string;
}