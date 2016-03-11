/**
 * http://usejsdoc.org/
 */

console.log("dnp.main.js configuring require.js");

// require(['/src/scripts/util/dnp.config.js'],function(){
// 	require(['TOM'],function(tom){ setupTOM();});
// });


// define('TOM',['jquery','tabletop','moment','dnphelper'],
// 	function( $,tabletop, moment, dhelp){
// 		setupPage();
// 		this.moment = moment;
// 		ttop = tabletop;
// 		console.log('TOM dependencies loaded');
// });

requirejs.config({
		baseUrl: '/src/scripts/',
		paths: {
				// packages
				alertify: 'js/alertify.min',
				d3: 'js/d3.min',
				d3Geo: 'js/d3.geo.projection.v0.min',
				d3Topo: 'js/topojson.v0.min',
				fullpage: 'js/jquery.fullPage',
				googleapi: 'js/client',
				handsontable: 'js/handsontable.min',
				jquery: 'js/jquery.min',
				moment: 'js/moment.min',
				pikaday: 'js/pikaday',
				semanticui: 'js/semantic.min',
				zeroclipboard: 'js/ZeroClipboard.min',

				// code files
				d3hexbin:'dnpviz/hexbin/d3.hexbin.min',
				gantt:'dnpviz/gantt/gantt',
				hexbin:'dnpviz/hexbin/hexbin',
				projcontrol: 'dnpviz/pages/projcontrol',
				dnphelper: 'dnp.helper',
				pcOverview: 'dnpviz/pages/project.control.overview',
				eqMap: 'dnpviz/map/eq.map',


		}
 
});


var debug = true,
	localhost = window.location.href.indexOf("127.0.0.1") > -1,
	alertify;



require(['jquery', 'dnphelper', 'd3','alertify'],
		function ($, dnp_helper, d3, alertify_local){
	
	setupPage();
			
	alertify = alertify_local;
	console.log("Required dependencies loaded");
	
	semanticui = require(['semanticui']);

	if(localhost) {
		if(debug) alertify.message("Local host detected");
		console.log("Local host detected");
	}

	// configure and notify alerts	
	alertify.defaults.notifier.position = 'bottom-right';

	// make selection grid 
	makeSelectionGrid('#projectControlGrid', projectControlList);
	makeSelectionGrid('#industryInsightsGrid', industryInsightsList);
	makeSelectionGrid('#dataLabsGrid',dataLabsList);


	// load visualisation 
	var viz = require(['hexbin'], function (hexbin){
		alertify.message("All scripts loaded successfully",1);
		$('#hexbinLoader').hide();
	});
 
	require(['pcOverview'],function(pcOverview){
		pcSetting = {
			containerID: '#projectControl',
			hoverContrainerID: '#hoverProjectControl',
			maxWidth: 500,
			maxHeight: 500,
			hoverIncr: 0.3,
			defColor: '#DB2828',
			emptyColor: '#D0D0D0',
			highColor: '#767676', //blue 2185d0
			textColor: 'white',
			refreshOnResize: true,
			links: [{ href:'/pages/plan.html',text:'Digital PMO'},
					{ href:'/pages/plan.html',text:''},
					{ href:'/pages/plan.html',text:''},
					{ href:'/pages/plan.html',text:''},
					{ href:'/pages/req.html',text:'Requirements'},
					{ href:'/pages/plan.html',text:''}]
		};
		makePCOverview(pcSetting);
		if(pcSetting.refreshOnResize){
			$(window).on('resize',function(){
				console.log('resize detected');
				makePCOverview(pcSetting);
			});
		}
	});

	// require(['eqMap'],function(eqMap){
	// 	loadMap();
	// });

});

var projectControlList={
	name: 'Assurance',
	icon: 'travel',
	color: 'red',
	links:[
	{text:'Business Value Realisation'},
	{text:'Requirements Management', color: 'red', icon:'file text', link:'./pages/req.html'},
	{text:'Planning & Monitoring', color: 'red', icon:'setting', link:'./pages/plan.html'},
	{text:'Change Request Managemet'},
	{text:'Solution Design'},
	{text:'Testing Coverage'},
	{text:'Training', color: '', icon:'student', link:'./pages/training.html'},
	{text:'Target Operating Model',icon:'grid layout',link:'./pages/tom.html'},
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

/*

<div class='column'>
	<div class='ui red header'>
	  <i class="travel icon circular"></i>Project Control
	</div>
	<div class='column' id='projectControlGrid'></div>  
</div>


*/



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
