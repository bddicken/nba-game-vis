
nbadvPlotter = (function(){

    var nbadvPlotter = {}

    nbadvPlotter.color = d3.scale.category10();

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
    
    nbadvPlotter.appendVectorGraph = function(containerSelection, data, dimension, totalWidth, totalHeight) {
        var opt = {epsilon: 15, perplexity: 6};
        var T = new tsnejs.tSNE(opt); // create a tSNE instance
        var Y;
        var stepNum = 0;
        var tx=0, ty=0;
        var ss=1;
        var stepMax = 200;
        
        var margin = {top: 10, right: 10, bottom: 10, left: 10};
        var width = totalWidth 
        var height = totalHeight 
        
        var x = d3.scale.linear()
            .domain([0, width])
            .range([0, width]);
        var y = d3.scale.linear()
            .domain([0, height])
            .range([height, 0]);
        
        var brush = d3.svg.brush()
            .x(x)
            .y(y)
            .on("brushstart", brushstart)
            .on("brush", brushmove)
            .on("brushend", brushend);
        
        var brushCell;

        var brushstart = function(p) {
            if (brushCell !== this) {
                d3.select(brushCell).call(brush.clear());
                //x.domain([200,width]);
                //y.domain([200,height]);
                brushCell = this;
            }
        }

        var brushmove = function(p) {
            var e = brush.extent();
            var b00 = e[0][0]; 
            var b01 = e[0][1];
            var b10 = e[1][0];
            var b11 = e[1][1];
            svg.selectAll("text").classed("hidden", function(d, i) {
                var xp = ((Y[i][0]*20*ss + tx) + 400);
                var yp = ((Y[i][1]*20*ss + ty) + 400) * (-1) + width;
                return b00 > xp || xp > b10
                    || b01 > yp || yp > b11;
            });
        }

        var brushend = function(p) {
            if (brush.empty()) svg.selectAll(".hidden").classed("hidden", false);
        }

        var updateEmbedding = function() {
          var Y = T.getSolution();
          var datapoints = svg.selectAll('text')
              .data(data.words)
              .attr("x",
                  function(d,i) { 
                    return ((Y[i][0]*20*ss + tx) + 400);
                  })
              .attr("y",
                  function(d,i) { 
                    return ((Y[i][1]*20*ss + ty) + 400);
                  });
        }

        var zoomHandler = function() {
            tx = d3.event.translate[0];
            ty = d3.event.translate[1];
            ss = d3.event.scale;
            updateEmbedding();
        }

        var step = function() {
            if (stepNum++ > stepMax) { return; }
            var cost = T.step(); 
            updateEmbedding();
        }
    
        T.initDataRaw(data.vecs); // init embedding
        setInterval(step, 0);

        // get min and max in each column of Y
        var Y = T.Y;
        
        var svg = containerSelection.append("svg") // svg is global
            .style("display", "inline")
            .attr("width", width)
            .attr("height", height);
        
        var containerGroup = svg
            .append("g")
            .attr("class", "cont");

        var g = containerGroup.selectAll(".b")
            .data(data.words)
            .enter().append("g")
            .attr("class", "u");

        g.append("text")
            .attr("text-anchor", "top")
            .attr("font-size", 12)
            .attr("fill", "#333")
            .text(function(d) { return d; });

        var zoomListener = d3.behavior.zoom()
            .scaleExtent([0.1, 10])
            .center([0,0])
            .on("zoom", zoomHandler);
        
        zoomListener(svg);

        var zoomMode = true;

        // Toggle zooming and brushing with "t"
        document.onkeypress = function (e) {
            e = e || window.event;
            console.log(e.keyCode);
            if (e.keyCode == 116) {
                if (zoomMode) {
                  tzl = d3.behavior.zoom()
                      .scaleExtent([0.1, 10])
                      .center([0,0])
                      .on("zoom", undefined);
                  tzl(svg);
                  containerGroup
                    .append("g")
                    .attr("class", "brush")
                    .call(brush);
                }
                else {
                    containerGroup.select(".brush").remove();
                    zoomListener(svg);
                }
                zoomMode = !zoomMode;
            }
        };
        return svg;
    }
    
    nbadvPlotter.appendSVGMultiLinePlot = function(containerSelection, allData, dimension, totalWidth, totalHeight)
    {
        var margin = {top: 20, right: 20, bottom: 30, left: 50};
        var width = totalWidth - margin.left - margin.right;
        var height = totalHeight - margin.top - margin.bottom;
            
        var svg = containerSelection
            .append("svg")
            .style("display", "inline")
            .attr("class", "svg-mutiline-plot")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // get all minutes
        var allMins = [];
        for (var i in allData) {
            var md = allData[i].minutes
            console.log("md = " + JSON.stringify(md));
            for (var j in md) {
                minute = md[j];
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

        svg.call(nbadvPlotter.plotX, width, height, xAxis);
        svg.call(nbadvPlotter.plotY, width, height, yAxis);
        
        console.log(allData);
       
        var data = allData;

        svg.call(nbadvPlotter.makeQuarterLines, 
                width, height,
                allMins,
                [x(11),x(23),x(35),x(47)]);

        svg.selectAll("panepath")
            .data(data).enter()
          .append("path")
            .attr("label", function (d, i) { return data[i].player; })
            .attr("class", "multi-line")
            .attr("fill", "none")
            .attr("stroke", function(d, i) { var el = data[i].player; return nbadvPlotter.color(el); } )
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
            .insert("span", ":first-child") // idiom for prepending in d3
            .style("background", "#fff")
            .style("border-style", "solid")
            .style("border-thickness", "1px")
            .style("border-color", "rgba(210,210,210,1.0)")
            .style("margin", "15px")
            //.style("width","1000px")
            .style("display", "inline-block")
            .style("margin", "auto")
            .attr("class", "nbaviswindow");

        container.append("span");

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
    
    /*
     * append a vector graph to the body
     */
    nbadvPlotter.addVectorGraphToBody = function(title, data, dimension)
    {
        var container = nbadvPlotter.getPlotContainer(title);
        nbadvPlotter.appendVectorGraph(container, data, dimension, 800, 800);
    }

    return nbadvPlotter;

})();

