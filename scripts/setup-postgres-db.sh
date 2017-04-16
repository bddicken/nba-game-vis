#!/bin/bash

#
# Script to setup database
#

# We want the script to fail on any error
#set -o errexit
set -o nounset

# get data load file from command line
DATA_DIR="${1}"
#PLAYERS_FILE="${2}"

# Some variables
PWD=$(pwd)
SCRIPT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
DB_DIR="nbadb"
DB="nba"
SCHEMA_SQL_FILE="${SCRIPT_DIR}/resources/schema.sql"
LOAD_DATA_SQL_FILE="${SCRIPT_DIR}/resources/load_data.sql"

# First, kill any existing postgres processes
killall postgres || true
rm -rf "${DB_DIR}" || true

# Create the db
initdb -D "${DB_DIR}"

# Start up the db (run in background)
postgres -D "${DB_DIR}" &

# sleep to wait for PG to finish starting up, kinda a hack
sleep 3s

# Create the database
createdb "${DB}"

# Initialize schema
psql -d "${DB}" -f "${SCHEMA_SQL_FILE}"

# Load data
echo "${DATA_DIR}" 
echo "${SCRIPT_DIR}/resources/load_data.sql"

TEMP_LOAD_FILE=$(mktemp)
cp "${LOAD_DATA_SQL_FILE}" ${TEMP_LOAD_FILE} 
echo "Temporary load file = ${TEMP_LOAD_FILE}"


#PBP_FILE=$(realpath "${DATA_DIR}/pbp.txt")
PBP_FILE=$(realpath "${DATA_DIR}/gameEvents.txt")
PBP_FILE=$(echo "${PBP_FILE}" | sed -e 's/[\/&]/\\&/g')

PLAYERS_FILE=$(realpath "${DATA_DIR}/players.txt")
PLAYERS_FILE=$(echo "${PLAYERS_FILE}" | sed -e 's/[\/&]/\\&/g')

sed -i -e "s/PBP_FILE_NAME/${PBP_FILE}/g" "${TEMP_LOAD_FILE}"
sed -i -e "s/PLAYERS_FILE_NAME/${PLAYERS_FILE}/g" "${TEMP_LOAD_FILE}"

psql -d "${DB}" -f "${TEMP_LOAD_FILE}"

#rm "${TEMP_LOAD_FILE}"

echo "DONE!"

