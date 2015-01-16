#!/bin/bash -x

#
# Script to setup database
#

# We want the script to fail on any error
#set -o errexit
set -o nounset

# Some variables
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
psql -d "${DB}" -f "${LOAD_DATA_SQL_FILE}"

echo "DONE!"

