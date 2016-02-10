
define('projcontrol',['gantt','moment','dnphelper','semui'],
	function(gantt, moment, dhelp,semui){
	console.log('project control dependencies loaded');
});

function makeGanttAndTableView(ganttData, ganttSetting){
	if(debug) console.log(arguments.callee.name+
		' :: ganttData ='+ganttData.length+', ganttSetting='+ganttSetting.toString);
	makeGant(ganttData,ganttSetting);

}



// manage the change of week
function makeGanttForWeek(week){
	if(ganttData === undefined) fetchDataFromGoogleSheet(ganttSetting);
	if(week !== undefined && week!='task') ganttData.week = week;

	if(week != 'task'){
		ganttData.data = ganttData.fulldata.filter(function(item){return item.week == ganttData.week;});
		ganttData.taskFocus = false;
	}else{
		ganttData.taskFocus = true;
	}

	makeGanttAndTableView(ganttData.data, ganttSetting);
	makeTimelineHeader(ganttData ,ganttSetting);
	makeGanttDataTable(ganttData ,ganttSetting);
}

// function to draw the 
function makeGanttDataTable(ganttData ,ganttSetting){

	html="<div class='ui grid'><div class='computer only row'>";
	html+="<span class='ui small red header left floated'>Summary : "+ganttData.week+"</span>";
	html+="<table class='ui small red compact striped table'>";
	html+="<thead>";
	html+="<tr >";
		//html+="<th>#</th>";
		//html+="<th>Week</th>";
		
		if(ganttData.taskFocus) html+="<th>Week</th>";
		else html+="<th>Category</th>";
		//html+="<th>RAG</th>";
		html+="<th>Task</th>";
		html+="<th>RAG</th>";
		html+="<th>%</th>";
		html+="<th><i class='calendar icon'></i> Start</th>";
		html+="<th><i class='calendar icon'></i> End</th>";

		html+="<th class='four wide'><i class='comments icon'></i> Notes</th>";
	html+="</tr>";
	html+="</thead>";
	html+="<tbody>";
	
	ganttData.data.forEach(function(obj){
		taskAlert = calTaskAlerts(obj);
		html+="<tr>";
			//html+="<td>"+obj.id+"</td>";
			//html+="<td>"+obj.week+"</td>";
			if(ganttData.taskFocus){
				html+="<td>"+obj.type+"</td>";
				html+="<td>"+obj.task+"</td>";
			}else {
				html+="<td class='cursor' onclick='ganttCatOnClick(\""+obj.type+"\")' data-content='Click to view Category History'>"+obj.type+"</td>";
				html+="<td class='cursor' onclick='tableTaskOnClick(\""+obj.id+"\",\""+obj.task+"\",\""+obj.week+"\")' data-content='Click to view Task History'>"+obj.task+"</td>";
			}
			html+="<td><div class='ui empty "+getRAGColor(obj.rag)+" label'></div></td>";
			html+="<td>"+taskAlert.pertHTML+" "+intPad(obj.pert,2)+"%</div></td>";
			
			html+="<td>"+taskAlert.startTimeHTML+" "+obj.startTime+"</td>";
			html+="<td>"+taskAlert.endTimeHTML+" "+obj.endTime+"</td>";
			html+="<td>"+obj.details+"</td>";
		html+="</tr>";
	});

	html+="</tbody>";
	html+="</table>";
	html+="</div></div>";
	$(ganttSetting.dataTableID).html(html);
	jackPopup();
	//$(ganttSetting.containerID).css('display','inline');
	//$(ganttSetting.containerID).css('border','0');
}

