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
var Summary     = require('./app/models/summary');

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


var getFirstValue = function (d) {
    var kk = Object.keys(d).sort();
    return d[kk[0]];
}
    
var getFirstKey = function (d) {
    var kk = Object.keys(d).sort();
    return kk[0];
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
    buildSummaries();
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

var summarizeGameEvents = function(ge, groupBy) {
    
    // make a sumamry, given the filtered data
    var allEventTypes = {}
    var summary = {}
    var arrayLength = ge.length;
    var maxMin = 0;
    var summaryArray = [];
    
    // Get Max minute and all event types
    for (var i = 0; i < arrayLength; i++) {
        var gameEvent = ge[i];
        var eventType = gameEvent.eventType;
        var minute = Math.floor(gameEvent.secondsIntoGame / 60);
        
        allEventTypes[eventType] = eventType;
        maxMin = maxMin < minute ? minute : maxMin;
    }
    
    // Initialize empty
    for (var i = 0; i < arrayLength; i++) {
        var gameEvent = ge[i];
        var groupKey = gameEvent[groupBy];
        summary[groupKey]       = []; 
        
        for(var j = 0 ; j <= maxMin ; j++) {
            summary[groupKey][j]    = {}; 
            summary[groupKey][j]['minute'] = j;
            for (var key in allEventTypes) {
                summary[groupKey][j][key] = 0; 
            }
        }
    }
   
    console.log("get = " + JSON.stringify(allEventTypes));

    // populate
    for (var i = 0; i < arrayLength; i++) {
        var gameEvent = ge[i];
        var eventType = gameEvent.eventType;
        var minute = Math.floor(gameEvent.secondsIntoGame / 60);
        var groupKey = gameEvent[groupBy];
        
        if (minute < 0) { continue; }
        
        /*
        console.log("gk=" + groupKey + "  min" + minute)
        console.log("x1 = " + JSON.stringify(summary[groupKey]));
        console.log("x2 = " + JSON.stringify(summary[groupKey][minute]));
        console.log("x3 = " + JSON.stringify(summary[groupKey][minute][eventType]));
        */

        summary[groupKey][minute][eventType]++; 
    }

    // convert to array
    for (var key in summary) {
        element = {}
        element[key] = summary[key];
        summaryArray.push(element);
    }


    console.log("summaries count = " + summaryArray.length)

    return summaryArray; 
}

var maxReturn = 99999999;

var buildSummaries = function() {
    var query = GameEvent.find().limit(maxReturn);
    var groupBy = 'player';
    query.exec(function (err, geAll) {
        if (err) { res.send(err); }
        var summaries = summarizeGameEvents(geAll, groupBy);
        for (var i in summaries) {
            var summary = summaries[i];
            var s = new Summary();
            s.name = getFirstKey(summary);
            s.minutes = getFirstValue(summary);
            s.save(function(err) {
                if (err) { console.log('FAILED -> ' + err); }
            });
        }
        console.log("done processing summaries");

        // Cannot exit right away, because the "s.save" callbacks may not have completed.
        // Update this to use promises, etc
        //process.exit(code=0);
    });
}

