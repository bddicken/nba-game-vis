#!/bin/bash
#
# Download/Process all data
#

set -o errexit
set -o nounset

SCRIPT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

echo "Downloading all data..."
${SCRIPT_DIR}/fetch-nba-data.sh

echo "Processing all data..."
mkdir "${SCRIPT_DIR}/nbaout"
python process-data.py -i "${SCRIPT_DIR}/download/" -o "${SCRIPT_DIR}/nbaout" -s "${SCRIPT_DIR}/nbascratch"

echo "Setting up postgres data..."
${SCRIPT_DIR}/setup-postgres-db.sh "${SCRIPT_DIR}/nbaout"

echo "DONE!"

