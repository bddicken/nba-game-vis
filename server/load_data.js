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

if (
    !program.gameEvents ||
    !program.players    ||
    !program.games      ||
    !program.seasons    ||
    !program.teams
   ) {
    console.log("must specify all arguments.");
}

var maxReturn = 99999999;

var getFirstValue = function (d) {
    var kk = Object.keys(d).sort();
    return d[kk[0]];
}
    
var getFirstKey = function (d) {
    var kk = Object.keys(d).sort();
    return kk[0];
}

var fileCount = 6;
var checkFinished = function(rowCount, rowType) {
    if (rowCount == 0) {
        console.log("Done processing " + rowType + " elements.");
        fileCount--;
    }
    if (fileCount == 1) {
        buildSummaries();
    }
    if (fileCount == 0) {
        console.log("Done processing all Files. Exiting.");
        process.exit(code=0);
    }

}

///
/// Players
///

var playerStream = fs.createReadStream(program.players);
var playerCount = 1;
var playerCSVStream = csv()
.on('end', function(data) {
    console.log("Done processing players"); 
    playerCount--;
    checkFinished(playerCount, "Player");
})
.on('data', function(data) {

    var player = new Player(); 
    player.name     = data[1];
    player.fullName = data[2];
    player.age      = 0;
    
    playerCount++;

    player.save(function(err) {
        if (err) { console.log('FAILED -> ' + err); }
        playerCount--;
        checkFinished(playerCount, "player");
    });
});
playerStream.pipe(playerCSVStream);

///
/// Team
///

var teamStream = fs.createReadStream(program.teams);
var teamCount = 1;
var teamCSVStream = csv()
.on('end', function(data) {
    console.log("Done processing teams"); 
    teamCount--;
    checkFinished(teamCount, "Player");
})
.on('data', function(data) {
    var team = new Team(); 
    team.id   = data[0];
    team.name = data[1];
    
    teamCount++;

    team.save(function(err) {
        if (err) { console.log('FAILED -> ' + err); }
        teamCount--;
        checkFinished(teamCount, "team");
    });
});
teamStream.pipe(teamCSVStream);

///
///
///

///
/// Season
///

var seasonStream = fs.createReadStream(program.seasons);
var seasonCount = 1;
var seasonCSVStream = csv()
.on('end', function(data) {
    console.log("Done processing seasons"); 
    seasonCount--;
    checkFinished(seasonCount, "Player");
})
.on('data', function(data) {
    var season = new Season(); 
    season.id   = data[0];
    season.name = data[1];
    
    seasonCount++;

    season.save(function(err) {
        if (err) { console.log('FAILED -> ' + err); }
        seasonCount--;
        checkFinished(seasonCount, "season");
    });
});
seasonStream.pipe(seasonCSVStream);

///
///
///

///
/// GameEvent
///

var gameEventStream = fs.createReadStream(program.gameEvents);
var gameEventCount = 1;
var gameEventCSVStream = csv()
.on('end', function(data) {
    console.log("Done processing gameEvents"); 
    gameEventCount--;
    checkFinished(gameEventCount, "Player");
})
.on('data', function(data) {
    var mongoPlayerID;
    var eventType   = data[0];
    var gameID      = data[1];
    var playerID    = data[3];
    var playerName  = data[4];
    var season      = data[5];
    var seqID       = data[6];
    var eventDetail = data[7];
    var teamID      = data[8];
    var time        = data[9];

    if (data.length < 10) {
        console.log("Datum length error")
        console.log("data = " + data)
        return;
    }
    
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
    
    gameEventCount++;

    gameEvent.save(function(err) {
        if (err) { console.log('FAILED -> ' + err); }
        gameEventCount--;
        checkFinished(gameEventCount, "gameEvent");
    });
});
gameEventStream.pipe(gameEventCSVStream);

///
///
///

///
/// Game
///

var gameStream = fs.createReadStream(program.games);
var gameCount = 1;
var gameCSVStream = csv()
.on('end', function(data) {
    console.log("Done processing games"); 
    gameCount--;
    checkFinished(gameCount, "Player");
})
.on('data', function(data) {
    var game = new Game(); 
    game.awayTeam   = data[0];
    game.date       = data[1];
    game.homeTeam   = data[2];
    game.id         = data[3];
    game.name       = data[4];
    game.season     = data[5];

    gameCount++;

    game.save(function(err) {
        if (err) { console.log('FAILED -> ' + err); }
        gameCount--;
        checkFinished(gameCount, "game");
    });
});
gameStream.pipe(gameCSVStream);

///
///
///

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
        //var groupKey = gameEvent[groupBy];
        var groupKey = gameEvent.season + "," + gameEvent.team + "," + gameEvent.player;
        
        summary[groupKey] = []; 
        
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
        //var groupKey = gameEvent[groupBy];
        var groupKey = gameEvent.season + "," + gameEvent.team + "," + gameEvent.player;
        
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

var summaryCount = 1;
var buildSummaries = function() {
    var query = GameEvent.find().limit(maxReturn);
    var groupBy = 'player';
    query.exec(function (err, geAll) {
        if (err) { res.send(err); }
        var summaries = summarizeGameEvents(geAll, groupBy);
        for (var i in summaries) {
            var summary = summaries[i];
            var keyData = getFirstKey(summary).split(',');

            var s = new Summary();
            
            //s.name = getFirstKey(summary);

            s.minutes = getFirstValue(summary);
            s.season  = keyData[0];
            s.team    = keyData[1];
            s.player  = keyData[2];
            
            //console.log(s.season + " " + s.player + " " + s.team)
            
            summaryCount++;

            s.save(function(err) {
                if (err) { console.log('FAILED -> ' + err); }
                summaryCount--;
                checkFinished(summaryCount, "summary");
            });
        }
        summaryCount--;
        checkFinished(summaryCount, "summary");
    });
}
