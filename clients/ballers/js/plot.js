
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
            .text("event count");
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
    
    nbadvPlotter.appendVectorGraph = function(
            containerSelection, data, dimension, totalWidth, totalHeight) {
        var opt = {epsilon: 20, perplexity: 6};
        var T = new tsnejs.tSNE(opt); // create a tSNE instance
        var Y;
        var stepNum = 0;
        var tx=0, ty=0;
        var ss=1;
        var stepMax = 300;
        
        var margin = {top: 10, right: 10, bottom: 10, left: 10};
        var width = totalWidth 
        var height = totalHeight 
        
        var x = d3.scale.linear()
            .domain([0, width])
            .range([0, width]);
        var y = d3.scale.linear()
            .domain([0, height])
            .range([height, 0]);
        
        var brushCell;

        var brushstart = function(p) {
            nbadvPlotter.color = d3.scale.category10();
            if (brushCell !== this) {
                d3.select(brushCell).call(brush.clear());
                //x.domain([200,width]);
                //y.domain([200,height]);
                brushCell = this;
            }
        }

        var players = ['Nash', 'Paul', 'Kidd'];

        var brushmove = function(p) {
            var e = brush.extent();
            var b00 = e[0][0]; 
            var b01 = e[0][1];
            var b10 = e[1][0];
            var b11 = e[1][1];
            players = [];
            svg.selectAll("circle").classed("hidden", function(d, i) {
                var xp = ((Y[i][0]*20*ss + tx) + 400);
                var yp = ((Y[i][1]*20*ss + ty) + 400) * (-1) + height;
                var value = b00 > xp || xp > b10
                    || b01 > yp || yp > b11;
                if (!value) { 
                    d3.select(this).attr("fill", function(d) { return nbadvPlotter.color(d); });
                    players.push(d); 
                } else {
                    d3.select(this).attr("fill", "SteelBlue" );
                };
                return value;
            });
        }

        var brushend = function(p) {
            if (brush.empty()) svg.selectAll(".hidden").classed("hidden", false);
            //console.log("players = " + JSON.stringify(players));
            updateSecondaryGraph("#secondary-Shot", "Shot", {}, JSON.stringify(players));
            updateSecondaryGraph("#secondary-TO", "TO", {}, JSON.stringify(players));
            updateSecondaryGraph("#secondary-Reb", "Reb", {}, JSON.stringify(players));
            updateSecondaryGraph("#secondary-Assist", "Assist", {}, JSON.stringify(players));
            updateSecondaryGraph("#secondary-Foul", "Foul", {}, JSON.stringify(players));
            updateSecondaryGraph("#secondary-FT", "FT", {}, JSON.stringify(players));
        }

        var brush = d3.svg.brush()
            .x(x)
            .y(y)
            .on("brushstart", brushstart)
            .on("brush", brushmove)
            .on("brushend", brushend);

        var updateEmbedding = function() {
          var Y = T.getSolution();

          // TODO: cleanup circle/text pairing
          var datapoints = svg.selectAll('circle')
              .data(data.words)
              .attr("cx",
                  function(d,i) { 
                    return ((Y[i][0]*20*ss + tx) + 400);
                  })
              .attr("cy",
                  function(d,i) { 
                    return ((Y[i][1]*20*ss + ty) + 400);
                  });
          var datapoints = svg.selectAll('text')
              .data(data.words)
              .attr("x",
                  function(d,i) { 
                    return ((Y[i][0]*20*ss + tx) + 400) + 6;
                  })
              .attr("y",
                  function(d,i) { 
                    return ((Y[i][1]*20*ss + ty) + 400) + 6;
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

        g.append("circle")
            //.attr("fill", function(d) { return nbadvPlotter.color(d); })
            .attr("fill", "SteelBlue" )
            .attr("r", "6px");
        g.append("text")
            .attr("text-anchor", "top")
            .attr("font-size", 12)
            .text(function(d) { return d; });

        var zoomListener = d3.behavior.zoom()
            .scaleExtent([0.1, 10])
            .center([0,0])
            .on("zoom", zoomHandler);
        
        brushend(null);
        
        zoomListener(svg);

        var toggleZoomBrush = function() {
            if (zoomBrushMode) {
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
            zoomBrushMode = !zoomBrushMode;
            return zoomBrushMode;

        }

        var zoomBrushMode = true;
        
        svg.append("rect")
            .attr("x", 5)
            .attr("y", 5)
            .attr("width", 55)
            .attr("height", 25)
            .attr("fill", "#bbb")

        svg.append("text")
            .attr("x", 15)
            .attr("y", 20)
            .attr("text-anchor", "top")
            .attr("font-size", 14)
            .style("cursor", "pointer")
            .on("click", function(d) { 
                toggleZoomBrush(); 
                d3.select(this).text(function() { return zoomBrushMode ? "brush" : "zoom"; } );
            })
            .text(function() { return zoomBrushMode ? "brush" : "zoom"; } );

        return svg;
    }
    
    nbadvPlotter.appendSVGMultiLinePlot = function(
            containerSelection, allData, dimension, totalWidth, totalHeight) {
        var margin = {top: 5, right: 5, bottom: 25, left: 40};
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
            //console.log("md = " + JSON.stringify(md));
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
                for (var k in minute) {
                    if (maxEventCount < minute[k]) { maxEventCount = minute[k]; }
                }
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
            .orient("bottom")
            //.ticks(12);
            .tickValues([0,6,12,18,24,30,36,42,48]);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(8);

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
            .attr("y", "20px")
            .attr("font-size", "18px")
            .attr("class", "focus-label")
            .attr("opacity", "0.0")

        svg.call(nbadvPlotter.plotX, width, height, xAxis);
        svg.call(nbadvPlotter.plotY, width, height, yAxis);
        
        //console.log(allData);
        var data = allData;
        
        var area_data = [];

        for (var i in data[0].minutes) {
            var d = data[0].minutes[i];
            console.log("d = " + JSON.stringify(d));
            var a = {};
            a.x_axis = d.minute;
            var beginMin = $('#timeSlidertextmin').html();
            var endMin   = $('#timeSlidertextmax').html();
            console.log("em = " + beginMin + '/' + endMin + "  " + a.x_axis);
            if (beginMin <= a.x_axis && a.x_axis <= endMin) {
                area_data.push(a);
            }
        }
        console.log("adl = " + area_data.length);

        var area = d3.svg.area()
            .interpolate("basis")
            .x(function(d) { console.log("d = " + JSON.stringify(d)); return Math.ceil(x(d.x_axis)); })
            .y0(height)
            .y1(function(d) { 
                var v = y(y.domain()[y.domain().length-1]);
                console.log("YR = " + v); 
                return v; 
            });
        
        svg.append("path")
            .datum(area_data)
            .attr("class", "area")
            .attr("opacity", ".05")
            .attr("fill", "#000")
            .attr("stroke", "blue")
            .attr("d", area);
            

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
            .attr("stroke-width", "2px")
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
            .style("background", "#fff")
            .style("border-style", "solid")
            .style("border-thickness", "1px")
            .style("border-color", "#ddd")
            .style("border-radius", "3px")
            .style("margin", "15px")
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
     * append a vector graph to the body
     */
    nbadvPlotter.addVectorGraphToBody = function(title, data, dimension)
    {
        var container = nbadvPlotter.getPlotContainer(title);
        nbadvPlotter.appendVectorGraph(container, data, dimension, 600, 700);
    }

    return nbadvPlotter;

})();

