#!/bin/sh

echo "Show name: "
read NAME

echo "Season count: "
read SEASON_COUNT

mkdir $NAME
cd $NAME

mkdir seasons
cd seasons

for ((SEASON_INDEX=1; i<=$SEASON_COUNT; i++)); do
	mkdir $SEASON_INDEX
	cd $SEASON_INDEX
	mkdir episodes
	cd ../
done