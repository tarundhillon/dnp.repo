var debug = true,
    moment, _help;
define('dnpTeam', ['jquery', 'dnpHelper', 'tabletop', 'moment'],
    function($, _help, _tabletop, moment) {
        this.moment = moment;
        this._help = _help;
        _help.setupPage();
        peity = requirejs(['peity']);

        $('.container').html('Hello team design');

        conf = {
            data: {},
            width: 'auto',
            sheetName: 'Profile',
            sheetTeam: 'Team Details',
            sheetKey: '1lNhr5TfVykkhbwFA6sC0qAL633EEOywZZkHE6wn8Nng',
            simpleSheet: false,
            filterID: '#filter',
            containerID: '#content',
            dateFormat: '%d/%m/%Y',
            momentDateFormat: 'DD/MM/YYYY',
            refreshOnResize: false
        };

        semui = require(['semanticui'], function() {
            fetchDataFromGoogleSheet(conf);

        });

        //	fetch data from google sheet and request gantt


        var _sheets;

        function fetchDataFromGoogleSheet(conf) {
            var startTime = moment();
            this.conf = conf;
            if (debug) console.log("Fetching data from " + conf.sheetName + ":" + conf.sheetKey);
            _help.showLoader(conf.containerID);
            try {
                _tabletop.init({
                    key: conf.sheetKey,
                    simpleSheet: conf.simpleSheet,
                    callback: function(data, tabletop, err) {
                        _sheets = tabletop;
                        console.log('callback status :: ' + tabletop.err);
                        if (tabletop.err === "OK") {
                            conf.data.allTeam = _sheets.sheets(conf.sheetTeam).elements;
                            setupData();
                            makeTeam();
                            _help.logTime(startTime, 'google datasheet fetch');
                            if (debug) console.log(data.length + " records fetched from google sheet");

                            if (conf.refreshOnResize) {
                                $(window).on('resize', function() {
                                    console.log('resize detected');
                                    makeTeam();
                                });
                            }

                        }
                        _help.hideLoader();
                    }
                });
            } catch (err) {
                console.log('TableTop exception ' + err);
            }

        }


        function makeTeam() {
            var html = '';
            html += "<div class='ui tabular secondary pointing red menu'>";
            html += "<a class='item' data-tab='tabOrgChart'><i class='ui sitemap icon cursor'></i> Overview</a>";
            html += "<a class='item' data-tab='tabAnalyseData' ><i class='ui bar chart icon cursor'></i> Analyse</a>";
            html += "<a class='item' data-tab='tabShowProfile'><i class='ui newspaper icon cursor'></i> Profile</a>";
            html += "<div class='right menu'>";
            html += "<a class='item ' id='filterPop'><i class='ui filter icon cursor'></i> Filter</a>";
            html += filterPopupHTML();
            html += "</div>";
            html += "</div>";

            html += "<div class='ui tab' data-tab='tabOrgChart'></div>";
            html += "<div class='ui tab' data-tab='tabAnalyseData'> Analyse data</div>";
            html += "<div class='ui tab' data-tab='tabShowProfile'> showProfile </div>";

            $(conf.filterID).html(html);

            $('.tabular.menu .item').tab({
                history: false,
                onFirstLoad: function(item) {
                    if (item !== undefined) {
                        switch (item) {
                            case 'tabOrgChart':
                                makeTeamStructure();
                                setupFilter();
                                break;
                            case 'tabAnalyseData':
                                analyseData();
                                break;
                            case 'tabShowProfile':
                                break;
                        }
                    }

                },
                onLoad: function(item) {
                    if (item === 'tabOrgChart') $('#filterPop').show();
                    else $('#filterPop').hide();
                }


            });
            $('.tabular.menu .item').first().tab('change tab', 'tabOrgChart');

            //makeTeamStructure();
            //$("div[data-tab='tabOrgChart']").tab('change tab','tabOrgChart');

        }

        function makeTeamStructure() {

            if (conf.data === undefined || conf.data.length === 0) {
                $(conf.containerID).html('Empty dataset: possible error while fetching data.');
                return;
            }

            var html = '';

            if (conf.data.wsList !== undefined && conf.data.wsList.length > 0)
                noCols = _help.numWord[conf.data.wsList.length];
            else noCols = '';

            html += "<div class='ui " + noCols + " column grid nopad stackable'>";
            conf.data.wsList.forEach(function(ws) {

                html += "<div class='column'>";
                html += "<div class='ui dnp tiny grey header pad center aligned'>" + ws + "</div>";
                objList = conf.data.allTeam.filter(function(item) {
                    return item.workstream === ws;
                }).sort(sortByStatus);

                objList.forEach(function(obj) {
                    html += getTeamCard(obj);
                });

                html += "</div>";
            });
            html += "</div>";
            $("div[data-tab='tabOrgChart']").html(html);
            // setup onclick filters for the team card 

            //setupFilter();
            _help.jackPopup();
            $('div[cardId]').click(showProfile);
        }

        var getTeamCard = function(obj) {
            var sObj = getStatusObj(obj);
            var html = "<div class='ui " + sObj.color + " teamcard segment cursor'" +
                " cardId='" + obj.id + "'" +
                " role='" + obj.role + "'" +
                " status='" + obj.status + "'>";
            html += "<div class='top left floating'>";
            html += sObj.iconHTML;
            html += "<span class='ui black dnp mini header' data-content='Name: " +
                obj.name + "'  data-variation='tiny' >" +
                obj.name.shorternName() +
                "</span>";
            html += "</div>";

            html += "<div class='grey ui tiny text'>" + obj.role + "</div>";
            return html += '</div>';
        };

        var showProfile = function(obj, id) {
            console.log(obj, $(this), id);
            $('#menuItemProfile').show();

        };

        var setupData = function() {
            var startTime = moment();
            var objList = [];
            conf.data.allTeam.forEach(function(data) {
                obj = {};
                obj.workstream = data['Primary Workstream'];
                obj.name = data['Emp Name'];
                obj.status = data['Status'];
                obj.role = data['Target Role'];
                obj.roleType = data['Role Type'];

                objList.push(obj);
            });
            conf.data.allTeam = objList;

            //setup the meta data
            conf.data.wsList = conf.data.allTeam.map(function(item) {
                return item.workstream;
            }).unique().sort();

            conf.data.statusList = conf.data.allTeam.map(function(item) {
                return item.status;
            }).unique().sort();

            conf.data.roleList = conf.data.allTeam.map(function(item) {
                return item.role;
            }).unique().sort();

            conf.data.roleTypeList = conf.data.allTeam.map(function(item) {
                return item.roleType;
            }).unique().sort();

            _help.logTime(startTime, 'data setup');
        };

        var sortByStatus = function(a, b) {
            if (a.status > b.status) return 1;
            if (a.status < b.status) return -1;
            return 0;
        };

        var getStatusObj = function(obj, size) {
            var item = {
                color: 'grey',
                icon: 'help'
            };
            if (size === undefined) size = 'tiny';
            if (obj.status !== undefined) {
                switch (obj.status) {
                    case 'Active':
                        item.color = 'blue';
                        item.hex = '#2185d0';
                        item.icon = 'checkmark';
                        break;
                    case 'Dropped':
                        item.color = 'grey';
                        item.hex = '#767676';
                        item.icon = 'ban';
                        break;
                    case 'TBP':
                        item.color = 'red';
                        item.hex = '#db2828';
                        item.icon = 'warning';
                        break;
                    case 'TBC':
                        item.color = 'orange';
                        item.hex = '#f2711c';
                        item.icon = 'help';
                        break;
                }
            }
            item.iconHTML = "<i class='ui " + size + " " + item.color + " " + item.icon + " icon' data-content='Status: " + obj.status + "' data-variation='" + size + "'></i>";
            return item;
        };

        var setupFilter = function() {

            $('#filterPop').popup({
                inline: true,
                hoverable: true,
                position: 'bottom right',
                delay: {
                    show: 100,
                    hide: 800
                }
            });

            $(".ui.checkbox").checkbox({
                onChange: function(obj, text) {
                    var label = $(this).parent().children("label").text().trim();
                    var type = $(this).attr('actionType').trim();
                    var status = $(this).is(':checked');
                    manageFilterClick(type, label, status);
                }
            });

            $('.ui.action.menu a.click.item').click(function(obj) {
                // show filter for only overview tab
                if ($('this').attr('id') === 'menuItemOrgChart') $('#filterPop').show();
                else $('#filterPop').hide();

                if ($('this').attr('id') !== 'menuItemProfile') $('#menuItemProfile').hide();


                $('.ui.action.menu a.click.item').removeClass('active');
                $(this).addClass('active');
                var functionName = $(this).attr('action');
                eval($(this).attr('action'))();

            });
        };

        var filterPopupHTML = function() {
            var html = '';
            html += '<div class="ui flowing popup transition hidden">';

            html += '<div class="ui equal width divided grid">';
            html += '<div class="equal width row">';

            html += '<div class="column">';
            html += '<div class="ui dnp tiny red header">Status</div>';
            html += '<div class="list">';
            conf.data.statusList.forEach(function(item, i) {
                sObj = getStatusObj({
                    status: item
                });
                html += '<div class="ui item">';
                html += '<div class="ui tiny checkbox">';
                html += '<input class="ui dnp tiny" type="checkbox" checked actionType="status" name="status_' + i + '"> ';
                html += '<label class="ui mini text"> ' + sObj.iconHTML + ' ' + item + '</label>';
                html += '</div>';
                html += '</div>';
            });
            html += '</div>';
            html += '</div>';

            conf.data.roleTypeList.forEach(function(roleType, i) {

                html += '<div class="column">';
                html += '<div class="ui dnp tiny red header">' + roleType + '</div>';
                html += '<div class="list">';

                roleList = conf.data.allTeam.filter(function(item) {
                    return item.roleType === roleType;
                }).map(function(item) {
                    return item.role;
                }).unique().sort();

                roleList.forEach(function(item, i) {
                    html += '<div class="ui item">';
                    html += '<div class="ui mini checkbox">';
                    html += '<input type="checkbox" checked actionType="role" name="role_' + i + '"> ';
                    html += '<label class="ui mini text"> ' + item + '</label>';
                    html += '</div>';
                    html += '</div>';
                });
                html += '</div>';
                html += '</div>';
            });


            html += '</div>';
            html += '</div>';
            html += '</div>';
            return html;
        };



        var analyseData = function() {
            var html = '';

            html += "<table class='ui mini compact very basic striped six column table'>";
            html += "<thead>";
            html += "<tr>";
            html += "<th class='wide'></th>";
            html += "<th class='wide'>Role</th>";
            html += "<th class='wide'>#</th>";
            html += "<th class='wide'>%</th>";
            html += "<th class='wide'></th>";
            html += "<th class='eight wide'></th>";
            html += "</tr>";
            html += "</thead>";
            html += "<tbody>";
            conf.data.roleList.forEach(function(role) {
                objList = conf.data.allTeam.filter(function(item) {
                    return item.role === role;
                }).sort(sortByStatus);
                pert = Math.round(((objList.length / conf.data.allTeam.length) * 100));
                statusSplit = getStatusSplit(objList);

                html += "<tr>";
                html += "<td> " + objList[0].roleType + "</td>";
                html += "<td> " + role + "</td>";
                html += "<td>" + objList.length + "</td>";
                html += "<td>" + pert + "% </td>";
                html += "<td> <span class='donut'>" + statusSplit.count + "</span></td>";
                html += "<td class='center aligned'>";
                objList.forEach(function(obj) {
                    html += getSummaryIconHTML(obj);
                });

                html += "</td>";
                html += "</tr>";

            });
            html += "</tbody>";
            html += "</table>";

            $("div[data-tab='tabAnalyseData']").html(html);
            _help.jackPopup();
            $('.donut').peity("donut", {
                fill: statusSplit.hex,
                height: 24,
                width: 24
            });
        };

        var getStatusSplit = function(objList) {
            var sObjList = {
                    count: [],
                    sObj: [],
                    status: [],
                    hex: []
                },
                sObj;
            conf.data.statusList.forEach(function(item) {
                sObj = getStatusObj({
                    status: item
                });
                sObjList.count.push(objList.filter(function(obj) {
                    return obj.status === item;
                }).length);
                sObjList.sObj.push(sObj);
                sObjList.status.push(item);
                sObjList.hex.push(sObj.hex);
            });
            return sObjList;
        };

        var getSummaryIconHTML = function(obj) {
            var html = '';

            html += "<i class='ui " + getStatusObj(obj).color + " icon user' " +
                " data-content='" + obj.name + "," + obj.workstream + "' " +
                "></i>";
            return html;
        };

        var manageFilterClick = function(type, label, status) {
            var qStr = '';
            switch (type) {
                case 'role':
                    qStr = "div[role='" + label + "']";
                    break;
                case 'status':
                    qStr = "div[status='" + label + "']";
                    break;
                default:
                    return;
            }

            if (status) $(qStr).show();
            else $(qStr).hide();

        };

    }


);