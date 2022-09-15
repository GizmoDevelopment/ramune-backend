// Modules
import admin from "firebase-admin";
import { applicationDefault } from "firebase-admin/app";

admin.initializeApp({
	credential: applicationDefault(),
	databaseURL: process.env.DATABASE_URL
});

export default admin.firestore();