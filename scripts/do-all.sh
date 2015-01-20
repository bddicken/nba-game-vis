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
${SCRIPT_DIR}/process-all-data.sh "${SCRIPT_DIR}/download" > data_file.txt

echo "Setting up postgres data..."
${SCRIPT_DIR}/setup-postgres-db.sh data_file.txt

echo "DONE!"

