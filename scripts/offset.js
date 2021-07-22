// Modules
const fs = require("fs");
const readline = require("readline");

function convertTimestampToSeconds (timestamp) {

	let time = 0;

	timestamp.split(":").reverse().forEach((num, index) => {

		const _num = Number(num);

		if (!isNaN(_num)) {
			time += _num * Math.pow(60, index);
		}
	});

	return time;
}

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.question("Enter path to *.lrc file: ", pathToLRCFile => {

	if (!fs.existsSync(pathToLRCFile)) throw Error("File not found");

	let lyrics = fs.readFileSync(pathToLRCFile, {
		encoding: "utf-8"
	});

	rl.question("Enter offset amount in seconds: ", offsetInSeconds => {

		offsetInSeconds = Number(offsetInSeconds);

		if (isNaN(offsetInSeconds)) throw Error("Invalid number");

		lyrics.split("\n").forEach(line => {

			const [ , lineName, lineValue ] = line.match(/\[(.*?):(.*?)\]/) || [];

			if (!isNaN(Number(lineName))) {

				const
					timestamp = `${lineName}:${lineValue}`,
					timestampInSeconds = convertTimestampToSeconds(timestamp),
					offsetTimestamp = new Date((timestampInSeconds + offsetInSeconds) * 1000).toISOString().substr(14, 9).replace(/0+$/, "");

				if (isNaN(offsetInSeconds)) throw Error("Invalid offset calculation");

				lyrics = lyrics.replace(timestamp, offsetTimestamp);
			}
		});

		fs.writeFileSync(pathToLRCFile, lyrics);
		console.log("Done!");
		rl.close();
	});

});

rl.on("close", () => {
	process.exit(0);
});