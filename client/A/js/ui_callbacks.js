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
    var filters = getFilters([]);
    var player = document.getElementById(filterKeys[1]).value;
    filtersJSON= JSON.stringify(filters);
    nbadvPlotter.addPlotToBodyURL(
        "Vector graph for ", 
        nbadvURLs.similarPlayerGroupingVectorGraph + filtersJSON,
        "blah",
        nbadvPlotter.addVectorGraphToBody);
}

var updateSecondaryGraph = function(id, dimension, filters2, players) {
     
    var filters = getFilters([]);
    var filtersJSON= JSON.stringify(filters);
    var url = nbadvURLs.playerGrouping + players + "/" + filtersJSON;
    var title = "Similarity plot for " + players +
        " on event type " + dimension;
   
    console.log("makeing req");
    console.log(" secondary g url = " + url);
    d3.json(url, function(error, data) {
        console.log(data);
        d3.select(id).html("");
        var outerContainer = d3.select(id)
            .style("border-style", "solid")
            .style("border-thickness", "1px")
            .style("border-color", "rgba(210,210,210,1.0)");
        outerContainer.append("div").html(dimension);
        var container = outerContainer.append("div");
        nbadvPlotter.appendSVGMultiLinePlot(container, data, dimension, 600, 160);
    })
    .header("Content-Type","application/json");
}


