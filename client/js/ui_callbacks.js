$(function() {
            
    var filterKeys = ["team", "player", "season", "eventType", "graphReach", "nodeDegree"];

    $( "#season" ).selectmenu();

    $( "#team" ).selectmenu();

    $( "#player" ).selectmenu();

    $( "#eventType" ).selectmenu();
    
    $( "#graphReach" ).selectmenu();
    
    $( "#nodeDegree" ).selectmenu();

    $( "input[type=submit], button" )
        .button()
        .click(function( event ) {
            event.preventDefault(); // stop page redirection
        });

    var getFilters = function(deleteKeys) {
        var filters = {};
        for(var i in filterKeys) { 
            var key = filterKeys[i]
            var value = document.getElementById(key).value; 
            if (value != "")
                filters[key] = value 
        } 
        console.log("filters=" + JSON.stringify(filters));
        for(var i in deleteKeys) { 
            var deleteKey = deleteKeys[i]
            delete filters[deleteKey]
        } 
        console.log("filters=" + JSON.stringify(filters));
        return filters;
    }
    
    $( "#groupedSummary" )
        .button()
        .click(function( event ) {
            event.preventDefault(); // stop page redirection
            var filters = getFilters(['eventType', 'graphReach', 'nodeDegree']);
            var dimension = document.getElementById(filterKeys[3]).value;
            var player = document.getElementById(filterKeys[1]).value;
            filtersJSON= JSON.stringify(filters);
            nbadvPlotter.addPlotToBodyURL(
                "Individual plot with filters " + fltersJSON +
                " on event type " + dimension,
                nbadvURLs.summaryPlayerGrouping + "player/" + filtersJSON,
                dimension,
                nbadvPlotter.addMultiLinePlotToBody);
        });
    
    $( "#individualSummary" )
        .button()
        .click(function( event ) {
            event.preventDefault(); // stop page redirection
            var filters = getFilters(['graphReach', 'nodeDegree']);
            var dimension = document.getElementById(filterKeys[3]).value;
            filtersJSON = JSON.stringify(filters);
            nbadvPlotter.addPlotToBodyURL(
                "Grouped plot with filters " + fltersJSON +
                " on event type " + dimension,
                nbadvURLs.gameSummaryURL + filtersJSON,
                dimension,
                nbadvPlotter.addPlotToBody);
        });
    
    $( "#similarPlot" )
        .button()
        .click(function( event ) {
            event.preventDefault(); // stop page redirection
            var filters = getFilters(['player', 'eventType', 'graphReach', 'nodeDegree']);
            var dimension = document.getElementById(filterKeys[3]).value;
            var player = document.getElementById(filterKeys[1]).value;
            filtersJSON= JSON.stringify(filters);
            nbadvPlotter.addPlotToBodyURL(
                "Similarity plot for " + player +
                " on event type " + dimension,
                nbadvURLs.similarPlayerGrouping + dimension + "/" + player + "/" + filtersJSON,
                dimension,
                nbadvPlotter.addSimilarPlotToBody);
        });
    
    $( "#similarGraph" )
        .button()
        .click(function( event ) {
            event.preventDefault(); // stop page redirection
            var filters = getFilters(['player', 'eventType', 'graphReach', 'nodeDegree']);
            var dimension = document.getElementById(filterKeys[3]).value;
            var graphReach = document.getElementById(filterKeys[4]).value;
            var nodeDegree = document.getElementById(filterKeys[5]).value;
            var player = document.getElementById(filterKeys[1]).value;
            filtersJSON= JSON.stringify(filters);
            nbadvPlotter.addPlotToBodyURL(
                "Similarity graph for " + player +
                " on event type " + dimension +
                " with reach " + graphReach + 
                " and degree " + nodeDegree, 
                nbadvURLs.similarPlayerGroupingGraph + dimension + "/" + 
                    graphReach + "/" + 
                    nodeDegree + "/" + 
                    player + "/" + 
                    filtersJSON,
                dimension,
                nbadvPlotter.addSimilarGraphToBody);
        });
    
    $( "#vecGraph" )
        .button()
        .click(function( event ) {
            event.preventDefault(); // stop page redirection
            var filters = getFilters(['player', 'eventType', 'graphReach', 'nodeDegree']);
            var dimension = document.getElementById(filterKeys[3]).value;
            var graphReach = document.getElementById(filterKeys[4]).value;
            var nodeDegree = document.getElementById(filterKeys[5]).value;
            var player = document.getElementById(filterKeys[1]).value;
            filtersJSON= JSON.stringify(filters);
            nbadvPlotter.addPlotToBodyURL(
                "Vector graph for " + player +
                " on event type " + dimension,
                nbadvURLs.similarPlayerGroupingVectorGraph + filtersJSON,
                dimension,
                nbadvPlotter.addVectorGraphToBody);
        });
});

