const show = require("./show.json");
const fs = require("fs");

let index = 1;

show.seasons.forEach((season, sindex) => {
	season.episodes.forEach((episode, eindex) => {
		show.seasons[sindex].episodes[eindex].id = index;
		index++;
	});
});

fs.writeFileSync("./show.json", JSON.stringify(show));