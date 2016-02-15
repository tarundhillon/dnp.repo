define('reqmgt',['moment','dnphelper','semui'],
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
					
					html+="<div class='ui modal' id='modal_"+obj.ID+"'>";
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
		html+="<div class='ui modal' id='"+modalID+"'>";
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