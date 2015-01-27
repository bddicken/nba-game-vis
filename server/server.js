// server.js

// BASE SETUP
// =============================================================================

var dbConnectString = 'mongodb://localhost/nbadb';

var express    = require('express');
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var app        = express();

var Bear = require('./app/models/bear');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

// TODO: local database
mongoose.connect(dbConnectString); 

// ROUTES FOR OUR API
// =============================================================================

var router = express.Router();              

// middleware to use for all requests
router.use(function(req, res, next) {
    console.log('Handling generic request.');
    next(); 
});

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to the api!' });   
});

// more routes for our API will happen here

router.route('/bears')
.get(function(req, res) {
    Bear.find(function(err, bears) {
        if (err) { res.send(err); }
        res.json(bears);
    });
})
.post(function(req, res) {
    console.log("creating new item with name=" + req.body.name); 
    
    var bear = new Bear(); 
    bear.name = req.body.name;  
    bear.save(function(err) {
        if (err) { res.send(err); }
        res.json({ message: 'Bear created!' });
    });
});

router.route('/bears/:bear_id')
.get(function(req, res) {
    Bear.findById(req.params.bear_id, function(err, bear) {
        if (err) { res.send(err); }
        res.json(bear);
    });
});

// REGISTER OUR ROUTES -- all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================

app.listen(port);
console.log('Server running on port ' + port);

