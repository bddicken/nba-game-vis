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
    
    nbadvPlotter.getFirstValue = function (d) {
        var kk = Object.keys(d).sort();
        return d[kk[0]];
    }
        
    nbadvPlotter.getFirstKey = function (d) {
        var kk = Object.keys(d).sort();
        return kk[0];
    }
        
    nbadvPlotter.makeQuarterLines = function(selection, width, height, domain, range) {
        var xQ = d3.scale.ordinal()
            .domain(domain)
            .range(range);
        var make_x_axis = function() {        
            return d3.svg.axis()
                .scale(xQ)
                .orient("bottom")
                .ticks(2);
        }
        return selection.append("g")         
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_axis()
                .tickSize(-height, 0, 0)
                .tickFormat("")
            );
    }
    
    nbadvPlotter.appendFDLGraph = function(containerSelection, data, dimension, totalWidth, totalHeight)
    {
        var margin = {top: 20, right: 20, bottom: 30, left: 50};
        var width = totalWidth - margin.left - margin.right;
        var height = totalHeight - margin.top - margin.bottom;

        var color = d3.scale.category10();

        var force = d3.layout.force()
            .charge(-150)
            .linkDistance(70)
            .size([width, height]);

        var svg = containerSelection
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        force
            .nodes(data.nodes)
            .links(data.links)
            .start();

        var link = svg.selectAll(".link")
            .data(data.links)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function(d) { return 3; })
            .style("opacity", function(d) { return .5; })
            .attr("fill", function(d) { return "grey"; })
            .attr("stroke", function(d) { return "grey"; })

        var node = svg.selectAll(".node")
            .data(data.nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", 12)
            //.style("fill", function(d) { return "fff"; })
            .style("fill", function(d) { return color(d.group); })
            .call(force.drag);

        node.append("title")
            .text(function(d) { return d.name; });

        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        });

        return svg;
    }
    
    nbadvPlotter.appendSVGPlot = function(containerSelection, data, dimension, totalWidth, totalHeight)
    {
        var margin = {top: 20, right: 20, bottom: 30, left: 50};
        var width = totalWidth - margin.left - margin.right;
        var height = totalHeight - margin.top - margin.bottom;
        var allMins = data.map(function(d) { return d.minute; });

        var x = d3.scale.ordinal()
            .domain(allMins)
            .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d[dimension]; })])
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

        svg.call(nbadvPlotter.makeQuarterLines, 
                width, height,
                allMins,
                [x(11),x(23),x(35),x(47)]);

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x",          function(d) { return x(d.minute); })
            .attr("width",      x.rangeBand())
            .attr("y",          function(d) { return y(d[dimension]); })
            .attr("height",     function(d) { return height - y(d[dimension]); });

        return svg;
    }
        
    nbadvPlotter.appendSVGLinePlot = function(containerSelection, data, dimension, totalWidth, totalHeight)
    {
        var margin = {top: 20, right: 20, bottom: 30, left: 50};
        var width = totalWidth - margin.left - margin.right;
        var height = totalHeight - margin.top - margin.bottom;
            
        var allMins = data.map(function(d) { return d.minute; });

        var x = d3.scale.ordinal()
            .domain(allMins)
            .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d[dimension]; })])
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
            .y(function(d) { return y(d[dimension]); });

        var svg = containerSelection
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.call(nbadvPlotter.plotX, width, height, xAxis);
        svg.call(nbadvPlotter.plotY, width, height, yAxis);

        svg.call(nbadvPlotter.makeQuarterLines, 
                width, height,
                allMins,
                [x(11),x(23),x(35),x(47)]);

        svg.append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", "2px")
            .attr("d", line(data));

        return svg;
    }
    
    
    nbadvPlotter.appendSVGMultiLinePlot = function(containerSelection, allData, dimension, totalWidth, totalHeight)
    {
        var margin = {top: 20, right: 20, bottom: 30, left: 50};
        var width = totalWidth - margin.left - margin.right;
        var height = totalHeight - margin.top - margin.bottom;
            
        var svg = containerSelection
            .append("svg")
            .attr("class", "svg-mutiline-plot")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // get all minutes
        var allMins = [];
        for (var i in allData) {
            data = allData[i].minutes
            for (var j in data) {
                minute = data[j];
                allMins[minute.minute] = minute.minute;
            }
        }
        allMins = allMins.map(function(d) { return d; });
        
        // get highest event count
        var maxEventCount = 0;
        for (var i in allData) {
            data = allData[i].minutes
            for (var j in data) {
                minute = data[j];
                if (maxEventCount < minute[dimension])
                { maxEventCount = minute[dimension]; }
            }
        }

        var x = d3.scale.ordinal()
            .domain(allMins)
            .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
            .domain([1, maxEventCount])
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .interpolate("basis")
            .x(function(d, i) { 
                return Math.ceil(x(d.minute));
            })
            .y(function(d, i) { 
                return Math.ceil(y(d[dimension] + 1));
            });

        var focus = svg.append("g")
            .attr("class", "focus")
            .append("text")
            .attr("fill", "black")
            .attr("x", (width - 120) + "px")
            .attr("y", "0px")
            .attr("font-size", "18px")
            .attr("class", "focus-label")
            .attr("opacity", "0.0")
        
        var cColor = d3.scale.category10();

        svg.call(nbadvPlotter.plotX, width, height, xAxis);
        svg.call(nbadvPlotter.plotY, width, height, yAxis);
        
        //console.log(allData);
       
        var data = allData;

        svg.call(nbadvPlotter.makeQuarterLines, 
                width, height,
                allMins,
                [x(11),x(23),x(35),x(47)]);

        svg.selectAll("panepath")
            .data(data).enter()
          .append("path")
            .attr("label", function (d, i) { return data[i].name; })
            .attr("class", "multi-line")
            .attr("fill", "none")
            .attr("stroke", function(d, i) { var el = data[i].name; return cColor(el); } )
            .attr("stroke-width", "3px")
            .attr("d", function(d) { return line(d.minutes); })
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
            });
        
            
        return svg;
    }
    
    /*
     */
    nbadvPlotter.addPlotToBodyURL = function(title, url, dimension, plotFunction)
    {
        console.log("fetching = " + url);
        d3.json(url, function(error, data) {
            //nbadvPlotter.addPlotToBody(title, data);
            plotFunction(title, data, dimension);
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
            .style("background", "#fff")
            .style("border-style", "solid")
            .style("border-thickness", "1px")
            .style("border-color", "rgba(210,210,210,1.0)")
            .style("margin", "15px")
            .style("width","1000px")
            .style("display", "block")
            .style("margin", "auto")
            .attr("class", "nbaviswindow");
        
        var titleContainer = container.append("div")
            .attr("align", "left")
            .style("text-align", "left")
            .style("padding", "10px")
            .style("display", "block")
            .style("margin-left", "20px")
            .style("font-size", "20px");

        titleContainer.append("button")
            .attr("onclick", "$(this).parent().parent().remove();")
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
            .html("-");
       
        titleContainer
            .append("span")
            .style("margin-left", "10px")
            .html(title);


        container.append("div");

        return container;
    }

    /*
     * append a plot to the body
     */
    nbadvPlotter.addPlotToBody = function(title, data, dimension)
    {
        var container = nbadvPlotter.getPlotContainer(title);
        nbadvPlotter.appendSVGPlot(container, data, dimension, 1000, 200);
        nbadvPlotter.appendSVGLinePlot(container, data, dimension, 1000, 200);
    }
    
    /*
     * append a plot to the body
     */
    nbadvPlotter.addMultiLinePlotToBody = function(title, data, dimension)
    {
        console.log(data);
        var container = nbadvPlotter.getPlotContainer(title);
        nbadvPlotter.appendSVGMultiLinePlot(container, data, dimension, 1000, 400);
    }
    
    /*
     * append a plot to the body
     */
    nbadvPlotter.addSimilarPlotToBody = function(title, data, dimension)
    {
        nbadvPlotter.addMultiLinePlotToBody(title, data, dimension)
    }
    
    /*
     * append a graph to the body
     */
    nbadvPlotter.addSimilarGraphToBody = function(title, data, dimension)
    {
        console.log(data);
        var container = nbadvPlotter.getPlotContainer(title);
        nbadvPlotter.appendFDLGraph(container, data, dimension, 1000, 600);
    }

    return nbadvPlotter;

})();

