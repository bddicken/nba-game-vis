// load_data.js
//
// Load tab delimited data into mongodb
//

var mongoose   = require('mongoose');
var Player     = require('./app/models/player');
var GameEvent  = require('./app/models/gameEvent');
var program    = require('commander');
var csv        = require("fast-csv");

program
  .version('0.0.1')
  .option('-e, --eventData <fileName>', 'events')
  .option('-p, --playerData <fileName>', 'players')
  .parse(process.argv);

console.log('event file:');
if (program.eventData) console.log( program.eventData);
if (program.playerData) console.log( program.playerData);

var dbConnectString = 'mongodb://localhost/nbadb';
mongoose.connect(dbConnectString); 

playerMap = {}

// Load and persist all players
function loadPlayers()
{
csv
    .fromPath(program.playerData, {delimiter:'\t'})
    .on("data", function(data){
	//console.log(data);
        
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
                //console.log('Player created!'); 
            }
        });
    })
    .on("end", function(){ loadPBP(); });
}
 
// Load and persist all game events
function loadPBP()
{
csv
    .fromPath(program.eventData, {delimiter:'\t'})
    .on("data", function(data){
	//console.log(data);

        var mongoPlayerID;
        var gameID      = data[0];
        var seqID       = data[1];
        var season      = data[2];
        var time        = data[3];
        var teamID      = data[4];
        var playerName  = data[5];
        var playerID    = data[6];
        var eventType   = data[7];
        var eventDetail = data[8];
        
        // process time
        time = time.replace(/:/g, "");
        mins = Math.floor(time / 100);
        secs = Math.floor(time % 100);
        timeInSecs = mins*60 + secs;
        //console.log(time + " " + mins + " " + secs + " " + timeInSecs)

        if (playerID in playerMap) {
            mongoPlayerID = playerMap[playerID]._id;
        } 
        else {
            console.log('WARNING: Missing player!')
        }

        //console.log("trying to create new game event");
    
        var gameEvent = new GameEvent(); 
        gameEvent.team = teamID; 
        gameEvent.season = season; 
        gameEvent.gameID = gameID;
        gameEvent.secondsIntoGame = timeInSecs;
        gameEvent.player = playerName;
        gameEvent.playerID = mongoPlayerID;
        gameEvent.eventType = eventType;
        gameEvent.eventDetail = eventDetail;

        gameEvent.save(function(err) {
            if (err) { console.log('FAILED -> ' + err); }
            else { 
                //console.log('GameEvent created!'); 
            }
        });
    })
    .on("end", function(){ process.exit(code=0); });
}

loadPlayers();


