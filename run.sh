#!/bin/bash

export RUNDIR="/usr/src/westapi"

cd $RUNDIR

./node_modules/.bin/forever start -c "node_modules/.bin/ts-node ./src/server.ts" ./
./node_modules/.bin/forever --fifo logs 0