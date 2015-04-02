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
var Summary     = require('./app/models/summary');

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

router.route('/eventTypes')
.get(function(req, res) {
    GameEvent.find().limit(3000).exec(function(err, gameEvents) {
        if (err) { res.send(err); }
        var typesArr = [];
        var typesMap = [];
        // TODO: make mre efficient by pre-computing
        for (var i in gameEvents) {
            var type = gameEvents[i].eventType;
            if (typesMap[type] == undefined)
            {
                typesMap[type] = type;
                typesArr.push(type);
            }
        }
        res.json(typesArr);
    });
})

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
        var summary = []
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
        
var summarizeGameEvents = function(ge, groupBy) {
    
    // make a sumamry, given the filtered data
    var allEventTypes = {}
    var summary = {}
    var arrayLength = ge.length;
    var maxMin = 0;
    
    // populate
    for (var i = 0; i < arrayLength; i++) {

        var gameEvent = ge[i];
        var minute = Math.floor(gameEvent.secondsIntoGame / 60);
        var eventType = gameEvent.eventType;
        allEventTypes[eventType] = eventType;
        var groupKey = gameEvent[groupBy];
        
        if (minute < 0) { continue; }

        if (summary[groupKey] == undefined) { 
            summary[groupKey] = []; 
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
        maxMin = maxMin < minute ? minute : maxMin;
    }

    // clean up
    for(var i in summary) {
        for(var j = 0 ; j < maxMin ; j++) {
            if (summary[i] == undefined) {
                summary[i] = []; 
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
    summaryArray = [];
    for (var i in summary) {
        element = {}
        element[i] = summary[i];
        summaryArray.push(element);
    }
    return summaryArray; 
}

var combineSummaries = function(s1, s2) {
    var summary = new Summary();
    summary.player = s1.player;
    summary.team = s1.team;
    summary.season = s1.season;
    
    summary.minutes = JSON.parse(JSON.stringify(s1.minutes));
    //console.log(JSON.stringify(s1.minutes));

    var s2mins = JSON.parse(JSON.stringify(s2.minutes));
    //console.log("\ns2m=" + JSON.stringify(s2mins));

    for (var i in s2mins) {
        var minute = s2mins[i];
        for (var j in minute) {
            var datum = minute[j];
            //console.log("i,j = " + i + "," + j);
            if (j == 'minute') {
                summary.minutes[i][j] = datum;
            } else {
                summary.minutes[i][j] += datum;
            }
        }
    }
    return summary;
}

var groupSummariesByKey = function(summaries, key) {

    groupedSummaries = {}
    groupedSummariesArr = []

    for (var i in summaries) {
        var summary = summaries[i];
        var groupKey = summary[key];
        if (groupedSummaries[groupKey] == undefined) {
            groupedSummaries[groupKey] = summary;
        }
        else {
            groupedSummaries[groupKey] = combineSummaries(
                groupedSummaries[groupKey], summary);
        }
    }

    for (var k in groupedSummaries) {
        groupedSummariesArr.push(groupedSummaries[k]);
    }

    return groupedSummariesArr; 
}

var getSummariesMatchingNames = function(summaries, names)
{
    var results = []
    for (var s in summaries) {
        summary = summaries[s];
        for (var n in names) {
            var name = names[n];
            if (summary.player == name) {
                results.push(summary);
            }
        }
    }
    return results;
}

var getMax = function(summary, eventType) {
    var max = 0;
    for (var name in summary) {
        mins = summary[name]
        for (var i in mins) {
            min = mins[i]
            max = (max < min[eventType]) ? min[eventType] : max; 
        }
    }
    return max;
}
    
var getMaxSumVal = function(summary, eventType) {
    var max = 0;
    //for (var name in summary) {
    //    mins = summary[name]
        mins = summary.minutes;
        for (var i in mins) {
            min = mins[i]
            max = (max < min[eventType]) ? min[eventType] : max; 
        }
    //}
    return max;
}
    
var getFirstValue = function (d) {
    var kk = Object.keys(d).sort();
    return d[kk[0]];
}
    
var getFirstKey = function (d) {
    var kk = Object.keys(d).sort();
    return kk[0];
}

/**
 * Find similar curves based on summed-difference.
 */
var compareSummariesDiff = function(base, rhs, groupBy) {
    var baseMins = base.minutes; 
    var compMins = rhs.minutes; 
    var minInts = Math.min(baseMins.length, compMins.length);
    var j = 0;
    var score = 0;
    while (j < minInts) {
        var baseMinute = baseMins[j][groupBy];
        var compMinute = compMins[j][groupBy];
        score += Math.abs(baseMinute - compMinute);
        j++;
    }
    return score;
}

/**
 * Find similar curves based on summed-difference.
 */
var findSimilarSummariesDiff = function(base, all, groupBy, threshold) {
    var baseMins = base.minutes; 
    var arrayLength = all.length;

    var allScored = []

    for (var i = 0; i < arrayLength; i++) {
        var summary = all[i];
        /*
        var compMins = summary.minutes; 
        var minInts = Math.min(baseMins.length, compMins.length);
        var j = 0;
        var score = 0;

        while (j < minInts) {
            var baseMinute = baseMins[j][groupBy];
            var compMinute = compMins[j][groupBy];
            score += Math.abs(baseMinute - compMinute);
            j++;
        }
        */
        var score = compareSummariesDiff(base, summary, groupBy);
        var scoreSumPair = {"score":score, "summary":summary}
        allScored.push(scoreSumPair);
    }

    var matchesScored = allScored.sort(function(lhs,rhs){ 
        if (lhs.score < rhs.score) { return -1; }
        else if (lhs.score > rhs.score) { return 1; }
        return 0;
    });

    matchesScored = matchesScored.slice(0,threshold);
    var matches = [];
    for (var i in matchesScored) { matches.push(matchesScored[i].summary); }

    return matches; 
}


/**
 * Find similar curves based on a weighted similarity metric, invented by yours truly :).
 */
var findSimilarSummaries = function(base, all, groupBy) {
    var baseMins = base.minutes; 
    var baseMax = getMaxSumVal(base, groupBy);
    var matches = [];
    var arrayLength = all.length;

    for (var i = 0; i < arrayLength; i++) {
        var summary = all[i];
        var compMins = summary.minutes; 
        var compMax = getMaxSumVal(summary, groupBy);
        var minInts = Math.min(baseMins.length, compMins.length);
        var j = 0;
        var keep = true;
        var offCount = 5;
        var diff = .33;

        while (j < minInts) {
            var baseMinute = baseMins[j][groupBy];
            var compMinute = compMins[j][groupBy];
            var baseNorm = baseMinute/baseMax;
            var compNorm = compMinute/compMax;

            if (!(compNorm < (baseNorm+diff) &&
                compNorm > (baseNorm-diff))) {
                if (--offCount < 1) keep = false;
            }
            j++;
        }

        if (keep)
            matches.push(summary)
    }

    return matches; 
}


router.route('/gameEvents/similar/layout/:filters')
.get(function(req, res) {
    var filters = JSON.parse(req.params.filters);
    var summariesAll = Summary.find(filters).limit(maxReturn);
    summariesAll.exec(function (err, summariesAll) {
        if (err) { res.send(err); }
                
        var summariesAllGrouped = groupSummariesByKey(summariesAll, "player");

        matchPlayerNames = [
                'Dragic', 'Nash', 'James', 
                'Durant', 'Crawford', 'Howard', 
                'Parker', 'Thabeet', 'Samuels',
                'Ibaka', 'Love', 'A. Miller'];
        
        matchSummaries = getSummariesMatchingNames(summariesAllGrouped, matchPlayerNames);
        //matchSummaries = summariesAllGrouped;
        
        //console.log("\n\nSA size = "+ summariesAll.length)
        //console.log("\n\nSAG size = "+ summariesAllGrouped.length)
        //console.log("\n\nMPG size = "+ matchSummaries.length)

        result = {}

        result['words'] = [];
        result['vecs'] = [];
        for (var k1 in summariesAllGrouped)
        {
            var s1 = summariesAllGrouped[k1];
            result['words'].push(s1.player);
            var vector = []
            for (var k2 in matchSummaries)
            {
                var s2 = summariesAllGrouped[k2];
                vector.push(compareSummariesDiff(s1, s2, 'Assist'));
                vector.push(compareSummariesDiff(s1, s2, 'Shot'));
                vector.push(compareSummariesDiff(s1, s2, 'Reb'));
                vector.push(compareSummariesDiff(s1, s2, 'TO'));
            }
            result['vecs'].push(vector);
        }

        res.json(result);
    });
});

router.route('/gameEvents/similar/graph/:matchValue/:graphReach/:nodeDegree/:player/:filters')
.get(function(req, res) {
    
    var filters = JSON.parse(req.params.filters);
    var player = req.params.player;
    var graphReach = req.params.graphReach;
    var nodeDegree = req.params.nodeDegree;
    var summarizeEventType = req.params.matchValue;

    var filtersPlayer = JSON.parse(JSON.stringify(filters));
    filtersPlayer.player = player;

    console.log("similar filters = " + JSON.stringify(filters))
    console.log("player filters = " + JSON.stringify(filtersPlayer))
    //console.log("mathValue = "+ summarizeEventType)
    //console.log("degree = "+ degree)
    
    var summariesQ = Summary.find(filtersPlayer).limit(maxReturn);
    var summariesQAll = Summary.find(filters).limit(maxReturn);

    summariesQ.exec(function (err, summariesMatch) {
        if (err) { res.send(err); }
        summariesQAll.exec(function (err, summariesAll) {
            if (err) { res.send(err); }
            
            console.log("\n\nSA size = "+ summariesAll.length)
            console.log("\n\nSM size = "+ summariesMatch.length)
                    
            var summariesMatchGrouped = groupSummariesByKey(summariesMatch, "player");
            var summariesAllGrouped = groupSummariesByKey(summariesAll, "player");
            
            console.log("\n\nSAG size = "+ summariesAllGrouped.length)
            console.log("\n\nSMG size = "+ summariesMatchGrouped.length)
            
            var nodeLinkMap = {}
            var graph = {}
            var links = []
            var nodes = []
            var counter = 0;
            nodes.push({"name":player, "group":0})
            nodeLinkMap[player] = counter++;

            var simSumAll = {};
            simSumAll[filters.player] = summariesMatchGrouped[0]; // initialize with first player

            // While we still have more degrees to compute...
            for (var i = 0; i < graphReach; i++)
            {
                for (var key in simSumAll)
                {
                    var match = simSumAll[key]
                    
                    // TODO: make similarity metric user-specifiable
                    var simSum = findSimilarSummariesDiff(
                    //var simSum = findSimilarSummaries(
                        match, 
                        summariesAllGrouped, 
                        summarizeEventType, nodeDegree);

                   for (var key2 in simSum) 
                   {
                        var similarResult = simSum[key2];

                        // update set of all summaries
                        simSumAll[similarResult.player] = similarResult;

                        // update node to link map
                        if (nodeLinkMap[similarResult.player] == undefined) {
                            nodeLinkMap[similarResult.player] = counter++;
                            nodes[nodeLinkMap[similarResult.player]] = {"name":similarResult.player, "group":i+1}
                        }
                
                        var sum = simSum[key];
                        var edge = {}
                        
                        edge.source = nodeLinkMap[match.player];
                        edge.target = nodeLinkMap[similarResult.player];
                        edge.value = 1;
                        links.push(edge)
                   }
                }
            }
            
            graph.nodes = nodes;
            graph.links = links;
            console.log("DONE"); 
            res.json(graph);

        });
    });
});

router.route('/gameEvents/similar/:matchValue/:player/:filters')
.get(function(req, res) {
    
    var filters = JSON.parse(req.params.filters);
    var player = req.params.player;
    var summarizeEventType = req.params.matchValue;
    
    var filtersPlayer = JSON.parse(JSON.stringify(filters));
    filtersPlayer.player = player;
    
    var summariesQ = Summary.find(filtersPlayer).limit(maxReturn);
    var summariesQAll = Summary.find(filters).limit(maxReturn);

    summariesQ.exec(function (err, summariesMatch) {
        if (err) { res.send(err); }
        summariesQAll.exec(function (err, summariesAll) {
            if (err) { res.send(err); }
            
            //console.log("\n\nSA size = "+ summariesAll.length)
            //console.log("\n\nSM size = "+ summariesMatch.length)
                    
            var summariesMatchGrouped = groupSummariesByKey(summariesMatch, "player");
            var summariesAllGrouped = groupSummariesByKey(summariesAll, "player");
   
            // TODO: make similarity metric user-specifiable
            //var simSum = findSimilarSummaries(
            var simSum = findSimilarSummariesDiff(
                    summariesMatchGrouped[0], 
                    summariesAllGrouped, 
                    summarizeEventType, 7); 
            res.json(simSum);
        });
    });
});

router.route('/gameEvents/summary/:matchValue/:filters')
.get(function(req, res) {
   
    var filters = JSON.parse(req.params.filters);
    var query = Summary.find(filters).limit(maxReturn);
    var matchValue = req.params.matchValue;

    // execute the query at a later time
    query.exec(function (err, summaries) {
        if (err) { res.send(err); }
        console.log("sum res = " + JSON.stringify(summaries));
        
        var summariesGrouped = groupSummariesByKey(summaries, matchValue);
        
        res.json(summariesGrouped);
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

