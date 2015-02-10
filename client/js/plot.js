nbadvPlotter = (function(){

    var nbadvPlotter = {}

    nbadvPlotter.appendSVGPlot = function(containerSelection, dataURL, totalWidth, totalHeight)
    {
        var margin = {top: 20, right: 20, bottom: 30, left: 50};
        var width = totalWidth - margin.left - margin.right;
        var height = totalHeight - margin.top - margin.bottom;

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);
        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var area = d3.svg.area()
            .x(function(d) { return x(d.minute); })
            .y0(height)
            .y1(function(d) { return y(d.Shot); });

        var svg = containerSelection
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.json(dataURL, function(error, data) {
            
            x.domain(data.map(function(d) { 
                return d.minute; 
            }));
            
            y.domain([0, d3.max(data, function(d) { 
                return d.Shot; 
            })]);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("#");

            svg.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return x(d.minute); })
                .attr("width", x.rangeBand())
                .attr("y", function(d) { return y(d.Shot); })
                .attr("height", function(d) { return height - y(d.Shot); });
        })
        .header("Content-Type","application/json");

        return svg;
    }
    
    nbadvPlotter.appendSVGLinePlot = function(containerSelection, dataURL, totalWidth, totalHeight)
    {
        var margin = {top: 20, right: 20, bottom: 30, left: 50};
        var width = totalWidth - margin.left - margin.right;
        var height = totalHeight - margin.top - margin.bottom;

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);
        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var area = d3.svg.area()
            .x(function(d) { return x(d.minute); })
            .y0(height)
            .y1(function(d) { return y(d.Shot); });

        var svg = containerSelection
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.json(dataURL, function(error, data) {
            
            x.domain(data.map(function(d) { 
                return d.minute; 
            }));
            
            y.domain([0, d3.max(data, function(d) { 
                return d.Shot; 
            })]);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("#");

            var line = d3.svg.line()
                .interpolate("basis")
                .x(function(d) { return x(d.minute); })
                .y(function(d) { return y(d.Shot); });

            svg.append("path")
                .attr("class", "line")
                .attr("fill", "none")
                .attr("stroke", "blue")
                .attr("stroke-width", "2px")
                .attr("d", line(data));
        })
        .header("Content-Type","application/json");

        return svg;
    }


    /*
     * append a plot to the body
     */
    nbadvPlotter.addPlotToBody = function(title, url)
    {
        var container = d3.select("#plots")
            .insert("div", ":first-child") // idiom for prepending in d3
            .attr("style", "background:rgba(200,200,200,1.0); border-style:solid; border-thickness:1px; border-color:#aaa; border-radius:3px; margin:15px; width:1000px;")
            .attr("class", "nbaviswindow");

        container.append("button")
            .attr("onclick", "$(this).parent().remove();")
            .attr("style", "font-size:20px;")
            .html("-");

        container.append("span")
            .attr("style", "font-size:20px; margin-left:20px; margin-right:20px;")
            .html(title);

        container.append("div");

        nbadvPlotter.appendSVGPlot(container, url, 900, 200);
        nbadvPlotter.appendSVGLinePlot(container, url, 900, 200);
    }

    return nbadvPlotter;

})();

