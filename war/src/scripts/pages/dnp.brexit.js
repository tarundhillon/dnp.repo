var debug = true,
    moment, _help;
define('dnpBrexit', ['jquery', 'd3', 'dnpHelper', 'moment', 'dnpChordLayout', 'dnpChordStretched', 'accounting','semanticui'],
    function($, d3, _help, moment, dnpChordLayout, dnpChordStretched, accounting, semui) {
        this.moment = moment;
        this._help = _help;
        _help.setupPage();
        peity = requirejs(['peity']);
        //semui = requirejs(['semanticui']);
        _help.accounting = accounting;


        conf = {
            data: {},
            width: 'auto',
            filterID: '#filter',
            containerID: '#content',
            dateFormat: '%d/%m/%Y',
            momentDateFormat: 'DD/MM/YYYY',
            refreshOnResize: false,
            gapi: { //download from google console 
                clientID: "632382337003-1i611ap2qn98oouud250k3jo8igb7h4g.apps.googleusercontent.com",
                projectID: "dev-dnp-associates",
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://accounts.google.com/o/oauth2/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_secret": "80wzD5YQS_tA5Te4jVJ8cqlw",
                "javascript_origins": ["http://dnp.associates", "http://dev.dnp.associates"]
            }

        };


        if (true) {
            var allItems = localStorage.getItem('dnp.bre.allItems');
            allItems = JSON.parse(allItems).items;
            _help.hideLoader();
            setupPage(allItems);
            _help.logTime(startTime, allItems.length + ' localStorage fetched');

        }

        requirejs(['./js/async!https://apis.google.com/js/client.js!onload'], function() {
            _help.showLoader(conf.containerID);
            gapi.client.load('hmrctradeendpoint', 'v1', function() {
            //gapi.client.load('dnptradeendpoint', 'v1', function() {
                
                console.log('Google endpoint loaded ..');
                var startTime = moment();

                if (typeof(Storage) !== "undefined") {
                    var allItems = localStorage.getItem('dnp.bre.allItems');
                    //if (allItems === undefined || allItems === null) {
                     if(true){
                        gapi.client
                            .dnptradeendpoint
                            .listTrade({
                                //limit: 5000
                            }).execute(function(resp) {
                                allItems = resp.items;
                                localStorage.setItem('dnp.bre.allItems', JSON.stringify(resp));
                                _help.hideLoader();
                                setupPage(allItems);
                                _help.logTime(startTime, allItems.length + ' records fetched');
                            });

                    } else {
                        allItems = JSON.parse(allItems).items;
                        _help.hideLoader();
                        setupPage(allItems);
                        _help.logTime(startTime, allItems.length + ' localStorage fetched');
                    }


                }


            }, 'https://3-dot-dev-dnp-associates.appspot.com/_ah/api');


        });





        function setupPage(allItems) {

            setupData(allItems);
            _help.hideLoader();

            var html = '';
            html += "<div class='ui tabular secondary pointing red menu'>";
            html += "<a class='item' data-tab='tabOverview'><i class='ui sitemap icon cursor'></i> Overview</a>";
            html += "<a class='item' data-tab='tabAnalyse' ><i class='ui bar chart icon cursor'></i> Analyse</a>";
            html += "<a class='item' data-tab='tabDataTable' ><i class='ui grid layout icon cursor'></i> Data Table</a>";
            html += "<a class='item' data-tab='tabCountry'><i class='ui newspaper icon cursor'></i> Country </a>";
            html += "</div>";

            html += "<div class='ui tab' data-tab='tabOverview'></div>";
            html += "<div class='ui tab' data-tab='tabAnalyse'></div>";
            html += "<div class='ui tab' data-tab='tabDataTable'></div>";
            html += "<div class='ui tab hide' data-tab='tabCountry'>" + getCountrySearchHTML() + "</div>";

            $(conf.containerID).html(html);
            $('.tabular.menu .item').tab({
                history: false,
                onFirstLoad: function(item, arg) {
                    if (item !== undefined) {
                        var domID = "div[data-tab='" + item + "']";
                        switch (item) {
                            case 'tabOverview':
                                setupOverviewHTML(domID);
                                break;
                            case 'tabDataTable':
                                setupDataTable(domID);
                                break;
                            case 'tabAnalyse':
                                analyseData();
                                break;
                            case 'tabCountry':
                                // showCountryDetails(domID,arg);
                                break;
                        }
                    }

                }
            });


            $('.tabular.menu .item').first().tab('change tab', 'tabOverview');



            //makeTeamStructure();
            //$("div[data-tab='tabOrgChart']").tab('change tab','tabOrgChart');


        }

        function setupOverviewHTML(domID) {
            $(domID).append('<div id="chart"></div>');
            requirejs(['dnpChord'], function(_chord) {
                console.log(' dnp.chord loaded ... ');
            });

        }

        function setupDataTable(domID) {
            var html = "",
                year = '2015',
                startTime = moment();
            accounting.settings.currency.symbol = '';
            accounting.settings.currency.precision = 0;

            html += "<table class='ui small striped selectable table'>";
            html += "<thead>";
            html += "<tr>";
            html += "<th>#</th>";
            html += "<th>Country</th>";
            html += "<th>Export</th>";
            html += "<th>Import</th>";
            html += "<th>Net Deficit (Export - Import)</th>";
            html += "</tr>";
            html += "</thead>";
            html += "<tbody>";
            getTopCountries(year, 'export').forEach(function(obj, i) {
                netTrade = obj[year].total.export - obj[year].total.import;
                netTrade > 0 ? netColor = 'positive' : netColor = 'negative';
                exportLineStr = '', importLineStr = '', netLineStr = '';

                dataHTML = '<ol>';

                conf.data.years.forEach(function(year, i) {
                    // for (var prop in obj[year])
                    //     dataHTML += '<li> ' + obj.name + ' ' + year + ' ' + prop + ' export: ' + accounting.formatMoney(obj[year][prop].export) + ', ' + accounting.formatMoney(obj[year][prop].import) + '</li>';


                    exportLineStr += Math.round(obj[year].total.export / 1000000);
                    if (i != conf.data.years.length - 1) exportLineStr += ',';

                    importLineStr += Math.round(obj[year].total.import / 1000000);
                    if (i != conf.data.years.length - 1) importLineStr += ',';

                    netLineStr += Math.round((obj[year].total.export - obj[year].total.import) / 1000000);
                    if (i != conf.data.years.length - 1) netLineStr += ',';
                });
                dataHTML += '</ol>';
                // console.log('exportLineStr::' + exportLineStr);
                // console.log('importLineStr::' + importLineStr);
                // console.log('netLineStr::' + netLineStr);
                html += "<tr class='countryRow cursor' country='" + obj.name + "'>";
                html += "<td>" + (i + 1) + "</td>";
                html += "<td>" + obj.name + "</td>";
                html += "<td> <span class='line'>" + exportLineStr + "</span> " + accounting.formatMoney(obj[year].total.export) + "</td>";
                html += "<td> <span class='line'>" + importLineStr + "</span>" + accounting.formatMoney(obj[year].total.import) + "</td>";
                html += "<td class='" + netColor + "'> <span class='line'>" + netLineStr + "</span>" + accounting.formatMoney(netTrade) + "</td>";
                html += "</tr>";
            });
            html += "</tbody>";
            html += '</table>';

            $(domID).html(html);
            _help.logTime(startTime, ' DOM updated');
            $(".line").peity("line");
            _help.logTime(startTime, ' peity updated');
            $(".countryRow").click(function(obj) {
                country = $(obj.target).parent().attr('country');
                console.log('country selected ' + country);
                showCountryDetails(country);
                $('.tabular.menu .item').first().tab('change tab', 'tabCountry', country);
            });
            _help.logTime(startTime, ' row click attached');

        }

        function showCountryDetails(country) {
            var cntObj = conf.data.cntObjList.filter(function(obj) {
                return obj.name === country;
            })[0];

            var catList = [];

            var html = '';
            html += '<div class="ui red tiny header">' + country + '</div>';
            html += "<table class='ui small striped selectable table'>";
            html += "<thead>";

            html += "<tr>";
            html += "<th class='two wide'>Category</th>";

            conf.data.years.forEach(function(year) {
                html += "<th colspan='3'>" + year + "</th>";
                for (var cat in cntObj[year]) catList.push(cat);
            });
            html += "</tr>";

            html += "<tr>";
            html += "<th class='two wide'> </th>";
            conf.data.years.forEach(function(year) {
                html += "<th class='one wide'><i class='ui green caret right icon'></i></th>";
                html += "<th  class='one wide'><i class='ui red caret left icon'></i></th>";
                html += "<th  class='one wide'><i class='ui grey caret left icon'></i><i class='ui grey caret right icon'></i></th>";
            });
            html += "</tr>";
            html += "</thead>";

            html += "<tbody>";


            catList.unique().sort().forEach(function(cat) {
                html += "<tr>";
                html += "<td>" + cat + "</td>";
                conf.data.years.forEach(function(year) {
                    if (cntObj[year][cat] !== undefined) {
                        // netTrade = accounting.formatMoney(cntObj[year][cat].export - cntObj[year][cat].import);
                        // exports = accounting.formatMoney(cntObj[year][cat].export);
                        // imports = accounting.formatMoney(cntObj[year][cat].imports);

                        netTrade = (cntObj[year][cat].export - cntObj[year][cat].import).million();
                        exports = cntObj[year][cat].export.million();
                        imports = cntObj[year][cat].import.million();


                    } else {
                        exports = '-';
                        imports = '-';
                        netTrade = '-';
                    }

                    html += "<td>" + exports + "</td>";
                    html += "<td>" + imports + "</td>";
                    html += "<td>" + netTrade + "</td>";
                });
                html += "</tr>";
            });

            html += "</tbody>";
            html += "</table>";




            //$("div[data-tab='tabCountry']").html(JSON.stringify(cntObj));
            $("div[data-tab='tabCountry']").html(html);
        }

        function setupData(items) {
            startTime = moment();
            conf.data.objList = items;

            conf.data.objList.sort(function(a, b) {
                return b.export - a.export;
            });


            conf.data.countries = conf.data.objList.map(function(obj) {
                return obj.country;
            }).unique();

            conf.data.years = conf.data.objList.map(function(obj) {
                return obj.year;
            }).unique().sort();

            conf.data.cntObjList = [];
            conf.data.countries.forEach(function(country, i) {
                cntObj = {
                    name: country
                };

                conf.data.years.forEach(function(year) {
                    yearObj = {};
                    totalExport = 0;
                    totalImport = 0;

                    conf.data.objList.filter(function(obj) {
                        return obj.country === country && obj.year === year;
                    }).forEach(function(obj) {
                        yearObj[obj.category] = {
                            export: obj.export,
                            import: obj.import
                        };
                        totalExport += parseInt(obj.export, 10);
                        totalImport += parseInt(obj.import, 10);
                    });
                    yearObj.total = {
                        export: totalExport,
                        import: totalImport
                    };
                    //yearObj.year = year; // I dont think this is needed. 
                    cntObj[year] = yearObj;
                });
                conf.data.cntObjList.push(cntObj);
            });




            conf.data.categories = conf.data.objList.map(function(obj) {
                return obj.category;
            }).unique();


            _help.logTime(startTime, ' setup data');
        }


        function getTopCountries(year, type) {
            startTime = moment();
            if (type === undefined) type = 'export';
            switch (type) {
                case 'export':
                    topCntList = conf.data.cntObjList.sort(function(a, b) {
                        return b[year].total.export - a[year].total.export;
                    });
                    break;
                case 'import':
                    topCntList = conf.data.cntObjList.sort(function(a, b) {
                        return b[year].total.import - a[year].total.import;
                    });
                    break;
                case 'net':
                    topCntList = conf.data.cntObjList.sort(function(a, b) {
                        return (b[year].total.export - b[year].total.import) -
                            (a[year].total.export - a[year].total.import);
                    });
                    break;
            }

            _help.logTime(startTime, ' top country sort');
            return topCntList;
        }

        //todo complete functionality
        function getCountrySearchHTML() {
            var html = '<div class="ui fluid search selection dropdown">';
            html += '<input type="hidden" name="country">';
            html += '<i class="dropdown icon"></i>';
            html += '<div class="default text">Select Country</div>';
            html += '<div class="menu">';
            html += '<div class="item" data-value="af"><i class="af flag"></i>Afghanistan</div>';
            html += '</div>';
            html += '</div>';
            return html;
        }

    });