/**
 * This is 
 */

console.log("dnp.timeline.js configuring require.js");

// require(['/src/scripts/util/dnp.config.js'],function(){
// 	require(['RegulatoryTimeline']);
// });

// requirejs.config({
// 		baseUrl: '/src/scripts/',
// 		paths: {
// 				// packages
// 				alertify: 'js/alertify.min',
// 				d3: 'js/d3.min',
// 				jquery: 'js/jquery.min',
// 				moment: 'js/moment.min',
// 				semui: 'js/semantic.min',
// 				zeroclipboard: 'js/ZeroClipboard.min',
				
// 				tabletop: 'js/tabletop', // need to merger these dependencies
// 				underscore: 'js/underscore-min',
// 				backbone: 'js/backbone-min',

// 				tabletopSync:'js/backbone.tabletopSync',

// 				// code files
// 				dnphelper: 'dnp.helper',
// 				timeline: 'dnpviz/timeline/dnp.timeline'
// 		}
		 
// });


var debug = true, moment, conf, tabletop, fullData;


define('dnpRegTL',['jquery','moment','dnphelper','d3','alertify','tabletop','timeline'],
		function ($, moment ,dhelp, d3, alertify,tabletop,timeline){
	
	this.moment = moment;
	this.tabletop = tabletop;
	setupPage(alertify);

	
	// $('.dataSource').checkbox({
	// 	onChange: changeDataSource
	// });

	conf = {
		data: {},
		width: 'auto',
		sheetName: 'Regulatory Timeline',
		sheetKey: '1pBuj4Rbk5v9b7s8B7kIbuP6NGOv6zLKzXKgkeXjoFbQ',
		simpleSheet: true,
		filterID: '#timeLineFilter',
		containerID: '#timeLineContainer',
		dataTableID: '#timeLineDataTable',
		dateFormat: '%d/%m/%Y',
		momentDateFormat: 'DD/MM/YYYY',
		maxTaskFontSize: 14,
		maxSvgHeight: 500,
		padding:0.01,
		inR:7,
		outR:10,
		lineHeight:30,
		dateUnit: 'year',
		pointColor: ['#DB2828'],
		lineColor: ['#999'],
		bgColor: ['#F0F0F0'],
		textBoxColor: '#D0D0D0',
		textBoxWidth: 100,
		textBoxHeight: 50,
		textBoxPad: 5,
		inDateFormat: 'DD/MM/YYYY',
		pointOnClick: managePointOnClick,
		refreshOnResize: true
	};
	
	semui = require(['semanticui'],function(){
		fetchDataFromGoogleSheet(conf);

	});

	//	fetch data from google sheet and request gantt
	
	
});

function fetchDataFromGoogleSheet(conf) {
	var startTime = moment();
	this.conf = conf;
	if(debug) console.log("Fetching data from "+conf.sheetName+":"+conf.sheetKey);
	showLoader(conf.containerID);
	tabletop.init( {
		key : conf.sheetKey,
		simpleSheet: conf.simpleSheet,
		callback: function(data, tabletop) {
			fullData = data;
			logTime(startTime,'google datasheet fetch');
			if(debug) console.log(data.length+" records fetched from google sheet");
			//ganttData = prepareGanttData(data);
			//makeGanttForWeek();
			setupFilter(conf,data);
			makeTimeLine(data, conf);
			if(conf.refreshOnResize){
				$(window).on('resize',function(){
				console.log('resize detected');
				makeTimeLine(data, conf);
			});}


			hideLoader();
		}
		
	});
}

var managePointOnClick = function(d){
	// may need to to a scroll to here
	updateDataTable(d.objList);
};


function setupFilter(conf,data){
	var html = '';
	var keys = data.map(function(obj){return obj['Short Name']; }).unique();
	html+="<div class='ui inverted red small menu'>";
	html+="<div class='ui small header white item'><i class='filter white icon'></i>Filter Timeline</div>";
	html+="<div class='right menu'>";
	//html+="<a class='item'><input type='checkbox' id='appendFilter'> &nbsp;Append</a>";
	html+="<a class='item' onclick='refreshTimeLine()'><i class='refresh icon'></i> Refresh</a>";
	html+="</div>";
	html+="</div>";
	html+="<div class='ui labels'>";
	keys.sort();
	keys.forEach(function(key){
		html+="<div class='ui label cursor filterKey' >"+key+"</div>";
	});
	html+="</div>";
	$(conf.filterID).html(html);
	$('.filterkey').click(function(obj){
		key = $(this).html();
		resetAllLabels();
		$(this).addClass('red');
		$(this).removeClass('grey');

		var keyData = data.filter(function(obj){return obj['Short Name'] === key;});
		makeTimeLine(keyData, conf);

	});
}

function refreshTimeLine(){
	makeTimeLine(fullData, conf);
	resetAllLabels();
}

function resetAllLabels(){
	$('.filterkey').removeClass('red');
}

function updateDataTable(points){
	html = '';
	html +="<table class='ui red table striped compact'>";
	html +="<thead>";
	html +="<tr>";
	html +="<th></th>";
	html +="<th>Name</th>";
	html +="<th>Description</th>";
	html +="<th>Expected Date</th>";
	html +="</tr>";
	html +="</thead>";
	html +="<tbody>";
	points.forEach(function(point){
		html +="<tr>";
		html +="<td>"+point.id+"</td>";
		html +="<td>"+point['Short Name']+"</td>";
		html +="<td>"+point['Regulatory Event']+"</td>";
		html +="<td>"+point['Expected Date']+"</td>";
		html +="</tr>";
	});
	html +="</tbody>";
	html +="</table>";
	$(conf.dataTableID).html(html);
}