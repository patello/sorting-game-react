#!/bin/bash

export LC_ALL=C.UTF-8
export LANG=C.UTF-8
cd /sorting-game-reinforcement-learning
flask run &
cd /sorting-game-react
npm start 