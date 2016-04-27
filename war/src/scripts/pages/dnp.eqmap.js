// require(['/src/scripts/util/dnp.config.js'],function(){
// 	require(['eqMap'],function(eqMap){ loadMap();});
// 	console.log('loading eq dependencies');
// });

var moment;
define('dnpEqMap', ['jquery', 'd3', 'dnpHelper', 'moment', 'd3Topo'],
    function($, d3, _help, moment, d3Topo) {
        _help.setupPage();
        d3Geo = require(['d3Geo']);
        this.moment = moment;
        console.log('earth quake map dependencies loaded');




        var eqConf = {
            domID: '#earthQuakeMap',
            descID: '#earthQuakeSummary',
            mapUrl: '/src/data/world.svg',
            dataUrl: 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson',
            topoJsonUrl: '/src/data/world-110m2.json',
            pointColor: '#DB2828',
            pointPert: 0.75,
            minHeight: 500,
            maxHeight: 500,
            maxWidth: 500,
            fontSize: '0.8rem',
            padding: 0.02, // in percentage 
            minMag: 5,
            dataFilter: 'today'
        };

        loadMap();


        var svg, svgMap, projection, mapData;

        function loadMap(type) {
            _help.showLoader(eqConf.domID);
            d3.xml(eqConf.mapUrl, function(error, doc) {
                if (!error) drawMap(doc.documentElement);
                else console.log(error);
            });
        }

        function filterMap(label) {
            type =  $(label).attr('filter-type');
            if (type !== undefined) {
                eqConf.dataFilter = type;
                manageFilterLabel(label);
                mapQuakes(mapData);
            }
        }

        function manageFilterLabel(label) {
            $('.dataFilter').removeClass('red');
            $('.dataFilter').addClass('grey');

            $(label).addClass('red');
            $(label).removeClass('grey');
        }

        function setupFilter(){
            var html = '';
            html += "<a class='ui red label cursor dataFilter' filter-type='today' > Today </a>";
            html += "<a class='ui grey label cursor dataFilter' filter-type='pastWeek' > Past Week </a>";
            html += "<a class='ui grey label cursor dataFilter' filter-type='pastMonth' > Past Month </a>";
            $('#filterPanel').html(html);

            $('.dataFilter').click(function(){
                filterMap(this);
            });
          

        }
        function drawMap(svgMap) {
            setupFilter();
            var svgDim = setDimention(eqConf);

            $(eqConf.domID).html('');
            var eqSvg = d3.selectAll(eqConf.domID)
                .append('svg')
                .attr("width", svgDim.width + "px")
                .attr("height", svgDim.height + "px")
                .attr('class', 'eqSvg');

            // https://github.com/mbostock/d3/wiki/Geo-Projections 
            //d3.geo.equirectangular(), d3.geo.mercator(), azimuthalEquidistant, conicEquidistant

            projection = d3.geo.mercator()
                .center([-8, 34])
                .scale(100)
                .translate([svgDim.width / 2, svgDim.height / 2])
                .rotate([-10, 0]);


            var path = d3.geo.path()
                .projection(projection);

            var g = eqSvg.append("g")
                .attr("class", "quakeGroup");

            // load and display the World
            // TODO json file and js file missing
            d3.json(eqConf.topoJsonUrl, function(error, topology) {
                g.selectAll("path")
                    .data(topojson.object(topology, topology.objects.countries).geometries)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("class", 'mappath');
            });

            // zoom and pan
            var zoom = d3.behavior.zoom()
                .scaleExtent([1, 5])
                .on("zoom", function() {
                    g.attr("transform", "translate(" +
                        d3.event.translate.join(",") + ")scale(" + d3.event.scale + ")");
                    g.selectAll("path")
                        .attr("d", path.projection(projection));
                });




            // plat the earthQuake points on the map
            d3.json(eqConf.dataUrl, function(data) {
                mapData = data;
                mapQuakes(mapData);
                _help.hideLoader();

            });

            eqSvg.call(zoom);
        }

        function mapQuakes(data) {

            var g = d3.selectAll(".quakeGroup");

            var allQuakes = data.features;

            var quakes = allQuakes.filter(function(obj) {
                var objTime = moment(obj.properties.time),
                    curTime = moment();
                switch (eqConf.dataFilter) {
                    case 'today':
                        return curTime.diff(objTime, 'days') === 0;
                    case 'pastWeek':
                        return curTime.diff(objTime, 'days') <= 7;
                    case 'pastMonth':
                        return curTime.diff(objTime, 'days') <= 30;
                }
            });


            console.log(allQuakes.length + ' quakes fetched and filtered to ' + quakes.length);
            quakes.sort(function(a, b) {
                //return b.properties.mag - a.properties.mag;
                return b.properties.time - a.properties.time;
            });

            d3.selectAll('.pin').remove();
            var pins = g.selectAll('.pins')
                .append('g')
                .attr('class', '.pins')
                .data(quakes)
                .enter();

            pins.append("circle")
                .attr("cx", function(d, i) {
                    showPointDetails(d, i, eqConf.minMag);
                    var longitude = d.geometry.coordinates[0];
                    var latitude = d.geometry.coordinates[1];

                    return projection([longitude, latitude])[0];
                })
                .attr("cy", function(d) {
                    var longitude = d.geometry.coordinates[0];
                    var latitude = d.geometry.coordinates[1];
                    return projection([longitude, latitude])[1];
                })
                .attr("r", function(d) {
                    if (d.properties.mag > 0) return d.properties.mag * eqConf.pointPert;
                    return 0;
                })
                .attr('fill', eqConf.pointColor)
                .style("cursor", "pointer")
                .attr("class", "pin")
                .on('click', function(d) {
                    showPointDetails(d);
                    //console.log(JSON.stringify(d));

                })
                .on('mouseOver', function(d) {});
        }

        function showPointDetails(d, i, minMag) {
            var html = '';
            /*

        {
            "type": "Feature",
            "properties": {
                "mag": 5.1,
                "place": "145km S of Kushiro, Japan",
                "time": 1457138003350,
                "updated": 1457166966355,
                "tz": 600,
                "url": "http://earthquake.usgs.gov/earthquakes/eventpage/us10004uv6",
                "detail": "http://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/us10004uv6.geojson",
                "felt": null,
                "cdi": null,
                "mmi": null,
                "alert": null,
                "status": "reviewed",
                "tsunami": 0,
                "sig": 400,
                "net": "us",
                "code": "10004uv6",
                "ids": ",us10004uv6,",
                "sources": ",us,",
                "types": ",geoserve,nearby-cities,origin,phase-data,tectonic-summary,",
                "nst": null,
                "dmin": 0.813,
                "rms": 0.65,
                "gap": 73,
                "magType": "mb",
                "type": "earthquake",
                "title": "M 5.1 - 145km S of Kushiro, Japan"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [144.1459, 41.6745, 24.2]
            },
            "id": "us10004uv6"
        }

	*/
            if (i === 0) $(eqConf.descID).html("<div class='ui small red header'>Significant Quake(s)</div>");
            if (minMag !== undefined && d.properties.mag < minMag) return;
            var time = moment(d.properties.time).format('DD MMM YY HH:mm');

            html += "<a href='" + d.properties.url + "' target='_new'> <i class='ui red linkify circular mini icon'></i></a>";
            html += time + ": M" + d.properties.mag + ', D' + d.geometry.coordinates[2] + ' - ' + d.properties.place;
            html += '<br/>';


            $(eqConf.descID).append(html);
        }

        function setDimention(eqConf) {
            var domHeight = $(eqConf.domID).height();
            var domWidth = $(eqConf.domID).width();
            var svgDim = {
                height: eqConf.maxHeight,
                width: domWidth,
                fontSize: '0.8rem',
                pad: domWidth * eqConf.padding,
            };

            if (domHeight < eqConf.maxHeight && domHeight > eqConf.minHeight) svgDim.height = domHeight;
            else if (domHeight > eqConf.minHeight) svgDim.height = eqConf.minHeight;

            if (domWidth < eqConf.maxWidth && domWidth !== 0) svgDim.width = domWidth;
            console.log('svgDim :: ' + JSON.stringify(svgDim));
            return svgDim;
        }

        return {
            filterMap: filterMap
        };

    });