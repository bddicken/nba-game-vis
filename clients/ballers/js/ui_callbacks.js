
var allFilterKeys = ["team", "season", "eventType"];

var getFilters = function(filterKeys) {
    var filters = {};
    for(var i in filterKeys) { 
        var key = filterKeys[i]
        var value = document.getElementById(key).value; 
        if (value != "")
            filters[key] = value 
    } 
    console.log("filters=" + JSON.stringify(filters));
    return filters;
}

var updateVectorGraph  = function() {
    var filters = getFilters(["team", "season", "eventType"]);
    var player = document.getElementById(allFilterKeys[1]).value;
    var filtersJSON= JSON.stringify(filters);
    
    var beginMin = $('#timeSlidertextmin').html();
    var endMin   = $('#timeSlidertextmax').html();
    
    var url = nbadvURLs.similarPlayerGroupingVectorGraph + beginMin + '/' + endMin + '/' + filtersJSON;
    
    console.log("url = " + url);
    
    d3.json(url, function(error, data) {
        var container = nbadvPlotter.getPlotContainer();
        container.html("");
        nbadvPlotter.appendVectorGraph(container, data, 650, 750);
    })
    .header("Content-Type","application/json");
}

var updateSecondaryGraph = function(id, dimension, filters2, players) {
     
    var filters = getFilters(["team", "season"]);
    var filtersJSON= JSON.stringify(filters);
    var url = nbadvURLs.playerGrouping + players + "/" + filtersJSON;
   
    //console.log("making req");
    console.log(" secondary url = " + url);
    
    d3.json(url, function(error, data) {
        console.log(data);
        d3.select(id).html("");
        var outerContainer = d3.select(id)
            .style("border-style", "solid")
            .style("border-width", "1px")
            .style("border-color", "#ccc")
            .style("border-radius", "3px")
            .style("background", "#fff");
        outerContainer.append("div").html(dimension);
        var container = outerContainer.append("div");
        nbadvPlotter.appendSVGMultiLinePlot(container, data, dimension, 370, 232);
    })
    .header("Content-Type","application/json");
}

$(function() {

    $( "#season" ).selectmenu();

    $( "#team" ).selectmenu();
    
    $( "#eventType" ).selectmenu();
    
    $( "#vecGraph" )
        .button()
        .click(function( event ) {
            event.preventDefault(); // stop page redirection
            updateVectorGraph();
        });
    
    $( "#about" )
        .button()
        .click(function( event ) {
            event.preventDefault(); // stop page redirection
            $(function() {
                $( "#about-dialog" ).dialog();
            });
        });
});
