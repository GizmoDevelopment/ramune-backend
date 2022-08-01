#!/bin/bash

read -p "Episode directory: " -r EP_DIR

if ! [[ -d "$EP_DIR" ]]; then
    echo "Invalid directory path"
	exit 1
fi

cd "$EP_DIR"

read -p "Video Track ID: " VIDEO_TRACK
read -p "Audio Track ID: " AUDIO_TRACK
read -p "Subtitle Track ID: " SUBTITLE_TRACK

mkdir "./show"

let INDEX=1

for FILE in ./*.mkv; do

	mkdir "./show/${INDEX}"
	mkdir "./show/${INDEX}/subtitles"

	# Dump subtitles
	ffmpeg \
		-hwaccel cuda -y \
		-i "${FILE}" \
		-map 0:s:${SUBTITLE_TRACK} \
		"./show/${INDEX}/subtitles/en.ass"

	# Re-encode
	#ffmpeg \
	#	-hwaccel cuda -y \
	#	-i "$FILE" \
	#	-preset ultrafast
	#	-pix_fmt yuv420p \
	#	-map 0:0 -map 0:a:$AUDIO_TRACK \
	#	-c:v libx264 -c:a copy \
	#	"encoded_$INDEX.mp4"

    # Take the re-encoded video and hardcode the subtitles
	#ffmpeg \
	#	-hwaccel cuda -y \
	#	-i "encoded_$INDEX.mp4" \
	#	-preset ultrafast \
	#	-vf subtitles="'$FILE':stream_index=$SUBTITLE_TRACK" \
	#	"./episodes/$INDEX.mp4"

    # Remove leftovers
	#rm "encoded_$INDEX.mp4"

	# Pass-thru video & re-encode audio
	ffmpeg \
		-i "${FILE}" \
		-preset slower \
		-map 0:v:0 \
		-map 0:a:${AUDIO_TRACK} \
		-c:v copy -c:a aac \
		-movflags +faststart \
		"./show/${INDEX}/${INDEX}.mp4"

	# ffmpeg -i "" -preset slower -map 0:v:0 -map 0:a:2 -c:v copy -c:a aac -movflags +faststart ""
	# ffmpeg -i "[OZR] Code Geass Lelouch of the Rebellion R2 - 03 (BDrip 1920x1080 x264 FLAC) [Dual-Audio].mkv" -preset slower -map 0:v:0 -map 0:a:2 -c:v copy -c:a aac -movflags +faststart "3.mp4"

	let INDEX++
done

#ffmpeg -i "$FILE" -map 0:0 -map 0:1 -map 0:2 -c copy "./episodes/$INDEX.mp4"

# Multi audio tracks
#ffmpeg -i "$FILE" -map 0:0 -map 1:a:0 -c copy "./episodes/$INDEX.mp4"

# Single audio track
#ffmpeg -i "$FILE" -pix_fmt yuv420p -map 0:0 -map 0:2 -c:v libx264 -c:a copy "./episodes/$INDEX.mp4"

# Single audio track + hardsub
#ffmpeg -i "$FILE" -preset ulrafast -pix_fmt yuv420p -map 0:0 -map 0:2 -vf subtitles="$FILE" -c:v libx264 -c:a copy "./episodes/$INDEX.mp4"

# Re-encode and hardsub
#ffmpeg -hwaccel cuda -i "1.mkv" -preset ultrafast -pix_fmt yuv420p -vf subtitles="./subtitles/$INDEX.srt" -map 0:0 -map 0:a:1 -c:v libx264 -c:a copy "./episodes/1.mp4"

# Any other
#ffmpeg -i "$FILE" -c copy "./episodes/$INDEX.mp4"

# Extract subtitles
#ffmpeg -hwaccel cuda -i "$FILE" -map 0:s:0 -f webvtt "./subtitles/$INDEX.vtt"

# Re-encode
#ffmpeg -hwaccel cuda -i "$FILE" -preset ultrafast -vf subtitles="$FILE" -pix_fmt yuv420p -map 0:0 -map 0:a:1 -map 0:s:1 -c:v libx264 -c:a copy "./episodes/$INDEX.mp4"

#ffmpeg -hwaccel cuda -i "1.mkv" -map 0:s:1 "./subtitles/1.srt"

#ffmpeg -hwaccel cuda -i "1.mkv" -preset ultrafast -pix_fmt yuv420p -map 0:v:0 -map 0:a:1 -map 0:s:0 -vf subtitles="1.mkv" -c:v libx264 -c:a copy -c:s copy "./episodes/1.mp4"

# Re-encode
# ffmpeg -hwaccel cuda -i "1.mkv" -preset ultrafast -pix_fmt yuv420p -map 0:0 -map 0:a:1 -c:v libx264 -c:a copy "./episodes/1.mp4"

#ffmpeg -hwaccel cuda -i "1.mkv" -preset ultrafast -vf subtitles="1.mkv" -pix_fmt yuv420p -map 0:0 -map 0:a:1 -map 0:s:1 -c:v libx264 -c:a copy "./episodes/XD.mp4"

# Map only the needed subtitles and then hardcode them (god why do I have to do it like this)

# let PATH="d:/Anime/Higurashi no Naku Koro ni/Higurashi/Higurashi no Naku Koro ni"; for FILE in "d:/Anime/Higurashi no Naku Koro ni/Higurashi/Higurashi no Naku Koro ni/*.mkv"; do ffmpeg -hwaccel cuvid -i "d:/Anime/Higurashi no Naku Koro ni/Higurashi/Higurashi no Naku Koro ni/$FILE" "$FILE.vtt"; done