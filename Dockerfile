FROM node:current-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN git clone --branch master https://github.com/patello/sorting-game-react.git

WORKDIR /sorting-game-react/
RUN npm install && \
    npm build

EXPOSE 3000
WORKDIR /
ADD docker-start.sh /
RUN chmod +x /docker-start.sh

CMD ["/docker-start.sh"]