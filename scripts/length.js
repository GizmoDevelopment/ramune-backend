// Modules
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const readline = require("readline");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

async function extractDuration (file) {

	const res = JSON.parse((await ffprobe([
		"-v", "error",
		"-print_format", "json",
		"-show_format",
		"-show_streams",
		"-i", file
	])).toString());

	const number = Number(res.streams?.[0]?.duration);

	if (isNaN(number)) {
		return 0;
	} else {
		return Number(number.toFixed(1));
	}
}

//const matched = stdout.match(/duration="?(\d*\.\d*)"?/)
//if (matched && matched[1]) return parseFloat(matched[1])

function ffprobe (args, options = {}) {
	return new Promise((res, rej) => {
		
		const output = [];
		
		// Spawn FFprobe
		const ffprobeProcess = spawn("ffprobe", args, { shell: true });
		
		ffprobeProcess.on("close", code => {
			if (code > 0) {
				rej(new Error("Couldn't start FFprobe process"));
			}
		});

		ffprobeProcess.stdin.on("error", rej);
		ffprobeProcess.stdout.on("error", rej);
		
		ffprobeProcess.stdout.on("data", data => {
			
			output.push(data);
			
			if (typeof options?.output === "function") {
				const resp = options.output(data);
				if (resp === false) ffprobeProcess.kill("SIGTERM");
			}
			
		});
		
		ffprobeProcess.stdout.on("end", () => {
			res(Buffer.concat(output));
		});
		
	});
}

process.on("uncaughtException", err => {
	console.error(err);
	process.exit(1);
});

process.on("unhandledRejection", err => {
	console.error(err);
	process.exit(1);
});

rl.question("Path to episode directory: ", async episodeDirectory => {

	const
		episodeList = fs.readdirSync(episodeDirectory),
		episodes = {},
		episodePromises = [];

	episodeList.forEach(episodeFile => {

		const p = extractDuration(path.join(episodeDirectory, episodeFile, `${episodeFile}.mp4`));

		p.then(duration => {
			episodes[parseInt(episodeFile)] = duration;
		});

		episodePromises.push(p);
	});
	
	await Promise.all(episodePromises);

	console.log(episodes);
	process.exit(0);
});