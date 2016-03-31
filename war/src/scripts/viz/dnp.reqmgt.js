define('reqmgt',['moment','dnphelper','semanticui'],
	function(moment, dhelp,semui){
	console.log('requirements management dependencies loaded');
});


function makeFunctionMap(reqData,reqSetting){
	var html="<div class='ui "+numWord[reqData.keys0.length]+" column grid funcMap stackable'>";
	reqData.keys0.forEach(function(key0){
		html+="<div class='column'>";
		html+="<div class='ui  red segment funcItem' id='"+key0+"'><div class='ui mini red header funcItem'>"+key0+"</div>";
		reqData.keys1.forEach(function(key1){
			var uList = [];
			var setL1 = reqData.data.filter(function(obj){ return obj.Level0 == key0 && obj.Level1 == key1;});
			setL1.forEach(function(obj){
				if(!uList.contains(obj.Level1)){
					html+="<a class='ui red mini label funcItem cursor' id='"+obj.ID+"' data-content='"+obj.Level1+"'>"+obj.Level1+"</a>";
					
					html+="<div class='ui small modal' id='modal_"+obj.ID+"'>";
					html+="<div class='ui small header'>"+obj.Level0+" <i class='caret right icon red'> </i>"+obj.Level1+"</div>";

					var setL2 = reqData.data.filter(function(obj2){ return obj2.Level0 == key0 && obj2.Level1 == key1 && obj2.Level2 == obj.Level2;});
					html +="<div class='content'><div class='ui bulleted list'>";
					setL2.forEach(function(obj2){
						html+="<span class='item red'> "+obj2.Level3+"</span>";
					});
					html+="</div></div>";
					html+="</div>";
					uList.push(obj.Level1);
				}
			});
		});
		html+="</div>";
		html+="</div>";
	});
	html+="</div>";
	
	$(reqSetting.functionMapID).html(html);
	//attach click event
	$(".ui.label.funcItem").click(function(){
		var objID = $(this).attr("ID");
		if(objID.length > 0) $('#modal_'+objID).modal('show');
	});
	//jackPopup();
}

function makeProgressOverview(reqData,reqSetting){
	var html="<table class='ui "+numWord[reqData.keys0.length+2]+" column small red compact celled table progOver stackable'>";
	html+="<thead><tr>";
	html+="<th class='two wide'>Status</th>";
	reqData.keys0.forEach(function(key0){
		html+="<th>"+key0+"</th>";
	});
	html+="</tr><thead>";
	

	html+="<tbody>";
	reqData.statusKeys.sort();
	reqData.statusKeys.forEach(function(key,i){
		html+="<tr>";
		html+="<td>"+key+"</td>";
		reqData.keys0.forEach(function(key0,j){
			html+="<td id='cell_"+i+"_"+j+"' status='"+key+"' level0='"+key0+"' class='prog_cell cursor center aligned'></td>";
		});
		html+="</tr>";
	});
	html+="<tbody>";
	html+="</table>";
	$(reqSetting.progressID).html(html);

	reqData.data.forEach(function(req){
		var cellID = '#cell_'+getStatusIndex(req)+'_'+getLabel0Index(req);
		var curVal = parseInt($(cellID).html(),10);
		if(isNaN(curVal)) curVal = 0;
		$(cellID).html(++curVal);
		$(cellID).attr('reqID',req.ID);
	});

	
	//attach click event
	$(".prog_cell").click(function(){
		//var objID = this.id;
		//console.log(objID);
		var status = $(this).attr('status'), level0 = $(this).attr('level0'), reqID = $(this).attr('reqID');

		var clickData = reqData.data.filter(function(obj){
			return status === obj.Status && level0 === obj.Level0;
		});
		var html='';
		var modalID = "modal_prog_"+reqID;
		html+="<div class='ui small modal' id='"+modalID+"'>";
		html+="<div class='ui small header'>"+level0+" <i class='caret right icon red'> </i></div>";
		html+="<div class='content'><div class='ui bulleted list'>";
		clickData.forEach(function(obj){
			html+="<span class='item red'> "+obj.Level0+", "+obj.Level1+", "+obj.Level2+", "+obj.Level3+"</span>";
		});
		html +='</div></div>';
		html +='</div>';
		$(reqSetting.progressID).append(html);
		$('#'+modalID).modal('show');
	});
}

function getStatusIndex(req){
	var index = -1;
	reqData.statusKeys.sort();
	for(var i=0;i<reqData.statusKeys.length;i++){
		if(reqData.statusKeys[i] == req.Status){
			index = i; break;
		}
	}
	return index;
}

function getLabel0Index(req){
	var index = -1;
	for(var i=0;i<reqData.keys0.length;i++){
		if(reqData.keys0[i] == req.Level0){
			index = i; break;
		}
	}
	return index;
}

