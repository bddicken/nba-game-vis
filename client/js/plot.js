

/*
 * append a plot to the body
*/
function addPlotToBody(title, url)
{
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 900 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%d-%b-%y").parse;

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

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json(url, function(error, data) {
      //console.log(data);
      
      x.domain(data.map(function(d) { /*console.log(d);*/ return d.minute; }));
      y.domain([0, d3.max(data, function(d) { return d.Shot; })]);
      
      svg.append("text")
          .attr("value", title);

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
}

