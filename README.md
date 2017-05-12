
# NBA Data Vis

This repository contains the code for the NBA game data visualizer project.
The repository contains several main sub-directories, each of which is described below:


## Server

The `server/` directory contains code to setup, load data into, and run the server.
The server serves NBA player/season/play-by-play data in various forms to potentially multiple clients.
To run the server, run:

```
nodejs server.js
```

Make sure you node 6 or greater.

Before you start up the server, you'll want to make sure that the server database is populated with NBA data.
You should use the `load_data.js` script to load the data into the database.
The data itself can be fetched and post-processed using the scripts in the `scripts/` directory.
See the related section below.


## Clients

This directory contains multiple different clients that utilize the data served by the server.
At the moment, there are two clients:

### dev-sandbox

As the name suggests, this client was developed as a sandbox to experiment with ways that the data from the server can be fetched and visualized.
To use the client, just run a standard http web server from `clients/dev-sandbox`.

### ballers

This client uses TSN-e plotting algorithms to plot the similarity between NBA players based on their statistics curves throughout the time of a game.
To use the client, just run a standard http web server from `clients/dev-sandbox`.


## Scripts

The scripts directory contains several shell and python scripts for downloading and processing the NBA data.

* `fetch-nba-data.sh` Is responsible for downloading and organizing the data from the web.
* `process-data.py` Does post-processing on the downloaded data, making it more friendly to use in an application
* `setup-postgres-db.sh` Was written to load the post-processed data into a postgres database.
  WARNING: I was going to make the server get the info from a postgres DB, but later changed my mind to use mongodb.
  This script does NOT NEED TO BE USED.
* `do-all.sh` Runs all of the above, in sequence.

