// Modules
const readline = require("readline");
const path = require("path");
const fs = require("fs");
const https = require("https");

// Constants
const ANIME_ENDPOINT = "https://api.jikan.moe/v3";
const CDN_ENDPOINT = "https://www.gizmo.moe/cdn/ramune";

// Variables
let showDir;
const map = {
    id: "",
    title: "",
    score: "",
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

function getSeasonEpisodes (title, seasonTitle) {
    return new Promise(async (res, _) => {

        const animeId = (await GET(encodeURI(`${ ANIME_ENDPOINT }/search/anime?q=${ title } ${ seasonTitle.match(/season 1/i) ? "" : seasonTitle.replace(/part 1/i, "") }`))).results[0].mal_id;

        // Dodging ratelimits
        setTimeout(async () => {
    
            const episodes = (await GET(`${ ANIME_ENDPOINT }/anime/${ animeId }/episodes`)).episodes;
    
            res(episodes);
    
        }, 2000);

    });
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Enter title: ", title => {

    map.title = title;

    rl.question("Enter score: ", score => {

        map.score = score;

        rl.question("Enter DB ID: ", id => {

            map.id = id;
            map.poster_url = `${ CDN_ENDPOINT }/${ map.id }/poster.png`;

            rl.question("Enter show directory path: ", _showDir => {

                showDir = _showDir;

                if (!fs.existsSync(showDir)) throw Error("Invalid directory");

                fs.readdirSync(showDir).forEach((seasonDir, index) => {

                    const seasonTitle = !seasonDir.match(/season/i) ? `Season ${ seasonDir }` : seasonDir;
                    const urlifiedSeasonName = seasonTitle.toLowerCase().replace(/\s/g, "-");
                
                    // Dodging ratelimits
                    setTimeout(async () => {
                        
                        const episodeList = (await getSeasonEpisodes(map.title, seasonTitle).catch(console.error)) || [];
                        const episodes = Array(episodeList.length);
                
                        fs.readdirSync(path.join(showDir, seasonDir)).forEach(episode => {
                
                            const episodeIndex = parseInt(episode);
                
                            episodes[episodeIndex - 1] = {
                                thumbnail_url: `${ CDN_ENDPOINT }/${ map.id }/${ urlifiedSeasonName }/${ episodeIndex }.png`,
                                title: episodeList?.[episodeIndex - 1]?.title
                            };
                
                        });
                
                        map.seasons.push({
                            title: seasonTitle,
                            episodes
                        });
                
                    }, index * 6000);
                
                });

            });

        });

    });

});

rl.on("close", () => {
    process.exit(0);
});

process.on("beforeExit", () => {

    console.log(map);

    if (showDir) {
        fs.writeFileSync(path.join(showDir, "data.json"), JSON.stringify(map, null, 2));
    }

});