var x,y,text,path,arc,g,radius;
// --- Sun brust 
function makeSunBurst(reqData,reqSetting){
	var dim = getDimention(reqSetting.sunBurst,200,450);

	var width = dim.width,
	height = dim.height,
	radius = Math.min(width, height) / 2;

	x = d3.scale.linear()
		.range([0, 2 * Math.PI]);

	y = d3.scale.linear()
		.range([0, radius]);

	var color = d3.scale.category20();

	//var color = d3.scale.linear().domain([0,100]).range(['#DB2828','#ddd'])
	$(reqSetting.sunBurst).html('');

	var svg = d3.select(reqSetting.sunBurst)
	.append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");

	var partition = d3.layout.partition()
		.value(function(d) { return d.size; });

	arc = d3.svg.arc()
		.startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
		.endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
		.innerRadius(function(d) { return Math.max(0, y(d.y)); })
		.outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

	// change data source	
	//root = prepareSunBrustData(reqData);
	root = reqData.tree;
	updateOverview(reqData);
	g = svg.selectAll("g")
		.data(partition.nodes(root))
		.enter().append("g");

	path = g.append("path")
		.attr("d", arc)
		.style("fill", function(d) {
			var c = '';
			if(d.depth===0){
				$(reqSetting.sunBurst).prepend(
					"<div class='ui small red header' id='sunBurstHeader'>"+d.name+"</div>");
				c =  "#DB2828";
			}
			c =  color((d.children ? d : d.parent).name);
			d.color = c;
			return c;
		})
		.on("click", click)
		.on("mouseover", hover)
		.on("mouseout", onMuoseOut);

	text = g.append("text")
		.attr("transform", function(d) { return "rotate(" + computeTextRotation(d) + ")"; })
		.attr("x", function(d) { return y(d.y); })
		.attr("dx", "6") // margin
		.attr("dy", ".35em") // vertical-align
		.text(function(d) {
			//if(d.depth ==1) return d.name;
			return "";
		});



	d3.select(self.frameElement).style("height", height + "px");

function updateOverview(reqData){
	var html = '';
	html+= '<div class="ui four statistics">';
	html+= '<div class="grey statistic"><div class="value">'+ reqData.data.length +"</div><div class='label'>Requirements</div></div><br><br>";
	html+= '<div class="grey statistic"><div class="value">'+ reqData.tree.children.length +"</div><div class='label'>Categories</div></div><br><br>";
	html+= '<div class="statistic"><div class="value" id="curSelection">'+ reqData.tree.children.length +"</div><div class='label'>Selection</div></div><br><br>";
	html+= '<div class="" id="sunBurstSelection"></div>';
	html+= '</div>';

	$(reqSetting.sunBurstOverview).html(html);
}


function onMuoseOut(){
	//$(reqSetting.sunBurstHover).html('');
}
function hover(d){
	var html = '';

	//if(d.parent !== undefined) html += '>>'+d.parent.name+' >>';
	var p = d.parent;
	html +="<span class='ui grey small header'>";
	parents = '';
	while(p !== undefined && p.name !== 'root'){
		parents = p.name +' >> '+ parents;
		p = p.parent;
	}
	html = html + parents+ "</span>";
	html +="<span class='ui small header' style='color:"+this.style.fill+"'>" +d.name +'</span><br>';

	if(d.children === undefined) html+='.';
	else {
		html+='<ul id="sunBrustChildList">';
		d.children.sort().forEach(function(child){
			html+= "<li class='no bullet'> <div class='ui label' style='background-color:"+child.color+"'></div> "+child.name+"</li>";
		});
		html+='</ul>';
	}

	if(d.children !== undefined)$('#curSelection').html(d.children.length);
	$('#curSelection').attr('style','color:'+this.style.fill+'');
	

	$(reqSetting.sunBurstHover).html(html);
}

function click(d){
	// fade out all text elements
	text.transition().attr("opacity", 0);
	//console.log(d.name+' logged');
	$(reqSetting.sunBurstRoot).html(d.name);
	$('#sunBurstSelection').html($(reqSetting.sunBurstHover).html());

	path.transition()
		.duration(750)
		.attrTween("d", arcTween(d))
		.each("end", function(e, i) {
			// check if the animated element's data e lies within the visible angle span given in d
			if (e.x >= d.x && e.x < (d.x + d.dx)) {
			// get a selection of the associated text element
			var arcText = d3.select(this.parentNode).select("text");
			// fade in the text element and recalculate positions
			arcText.transition().duration(750)
				.attr("opacity", 1)
				.attr("transform", function() { return "rotate(" + computeTextRotation(e) + ")"; })
				.attr("x", function(d) { return y(d.y); });
			}
		});
}





// Interpolate the scales!
function arcTween(d) {
  var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
      yd = d3.interpolate(y.domain(), [d.y, 1]),
      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
  return function(d, i) {
    return i
        ? function(t) { return arc(d); }
        : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
  };
}

function computeTextRotation(d) {
  return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
}

}