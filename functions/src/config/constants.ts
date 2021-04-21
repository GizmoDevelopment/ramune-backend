// Modules
import * as functions from "firebase-functions";

export const ENDPOINTS = {
	CDN: functions.config().cdn.endpoint,
};