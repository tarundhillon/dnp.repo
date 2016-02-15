/**
 * http://usejsdoc.org/
 */

console.log("dnp.req.js configuring require.js");

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
				reqmgt: 'dnpviz/pages/req.mgt',
				dnphelper: 'dnp.helper'
		}
		 
});


var debug = true, moment, reqData, reqSetting,tabletop;


require(['jquery','moment','dnphelper','d3','alertify','reqmgt','tabletop'],
		function ($, moment ,dhelp, d3, alertify, reqmgt, tabletop){
	this.moment = moment;
	this.tabletop = tabletop;
	setupPage(alertify);

	$('.dataSource').checkbox({
		onChange: changeDataSource
	});

	reqSetting = {
		sheetName: 'Core Banking Function Scope',
		sheetKey : '1qDCaMvSleuMLIoR9ecrtVGmTTOSeGRpo9yrz1fGQbwY',
		simpleSheet: true,
		functionMapID: '#functionalMap',
		progressID: '#progressID'
	};
	
	readReqData(reqSetting);

});


function readReqData(reqSetting) {
	var startTime = moment();
	if(debug) console.log("Fetching data from "+reqSetting.sheetName+":"+reqSetting.sheetKey);
	showLoader(reqSetting.containerID);
	tabletop.init( {
		key : reqSetting.sheetKey,
		simpleSheet: reqSetting.simpleSheet,
		callback: function(data, tabletop) {
			logTime(startTime,'data fetch');
			if(debug) console.log(data.length+" records fetched");
			reqData = prepareReqData(data);
			makeFunctionMap(reqData,reqSetting);
			makeProgressOverview(reqData,reqSetting);
			hideLoader();
		}
		
	});
}

function prepareReqData(data){
	var level0 = [], level1 = [], level2 = [], level3 = [],statusKeys=[];
	data.forEach(function(req){ // prepare keys
		//console.log(req);
		if(!level0.contains(req.Level0)) level0.push(req.Level0);
		if(!level1.contains(req.Level1)) level1.push(req.Level1);
		if(!level2.contains(req.Level2)) level2.push(req.Level2);
		if(!level3.contains(req.Level3)) level3.push(req.Level3);
		if(!statusKeys.contains(req.Status)) statusKeys.push(req.Status);
	});

	reqData = {
		'data': data,
		'keys0': level0,
		'keys1': level1,
		'keys2': level2,
		'keys3': level3,
		'statusKeys' : statusKeys
	};
	if(debug) console.log('Level 0 ::'+level0.length+', Level 1 ::'+level1.length+', Level 2 ::'+level2.length+', Level 3 ::'+level3.length);
	return reqData;
}

var changeDataSource = function (){
	console.log('sheet ID:'+ this.nextElementSibling.innerHTML +','+this.value);
	reqSetting.sheetName = this.nextElementSibling.innerHTML;
	reqSetting.sheetKey = this.value;
	readReqData(reqSetting);
};