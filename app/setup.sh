#!/bin/sh

arch=`uname -m`
echo $arch

npm install

# rm -rf node_modules package-lock.json
# npm install --only=production
# rm -rf src

if [ ${arch} == 'aarch64' ]; then
    echo "ARM 64 Bit Architecture"
    echo '{' >> 'custom-binary.json' && \
    echo '"tf-lib": "https://gurvsin3-visualrecognition.s3.jp-tok.cloud-object-storage.appdomain.cloud/libtensorflow_arm64.tar.gz"'  >> 'custom-binary.json' && \
    echo '}' >> 'custom-binary.json'
    cp custom-binary.json node_modules/@tensorflow/tfjs-node/scripts/
    chmod 755 node_modules/@tensorflow/tfjs-node/scripts/custom-binary.json

elif [ ${arch} == 'armv7l' ]; then
    echo "ARM 32 Bit Architecture"
    npm uninstall --save @tensorflow/tfjs-node
    npm install --save @tensorflow/tfjs-node@2.6.0

    echo 'SUBSYSTEM=="vchiq",MODE="0666"' >> 99-camera.rules
    cp 99-camera.rules /etc/udev/rules.d/

elif [ ${arch} == 'x86_64' ]; then
    echo "DARWIN Architecture"
else
    echo "UNKONWN Architecture"
fi

npm rebuild @tensorflow/tfjs-node --build-from-source

npm install edge-sx127x
npm run build