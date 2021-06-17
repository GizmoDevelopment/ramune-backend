import re
import requests
import time

CDN_ENDPOINT = "https://cdn.gizmo.moe/ramune"
JIKAN_ENDPOINT = "https://api.jikan.moe/v3"

show = {
	"id": "",
	"title": "",
	"description": "",
	"seasons": []
}

show["title"] = input("Enter show title: ")
show["id"] = re.sub(r'\s', "_", show["title"]).lower()

mal_id_list = input("Enter MAL ID(s): ").split(",")

for index, mal_id in enumerate(mal_id_list):

	season = {
		"id": index,
		"episodes": []
	}

	# Fetch season information
	mal_response = requests.get(JIKAN_ENDPOINT + "/anime/" + mal_id)
	mal_response = mal_response.json()

	# Only list first season's description
	if mal_id_list.index(mal_id) == 0:
		show["description"] = mal_response["synopsis"].replace("[Written by MAL Rewrite]", "(Source: MyAnimeList)")

	time.sleep(2)

	# Fetch season episode list
	mal_response = requests.get(JIKAN_ENDPOINT + "/anime/" + mal_id + "/episodes")
	mal_response = mal_response.json()
	mal_anime_episodes = mal_response["episodes"]

	# Create episodes
	for index, mal_anime_episode in enumerate(mal_anime_episodes):
		season["episodes"].append({
			"id": index,
			"title": mal_anime_episode["title"],
			"subtitles": [ "en", "ja" ],
			"data": {}
		})

	show["seasons"].append(season)

	print("Finished Season " + str(index + 1))

print("Finished " + show["title"])
print(show)
