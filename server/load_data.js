// load_data.js
//
// Load tab delimited data into mongodb
//

var mongoose    = require('mongoose');

var Player      = require('./app/models/player');
var GameEvent   = require('./app/models/gameEvent');
var Season      = require('./app/models/season');
var Team        = require('./app/models/team');
var Game        = require('./app/models/game');

var program     = require('commander');
var csv         = require("fast-csv");
var fs          = require('fs');
var readline    = require('readline');

var dbConnectString = 'mongodb://localhost/nbadb';
mongoose.connect(dbConnectString); 

program
  .version('0.0.1')
  .option('-e, --gameEvents <fileName>', 'gameEvents')
  .option('-p, --players <fileName>',   'players')
  .option('-g, --games <fileName>',     'games')
  .option('-s, --seasons <fileName>',   'seasons')
  .option('-t, --teams <fileName>',     'teams')
  .parse(process.argv);

console.log('event file:');
if (
    !program.gameEvents ||
    !program.players    ||
    !program.games      ||
    !program.seasons    ||
    !program.teams
   ) {
    console.log("must specify all arguments.");
}

gameEventCount = 0;
playerCount = 0;

var playerIO = readline.createInterface({
    input: fs.createReadStream(program.players),
    output: process.stdout,
    terminal: false
});

playerIO.on('close', function(line) {
    console.log("Done processing players."); 
});

playerIO.on('line', function(line) {
    raw = JSON.parse(line);

    var playerID = raw.playerID;
    var name     = raw.name;
    var fullName = raw.trueName;
    
    //console.log("trying to create new player");

    var player = new Player(); 
    player.name = name;
    player.fullName = fullName;
    player.age = 0;

    player.save(function(err) {
        if (err) { console.log('FAILED -> ' + err); }
        else { 
            //console.log((playerCount++) + " player created."); 
        }
    });
});

var gameIO = readline.createInterface({
    input: fs.createReadStream(program.games),
    output: process.stdout,
    terminal: false
});

gameIO.on('close', function(line) {
    console.log("Done processing games."); 
});

gameIO.on('line', function(line) {
    raw = JSON.parse(line);

    var game = new Game(); 
    
    game.name       = raw.name;
    game.season     = raw.season;
    game.homeTeam   = raw.homeTeam;
    game.awayTeam   = raw.awayTeam;
    game.date       = raw.date;
    game.id         = raw.id;

    game.save(function(err) {
        if (err) { console.log('FAILED -> ' + err); }
        else { 
            //console.log((playerCount++) + " game created."); 
        }
    });
});

var teamIO = readline.createInterface({
    input: fs.createReadStream(program.teams),
    output: process.stdout,
    terminal: false
});

teamIO.on('close', function(line) {
    console.log("Done processing teams."); 
});

teamIO.on('line', function(line) {
    raw = JSON.parse(line);

    var team = new Team(); 
    
    team.name        = raw.name;
    team.id          = raw.id;

    team.save(function(err) {
        if (err) { console.log('FAILED -> ' + err); }
        else { 
            //console.log((playerCount++) + " team created."); 
        }
    });
});

var seasonIO = readline.createInterface({
    input: fs.createReadStream(program.seasons),
    output: process.stdout,
    terminal: false
});

seasonIO.on('close', function(line) {
    console.log("Done processing seasons."); 
});

seasonIO.on('line', function(line) {
    raw = JSON.parse(line);

    var season = new Season(); 
    
    season.name        = raw.name;
    season.id          = raw.id;

    season.save(function(err) {
        if (err) { console.log('FAILED -> ' + err); }
        else { 
            //console.log((playerCount++) + " season created."); 
        }
    });
});

var gameEventIO = readline.createInterface({
    input: fs.createReadStream(program.gameEvents),
    output: process.stdout,
    terminal: false
});

gameEventIO.on('close', function(line) {
    console.log("Done processing gameEvents."); 
});

gameEventIO.on('line', function(line) {
    raw = JSON.parse(line);
    
    var pbpCount = 0;

    var mongoPlayerID;
    var gameID      = raw.gameID;
    var seqID       = raw.seqID;
    var season      = raw.season;
    var time        = raw.time;
    var teamID      = raw.teamID;
    var playerName  = raw.playerName;
    var playerID    = raw.playerID;
    var eventType   = raw.eventType;
    var eventDetail = raw.eventDetail;
    
    // process time
    time = time.replace(/:/g, "");
    mins = Math.floor(time / 100);
    secs = Math.floor(time % 100);
    timeInSecs = mins*60 + secs;

    //console.log("trying to create new game event " + gameEventCount++);

    var gameEvent = new GameEvent(); 
    gameEvent.team              = teamID; 
    gameEvent.season            = season; 
    gameEvent.gameID            = gameID;
    gameEvent.player            = playerName;
    gameEvent.playerID          = mongoPlayerID;
    gameEvent.eventType         = eventType;
    gameEvent.eventDetail       = eventDetail;
    gameEvent.secondsIntoGame   = timeInSecs;

    gameEvent.save(function(err) {
        if (err) { console.log('FAILED -> ' + err); }
        else { 
            //console.log((pbpCount++) + " pbp event created."); 
        }
    });
});

    
/*

var processSeasons = function(data) {
    console.log("seasons")
}

var processGames = function(data) {
    console.log("games")
}

var processTeams = function(data) {
    console.log("teams")
}

var processPlayers = function(data) {

    return;

    var playerID = data[0];
    var name     = data[1];
    var fullName = data[2];
    
    //console.log("trying to create new player");

    var player = new Player(); 
    player.name = name;
    player.fullName = fullName;
    player.age = 0;

    playerMap[playerID] = player;

    player.save(function(err) {
        if (err) { console.log('FAILED -> ' + err); }
        else { 
            console.log((playerCount++) + " player created."); 
        }
    });
}

var exit = function() {
    process.exit(code=0);
}


var processAllData = function(data) {
        console.log('loaging3')
    processSeasons(data.seasons);
    processGames(data.games);
    processPlayers(data.players);
    processTeams(data.teams);
    processGameEvents(data.gameEvents);
    exit();
}

var nbaData = JSON.parse(fs.readFileSync(program.dataFile, 'utf8'));

processAllData(nbaData);
*/

