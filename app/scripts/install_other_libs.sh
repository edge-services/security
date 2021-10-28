#!/bin/bash

arch=`uname -m`
echo $arch
set -ex

# Installing Devtools
# if [[ ${TAG_SUFFIX} != "minimal" ]]; then
#   echo "Installing devtools"
#   apk add --no-cache --virtual devtools build-base linux-headers udev python python3
# else
#   echo "Skip installing devtools"
# fi

if [ ${arch} == 'aarch64' ]; then
    echo "ARM 64 Bit Architecture"
    npm install edge-sx127x

elif [ ${arch} == 'armv7l' ]; then
    echo "ARM 32 Bit Architecture"
    npm install edge-sx127x
elif [ ${arch} == 'x86_64' ]; then
    echo "DARWIN Architecture"
else
    echo "UNKONWN Architecture"
fi
