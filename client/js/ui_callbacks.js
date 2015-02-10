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
            
            var filters = {};
            
            for(var i in filterKeys) { 
                var key = filterKeys[i]
                var value = document.getElementById(key).value; 
                if (value != "")
                    filters[key] = value 
            } 

            filtersJSON = JSON.stringify(filters);
            //console.log(filters);
            //console.log(filtersJSON);
            nbadvPlotter.addPlotToBody(filtersJSON, nbadvURLs.gameSummaryURL + filtersJSON);
        });
});

