
# NBA Data Vis

NBA game data visualizer.

## Server

Code to setup and run the server.
TODO: add more details here.

## Clients

Various clients that connect to the server.
TODO: add more details here.

## Scripts

The scripts directory contains several shell and python scripts for downloading and processing the NBA data.


* `fetch-nba-data.sh` Is responsible for downloading and organizing the data from the web.
* `process-data.py` Does post-processing on the downloaded data, making it more friendly to use in an application
* `setup-postgres-db.sh` Was written to load the post-processed data into a postgres database.
  WARNING: I was going to make the server get the info from a postgres DB, but later changed my mind to use mongodb.
  This script does NOT NEED TO BE USED.
* `do-all.sh` Runs all of the above, in sequence.

