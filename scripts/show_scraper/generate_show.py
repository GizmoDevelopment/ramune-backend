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

	mal_anime_endpoint = f"{JIKAN_ENDPOINT}/anime/{mal_id}"

	# Fetch season information
	mal_response_season = requests.get(mal_anime_endpoint)
	mal_response_season = mal_response_season.json()["data"]

	# Only list first season's description
	if mal_id_list.index(mal_id) == 0:
		show["description"] = mal_response_season["synopsis"].replace("[Written by MAL Rewrite]", "(Source: MyAnimeList)")

	# Avoid ratelimits
	time.sleep(3)

	# Fetch season episode list
	mal_response_episodes = requests.get(f"{mal_anime_endpoint}/episodes")
	mal_response_episodes = mal_response_episodes.json()
	
	episodes = []
	
	episodes.extend(mal_response_episodes["data"])

	if "pagination" in mal_response_episodes:

		last_page_number = mal_response_episodes["pagination"]["last_visible_page"]

		if last_page_number > 1:
			for page_number in range(2, last_page_number + 1):

				# Avoid ratelimits
				time.sleep(3)

				mal_response_episodes_page = requests.get(f"{mal_anime_endpoint}/episodes?page={page_number}")
				mal_response_episodes_page = mal_response_episodes_page.json()

				episodes.extend(mal_response_episodes_page["data"])

	# Create episodes
	for _, mal_anime_episode in enumerate(episodes):

		season["episodes"].append({
			"id": episode_id,
			"title": mal_anime_episode["title"],
			"subtitles": [ "en" ],
			"duration": 0,
			"data": {}
		})

		episode_id += 1

	show["seasons"].append(season)

	print("Finished Season #%i (ID: %s)" % (season_index + 1, mal_id))

file = open("show.json", "w")
file.write(json.dumps(show))
file.close()

print("Finished " + show["title"])
print(show)
