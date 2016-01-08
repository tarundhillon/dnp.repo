/**
 * http://usejsdoc.org/
 */
define('hexbin',['d3hexbin'],function(d3hexbin){
	
	var width = 600,
    height = 450,
    i = -1,
    θ = 0,
    δθ = .02,
    n = 200,
    k = 1, // samples to replace per frame
    hexR = 10,
    area = 50;
var randomX = d3.random.normal(width / 2, 50),
    randomY = d3.random.normal(height / 2, 50),
    points = d3.range(n).map(function() { return [randomX(), randomY()]; });

var color = d3.scale.linear()
    .domain([0, 10])
    //.range(["white", "#00a1de"])
    //.range(["white", "#DB2828"])
    .range(["#DB2828", "white"])
    .interpolate(d3.interpolateLab);

var hexbin = d3.hexbin()
    .size([width, height])
    .radius(hexR);

// var svg = d3.select("#hexbin")
//     .append("svg")
//     .attr("width", width)
//     .attr("height", height);

var svg = d3.select("#hexbin")
    .append("svg")
    .attr("viewBox", "0 0 700 500")
    .attr("width",width)
    .attr("height",height)
    .attr("preserveAspectRatio", "xMinYMin meet");



var hexagon = svg.append("g")
    .attr("class", "hexagons")
    .selectAll("path")
    .data(hexbin(points))
    .enter().append("path")
    .attr("d", hexbin.hexagon(hexR))
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .style("fill", function(d) { return color(d.length); });



d3.timer(function() {
  θ += δθ;
  randomX = d3.random.normal(width / 2 + area * Math.cos(θ), area),
  randomY = d3.random.normal(height / 2 + area * Math.sin(θ), area);

  for (var j = 0; j < k; ++j) {
    i = (i + 1) % n;
    points[i][0] = randomX();
    points[i][1] = randomY();
  }

  hexagon = hexagon
      .data(hexbin(points), function(d) { return d.i + "," + d.j; });

  hexagon.exit().remove();

  hexagon.enter().append("path")
      .attr("d", hexbin.hexagon(hexR))
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  hexagon
      .style("fill", function(d) { return color(d.length); });
});


var xScale = d3.scale.linear()
.domain([0,width])
.range([width,0]);

var yScale = d3.scale.linear()
.domain([height,0])
.range([height-10,0]);
//.range(['High','Medium', 'Low']);

var xAxis = d3.svg.axis()
	.scale(xScale)
	.ticks(5)
	.orient("bottom");

var yAxis = d3.svg.axis()
.scale(yScale)
.ticks(5)
.orient("right");

/*var xAxisGroup = svg.append("g")
.attr("transform","translate(20,"+ (height -20) +")")
.attr("fill","none")
.attr("stroke", "#d0d0d0")
//.attr("stroke-width", 2)
.call(xAxis);

var yAxisGroup = svg.append("g")
.attr("transform","translate("+(width-50) +",20)")
.attr("fill","none")
.attr("stroke", "#d0d0d0")
.attr("class", "grid")
.call(yAxis);
*/

});