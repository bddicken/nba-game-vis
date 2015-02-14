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
    
    /*
     */
    nbadvPlotter.addPlotToBodyURL = function(title, url)
    {
        d3.json(url, function(error, data) {
            nbadvPlotter.addPlotToBody(title, data);
        })
        .header("Content-Type","application/json");
    }

    /*
     * append a plot to the body
     */
    nbadvPlotter.addPlotToBody = function(title, data)
    {
        var container = d3.select("#plots")
            .insert("div", ":first-child") // idiom for prepending in d3
            .style("background", "rgba(200,200,200,1.0)")
            .style("border-style", "solid")
            .style("border-thickness", "1px")
            .style("border-color", "#aaa")
            .style("border-radius", "3px")
            .style("margin", "15px")
            .style("width","1000px")
            .attr("class", "nbaviswindow");

        container.append("button")
            .attr("onclick", "$(this).parent().remove();")
            .attr("style", "font-size:20px;")
            .html("-");

        container.append("span")
            .attr("style", "font-size:20px; margin-left:20px; margin-right:20px;")
            .html(title);

        container.append("div");

        nbadvPlotter.appendSVGPlot(container, data, 900, 200);
        nbadvPlotter.appendSVGLinePlot(container, data, 900, 200);
    }

    return nbadvPlotter;

})();

