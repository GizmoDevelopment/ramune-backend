import re
import requests
import time
import json

CDN_ENDPOINT = "https://cdn.gizmo.moe/ramune"
JIKAN_ENDPOINT = "https://api.jikan.moe/v4"

show = {
	"id": "",
	"title": "",
	"description": "",
	"seasons": []
}

show["title"] = input("Enter show title: ")

show_title_no_special_symbols = re.sub(r'[^\w]', "_", show["title"]).lower()
show_title_no_duplicate_underscores = re.sub(r'_{2,}', "_", show_title_no_special_symbols)

show["id"] = show_title_no_duplicate_underscores

mal_id_list = input("Enter MAL ID(s): ").split(",")

episode_id = 1

for season_index, mal_id in enumerate(mal_id_list):

	season = {
		"id": season_index + 1,
		"episodes": []
	}

	# Fetch season information
	mal_response_season = requests.get(JIKAN_ENDPOINT + "/anime/" + mal_id)
	mal_response_season = mal_response_season.json()["data"]

	# Only list first season's description
	if mal_id_list.index(mal_id) == 0:
		show["description"] = mal_response_season["synopsis"].replace("[Written by MAL Rewrite]", "(Source: MyAnimeList)")

	# Avoid ratelimits
	time.sleep(3)

	# Fetch season episode list
	mal_response_episodes = requests.get(JIKAN_ENDPOINT + "/anime/" + mal_id + "/episodes")
	mal_response_episodes = mal_response_episodes.json()["data"]

	# Create episodes
	for _, mal_anime_episode in enumerate(mal_response_episodes):

		season["episodes"].append({
			"id": episode_id,
			"title": mal_anime_episode["title"],
			"subtitles": [ "en", "ja" ],
			"duration": 0,
			"data": {}
		})

		episode_id += 1

	show["seasons"].append(season)

	print("Finished Season " + str(index + 1))

file = open("show.json", "x")
file.write(json.dumps(show))
file.close()

print("Finished " + show["title"])
print(show)
