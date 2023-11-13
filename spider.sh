#!/bin/bash

rm -f ./data/*
mysql -h192.168.1.20 -u******** -p******* pricefiles -e "select PartNumber from pol_part" > ./data/parts
cd ./data
split -l 2 parts
cd ..
rm -f ./data/parts
for f in $(ls -1 ./data/); do
    echo "start process ./data/$f"
    node ./polspider.js --disable-fitment --scan-file=./data/$f &
done