function calTaskAlerts(obj){
	var taskAlert={};
	var prevWeek = getPrevWeek(obj);
	var prevObjs = ganttData.fulldata.filter(function(item){ return item.id === obj.id && item.week === prevWeek;});
	if(prevObjs.length > 0){
		prevObj = prevObjs[0];
		//Manage % alters
		taskAlert.pert = parseInt(prevObj.pert,10) - parseInt(obj.pert,10);

		if(taskAlert.pert > 0)
			taskAlert.pertHTML = "<i class='caret down red icon' data-content='Dropped by "+taskAlert.pert+"%, from "+prevObj.pert+"% to "+obj.pert+"%'></i>";
		else if(taskAlert.pert===0)
			taskAlert.pertHTML = "<i class='icon'></i> ";
		else if(taskAlert.pert<0)
			taskAlert.pertHTML = "<i class='caret up green icon' data-content='Increased by "+taskAlert.pert+"%, from "+prevObj.pert+"% to "+obj.pert+"%'></i>";
	
		//Manage start date alerts 
		taskAlert.startTime = moment(obj.startTime,ganttSetting.inDateFormat).diff(moment(prevObj.startTime,ganttSetting.inDateFormat),'days');
		if(taskAlert.startTime > 0)
			taskAlert.startTimeHTML = "<i class='caret right red icon' data-content='Delayed by "+taskAlert.startTime+" days'></i>" ;
		else if(taskAlert.startTime < 0)
			taskAlert.startTimeHTML = "<i class='caret left green icon' data-content='Reduced by "+taskAlert.startTime+" days'></i>";
		else taskAlert.startTimeHTML = "<i class='icon'></i>";

		//manage end date alerts
		taskAlert.endTime = moment(obj.endTime,ganttSetting.inDateFormat).diff(moment(prevObj.endTime,ganttSetting.inDateFormat),'days');
		if(taskAlert.endTime > 0)
			taskAlert.endTimeHTML = "<i class='caret right red icon' data-content='Delayed by "+taskAlert.endTime+" days'></i>" ;
		else if(taskAlert.endTime < 0)
			taskAlert.endTimeHTML = "<i class='caret left green icon' data-content='Reduced by "+taskAlert.endTime+" days'></i>";
		else taskAlert.endTimeHTML = "<i class='icon'></i>";
	}
	else {
		taskAlert.pert=0;
		taskAlert.pertHTML = "<i class='icon'></i> ";

		taskAlert.startTime = 0;
		taskAlert.startTimeHTML = "<i class='icon'></i>";
		
		taskAlert.endTime = 0;
		taskAlert.endTimeHTML = "<i class='icon'></i>";

	}
	return taskAlert;
}

function getPrevWeek(obj){
	index = $.inArray(obj.week,ganttData.weekList);
	if(index > 0) return ganttData.weekList[index-1];
	return obj.week;
}
// Data transformation function to prepare the data	
function prepareGanttData(data){
	var  ganttData = {}, dataList=[], obj, weekList=[];
	data.forEach(function(d){
		obj={};
		obj.id = d.ID.trim();
		obj.task = d.Task.trim();
		obj.type = d.Category.trim();
		obj.startTime = d.Start.trim();
		obj.endTime = d.End.trim();
		obj.details = d.Notes.trim();
		obj.pert = d.Pert.trim();
		obj.week = d.Week.trim();
		obj.rag = d.RAG.trim();

		if($.inArray(obj.week,weekList) == -1) weekList.push(obj.week);
		dataList.push(obj);
	});
	
	ganttData.week = obj.week;
	ganttData.fulldata = dataList;
	ganttData.weekList = weekList;
	return ganttData;
}

function makeTimelineHeader(ganttData,ganttSetting){
	var html = '';
	html+="<div class='ui basic right aligned segment' id='ganttHeader'>";
	html+="<span class='ui small red header left floated'>"+ganttSetting.sheetName+" Overview : "+ganttData.week+"</span>";
	ganttData.weekList.forEach(function(week){
		if(week === ganttData.week) active = 'inverted red';
		else active = '';
		html+="<a href=\"javascript: makeGanttForWeek('"+week+"')\" class='ui "+active+" label'>"+week+"</a>";
	});
	html+="</div>";
	$(ganttSetting.containerID).prepend(html);
}

function tableTaskOnClick(id,name, week){
	var obj = {id: id, task: name, week: week };
	ganttTaskOnClick(obj);
}

var ganttTaskOnClick = function (task){

  if(task.id === undefined)	task = {id: task, task:ganttData.week };
  //console.log(task.task+' clicked');
  var taskData=[],obj={};
  ganttData.weekList.forEach(function(week){
	weekTask = ganttData.fulldata.filter(function(d){ return d.week == week && d.id == task.id;});
	if(weekTask !== undefined && weekTask.length > 0){
		//obj = {};
		obj = $.extend(true, {}, weekTask[0]);
		obj.type = weekTask[0].week;
		obj.week = weekTask[0].category;
		obj.week = weekTask[0].week;
	}
	else {
		// insert empty row to deleted value 
		obj = {};
		obj.startTime ='';
		obj.endTime ='';
		obj.pert = 0;
		obj.type = week;
		obj.week = week;
	}
	taskData.push(obj);
  });
  ganttData.data = taskData;
  ganttData.week = task.task;
  makeGanttForWeek('task');
};

var ganttCatOnClick = function (category){
  console.log(category+' clicked');
  var taskData=[],obj={};
  ganttData.weekList.forEach(function(week){
	weekTasks = ganttData.fulldata.filter(function(d){ return d.week == week && d.type == category;});
	weekTasks.forEach(function (weekTask) {
		if(weekTask !== undefined){
			//obj = {};
			obj = $.extend(true, {}, weekTask);
			obj.type = weekTask.week;
			obj.week = weekTask.category;
			obj.week = week;
		}
		else {
			// insert empty row to deleted value 
			obj = {};
			obj.startTime ='';
			obj.endTime ='';
			obj.pert = 0;
			obj.type = week;
			obj.week = week;
		}
		taskData.push(obj);
	});
  });
  ganttData.data = taskData;
  ganttData.week = category;
  makeGanttForWeek('task');
};



	