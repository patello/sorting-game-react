FROM node:current-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    python3 \
    python3-pip \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN git clone --branch feature/server https://github.com/patello/sorting-game-reinforcement-learning.git && \
    git clone --branch feature/ai-helper https://github.com/patello/sorting-game-react.git

WORKDIR /sorting-game-reinforcement-learning/

RUN pip3 install --upgrade setuptools && \
    pip3 install --no-cache-dir -r requirements.txt

WORKDIR /sorting-game-react/
RUN npm install

EXPOSE 3000
WORKDIR /
ADD docker-start.sh /
RUN chmod +x /docker-start.sh

CMD ["/docker-start.sh"]