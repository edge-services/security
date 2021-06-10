# FROM alpine:latest
# FROM node:12.22.1-alpine AS BUILD_IMAGE
# FROM balenalib/rpi-raspbian

FROM ubuntu:18.04

LABEL author="Gurvinder Singh <sinny777@gmail.com>"
LABEL profile="http://www.gurvinder.info"

USER root

RUN apt-get update && \
    apt-get -qy install curl ca-certificates apt-transport-https nano python make \
    build-essential cmake gcc g++ unzip pkg-config wget fswebcam \
    -y --no-install-recommends --fix-missing apt-utils netcat && rm -rf /var/lib/apt/lists/*

ENV NODE_VERSION=12.22.1
RUN apt install -y curl
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION} && \
    . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION} && \
    . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

WORKDIR /usr/src/app

ADD ./app ./

# RUN npm config set registry http://registry.npmjs.org
RUN npm install -g node-gyp && \
    npm install -g node-pre-gyp

# cp scripts/custom-binary.json node_modules/@tensorflow/tfjs-node/scripts

RUN chmod 755 /usr/src/app/setup.sh && \
    bash /usr/src/app/setup.sh
# RUN chmod 755 /usr/src/app/startup.sh
# RUN sudo usermod -a -G video developer

ENV PATH="$PATH:/opt/vc/bin"
RUN echo "/opt/vc/lib" > /etc/ld.so.conf.d/00-vcms.conf \
    && ldconfig
# ADD 00-vmcs.conf /etc/ld.so.conf.d/
# RUN ldconfig

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=3000

EXPOSE ${PORT}

# ENTRYPOINT ["/app/startup.sh"]
CMD ["node", "."]






