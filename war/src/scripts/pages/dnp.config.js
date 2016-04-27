requirejs.config({
		baseUrl: '/src/scripts',
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
				semuiDimmer: 'js/dimmer.min',
				peity: 'js/jquery.peity',
				
				//for google
				tabletop: 'js/tabletop.fix', // need to merger these dependencies
				underscore: 'js/underscore-min',
				backbone: 'js/backbone-min',
				tabletopSync:'js/backbone.tabletopSync',
				almond: 'js/almond',
				googleSheet: 'js/min.gsheet',
				fs: 'js/fs',

				// code files
				
				d3hexbin:'viz/d3.hexbin.min',
				gantt:'viz/dnp.gantt',
				hexbin:'viz/dnp.hexbin',
				projcontrol: 'viz/dnp.projctrl',
				dnpHexGrid: 'viz/dnp.hexgrid',
				reqmgt:'viz/dnp.reqmgt',
				timeline: 'viz/dnp.timeline',
				dnpBubble: 'viz/dnp.bubble.chart',


				// page files
				dnpCore: 'pages/dnp.core',
				dnpHelper: 'pages/dnp.helper',
				dnpMain: 'pages/dnp.main',
				dnpIndex: 'pages/dnp.index',
				dnpPlan: 'pages/dnp.plan',
				dnpReq: 'pages/dnp.req',
				dnpRegTL: 'pages/dnp.regtl',
				dnpTOM: 'pages/dnp.tom',
				dnpEqMap:'pages/dnp.eqmap',
				dnpTraining:'pages/dnp.training',
				dnpTeam:'pages/dnp.team',
		}


		/*
			List of semantic elements 
			- button -- ? 68K
			- Header - 8K
			- Icon -33k
			- Label -20K
			- Dimmer - 2.5K
			- Segment -11K
			- Container - 2K
			- Menu -29k
			- Grid - 55k
			- Table -16K
			- Statistic - 10K
		*/

});