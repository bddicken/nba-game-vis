#!/bin/bash

DATA_ROOT_DIR="${1}"

PBP_FILES=$(find "${DATA_ROOT_DIR}" | grep 'playoff\|reg' | grep 'playbyplay')

#echo ${PBP_FILES}

for DATA_FILE in ${PBP_FILES}; do
    python process-data.py -i ${DATA_FILE} -s "SEASON"
done

