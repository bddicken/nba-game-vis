// server.js

// BASE SETUP
// =============================================================================

var program = require('commander');

program
  .version('0.0.1')
  .option('-e, --eventData <fileName>', 'events')
  .option('-p, --playerData', 'players')
  .parse(process.argv);

console.log('event file:');
if (program.eventData) console.log( program.eventData);
if (program.playerData) console.log( program.playerData);

var dbConnectString = 'mongodb://localhost/nbadb';

var mongoose   = require('mongoose');
var Player = require('./app/models/player');
var GameEvent = require('./app/models/gameEvent');
mongoose.connect(dbConnectString); 

var csv = require("fast-csv");
 
csv
 .fromPath(program.eventData, delimiter='\t')
 .on("data", function(data){
     console.log(data);
 })
 .on("end", function(){
     console.log("done");
 });


