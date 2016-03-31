/**
 * http://usejsdoc.org/
 */

console.log("dnp.plan.js configuring require.js");

requirejs.config({
		baseUrl: '/src/scripts/',
		paths: {
				// packages
				alertify: 'js/alertify.min',
				d3: 'js/d3.min',
				googleapi: 'js/client',
				handsontable: 'js/handsontable.min',
				jquery: 'js/jquery.min',
				moment: 'js/moment.min',
				pikaday: 'js/pikaday',
				semui: 'js/semantic.min',
				zeroclipboard: 'js/ZeroClipboard.min',
				
				tabletop: 'js/tabletop', // need to merger these dependencies
				underscore: 'js/underscore-min',
				backbone: 'js/backbone-min',

				tabletopSync:'js/backbone.tabletopSync',

				// code files
				gantt:'dnpviz/gantt/gantt',
				projcontrol: 'dnpviz/pages/projcontrol',
				dnphelper: 'dnp.helper'
		}
		 
});


var debug = true, moment, ganttData, ganttSetting,tabletop;


require(['jquery','moment','dnphelper','d3','alertify','projcontrol','tabletop'],
		function ($, moment ,dhelp, d3, alertify, projcontrol, tabletop){
	
	this.moment = moment;
	this.tabletop = tabletop;
	setupPage(alertify);

	$('.dataSource').checkbox({
		onChange: changeDataSource
	});

	ganttSetting = {
		width: 'auto',
		sheetName: 'Business Transformation',
		sheetKey: '1myBKwg2F1VLwy7P8RFKuGWEdvrV9Yu7gq-3k4H0Mwlk',
		simpleSheet: true,
		containerID: '#ganttContainer',
		dataTableID: '#ganttDataTable',
		dateFormat: '%d/%m/%Y',
		momentDateFormat: 'DD/MM/YYYY',
		maxTaskFontSize: 14,
		defTaskHeight: 25,
		maxTaskHeight: 30,
		defGanttPadding: 40,
		defCarPadding: 20,
		taskColor: ['#00B9FA'],
		catColor: ['#F0F0F0','#DB2828'],
		inDateFormat: 'DD/MM/YYYY',
		//taskColor: ['#00B9FA','#DB2828'],
		//catColor: ['#00B9FA','#DB2828'],
		taskOnClick: ganttTaskOnClick,
		catOnClick: ganttCatOnClick
	};
	
	//	fetch data from google sheet and request gantt
	fetchDataFromGoogleSheet(ganttSetting);
	
});

function fetchDataFromGoogleSheet(ganttSetting) {
	var startTime = moment();
	if(debug) console.log("Fetching data from "+ganttSetting.sheetName+":"+ganttSetting.sheetKey);
	showLoader(ganttSetting.containerID);
	tabletop.init( {
		key : ganttSetting.sheetKey,
		simpleSheet: ganttSetting.simpleSheet,
		callback: function(data, tabletop) {
			logTime(startTime,'google datasheet fetch');
			if(debug) console.log(data.length+" records fetched from google sheet");
			ganttData = prepareGanttData(data);
			makeGanttForWeek();
			hideLoader();
		}
		
	});
}

var changeDataSource = function (){
			console.log('sheet ID:'+ this.nextElementSibling.innerHTML +','+this.value);
			ganttSetting.sheetName = this.nextElementSibling.innerHTML;
			ganttSetting.sheetKey = this.value;
			fetchDataFromGoogleSheet(ganttSetting);
};