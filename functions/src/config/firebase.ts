// Modules
import admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp({
	credential: admin.credential.cert({
		privateKey: functions.config().private.key.replace(/\\n/g, "\n"),
		projectId: functions.config().project.id,
		clientEmail: functions.config().client.email
	}),
	databaseURL: `https://${ functions.config().project.id }.firebaseio.com`
});

// Variables
const db = admin.firestore();
const constants = {
	OVH_VIDEO_ENDPOINT: functions.config().ovh.endpoint
};

export { admin, db, constants };