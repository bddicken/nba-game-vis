$(function() {
            
    var filterKeys = ["team", "player", "season", "eventType"];

    $( "#season" ).selectmenu();

    $( "#team" ).selectmenu();

    $( "#player" ).selectmenu();

    $( "#eventType" ).selectmenu();

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
            var filters = getFilters(['eventType']);
            var dimension = document.getElementById(filterKeys[3]).value;
            var player = document.getElementById(filterKeys[1]).value;
            filtersJSON= JSON.stringify(filters);
            nbadvPlotter.addPlotToBodyURL(
                filtersJSON, 
                nbadvURLs.summaryPlayerGrouping + "player/" + filtersJSON,
                dimension,
                nbadvPlotter.addMultiLinePlotToBody);
        });
    
    $( "#individualSummary" )
        .button()
        .click(function( event ) {
            event.preventDefault(); // stop page redirection
            var filters = getFilters([]);
            var dimension = document.getElementById(filterKeys[3]).value;
            filtersJSON = JSON.stringify(filters);
            nbadvPlotter.addPlotToBodyURL(
                filtersJSON, 
                nbadvURLs.gameSummaryURL + filtersJSON,
                dimension,
                nbadvPlotter.addPlotToBody);
        });
    
    $( "#similarPlot" )
        .button()
        .click(function( event ) {
            event.preventDefault(); // stop page redirection
            var filters = getFilters(['player', 'eventType']);
            var dimension = document.getElementById(filterKeys[3]).value;
            var player = document.getElementById(filterKeys[1]).value;
            filtersJSON= JSON.stringify(filters);
            nbadvPlotter.addPlotToBodyURL(
                filtersJSON, 
                nbadvURLs.similarPlayerGrouping + dimension + "/" + player + "/" + filtersJSON,
                dimension,
                nbadvPlotter.addSimilarPlotToBody);
        });
    
    $( "#similarGraph" )
        .button()
        .click(function( event ) {
            event.preventDefault(); // stop page redirection
            var filters = getFilters(['player', 'eventType']);
            var dimension = document.getElementById(filterKeys[3]).value;
            var player = document.getElementById(filterKeys[1]).value;
            filtersJSON= JSON.stringify(filters);
            nbadvPlotter.addPlotToBodyURL(
                filtersJSON, 
                nbadvURLs.similarPlayerGroupingGraph + dimension + "/2/" + player + "/" + filtersJSON,
                dimension,
                nbadvPlotter.addSimilarGraphToBody);
        });
});

