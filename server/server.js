// server.js

// BASE SETUP
// =============================================================================

var dbConnectString = 'mongodb://localhost/nbadb';

var express    = require('express');
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var app        = express();

var Player = require('./app/models/player');
var GameEvent = require('./app/models/gameEvent');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

mongoose.connect(dbConnectString); 

// ROUTES FOR OUR API
// =============================================================================

var router = express.Router();              

// middleware to use for all requests
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
// TODO: disable in deployment
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

// REGISTER OUR ROUTES -- all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================

app.listen(port);
console.log('Server running on port ' + port);

