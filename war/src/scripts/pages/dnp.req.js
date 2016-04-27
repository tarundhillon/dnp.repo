/**
 * http://usejsdoc.org/
 */

console.log("dnp.req.js configuring require.js");
// require(['/src/scripts/util/dnp.config.js'],function(){
// 	require(['Requirements']);
// });




var debug = true, moment, reqData, reqSetting,tabletop;


define('dnpReq',['jquery','moment','dnpHelper','d3','reqmgt','tabletop'],
		function ($, moment ,dnpHelper, d3, reqmgt, tabletop){
	this.moment = moment;
	this.tabletop = tabletop;
	dnpHelper.setupPage();

	$('.dataSource').checkbox({
		onChange: changeDataSource
	});

	reqSetting = {
		sheetName: 'Core Banking Function Scope',
		sheetKey : '1qDCaMvSleuMLIoR9ecrtVGmTTOSeGRpo9yrz1fGQbwY',
		//sheetKey : '1SoQE74p0YcSahn5VWlZK8C59YzaQ5uJrFPM8NrJeUk0',
		simpleSheet: true,
		functionMapID: '#functionalMap',
		progressID: '#progressID',
		sunBurst: '#sunBurst',
		sunBurstRoot: '#sunBurstHeader',
		sunBurstHover: '#sunBurstHover',
		sunBurstOverview: '#sunBurstOverview',
		decisionFramework: '#decisionFramework'
	};
	
	readReqData(reqSetting);




function readReqData(reqSetting) {
	var startTime = moment();
	if(debug) console.log("Fetching data from "+reqSetting.sheetName+":"+reqSetting.sheetKey);
	dnpHelper.showLoader(reqSetting.functionMapID);
	// temp workaround for internet connection 
	//reqData = prepareReqData(JSON.parse(localStorage.getItem('testDataSet')));
	tabletop.init( {
		key : reqSetting.sheetKey,
		simpleSheet: reqSetting.simpleSheet,
		

		callback: function(data, tabletop) {
			dnpHelper.logTime(startTime,'data fetch');
			if(debug) console.log(data.length+" records fetched");
			
			reqData = prepareReqData(data);

			//temporary work around 

			

			reqmgt.makeFunctionMap(reqData,reqSetting);
			reqmgt.makeProgressOverview(reqData,reqSetting);
			reqmgt.makeSunBurst(reqData,reqSetting);
			
			// var tempUrl = '/src/scripts/dnpviz/pages/flare.json';
			// d3.json(tempUrl, function(error, root) {
			// 	reqData.tree = root;
			// 	makeSunBurst(reqData,reqSetting);
			// });

			dnpHelper.hideLoader();

		}
		
	});
}

function prepareReqData(data){
	var level0 = [], level1 = [], level2 = [], level3 = [],statusKeys=[], tree={};

	tree.name = 'root';
	tree.children = [];
	//data = JSON.parse(localStorage.getItem('testDataSet'));
	data.forEach(function(req,i){ // prepare keys
		//console.log(req);
		if(!level0.contains(req.Level0)) level0.push(req.Level0);
		if(!level1.contains(req.Level1)) level1.push(req.Level1);
		if(!level2.contains(req.Level2)) level2.push(req.Level2);
		if(!level3.contains(req.Level3)) level3.push(req.Level3);
		if(!statusKeys.contains(req.Status)) statusKeys.push(req.Status);
		tree = treeAdd(tree,req,0);
		

	});



	reqData = {
		'data': data,
		'keys0': level0,
		'keys1': level1,
		'keys2': level2,
		'keys3': level3,
		'statusKeys' : statusKeys,
		'tree': tree
	};
	//if(debug) console.log('Level 0 ::'+level0.length+', Level 1 ::'+level1.length+', Level 2 ::'+level2.length+', Level 3 ::'+level3.length);
	return reqData;
}

function getReq(data,lev,val){
	return data.filter(function(obj){return obj[lev]===val;});
}

//var reqLevel = ['Level0','Level1','Level2','Level3'];
var reqLevel = ['Level0','Level1','Level2'];
var found = false;
function treeAdd(tree,req, lev){
	if(tree !== undefined && lev <4){
		if(tree.name === 'root'){
			found = false;
			for(var i =0;i<tree.children.length;i++)
				if(tree.children[i].name === req[reqLevel[lev]]){
					found = true;
					treeAdd(tree.children[i],req,lev);
					return tree;
				}
			
			if(!found)
				tree = pushReq(tree,req,lev);
		}else{
			if(tree.name === req[reqLevel[lev]]){
				found = false;
				lev++;
				if(lev<reqLevel.length && tree.children !== undefined){
					for(var k = 0; k<tree.children.length; k++)
						if(tree.children[k].name === req[reqLevel[lev]]){
							found = true;
							treeAdd(tree.children[k],req,lev);
							return;
						}

					if(!found){
						tree = pushReq(tree,req,lev);
						found = true;
						return;
					}
				}
			}
			else if(tree.children === undefined || tree.children.length === 0) tree = pushReq(tree,req,lev);
		}
		//console.log('tree ::'+JSON.stringify(tree,null,1));
		return tree;
	}
	//if(tree.children === undefined || tree.children.length === 0) tree = pushReq(tree,req);
	//else treeAdd(tree.children[0],req,val);
	//return tree;
	
}

function makeReqObj(obj,req,lev){
	if(lev < reqLevel.length -1){
		obj.name = req[reqLevel[lev]];
		obj.children=[{}];
		makeReqObj(obj.children[0],req,++lev);
	}else{
		obj.name = req[reqLevel[lev]];
		obj.size = 1;
		// obj.depth = reqLevel[lev];
	}
	return obj;
}

function pushReq(tree,req,lev){
	var obj = makeReqObj({},req,lev);
	if(tree.children === undefined) tree.children = [];
	tree.children.push(obj);
	return tree;
}


// function pushReq(tree,req){
// 	var obj = {name: req.Level0,
// 		children:[{name:req.Level1,
// 			children:[{ name: req.Level2,
// 				children:[{name:req.Level3}]
// 			}]
// 		}]
// 	};
// 	if(tree.children === undefined) tree.children = [];
// 	tree.children.push(obj);
// 	return tree;
// }
function nodeContains(nodes, val){
	if(nodes === undefined) return false;
	if( nodes.contains(val) != -1) return true;
	else return false;
	//if (nodes.filter(function(obj){return obj.name === val; }).length > 0) return true;
	
}

var changeDataSource = function (){
	console.log('sheet ID:'+ this.nextElementSibling.innerHTML +','+this.value);
	reqSetting.sheetName = this.nextElementSibling.innerHTML;
	reqSetting.sheetKey = this.value;
	readReqData(reqSetting);
};


});