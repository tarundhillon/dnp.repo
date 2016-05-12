var debug = true,
    moment, _help;
define('dnpTeam', ['jquery', 'c3', 'dnpHelper', 'tabletop', 'moment'],
    function($, c3, _help, _tabletop, moment) {
        this.moment = moment;
        this._help = _help;
        _help.setupPage();
        peity = requirejs(['peity']);

        $('.container').html('Hello team design');

        conf = {
            data: {},
            width: 'auto',
            sheetProfile: 'Profile',
            sheetTeam: 'Team Details',
            sheetConfig: 'Config',
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
                            conf.data.config = _sheets.sheets(conf.sheetConfig).elements;
                            conf.data.profiles = _sheets.sheets(conf.sheetProfile).elements;
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
            html += "<a class='item' data-tab='tabShowProfile'><i class='ui newspaper icon cursor'></i> Profile </a>";
            html += "<a class='item' data-tab='tabShowProfileBook'><i class='ui book icon cursor'></i> Profile Book </a>";
            html += "<div class='right menu'>";
            html += "<a class='item ' id='filterPop'><i class='ui filter icon cursor'></i> Filter</a>";
            html += filterPopupHTML();
            html += "</div>";
            html += "</div>";

            html += "<div class='ui tab' data-tab='tabOrgChart'></div>";
            html += "<div class='ui tab' data-tab='tabAnalyseData'></div>";
            html += "<div class='ui tab hide' data-tab='tabShowProfile'><div class='ui center aligned label'>"+
            "Please select a candidate in the Overview tab</div></div>";
            html += "<div class='ui tab hide' data-tab='tabShowProfileBook'></div>";

            $(conf.filterID).html(html);

            $('.tabular.menu .item').tab({
                history: false,
                onFirstLoad: function(item) {
                    if (item !== undefined) {
                        //$('#closeProfileTab').remove();
                        switch (item) {
                            case 'tabOrgChart':
                                makeTeamStructure();
                                setupFilter();
                                break;
                            case 'tabAnalyseData':
                                analyseData();
                                break;
                            case 'tabShowProfile':
                                //showAllProfiles();
                                break;
                            case 'tabShowProfileBook':
                                showAllProfiles();
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

        function getProfileCard(obj) {
            var html = "";

            html += '<div class="ui profile basic card">';

            html += '<div class="content">';
            html += '<div class="left floated ui image">';
            html += "<i class='ui huge red  user icon '> </i>";
            html += '</div>';

            html += "<div class='right floated nopad'>";
            html += '<a class="ui red header">' + obj.name + '</a>';
            html += '<div class="description">';
            html += obj.role + ', ' + obj.workstream;
            html += '</div>';
            html += '<div class="meta">';
            html += '<span class="date">Joined ' + obj.start.fromNow() + '</span>';
            html += '</div>';

            html += '</div>';

            html += '</div>';
            html += '</div>';

            return html;

        }

        function showAllProfiles() {
            var html = "";
            conf.data.allTeam.forEach(function(obj) {
                html += showProfileHTML(obj);
                html += "<br><hr><br>";
            });
            $("div[data-tab='tabShowProfileBook']").html(html);
            //$('.tabular.menu .item').tab('change tab', 'tabShowProfile');
        }

        function showProfile(obj) {
            var html;
            if (obj.type === 'click')
                html = showProfileHTML(undefined,this);
            else
                html = showProfileHTML(obj);
            $("div[data-tab='tabShowProfile']").html(html);
            $('.tabular.menu .item').tab('change tab', 'tabShowProfile');

        }

        function showProfileHTML(obj, thisObj) {
            if (obj === undefined || obj.type === 'click') {
                cardId = $(thisObj).closest("div[cardId]").attr('cardId');
                obj = getTeamObj(cardId);
            }
            var profile = getProfileObj(obj.id);
            var html = '';
            html += getProfileCard(obj);

            html += '<div class="ui divided two column nopad grid">';
            html += '<div class="column">';
            if (profile === undefined) profile = {};
            if (profile.title === undefined) profile.title = '...';
            if (profile.skills === undefined) profile.skills = '...';
            if (profile.experience === undefined) profile.experience = '...';
            if (profile.projects === undefined) profile.projects = '...';

            html += '<div class="ui small header red">Overview</div>';
            html += '<div class="ui red basic blur segment">' + profile.title + "</div>";

            html += '<div class="ui small header red">Skills</div>';
            html += '<div class="ui red basic blur segment">' + profile.skills + "</div>";

            html += '<div class="ui small header red">Experience</div>';
            html += '<div class="ui red basic blur segment">' + profile.experience + "</div>";

            html += '</div>';

            html += '<div class="column">';
            html += '<div class="ui small header red">Projects</div>';
            html += '<div class="ui red basic blur segment">' + profile.projects + '</div>';
            html += '</div>';
            html += '</div>';
            return html;

        }

        var setupData = function() {
            var startTime = moment();
            var objList = [];
            conf.data.allTeam.forEach(function(data) {
                obj = {};
                obj.workstream = data['Primary Workstream'];
                obj.id = data['RACF'];
                obj.name = data['Emp Name'];
                obj.status = data['Status'];
                obj.role = data['Target Role'];
                obj.roleType = data['Role Type'];
                obj.start = moment(data['TTT Start Date'], 'DD/MM/YYYY');
                obj.end = moment(data['TTT End Date'], 'DD/MM/YYYY');
                //obj.start = data['TTT Start Date'];


                objList.push(obj);
            });
            conf.data.allTeam = objList;


            objList = [];
            conf.data.profiles.forEach(function(data) {
                obj = {};
                obj.id = data['RACFID'];
                obj.title = data['Title'];
                obj.experience = data['Professional experience'];
                obj.skills = data['Skills'];
                obj.projects = data['Key Projects'];
                objList.push(obj);
            });
            conf.data.profiles = objList;

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

        function getTeamObj(id) {
            var objList = conf.data.allTeam.filter(function(obj) {
                return obj.id === id;
            });
            if (objList.length > 0) return objList[0];
            return undefined;
        }

        function getProfileObj(id) {
            var objList = conf.data.profiles.filter(function(obj) {
                return obj.id === id;
            });
            if (objList.length > 0) return objList[0];
            return undefined;
        }

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

        function getConfigSortOrder(type) {
            return conf.data.config.map(function(item) {
                return item['Type'].trim();
            }).indexOf(type.trim());
        }

        var sortBySortID = function(a, b) {
            return getConfigSortOrder(a) - getConfigSortOrder(b);
        };


        var analyseData = function() {
            var html = '';
            html += "<div class='ui three column divided nopad stackable grid '>";

            var stats = summaryStats();
            html += "<div class='four wide column center aligned'>" + stats.html + "</div>";

            html += "<div class='four wide column  center aligned'>";
            html += "<div id='summaryChart'> </div>";
            html += "</div>";



            html += "<div class='eight wide  column'>";
            html += "<div class='ui red tiny header'> Ramp-up Timeline </div>";
            html += "<div id='timelineChart'></div></div>";
            html += "</div>";


            html += "<table class='ui mini compact very basic striped red table'>";
            html += "<thead>";
            html += "<tr>";
            html += "<th class='two wide'></th>";
            html += "<th class='three wide'></th>";
            html += "<th class='one wide'></th>";
            html += "<th class='one wide'></th>";
            html += "<th class='one wide'></th>";
            html += "<th class='eight wide'></th>";
            html += "</tr>";
            html += "</thead>";
            html += "<tbody>";

            conf.data.roleList.sort(sortBySortID).forEach(function(role) {
                objList = conf.data.allTeam.filter(function(item) {
                    return item.role === role;
                }).sort(sortByStatus);
                pert = Math.round(((objList.length / conf.data.allTeam.length) * 100));
                statusSplit = getStatusSplit(objList);

                html += "<tr>";
                html += "<td> " + objList[0].roleType + "</td>";
                html += "<td> " + role + "</td>";
                html += "<td>" + objList.length + "</td>";
                html += "<td>" + pert + "%</td>";
                html += "<td> <span class='table donut'>" + statusSplit.count + "</span></td>";
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

            $('.table.donut').peity("donut", {
                fill: statusSplit.hex,
                height: 24,
                width: 24
            });

            summaryDonutChart(stats.data);
            timelineChart();
        };


        var timelineChart = function() {
            var chartData = [];
            dateList = conf.data.allTeam.map(function(obj) {
                return obj.start;
            }).unique();

            maxDate = moment.max(dateList);
            minDate = moment.min(dateList);
            months = maxDate.diff(minDate, 'months');

            var teamData = ['team'],
                monthAdd = ['monthAdd'],
                monthDrop = ['monthDrop'],
                axisData = ['x'];
            var curDate = moment(minDate),
                cnt = 0;
            for (var i = 0; i < months; i++, curDate.add(1, 'months')) {
                //TODO need to implement the between logic here. 
                objList = conf.data.allTeam.filter(function(obj) {
                    return curDate.format('MMM YY') === obj.start.format('MMM YY');
                });
                endObjList = conf.data.allTeam.filter(function(obj) {
                    return curDate.format('MMM YY') === obj.end.format('MMM YY');
                });
                cnt += objList.length - endObjList.length;
                monthAdd.push(objList.length);
                monthDrop.push(-endObjList.length);
                teamData.push(cnt);
                axisData.push(curDate.format('YYYY-MM-DD'));
            }

            chartData.push(axisData);
            chartData.push(teamData);
            chartData.push(monthAdd);
            chartData.push(monthDrop);

            var chart = c3.generate({
                bindto: '#timelineChart',
                data: {
                    x: 'x',
                    columns: chartData,
                    axes: {
                        team: 'y2',

                    },
                    types: {
                        monthAdd: 'bar',
                        monthDrop: 'bar'
                    },
                    groups: [
                        ['monthAdd', 'monthDrop']
                    ],
                    colors: {
                        team: _help.hexColor('blue'),
                        monthAdd: _help.hexColor('green'),
                        monthDrop: _help.hexColor('red'),
                    }
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        tick: {
                            format: '%b %Y'
                        }
                    },
                    y: {
                        show: true,
                        label: {
                            text: 'Additions / Attrition',
                            position: 'outer-middle',
                        }
                    },
                    y2: {
                        show: true,
                        label: {
                            text: 'Team size',
                            position: 'outer-middle',

                        }
                    }
                },
                legend: {
                    show: false
                }
            });

        };


        var getTimeline = function() {
            var html = '';

            dateList = conf.data.allTeam.map(function(obj) {
                return obj.start;
            }).unique();
            maxDate = moment.max(dateList);
            minDate = moment.min(dateList);
            months = maxDate.diff(minDate, 'months');
            console.log(minDate, '-', maxDate, '-', months);

            html += "<table class='ui red nopad table'>";
            html += "<tbody>";

            var curDate = moment(minDate),
                objList;

            conf.data.roleTypeList.forEach(function(roleType) {

                html += "<tr>";
                html += "<td class='label'>" + roleType + "</td>";

                for (var i = 0; i < months; i++, curDate.add(1, 'months')) {
                    objList = conf.data.allTeam.filter(function(obj) {
                        return curDate.format('MMM YY') === obj.start.format('MMM YY') &&
                            obj.roleType === roleType;
                    });
                    html += "<td>" + objList.length + "</td>";
                }


                html += "</tr>";
            });

            html += "</tbody>";

            html += "<tfoot>";
            html += "<tr>";
            html += "<th></th>";
            curDate = moment(minDate);
            for (var i = 0; i < months; i++, curDate.add(1, 'months')) {
                html += "<th>" + curDate.format('MMM YY') + "</th>";
            }
            html += "</tr>";
            html += "</tfoot>";

            html += "</table>";

            return html;
        };

        var summaryStats = function() {
            var stats = [],
                total = 0,
                dropStat, html = '';
            conf.data.statusList.forEach(function(status) {

                stat = {};
                stat.type = status;
                stat.value = conf.data.allTeam.filter(function(item) {
                    return item.status === status;
                }).length;
                if (status !== undefined && status.toLowerCase() !== 'dropped') {
                    total += stat.value;
                    stats.push(stat);
                } else dropStat = stat;
            });


            // total stats
            html += "<div class='ui large statistic'>";
            html += "<div class='value'>" + total + "</div>";
            html += "<div class='label'>Total</div>";
            html += "</div>";

            html += "<div class='ui three statistics'>";
            stats.forEach(function(stat) {
                sObj = getStatusObj({
                    status: stat.type
                });
                html += "<div class=' " + sObj.color + " statistic'>";
                html += "<div class='value'>" + stat.value + "</div>";
                //html += "<div class='label'>" + sObj.iconHTML + " " + stat.type + "</div>";
                html += "<div class='label'>" + stat.type + "</div>";
                html += "</div>";
            });
            html += "</div>";

            html += "<div class='ui grey statistic'>";
            html += "<div class='value'>" + dropStat.value + "</div>";
            html += "<div class='grey label'>Dropped</div>";
            html += "</div>";
            return {
                data: stats,
                html: html
            };

        };

        var summaryDonutChart = function(stats) {
            var chartData = [],
                chartColor = {};
            stats.forEach(function(stat) {
                sObj = getStatusObj({
                    status: stat.type
                });
                chartColor[stat.type] = _help.hexColor(sObj.color);
                chartData.push([stat.type, stat.value]);
            });
            var chart = c3.generate({
                bindto: '#summaryChart',
                data: {

                    //columns: roleTypeSplit,
                    columns: chartData,
                    colors: chartColor,
                    type: 'donut',


                    onclick: function(d, i) {
                        //console.log("onclick", d, i);
                    },
                    onmouseover: function(d, i) {
                        //console.log("onmouseover", d, i);
                    },
                    onmouseout: function(d, i) {
                        //console.log("onmouseout", d, i);
                    }
                },
                donut: {
                    title: "97",
                    label: {
                        show: false
                    },
                    width: 40,
                },
                legend: {
                    show: false
                },
                target: '#chart'
            });

        };

        var summaryBarChart = function() {
            var roleTypeSplit = [];
            conf.data.roleTypeList.forEach(function(type) {
                objList = conf.data.allTeam.filter(function(obj) {
                    return obj.roleType === type;
                });
                roleTypeSplit.push(objList.length);
            });
            var chart = c3.generate({
                bindto: '#chart',
                size: {
                    height: 150
                },
                bar: {
                    width: 40
                },
                padding: {
                    left: 60
                },
                color: {
                    pattern: ['#FABF62', '#ACB6DD']
                },
                data: {
                    x: 'x',
                    columns: [
                        ['x'].concat(conf.data.roleTypeList), ['value'].concat(roleTypeSplit),
                    ],

                    type: 'bar',

                    color: function(inColor, data) {
                        var colors = ['#FABF62', '#ACB6DD'];
                        if (data.index !== undefined) {
                            return colors[data.index];
                        }

                        return inColor;
                    }
                },
                axis: {
                    rotated: true,
                    x: {
                        type: 'category'
                    }
                },
                tooltip: {
                    grouped: false
                },
                legend: {
                    show: false
                }
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