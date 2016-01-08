/**
 * http://usejsdoc.org/
 */

console.log("dnp.main.js configuring require.js");

requirejs.config({
		baseUrl: '/src/scripts/',
		paths: { 
				// packages
				alertify: 'js/alertify.min',
				d3: 'js/d3.min',
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
				projcontrol: 'dnpviz/pages/projcontrol'	

			 }
		 
});

var debug = true, 
	localhost = window.location.href.indexOf("127.0.0.1") > -1,
	alertify;


require(['jquery','d3','fullpage','alertify','googleapi'], 
		function ($, d3, fullpage, alertify_local,googleapi){
	alertify = alertify_local;
	console.log("Required dependencies loaded");
	var semanticui = require(['semanticui']);
	if(localhost) { 
		if(debug) alertify.message("Local host detected");		
		console.log("Local host detected");
	}	

	// configure and notify alerts 		
	alertify.defaults.notifier.position = 'bottom-right'; 

	// configure the scroll 
	$(function() {
	  $('a[href*=#]:not([href=#])').click(function() {
	    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
	      var target = $(this.hash);
	      target = target.length ? target : $('[data-anchor=' + this.hash.slice(1) +']');
	      if (target.length) {
	        $('html,body').animate({
	          scrollTop: target.offset().top
	        }, 1000);
	        return false;
	      }
	    }
	  });
	});


	// load visualisation 
	var viz = require(['hexbin'], function (hexbin){	
		alertify.message("All scripts loaded successfully",1);
	});	
 
	 // initialise fullpage
	 $(document).ready(function() {
		$('#fullpage').fullpage({
			anchors: ['home', 'project_control', 'contact_us'],
			//sectionsColor: ['#f00','#0f0', '#00f'],
			navigation: true,
			afterLoad: function(anchorLink,index){
			  var loadedSection = $(this);
			  
			  if(index == 2){
				// call page 2
				var projcontrol = require(['projcontrol'], function (projcontrol){	
					alertify.message("Project control page loaded",1);
				});	

			  }
			  if(index == 1) alertify.message("Page 1 loaded");
			}

		}); 
		pageTag = window.location.hash.substring(1); 
		console.log('pageTag :: '+ pageTag);
		if(pageTag) $.fn.fullpage.moveTo(pageTag);
    
	});
 
 
});
