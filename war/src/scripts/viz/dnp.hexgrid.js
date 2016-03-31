	// require(['dnpCapGrid'],function(pcOverview){
	// 	pcSetting = {
	// 		containerID: '#projectControl',
	// 		hoverContrainerID: '#hoverProjectControl',
	// 		maxWidth: 500,
	// 		maxHeight: 500,
	// 		hoverIncr: 0.3,
	// 		defColor: '#DB2828',
	// 		emptyColor: '#D0D0D0',
	// 		highColor: '#767676', //blue 2185d0
	// 		textColor: 'white',
	// 		refreshOnResize: true,
	// 		links: [{ href:'/pages/plan.html',text:'Digital PMO'},
	// 				{ href:'/pages/plan.html',text:''},
	// 				{ href:'/pages/plan.html',text:''},
	// 				{ href:'/pages/plan.html',text:''},
	// 				{ href:'/pages/req.html',text:'Requirements'},
	// 				{ href:'/pages/plan.html',text:''}]
	// 	};
	// 	makePCOverview(pcSetting);
	// 	if(pcSetting.refreshOnResize){
	// 		$(window).on('resize',function(){
	// 			console.log('resize detected');
	// 			makePCOverview(pcSetting);
	// 		});
	// 	}
	// });

define('dnpHexGrid',['dnphelper','d3hexbin'],
	function(dhelp){
	//console.log('project control dependencies loaded');
});

function autoDimention(pcSetting){
	var svgDim = { height:pcSetting.maxHeight,
					width:pcSetting.maxWidth,
					hexSize: 0,
					fontSize: '1rem',
					lineHeight: '1'
				};
	var domHeight = $(pcSetting.containerID).height();
	var domWidth = $(pcSetting.containerID).width();

	if(domHeight < pcSetting.maxHeight && domHeight !== 0) svgDim.height = domHeight;
	if(domWidth < pcSetting.maxWidth){
		svgDim.width = domWidth;
		svgDim.fontSize = '0.8rem';
		svgDim.lineHeight= '0.8';
	}

	
	svgDim.hexSize = (svgDim.width)/(pcSetting.links.length * 1.3);

	//console.log('svgDim :: '+JSON.stringify(svgDim));
	return svgDim;
}

function makePCOverview(pcSetting){
	//var margin = {top: 20, right: 20, bottom: 30, left: 40},

var svgDim = autoDimention(pcSetting);
var hexDesign = getHexDesign();
var hexData = [], hexBinArray = [];

 pcSetting.links.forEach(function(obj,i){
	hexDataPoint = {};
	hexDataPoint.text = obj.text;
	hexDataPoint.href = obj.href;
	hexDataPoint.x = hexDesign[i].x * svgDim.hexSize;
	hexDataPoint.y = hexDesign[i].y * svgDim.hexSize;
	hexBinArray.push([hexDataPoint.x,hexDataPoint.y]);
	hexData.push(hexDataPoint);
 });
//console.log('hexBinArray='+hexBinArray.length);


var hexbin = d3.hexbin()
    .size([svgDim.width, svgDim.height])
    .radius(svgDim.hexSize);

var x = d3.scale.identity()
    .domain([0, svgDim.width]);

var y = d3.scale.linear()
    .domain([0, svgDim.height])
    .range([svgDim.height, 0]);
$(pcSetting.containerID).html('');
var svg = d3.select(pcSetting.containerID)
	.append("svg")
    .attr("width", svgDim.width)
    .attr("height", svgDim.height)
	.append("g")
    .attr("transform", "translate(0,0)");

svg.append("clipPath")
    .attr("id", "clip")
	.append("rect")
    .attr("class", "mesh")
    .attr("width", svgDim.width)
    .attr("height", svgDim.height);

var group = svg.append("g")
	.attr("class",".hexagonGroup")
    .attr("clip-path", "url(#clip)")
	.selectAll(".hexagon")
    .data(hexbin(hexBinArray))
	.enter();

var hexbox = group.append("path")
    .attr("class", "hexagon")
    .attr("d", hexbin.hexagon())
	.attr("id", function(d,i){return i;})
	.style("stroke", 'white')
	.style('stroke-width',1)
	.style('opacity',1)
    .attr("transform", function(d,i) {return "translate(" + d.x + "," + d.y + ")"; })
    .style("fill", function(d,i){
		if(hexData[i].text === '') return pcSetting.emptyColor;
		else return pcSetting.defColor;
    })
    .on('mouseover', function (d,i){ return manageMouse(i,'on');})
	.on('mouseout', function (d,i){ return manageMouse(i,'out');})
	.on('click', function (d,i){ return manageClick(i,hexData[i].href);});

var hexboxText = group.append("text")
	.attr("class", "hexagon_text")
	.attr("id", function(d,i){return i;})
	.text(function(d,i){return hexData[i].text;})
	.attr("fill", pcSetting.textColor)
	.attr("dy", 0)
	.attr("font-size",svgDim.fontSize)
	.style("text-anchor",'middle')
	//.attr("transform", function(d) { return "translate(" + ( d.x - svgDim.hexSize/2) + "," + ( d.y ) + ")"; })
	.attr("transform", function(d) { return "translate(" + ( d.x) + "," + ( d.y ) + ")"; })
	.call(wrap,1.5*svgDim.hexSize,svgDim)
    .on('mouseover', function (d,i){return manageMouse(i,'on');})
	.on('mouseout', function (d,i){ return manageMouse(i,'out');})
	.on('click', function (d,i){ return manageClick(i,hexData[i].href);});

	animateSVG(hexbox);
	//hexbox.each(animateSVG(hexbox));

}

function animateSVG(hexbox){
	var zoom = 1.05;
	//hexbox
	d3.selectAll(' .hexagonGroup')
	.transition()
	.ease('bounce')
	.duration('5000')
	.attr("transform", function(d,i) {return "translate(" + (d.x * zoom) + "," + (d.y*zoom) + ")"; })
	.transition()
	.ease('circle')
	.duration('5000')
	.attr("transform", function(d,i) {return "translate(" + (d.x) + "," + (d.y) + ")"; })
	.each("end",function(){animateSVG(hexbox);});
}

var manageClick = function(i, href) {
	if (d3.select("text[id='"+i+"']").text() === "") return;
	window.location = href;
};
var manageMouse = function(i,type){
	if (d3.select("text[id='"+i+"']").text() === "") return;

	var strokeWidth = 1, stroke = 'white', opacity = 1, fill = "#DB2828";
	switch(type){
		case 'on':
			strokeWidth = 3;
			stroke = 'white';
			opacity = 1;
			fill = pcSetting.highColor;
			text = 'white';
			break;
		case 'out':
			strokeWidth = 1;
			stroke = 'white';
			opacity = 1;
			fill = pcSetting.defColor;
			text = '#DB2828';
			break;
	}


	d3.selectAll("path[id='"+i+"']")
	.transition()
	.ease('elastic')
	.duration('500')
	.style('opacity',opacity)
	.style("stroke", stroke)
	.style("fill", fill)
	.style("cursor", "pointer")
	.style('stroke-width',strokeWidth);

	var hexboxText = d3.selectAll("text[id='"+i+"']");
	if(hexboxText !== undefined) hexboxText.style("cursor", "pointer");
};

function getHexDesign(){
	return [{x:1,y:2},
				{x:5,y:5},
				{x:1,y:5},
				{x:3,y:5},
				{x:4,y:3},
				{x:3,y:1}];

}

//function to wrap the 
function wrap(text, width,svgDim) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = svgDim.lineHeight, // rem
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "rem");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "rem").text(word);
      }
    }
  });
}
