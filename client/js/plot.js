nbadvPlotter = (function(){

    var nbadvPlotter = {}

    nbadvPlotter.plotX = function(selection, width, height, xAxis) {
        return selection.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    }
    
    nbadvPlotter.plotY = function(selection, width, height, yAxis) {
        return selection.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("#");
    }
    
    nbadvPlotter.appendSVGPlot = function(containerSelection, data, totalWidth, totalHeight)
    {
        var margin = {top: 20, right: 20, bottom: 30, left: 50};
        var width = totalWidth - margin.left - margin.right;
        var height = totalHeight - margin.top - margin.bottom;

        var x = d3.scale.ordinal()
            .domain(data.map(function(d) { return d.minute; }))
            .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.Shot; })])
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var svg = containerSelection
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.call(nbadvPlotter.plotX, width, height, xAxis);
        svg.call(nbadvPlotter.plotY, width, height, yAxis);

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x",          function(d) { return x(d.minute); })
            .attr("width",      x.rangeBand())
            .attr("y",          function(d) { return y(d.Shot); })
            .attr("height",     function(d) { return height - y(d.Shot); });

        return svg;
    }
        
    nbadvPlotter.appendSVGLinePlot = function(containerSelection, data, totalWidth, totalHeight)
    {
        var margin = {top: 20, right: 20, bottom: 30, left: 50};
        var width = totalWidth - margin.left - margin.right;
        var height = totalHeight - margin.top - margin.bottom;

        var x = d3.scale.ordinal()
            .domain(data.map(function(d) { return d.minute; }))
            .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.Shot; })])
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .interpolate("basis")
            .x(function(d) { return x(d.minute); })
            .y(function(d) { return y(d.Shot); });

        var svg = containerSelection
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.call(nbadvPlotter.plotX, width, height, xAxis);
        svg.call(nbadvPlotter.plotY, width, height, yAxis);

        svg.append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", "2px")
            .attr("d", line(data));

        return svg;
    }
    
    nbadvPlotter.appendSVGMultiLinePlot = function(containerSelection, allData, totalWidth, totalHeight)
    {
        var margin = {top: 20, right: 20, bottom: 30, left: 50};
        var width = totalWidth - margin.left - margin.right;
        var height = totalHeight - margin.top - margin.bottom;
            
        var svg = containerSelection
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // get all minutes
        var allMins = [];
        for (var i in allData) {
            data = allData[i]
            for (var j in data) {
                minute = data[j];
                allMins[minute.minute] = minute.minute;
            }
        }
        allMins = allMins.map(function(d) { return d; });
        
        // get highest event count
        var maxEventCount = 0;
        for (var i in allData) {
            data = allData[i]
            for (var j in data) {
                minute = data[j];
                if (maxEventCount < minute.Shot)
                { maxEventCount = minute.Shot; }
            }
        }
            
        var x = d3.scale.ordinal()
            .domain(allMins)
            .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
            .domain([0, maxEventCount])
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .interpolate("basis")
            .x(function(d) { return x(d.minute); })
            .y(function(d) { return y(d.Shot); });
                
        var focus = svg.append("g")
            .attr("class", "focus")
            .append("text")
            .attr("fill", "black")
            .attr("x", (width - 60) + "px")
            .attr("y", (30 ) + "px")
            .attr("font-size", "18px")
            .attr("class", "focus-label")
            .attr("opacity", "0.0")

        for (var i in allData)
        {
            var data = $.map(allData[i],function(v){
                return v;
            });

            svg.call(nbadvPlotter.plotX, width, height, xAxis);
            svg.call(nbadvPlotter.plotY, width, height, yAxis);
            
            console.log('---');
            console.log(data);
            console.log('pre');
            console.log(allMins + " " + maxEventCount);

            if(data.length > 2)
            {
                svg.append("path")
                    .attr("label", i)
                    .attr("class", "line")
                    .attr("fill", "none")
                    .attr("stroke", "blue")
                    .attr("stroke-width", "3px")
                    .attr("d", line(data))
                    .on("mouseover", function() { 
                            var label = d3.select(this).attr("label"); 
                            d3.selectAll(".focus-label").html(label); 
                            d3.selectAll(".focus-label")
                                .transition()
                                .duration(250)
                                .attr("opacity", "1.0"); 
                    })
                    .on("mouseout", function() { 
                        d3.selectAll(".focus-label")
                            .transition()
                            .duration(250)
                            .attr("opacity", "0.0")
                    })
            }
        }
        return svg;
    }
    
    /*
     */
    nbadvPlotter.addPlotToBodyURL = function(title, url, plotFunction)
    {
        console.log(url);
        d3.json(url, function(error, data) {
            //nbadvPlotter.addPlotToBody(title, data);
            plotFunction(title, data);
        })
        .header("Content-Type","application/json");
    }
    
    /*
     * append a plot to the body
     */
    nbadvPlotter.getPlotContainer = function(title)
    {
        var container = d3.select("#plots")
            .insert("div", ":first-child") // idiom for prepending in d3
            .style("background", "rgba(220,220,220,1.0)")
            .style("border-style", "solid")
            .style("border-thickness", "1px")
            .style("border-color", "rgba(210,210,210,1.0)")
            //.style("border-radius", "3px")
            .style("margin", "15px")
            .style("width","1000px")
            .attr("class", "nbaviswindow");

        container.append("button")
            .attr("onclick", "$(this).parent().remove();")
            .attr("style", "font-size:20px;")
            .style("opacity", "0.3")
            .on("mouseover", function() { 
                    d3.select(this)
                        .transition()
                        .duration(250)
                        .style("opacity", "1.0"); 
            })
            .on("mouseout", function() { 
                d3.select(this)
                    .transition()
                    .duration(250)
                    .style("opacity", "0.3")
            })
            //.attr("opacity", "0.6")
            .html("-");

        container.append("span")
            .attr("style", "font-size:20px; margin-left:20px; margin-right:20px;")
            .html(title);

        container.append("div");

        return container;
    }


    /*
     * append a plot to the body
     */
    nbadvPlotter.addPlotToBody = function(title, data)
    {
        var container = nbadvPlotter.getPlotContainer(title);
        nbadvPlotter.appendSVGPlot(container, data, 900, 200);
        nbadvPlotter.appendSVGLinePlot(container, data, 900, 200);
    }
    
    /*
     * append a plot to the body
     */
    nbadvPlotter.addMultiLinePlotToBody = function(title, data)
    {
        console.log(data);
        var container = nbadvPlotter.getPlotContainer(title);
        nbadvPlotter.appendSVGMultiLinePlot(container, data, 900, 400);
    }

    return nbadvPlotter;

})();

