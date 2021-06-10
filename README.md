
## Steps to publish Security service on horizon hub

docker buildx ls
docker buildx create --use --name=qemu
<!-- docker buildx create --name remote --append ssh://ubuntu@192.168.1.6 -->
docker buildx inspect --bootstrap

<!-- docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t ${DOCKER_IMAGE_BASE}_$ARCH:$SERVICE_VERSION --push . -->
<!-- docker buildx build --platform linux/amd64,linux/arm64 -t ${DOCKER_IMAGE_BASE}_$ARCH:$SERVICE_VERSION --push . -->


sudo docker buildx build \
  --push -t sinny777/security:0.0.1 \
  --platform=linux/amd64,linux/arm64,linux/arm/v7 .

sudo docker buildx build \
  --push -t sinny777/security:0.0.1 \
  --platform=linux/amd64,linux/arm64,linux/arm/v7 .

sudo docker buildx build \
  --push -t sinny777/security_arm:0.0.1 \
  --platform=linux/arm/v7 .

sudo docker buildx build \
  --push -t sinny777/security_arm64:0.0.1 \
  --platform=linux/arm64 .

sudo docker run -it --name security \
--privileged \
-p 3000:3000 --env-file .env \
--mount type=bind,source="/Users/gurvindersingh/Documents/Development/data/ml/models/fire_classification",target=/tmp \
sinny777/security:0.0.1 /bin/bash

docker run -it --name security \
-p 3000:3000 --env-file .env \
-v /opt/vc/bin:/opt/vc/bin \
-v /opt/vc/lib:/opt/vc/lib \
--device /dev/vchiq \
--mount type=bind,source=/usr/share,target=/usr/share \
--privileged \
sinny777/security_arm64:0.0.1

export DOCKER_HUB_ID="<dockerhubid>"
echo "P@ssw0rd" | docker login -u $DOCKER_HUB_ID --password-stdin

hzn dev service new -s security -V 0.0.1 -i $DOCKER_HUB_ID/security --noImageGen


$ eval $(hzn util configconv -f horizon/hzn.json)
$ export ARCH=$(hzn architecture)
$ hzn exchange service publish -f horizon/service.definition.json


TFJS_NODE_CDN_STORAGE="https://storage.googleapis.com/" npm install @tensorflow/tfjs-node-gpu
https://s3.us.cloud-object-storage.appdomain.cloud/tfjs-cos/libtensorflow-cpu-linux-arm-1.7.4.tar.gz


## References

- [Ubuntu + Tensorflow + RaspberryPi 4](https://qengineering.eu/install-ubuntu-18.04-on-raspberry-pi-4.html)
- [Running AI in NodeJS](https://developer.ibm.com/technologies/artificial-intelligence/tutorials/environments-for-running-ai-in-nodejs/)
- [Build for ARM](https://www.tensorflow.org/lite/guide/build_arm)
