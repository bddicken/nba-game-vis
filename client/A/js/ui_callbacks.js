$(function() {
    $( "#season" ).selectmenu();
    $( "#team" ).selectmenu();
    $( "#player" ).selectmenu();
});

var filterKeys = ["team", "player", "season"];

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

var updateVectorGraph  = function() {
    var filters = getFilters(['player', 'season', 'team']);
    var player = document.getElementById(filterKeys[1]).value;
    filtersJSON= JSON.stringify(filters);
    nbadvPlotter.addPlotToBodyURL(
        "Vector graph for ", 
        nbadvURLs.similarPlayerGroupingVectorGraph + filtersJSON,
        "blah",
        nbadvPlotter.addVectorGraphToBody);
}

var updateSecondaryGraph = function(id, dimension, filters, player) {
            
    var filtersJSON= JSON.stringify(filters);
    var url = nbadvURLs.similarPlayerGrouping + dimension + "/" + player + "/" + filtersJSON;
    var title = "Similarity plot for " + player +
        " on event type " + dimension;
   
    console.log("makeing req");
    console.log("url = " + url);
    d3.json(url, function(error, data) {
        console.log(data);
        var container = d3.select(id);
        nbadvPlotter.appendSVGMultiLinePlot(container, data, dimension, 800, 210);
    })
    .header("Content-Type","application/json");
}


