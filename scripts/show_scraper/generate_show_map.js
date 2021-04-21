// Modules
const readline = require("readline");
const path = require("path");
const fs = require("fs");
const https = require("https");

// Constants
const ANIME_ENDPOINT = "https://api.jikan.moe/v3";
const CDN_ENDPOINT = "https://ramune-cdn.gizmo.moe/";

// Variables
let showDir;
const map = {
    id: "",
    title: "",
	description: "",
    score: 0,
    poster_url: "",
    seasons: []
};

function GET (path) {
    return new Promise((res, rej) => {
        https.get(path, resp => {

            let data = "";

            resp.on("data", d => {
                data += d;
            });

            resp.on("end", () => {
                res(JSON.parse(data));
            });

            resp.on("error", rej);

        });
    });
}

async function getAnimeMalId (title, seasonTitle) {
	return (await GET(encodeURI(`${ ANIME_ENDPOINT }/search/anime?q=${ title } ${ seasonTitle && seasonTitle.match(/season 1/i) ? "" : seasonTitle.replace(/part 1/i, "") }`))).results[0].mal_id;
}

function getSeasonEpisodes (title, seasonTitle) {
    return new Promise(async (res, _) => {

        const animeId = await getAnimeMalId(title, seasonTitle);

        // Dodging ratelimits
        setTimeout(async () => {
    
            const episodes = (await GET(`${ ANIME_ENDPOINT }/anime/${ animeId }/episodes`)).episodes;
    
            res(episodes);
    
        }, 2000);

    });
}

function getAnimeInformation (animeId) {
	return GET(encodeURI(`${ ANIME_ENDPOINT }/search/anime/${ animeId }`));
}

function generateSeason (seasonDir, index) {
    return new Promise((res, _) => {

        const seasonTitle = !seasonDir.match(/season/i) ? `Season ${ seasonDir }` : seasonDir;
        const urlifiedSeasonName = seasonTitle.toLowerCase().replace(/\s/g, "-");
    
        // Dodging ratelimits
        setTimeout(async () => {
            
            const episodeList = (await getSeasonEpisodes(map.title, seasonTitle).catch(console.error)) || [];
            const episodes = Array(episodeList.length);
    
            fs.readdirSync(path.join(showDir, seasonDir)).forEach(episode => {
    
                const episodeIndex = parseInt(episode);
    
                episodes[episodeIndex - 1] = {
                    thumbnail: episodeIndex,
                    title: episodeList?.[episodeIndex - 1]?.title
                };
    
            });
    
            map.seasons.push({
                title: seasonTitle,
                episodes
            });
            
            console.log(`Finished '${ seasonTitle }'`);
            res();
    
        }, index * 6000);

    });
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Enter title: ", title => {

    map.title = title;

    rl.question("Enter score: ", score => {

        map.score = parseInt(score);

        rl.question("Enter DB ID: ", id => {

            map.id = id;
            map.poster = id;

			const malId = 0;

            rl.question("Enter show directory path: ", async _showDir => {

                const seasonPromises = [];

                showDir = _showDir;

                if (!fs.existsSync(showDir)) throw Error("Invalid directory");

                fs.readdirSync(showDir).forEach((seasonDir, index) => {

					if (index === 0) {
						getAnimeMalId(title).then(id => {
							malId = id;
						});
					}
					
                    seasonPromises.push(generateSeason(seasonDir, index + 1));        
                });

                await Promise.all(seasonPromises);

				setTimeout(async () => {
					
					const anime = await getAnimeInformation(malId);

					map.description = anime.synopsis.replace("[Written by MAL Rewrite]", "(Source: MyAnimeList)");

					fs.writeFileSync(path.join(showDir, "data.json"), JSON.stringify(map, null, 2));
                	rl.close();

				}, 3000);

            });

        });

    });

});

rl.on("close", () => {
    process.exit(0);
});