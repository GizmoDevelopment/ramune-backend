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

rl.question("Enter path to *.json file: ", dataFile => {

    if (!fs.existsSync(dataFile)) throw Error("Generated show file not found");

    const data = require(dataFile);

    if (!data.id) throw Error("Show has no ID");

	const content = data;

	delete content.id;

    admin
        .firestore()
        .collection("shows")
        .doc(data.id)
        .set(content).then(res => {
            console.log(res);
            process.exit(0);
        }).catch(err => {
            throw Error(err);
        });

});

rl.on("close", () => {
    process.exit(0);
});