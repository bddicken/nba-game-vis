// server.js
//
// TODO: disable delete requests for production
//

// BASE SETUP
// =============================================================================

var dbConnectString = 'mongodb://localhost/nbadb';

var express    = require('express');
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var app        = express();

var Player = require('./app/models/player');
var GameEvent = require('./app/models/gameEvent');
var Season      = require('./app/models/season');
var Team        = require('./app/models/team');
var Game        = require('./app/models/game');

var maxReturn = 100000000;

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

mongoose.connect(dbConnectString); 

// ROUTES FOR OUR API
// =============================================================================

var router = express.Router();              

// middleware t use for all requests
router.use(function(req, res, next) {
    console.log('Handling generic request.');

    // Dangerous!
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    res.header("Content-Type", "text/cache-manifest")

    next(); 
});

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to the api!' });   
});

// All team routes here
/*
router.route('/teams')
.get(function(req, res) {
    var query = Team.find().limit(maxReturn);
    query.select('-_id team');
    query.exec(function (err, teams) {
        if (err) { res.send(err); }
        res.json(teams);
    });
});
*/


// All player routes here

router.route('/players')
.get(function(req, res) {
    Player.find(function(err, players) {
        if (err) { res.send(err); }
        res.json(players);
    });
})
.post(function(req, res) {
    var name = req.body.name;
    var age  = req.body.age;

    console.log("creating new player with name=" + name + " age=" + age);

    var player = new Player(); 
    player.name = name;  
    player.age = age; 

    player.save(function(err) {
        if (err) { res.send(err); }
        res.json({ message: 'Player created!' });
    });
})
.delete(function(req, res) {
    Player.remove({}, function(err) {
        console.log("All Players deleted.");
        res.json({ message: 'All Players deleted.' });
    });
});

router.route('/players/:player_id')
.get(function(req, res) {
    Player.findById(req.params.player_id, function(err, player) {
        if (err) { res.send(err); }
        res.json(player);
    });
});

// All gameEvent routes here

router.route('/gameEvents')
.get(function(req, res) {
    //GameEvent.find().populate('player').exec(function(err, gameEvents) {
    GameEvent.find().exec(function(err, gameEvents) {
        if (err) { res.send(err); }
        res.json(gameEvents);
        // Use "populate" to link the gameEvents to the Player objects
    });
})
.post(function(req, res) {
    var season = req.body.season;
    var team = req.body.team;
    var gameID = req.body.gameID;
    var playerID = req.body.playerID;
    var eventType = req.body.eventType;
    var eventDetail = req.body.eventDetail;

    console.log("creating new game event");

    var gameEvent = new GameEvent(); 
    gameEvent.team = team; 
    gameEvent.season = season; 
    gameEvent.gameID = gameID;
    gameEvent.player = playerID;
    gameEvent.eventType = eventType;
    gameEvent.eventDetail = eventDetail;

    gameEvent.save(function(err) {
        if (err) { res.send(err); }
        res.json({ message: 'GameEvent created!' });
    });
})
// TODO: disable in deployment
.delete(function(req, res) {
    GameEvent.remove({}, function(err) {
        console.log("All GameEvents deleted");
        res.json({ message: 'All GameEvents deleted.' });
    });
});

// gameSummary

/**
 * ":filters" Is a list of key/value pairs rsed to pair down the number of games 
 * to be summarized. Possible filters are:
 *
 *    { season : seadonID }
 *    { team : teamID }
 *    { player : playerID }
 *    { game : gameID }
 *
 * If a filter is unspecified in the list, then the results will include all
 * data points in that category. For example, if a season and a team is specified,
 * then a summary will be returned for only that team in that season, but for
 * all players in all games.
 *
 * TODO: fix up the ugliness of this function.
 *
 */
router.route('/gameSummary/:filters')


// TODO: merge this function with one below
.get(function(req, res) {
    console.log("filters = " + req.params.filters)
    var filters = JSON.parse(req.params.filters);
    var query = GameEvent.find(filters).limit(maxReturn);
    query.select('secondsIntoGame eventType');

    // execute the query at a later time
    query.exec(function (err, ge) {
        if (err) { res.send(err); }

        // make a sumamry, given the filtered data
        var allEventTypes = {}
        summary = []
        var arrayLength = ge.length;
        for (var i = 0; i < arrayLength; i++) {
            minute = Math.floor(ge[i].secondsIntoGame / 60);
            eventType = ge[i].eventType;
            allEventTypes[eventType] = eventType;

            if (summary[minute] == null || summary[minute] == undefined) { 
                summary[minute] = {}; 
                summary[minute]['minute'] = minute;
            }

            if (!(eventType in summary[minute])) { 
                summary[minute][eventType] = 0;
            }
            else { 
                summary[minute][eventType]++; 
            }
        }
        for(var i = 0; i < summary.length; i++) {
            if (summary[i] == null || summary[i] == undefined) {
                summary[i] = {}; 
                summary[i]['minute'] = i;
            }
            for (var key in allEventTypes) {
                if (summary[i][key] == null || summary[i][key] == undefined){
                    summary[i][key] = 0; 
                }
            }
        }
        res.json(summary);
    });
});

router.route('/gameEvents/summary/:groupBy/:filters')
.get(function(req, res) {
    
    var filters = JSON.parse(req.params.filters);
    var query = GameEvent.find(filters).limit(maxReturn);
    var groupBy = req.params.groupBy;
    
    console.log("filters = " + filters + "  groupBy = " + groupBy)

    // execute the query at a later time
    query.exec(function (err, ge) {
        if (err) { res.send(err); }

        // make a sumamry, given the filtered data
        var allEventTypes = {}
        var summary = {}
        var arrayLength = ge.length;

        // populate
        for (var i = 0; i < arrayLength; i++) {

            var gameEvent = ge[i];
            var minute = Math.floor(gameEvent.secondsIntoGame / 60);
            var eventType = gameEvent.eventType;
            allEventTypes[eventType] = eventType;
            var groupKey = gameEvent[groupBy];

            if (summary[groupKey] == undefined) { 
                summary[groupKey] = {}; 
            }
            
            if (summary[groupKey][minute] == undefined) { 
                summary[groupKey][minute] = {}; 
                summary[groupKey][minute]['minute'] = minute;
            }

            if (!(eventType in summary[groupKey][minute])) { 
                summary[groupKey][minute][eventType] = 0;
            }
            else { 
                summary[groupKey][minute][eventType]++; 
            }
        }

        // clean up
        for(var i in summary) {
            for(var j in summary[i]) {
                if (summary[i] == undefined) {
                    summary[i] = {}; 
                }
                if (summary[i][j] == undefined) {
                    summary[i][j] = {}; 
                    summary[i][j]['minute'] = j;
                }
                for (var key in allEventTypes) {
                    if (summary[i][j][key] == undefined){
                        summary[i][j][key] = 0; 
                    }
                }
            }
        }

        res.json(summary);
    });
});

router.route('/seasons')
.get(function(req, res) {
    Season.find(function(err, seasons) {
        if (err) { res.send(err); }
        res.json(seasons);
    });
});

router.route('/teams')
.get(function(req, res) {
    Team.find(function(err, teams) {
        if (err) { res.send(err); }
        res.json(teams);
    });
});


// REGISTER OUR ROUTES -- all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================

app.listen(port);
console.log('Server running on port ' + port);

