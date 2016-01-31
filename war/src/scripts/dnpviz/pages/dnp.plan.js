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
				semanticui: 'js/semantic.min',
				zeroclipboard: 'js/ZeroClipboard.min',
				

				// code files
				//d3hexbin:'dnpviz/hexbin/d3.hexbin.min',
				gantt:'dnpviz/gantt/gantt',
				//hexbin:'dnpviz/hexbin/hexbin',
				projcontrol: 'dnpviz/pages/projcontrol'	

			 }
		 
}); 


var debug = true, 
	localhost = window.location.href.indexOf("127.0.0.1") > -1,
	alertify;


require(['jquery','d3','alertify','googleapi'], 
		function ($, d3, alertify_local,googleapi){
	alertify = alertify_local;
	console.log("Required dependencies loaded");
	var semanticui = require(['semanticui'],function(semanticui){
		$('#sampledd').dropdown();
	});
	if(localhost) { 
		if(debug) alertify.message("Local host detected");		
		console.log("Local host detected");
	}	

	// configure and notify alerts 		
	alertify.defaults.notifier.position = 'bottom-right'; 
 
	 // initialise fullpage
	 $(document).ready(function() {
	 	
		var projcontrol = require(['projcontrol'], function (projcontrol){	
		alertify.message("Project control loaded",1);
		});
	}); 
 
});
