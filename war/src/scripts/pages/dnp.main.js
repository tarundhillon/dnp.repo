/**
 * http://usejsdoc.org/
 */
//requirejs(['jquery', 'dnpHelper', 'd3'], function ($, dnp_helper, d3){
define('dnpMain',['dnpHelper'], function (dnpHelper){

console.log("dnp.main.js configuring require.js");
console.log("Something working here...x..y..z..");

// $('body').html('<h1> In side main</h1>');
// $('#loader').hide();

var debug = true,
	localhost = window.location.href.indexOf("127.0.0.1") > -1;


//define('dnpMain',['jquery', 'dnphelper', 'd3','hexbin'], function ($, dnp_helper, d3,hexbin){


	console.log("Yellow fox jumping");
	dnpHelper.setupPage();

	//dnpHelper();
			
	//alertify = alertify_local;
	console.log("Required dependencies loaded");
	
	//semanticui = require(['semanticui']);

	if(localhost) {
		//if(debug) alertify.message("Local host detected");
		console.log("Local host detected");
	}

	// configure and notify alerts	
	//alertify.defaults.notifier.position = 'bottom-right';

	// make selection grid 
	

	//load visualisation 
	console.log('launching hexbin');
	//console.log('moment = '+moment);

	// require(["d3"], function(d3) {
	//   console.log(d3.version); // "3.4.3"
	// });
	//console.log('loading dnp.hexbin.js ='+d3.version);
	var viz = requirejs(['hexbin'], function (hexbin){
		//alertify.message("All scripts loaded successfully",1);
		console.log('launching loaded');
		$('#hexbinLoader').hide();
	});
 



var projectControlList={
	name: 'Assurance',
	icon: 'travel',
	color: 'red',
	links:[
	{text:'Business Value Realisation'},
	{text:'Requirements Management', color: 'red', icon:'file text', link:'./req.html'},
	{text:'Planning & Monitoring', color: 'red', icon:'setting', link:'./plan.html'},
	{text:'Change Request Managemet'},
	{text:'Solution Design'},
	{text:'Testing Coverage'},
	{text:'Training', color: '', icon:'student', link:'./training.html'},
	{text:'Target Operating Model',icon:'grid layout',link:'./tom.html'},
	{text:'Organisation Design'},
	{text:'Product Selection'},
	
]};

var industryInsightsList={
	name: 'Insights',
	icon: 'wizard',
	color: 'green',
	links:[
	{text:'Regulatory Timeline', icon:'history', link:'./pages/timeline.html'},
	{text:'Solvency II'},
	{text:'Future Clearing Model'},
	{text:'SEPA'},
	{text:'UK Payments'},
	{text:'Risk Management'},
	{text:'Core Banking Transformation'},
	{text:'Telephony Transformation'},

]};

var dataLabsList={
	name: 'Labs',
	icon: 'lab',
	color: 'blue',
	links:[
	{text:'Earth Quakes', statu: '', icon:'world', link:'./pages/earthquake.html'},
	{text:'Euro Millons'},
	{text:'Cheese'},
	{text:'Brexit'},
	{text:'Block Chain'},
]};


makeSelectionGrid('#projectControlGrid', projectControlList);
makeSelectionGrid('#industryInsightsGrid', industryInsightsList);
makeSelectionGrid('#dataLabsGrid',dataLabsList);


function makeSelectionGrid(domID,conList){
	var html = "";
	html+="<div class='nopad column'>";
	html+="<div class='ui "+conList.color+" header'><i class='"+conList.icon+" icon '></i>"+conList.name+"</div>";
	html+="<div class='ui basic segment "+conList.color+" '>";
	html+= "<div class='ui three column grid'>";
	conList.links.forEach(function(content){
		if(content.link === undefined ){
			content.link = '#';
			content.color = 'grey';
		}else content.color = conList.color;
		if(content.icon === undefined ) content.icon = 'spinner';
		html+="<div class='nopad column'>";
		html+="<a href='"+content.link+"' class='ui segment inverted "+content.color+" itemBox'>";
		html+="<i class='"+content.icon+" large circular icon'></i>";
		html+="<div class='itemBoxLabel'>"+content.text+"</div>";
		html+="</a>";
		html+="</div>";
	});
	html+="</div>";
	html+="</div>";
	html+="</div>";
	$(domID).html(html);

}



});
