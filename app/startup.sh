#!/bin/sh

FILE=assets/model/saved_model.pb
if test -f "$FILE"; then
    echo "$FILE exists."
else
    wget https://gurvsin3-visualrecognition.s3.jp-tok.cloud-object-storage.appdomain.cloud/model.tgz \
    -O assets/model.tgz
    cd assets
    tar -xf model.tgz
    echo "AI MODEL DOWNLOADED..." 
fi

cd ..
npm start
