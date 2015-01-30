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

// Load and persist all players
csv
    .fromPath(program.playerData, {delimiter:'\t'})
    .on("data", function(data){
	console.log(data);
        // TODO: create/save players
    })
    .on("end", function(){});
 
// Load and persist all game events
csv
    .fromPath(program.eventData, {delimiter:'\t'})
    .on("data", function(data){
	console.log(data);

        var gameID      = data[0];
        var seqID       = data[1];
        var season      = data[2];
        var time        = data[3];
        var teamID      = data[4];
        var playerName  = data[5];
        var dummy       = data[6];
        var eventType   = data[7];
        var eventDetail = data[8];

        console.log("trying to create new game event");
    
        var gameEvent = new GameEvent(); 
        gameEvent.team = teamID; 
        gameEvent.season = season; 
        gameEvent.gameID = gameID;
        gameEvent.player = playerName;
        gameEvent.eventType = eventType;
        gameEvent.eventDetail = eventDetail;

        gameEvent.save(function(err) {
            if (err) { console.log('FAILED -> ' + err); }
            else { console.log('GameEvent created!'); }
        });
    })
    .on("end", function(){});

