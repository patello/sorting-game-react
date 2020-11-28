FROM node:current-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY . /sorting-game-react

WORKDIR /sorting-game-react/
RUN npm install && \
    npm run build

EXPOSE 3000
WORKDIR /
ADD docker-start.sh /
RUN chmod +x /docker-start.sh

CMD ["/docker-start.sh"]