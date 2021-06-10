#!/bin/sh

FILE=assets/model/saved_model.pb
if test -f "$FILE"; then
    echo "$FILE exists."
else
    wget https://gurvsin3-visualrecognition.s3.jp-tok.cloud-object-storage.appdomain.cloud/model_dir.tar.gz \
    -O assets/model.tar.gz
    cd assets
    tar -xf model.tar.gz
    echo "AI MODEL DOWNLOADED..." 
fi

cd ..
npm start
