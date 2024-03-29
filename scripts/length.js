// Modules
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const readline = require("readline");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

async function extractData (file) {

	await ffprobe([
		"-v", "error",
		"-print_format", "json",
		"-show_format",
		"-show_chapters",
		"-show_streams",
		"-i", file
	])

	const data = {
		duration: 0
	};

	try {

		const res = JSON.parse((await ffprobe([
			"-v", "error",
			"-print_format", "json",
			"-show_format",
			"-show_chapters",
			"-show_streams",
			"-i", file
		])).toString());
	
		const duration = Number(res.streams?.[0]?.duration);
	
		if (!isNaN(duration)) {
			data.duration = Number(duration.toFixed(1));
		}
	
		if (res.chapters) {
			res.chapters.forEach(chapter => {
				if (chapter.tags.title === "OP" || chapter.tags.title === "Opening") {
					data.OP = chapter.start / 1000;
				} else if (chapter.tags.title === "ED" || chapter.tags.title === "Ending") {
					data.ED = chapter.start / 1000;
				}
			});
		}

	} catch (err) {
		console.error(err);
	}

	return data;
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

		ffprobeProcess.stdin.on("error", err => rej(err.toString()));
		ffprobeProcess.stdout.on("error", err => rej(err.toString()));
		ffprobeProcess.stderr.on("error", err => rej(err.toString()));
		ffprobeProcess.stderr.on("data", err => rej(err.toString()));

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

rl.question("Path to show.json: ", showDataPath => {

	const showData = require(showDataPath);

	rl.question("Path to show directory: ", async showDirectory => {
		rl.question("Do you want OP/ED timestamps? (Y\\n) ", async timestampChoice => {
			
			const seasonDirectory = path.resolve(showDirectory, "seasons");

			if (fs.existsSync(seasonDirectory)) {

				const seasons = fs
					.readdirSync(seasonDirectory, { withFileTypes: true })
					.filter(d => d.isDirectory())
					.map(d => d.name);

				const seasonPromises = [];

				seasons.forEach(season => {
					seasonPromises.push(async function () {

						const episodeDirectory = path.resolve(seasonDirectory, season, "episodes");
					
						if (fs.existsSync(episodeDirectory)) {

							const
								shouldSaveTimestamps = timestampChoice.toLowerCase() === "y" || timestampChoice.trim().length === 0;

							const
								episodeList = fs.readdirSync(episodeDirectory),
								_episodeData = {},
								episodePromises = [];

							episodeList.forEach(episodeFile => {

								const p = extractData(path.join(episodeDirectory, episodeFile, `${episodeFile}.mp4`));

								p.then(duration => {
									_episodeData[parseInt(episodeFile)] = duration;
								});

								episodePromises.push(p);
							});

							await Promise.all(episodePromises);

							for (const _episodeIndex in _episodeData) {
								showData.seasons.forEach((season, seasonIndex) => {
									season.episodes.forEach((episode, episodeIndex) => {
										if (episode.id === parseInt(_episodeIndex)) {

											const _ep = _episodeData[_episodeIndex];

											if (_ep.duration > 0) {
												episode.duration = _ep.duration;
											}

											if (shouldSaveTimestamps) {

												if ("OP" in _ep || "ED" in _ep) {
													episode.data.lyrics = [];
												}

												if ("OP" in _ep) {
													episode.data.lyrics.push({
														id: "op1",
														start: _ep.OP
													});
												}

												if ("ED" in _ep) {
													episode.data.lyrics.push({
														id: "ed1",
														start: _ep.ED
													});
												}

											}

											showData.seasons[seasonIndex].episodes[episodeIndex] = episode;
										}
									});
								});
							}
							
						}
					}());
				});

				await Promise.all(seasonPromises);

				console.log(showData.seasons);
				fs.writeFileSync(showDataPath, JSON.stringify(showData));
				process.exit(0);

			} else {
				console.error("Invalid show directory");
				process.exit(1);
			}
		});
	});

	// rl.question("Path to episode directory: ", async episodeDirectory => {
	// 	rl.question("Do you want OP/ED timestamps? (Y\\n) ", async timestampChoice => {

	// 		episodeDirectory = path.resolve(episodeDirectory);

	// 		const
	// 			shouldSaveTimestamps = timestampChoice.toLowerCase() === "y" || timestampChoice.trim().length === 0;

	// 		const
	// 			episodeList = fs.readdirSync(episodeDirectory),
	// 			_episodeData = {},
	// 			episodePromises = [];

	// 		episodeList.forEach(episodeFile => {

	// 			const p = extractData(path.join(episodeDirectory, episodeFile, `${episodeFile}.mp4`));

	// 			p.then(duration => {
	// 				_episodeData[parseInt(episodeFile)] = duration;
	// 			});

	// 			episodePromises.push(p);
	// 		});

	// 		await Promise.all(episodePromises);

	// 		for (const _episodeIndex in _episodeData) {
	// 			showData.seasons.forEach((season, seasonIndex) => {
	// 				season.episodes.forEach((episode, episodeIndex) => {
	// 					if (episode.id === parseInt(_episodeIndex)) {

	// 						const _ep = _episodeData[_episodeIndex];

	// 						if (_ep.duration > 0) {
	// 							episode.duration = _ep.duration;
	// 						}

	// 						if (shouldSaveTimestamps) {

	// 							if ("OP" in _ep || "ED" in _ep) {
	// 								episode.data.lyrics = [];
	// 							}

	// 							if ("OP" in _ep) {
	// 								episode.data.lyrics.push({
	// 									id: "op1",
	// 									start: _ep.OP
	// 								});
	// 							}

	// 							if ("ED" in _ep) {
	// 								episode.data.lyrics.push({
	// 									id: "ed1",
	// 									start: _ep.ED
	// 								});
	// 							}

	// 						}

	// 						showData.seasons[seasonIndex].episodes[episodeIndex] = episode;
	// 					}
	// 				});
	// 			});
	// 		}

	// 		console.log(showData.seasons[0].episodes);
	// 		fs.writeFileSync(showDataPath, JSON.stringify(showData));
	// 		process.exit(0);
	// 	});
	// });
});
