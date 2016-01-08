// require(['jquery','d3','fullpage','alertify',], 
// function ($, d3, fullpage, alertify, ){
var taskOnClick, dataList,curDataListIndex,gmoment;
define('projcontrol',['pikaday','moment','zeroclipboard']
	,function(pikaday, moment,  zeroclipboard){
		console.log("Initialising project control page ..") 
		var ROOT = 'https://2-dot-dnp-digital.appspot.com/_ah/api';
		gmoment = moment;
		if(localhost) ROOT = 'http://127.0.0.1:8888/_ah/api';

		var sHeight = $('#ganttDetailsMenu').parent().height() - 60;	
		var sWidth = $('#ganttDetailsMenu').parent().width() - 20;	
		console.log('sHeight:'+sHeight+' sWidth:'+sWidth);

		gapi.client.load('ganttendpoint', 'v1', function() {
		  	console.log("Google endpoint loaded .. ");

			//load saved entities 
			gapi.client
				.ganttendpoint
				.listGantt()
				.execute(function(resp){
					console.log(resp);
					dataList = resp;
					dataList.items.sort(sortDataList);	
					curDataListIndex = 0;
					// load the gantt
					var ganttChart = require(['gantt','handsontable'], 
						function(gantt, handsontable){
							var json = prepareJson(dataList.items[curDataListIndex].json);
							makeGant('mainGantt', json, 'ganttDetaisTable');		
					});	

					// populate the drop down 	
					//$('#ganttList').dropdown();
					var curID = dataList.items[curDataListIndex].id;
					var selText = ''
					dataList.items.forEach(function(item,i) { 
						if(curID == item.id)  selText = 'selected'; 
						else selText = '';
					    $('#ganttList')
					     	.append("<option "+selText
					     		+" value='"+item.id +"' >"
					     		+getTimeSelectString(item.timeStamp)
					     		+"</option>");	
					});	
					// make a semantic dropdown	
					$('#ganttList').dropdown({
						on:'hover',
						transition: 'drop',
						sortSelect: 'true',
						//action: 'combo',
						placeholder: 'Select week',
						onChange: function(value, text,elem){
									curDataListIndex = getCurDataListIndex(value);
									makeGant('mainGantt', prepareJson(getJsonById(value)),'ganttDetaisTable');			

								}
					});
					
				});
		}, ROOT);
		
		function getCurDataListIndex(val){
			var index = -1;
			dataList.items.forEach(function(item,i){
				if(item.id == val){
					index = i; 
				} 
			});
			return index;
		}


		function getTimeSelectString(t){
			return 'W'+moment(parseFloat(t)).format('W')
			+' - '+ moment(parseFloat(t)).format('DD MMM')
			+' ('+ moment(parseFloat(t)).fromNow()+')'
		}

		function getJsonById(jid){
			jid = jid + "";
			if(!dataList) return "dataList epmty";
			for (var i = 0; i < dataList.items.length; i++) {
				if(dataList.items[i].id == jid) return dataList.items[i].json; 	
			}
			return jid + " not found in dataList";
		}	


		function prepareJson(jsonStr){
			jsonStr = jsonStr.replace('"[','[');
			jsonStr = jsonStr.replace(']"',']');
			return JSON.parse(jsonStr);
		}

		$('.menu .item').tab();
		
		

	
		// save datatable ganttendpoint.insertGantt
		$("#saveItem").click(function(){
			var jsonData = makeJSON(datatable.getData());
			var jsonString = JSON.stringify(jsonData);
			console.log("Saving"+jsonData);
			var jsonInsert = '{"name":"Wokmoom", "json":"'+jsonData+'"}'
			gapi.client
				.ganttendpoint
				.insertGantt({'name': 'Wokmoom', 'json': '"'+jsonString+'"' })
				.execute(function(resp){
					console.log("response ::"+JSON.stringify(resp));
					alertify.message(resp);
			});
		});	

		// this function is called when the gantt task is clicked
		taskOnClick = function(e){
		  console.log('bar clicked >> task:'+e.task);
		  $('#'+taskDetailsID).show();
		  $('#'+taskDetailsID+'History').show();
		  $('#ganttHistoryTableMessage').html(e.type+" : "+e.task);
		  $('#'+taskDetailsID+' > tbody').html("");

		  addTaskClickRow(dataList.items[curDataListIndex].timeStamp,e,"*",taskDetailsID);
		  //i class='edit icon' onclick=alert(\' hello\')></i>");
		  $('#'+taskDetailsID+' > tbody:last-child').append('<tr><td colspan=7 >'+
              '<i class="history grey icon"></i>'+ 
              '<span class="ui text small grey" >Progress</span></td></tr>');



		  for (var i = 0; i < dataList.items.length; i++) {
		  	jsonArray = prepareJson(dataList.items[i].json)
		  	for (var k = 0; k < jsonArray.length; k++)
		  		if(curDataListIndex != i && jsonArray[k].type == e.type && jsonArray[k].task == e.task) 
		  			addTaskClickRow(dataList.items[i].timeStamp,jsonArray[k],'',taskDetailsID);	
		  };

		}

		function addTaskClickRow(t,e,postFix,detailsID){
			var timeStamp;
			// if(t != '*') timeStamp = moment(parseInt(t)).fromNow();
			timeStamp = moment(parseInt(t)).fromNow()+postFix;
			$('#'+detailsID+' > tbody:last-child')
			    .append('<tr>'+
			      '<td> '+ timeStamp+' </td>'+
			      '<td>'+ e.type +'</td>'+
			      '<td>'+ e.task +'</td>'+
			      '<td>'+ e.pert +'</td>'+
			      '<td>'+ e.startTime +'</td>'+
			      '<td>'+ e.endTime +'</td>'+
			      '<td>'+ e.details +'</td>'+
			      '</tr>');

			  $("#detailsSegment").find(".active").removeClass('active');
			  $("[data-tab='third']").addClass('active');  
		}

		function sortDataList(a,b){
			return b.timeStamp - a.timeStamp;
		}




});	