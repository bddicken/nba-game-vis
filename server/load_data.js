// load_data.js
//
// Load tab delimited data into mongodb
//

var mongoose   = require('mongoose');
var Player     = require('./app/models/player');
var GameEvent  = require('./app/models/gameEvent');
var program    = require('commander');
var csv        = require("fast-csv");
var fs         = require('fs');
var readline   = require('readline');

program
  .version('0.0.1')
  .option('-e, --gameEvents <fileName>', 'gameEvents')
  .option('-p, --players <fileName>', 'players')
  .option('-d, --dataFile <fileName>', 'File with nba data, processed by process-all.py')
  .parse(process.argv);

console.log('event file:');
//if (!program.dataFile) {
if (!program.gameEvents && !program.players) {
    console.log("must specify data File argument.");
    //exit();
}

gameEventCount = 0;
playerCount = 0;

var gameEventIO = readline.createInterface({
    input: fs.createReadStream(program.gameEvents),
    output: process.stdout,
    terminal: false
});

gameEventIO.on('line', function(line) {
    raw = JSON.parse(line);
    
    var pbpCount = 0;

    var mongoPlayerID;
    var gameID  = raw.gameID;
    var seqID   = raw.seqID;
    var season  = raw.season;
    var time    = raw.time;
    var teamID  = raw.teamID;
    var playerName  = raw.playerName;
    var playerID    = raw.playerID;
    var eventType   = raw.eventType;
    var eventDetail = raw.eventDetail;
    
    // process time
    time = time.replace(/:/g, "");
    mins = Math.floor(time / 100);
    secs = Math.floor(time % 100);
    timeInSecs = mins*60 + secs;
    //console.log(time + " " + mins + " " + secs + " " + timeInSecs)

    //if (playerID in playerMap) {
    //    mongoPlayerID = playerMap[playerID]._id;
    //} 
    //else {
    //    console.log('WARNING: Missing player!')
    //}

    console.log("trying to create new game event " + gameEventCount++);

    var gameEvent = new GameEvent(); 
    gameEvent.team      = teamID; 
    gameEvent.season    = season; 
    gameEvent.gameID    = gameID;
    gameEvent.player    = playerName;
    gameEvent.playerID  = mongoPlayerID;
    gameEvent.eventType = eventType;
    gameEvent.eventDetail       = eventDetail;
    gameEvent.secondsIntoGame   = timeInSecs;

    gameEvent.save(function(err) {
    console.log("!!!!!!" + gameEventCount);
        if (err) { console.log('FAILED -> ' + err); }
        else { 
            console.log((pbpCount++) + " pbp event created."); 
        }
    });

    //console.log(line);
});

var playerIO = readline.createInterface({
    input: fs.createReadStream(program.players),
    output: process.stdout,
    terminal: false
});

playerIO.on('line', function(line) {
    raw = JSON.parse(line);

    var playerID = raw.playerID;
    var name     = raw.name;
    var fullName = raw.fullName;
    
    console.log("trying to create new player");

    var player = new Player(); 
    player.name = name;
    player.fullName = fullName;
    player.age = 0;

    //playerMap[playerID] = player;

    player.save(function(err) {
        if (err) { console.log('FAILED -> ' + err); }
        else { 
            console.log((playerCount++) + " player created."); 
        }
    });
});
    
var player = new Player(); 

//playerMap[playerID] = player;
console.log((playerCount++) + "POOPOPOPOPOPO"); 

player.save(function(err) {
    if (err) { console.log('FAILED -> ' + err); }
    else { 
        console.log((playerCount++) + " player created _____ "); 
    }
});

/*

var dbConnectString = 'mongodb://localhost/nbadb';
mongoose.connect(dbConnectString); 


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

