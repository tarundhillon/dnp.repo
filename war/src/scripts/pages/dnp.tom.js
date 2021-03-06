var data, moment, ttop, debug = true,
    showSheet;
define('dnpTOM', ['jquery', 'tabletop', 'moment', 'dnpHelper'],
    function($, tabletop, moment, _help) {


        _help.setupPage();
        this.moment = moment;
        ttop = tabletop;
        console.log('TOM dependencies loaded');
        setupTOM();


        var conf = {
            sheetKey: '1Jv8JNT8N9wE4PQ00ISwPCYgYkXDOPsoXNoWQNBMSyKA',
            sheetName: 'Solvency II',
            simpleSheet: false,
            containerID: '#tomContainer',
            filterID: '#tomFilter'
        };


        function setupTOM() {
            var semui = require(['semanticui'], function() {
                fetchDataFromGoogleSheet();

            });

        }

        function fetchDataFromGoogleSheet() {
            var startTime = moment();
            if (true) console.log("Fetching data from " + conf.sheetName + ":" + conf.sheetKey);
            _help.showLoader(conf.containerID);
          
            ttop.init({
                key: conf.sheetKey,
                simpleSheet: conf.simpleSheet,
                callback: function(data, tabletop, err) {
                    console.log('err ::'+err);
                    ttop = tabletop;
                    // add sheet filters 
                    var html = '';
                    for (var sheet in tabletop.sheets()) {
                        html += "<div class='ui cursor small label filterBox' sheetName='" + sheet + "' onclick='showSheet(\"" + sheet + "\")'>" + sheet + "</div>";
                    }
                    $(conf.filterID).html(html);

                    showSheet();
                    _help.logTime(startTime, 'google datasheet fetch');
                    _help.hideLoader();
                    // throw "Test me";


                }

            });


        }

        showSheet = function(sheetName) {
            if (sheetName !== undefined) conf.sheetName = sheetName;
            $('.filterBox').removeClass('red');
            $("div[sheetName='" + conf.sheetName + "']").addClass('red');
            this.data = ttop.sheets(conf.sheetName).elements;
            $(conf.containerID).html(getTOMHTML(this.data));

        };

        function getTOMHTML(data) {
            var html = '';
            html += "<div class='ui grid stackable'>";
            data.forEach(function(d, i) {
                bgColor = (i % 2 === 0 ? 'lightGreyBack' : 'whiteBack');
                html += "<div class='row " + bgColor + "'>";
                html += "<div class='three wide column'>";
                html += "<div class='ui  basic segment'>";
                html += "<i class='ui red large icon " + d.icon + "'></i>";
                html += "&nbsp;&nbsp;<span class='ui grey small header'>" + d.layer + "</span>";
                html += "</div>";
                html += "</div>";

                html += "<div class='three wide column'>";
                html += "<div class='ui  basic segment'>";
                html += "<span class='ui small desc'>" + d.desc + "</span>";
                html += "</div>";
                html += "</div>";


                html += "<div class='ten wide column'>";
                html += "<div class='ui grid stackable'>";
                d.cat.split(',').forEach(function(c) {
                    html += "<div class='three wide column'>";
                    html += "<div class='ui inverted red segment tomBox'>" + c + "</div>";
                    html += "</div>";
                });
                html += "</div>";
                html += "</div>";
                html += "</div>";
            });
            html += "</div>";
            return html;
        }

    });