// Modules
const fs = require("fs");
const readline = require("readline");
const admin = require("firebase-admin");

// Variables
const serviceAccount = require(process.env.SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${ serviceAccount.project_id }.firebaseio.com`
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Enter data.json path: ", dataFile => {

    if (!fs.existsSync(dataFile)) throw Error("Generated data.json not found");

    const data = require(dataFile);

    if (!data.id) throw Error("Show has no ID");

    admin
        .firestore()
        .collection("shows")
        .doc(data.id)
        .set(data).then(() => {
            console.log("Done!");
            process.exit(0);
        }).catch(err => {
            throw Error(err);
        });

});

rl.on("close", () => {
    process.exit(0);
});