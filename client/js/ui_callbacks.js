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

    var getFilters = function() {
        var filters = {};
        for(var i in filterKeys) { 
            var key = filterKeys[i]
            var value = document.getElementById(key).value; 
            if (value != "")
                filters[key] = value 
        } 
        return filters;
    }
    
    $( "#groupedSummary" )
        .button()
        .click(function( event ) {
            event.preventDefault(); // stop page redirection
            var filters = getFilters();
            var dimension = document.getElementById(filterKeys[3]).value;
            filtersJSON = JSON.stringify(filters);
            nbadvPlotter.addPlotToBodyURL(
                filtersJSON, 
                nbadvURLs.summaryPlayerGrouping + filtersJSON,
                dimension,
                nbadvPlotter.addMultiLinePlotToBody);
        });
    
    $( "#individualSummary" )
        .button()
        .click(function( event ) {
            event.preventDefault(); // stop page redirection
            var filters = getFilters();
            var dimension = document.getElementById(filterKeys[3]).value;
            filtersJSON = JSON.stringify(filters);
            nbadvPlotter.addPlotToBodyURL(
                filtersJSON, 
                nbadvURLs.gameSummaryURL + filtersJSON,
                dimension,
                nbadvPlotter.addPlotToBody);
        });
    
    $( "#similar" )
        .button()
        .click(function( event ) {
            event.preventDefault(); // stop page redirection
            var filters = getFilters();
            var dimension = document.getElementById(filterKeys[3]).value;
            filtersJSON = JSON.stringify(filters);
            nbadvPlotter.addPlotToBodyURL(
                filtersJSON, 
                nbadvURLs.similarPlayerGrouping + filtersJSON,
                dimension,
                nbadvPlotter.addSimilarPlotToBody);
        });
});

