/**
 * http://usejsdoc.org/
 */

console.log("dnp.plan.js configuring require.js");

var debug = true,
    moment, ganttData, ganttSetting, tabletop,_proj;


define('dnpPlan', ['jquery', 'moment', 'dnpHelper', 'd3', 'projcontrol', 'tabletop'],
    function($, moment, _help, d3, _proj, tabletop) {
		this._proj = _proj;
        this.moment = moment;
        this.tabletop = tabletop;
        _help.setupPage();

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
            minGanttPadding: 10,
            defCarPadding: 20,
            maxSvgHeight: 500,
            taskColor: ['#00B9FA'],
            catColor: ['#F0F0F0', '#DB2828'],
            inDateFormat: 'DD/MM/YYYY',
            //taskColor: ['#00B9FA','#DB2828'],
            //catColor: ['#00B9FA','#DB2828'],
            taskOnClick: _proj.ganttTaskOnClick,
            catOnClick: _proj.ganttCatOnClick,
            refreshOnResize: true
        };

        //	fetch data from google sheet and request gantt
        fetchDataFromGoogleSheet(ganttSetting);



        function fetchDataFromGoogleSheet(ganttSetting) {
            var startTime = moment();
            if (debug) console.log("Fetching data from " + ganttSetting.sheetName + ":" + ganttSetting.sheetKey);
            _help.showLoader(ganttSetting.containerID);
            tabletop.init({
                key: ganttSetting.sheetKey,
                simpleSheet: ganttSetting.simpleSheet,
                callback: function(data, tabletop) {
                    _help.logTime(startTime, 'google datasheet fetch');
                    if (debug) console.log(data.length + " records fetched from google sheet");
                    ganttData = _proj.prepareGanttData(data);
                    _proj.makeGanttForWeek();
                    _help.hideLoader();
                }

            });
        }

        var changeDataSource = function() {
            console.log('sheet ID:' + this.nextElementSibling.innerHTML + ',' + this.value);
            ganttSetting.sheetName = this.nextElementSibling.innerHTML;
            ganttSetting.sheetKey = this.value;
            fetchDataFromGoogleSheet(ganttSetting);
        };

    });