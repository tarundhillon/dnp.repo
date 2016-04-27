define('timeline', ['moment', 'dnpHelper', 'semanticui'],
    function(moment, dhelp, semui) {
        console.log('timeline dependencies loaded');

        var conf, data;

        function makeTimeLine(data, conf) {
            this.conf = conf;
            this.data = data;
            updateDataTable(data); // Need to check is this should be here. 
            svgDim = autoDimention(conf);

            data = data.filter(function(obj) {
                return moment(obj.Date, conf.inDateFormat).isValid();
            });
            $(conf.containerID).html('');
            var svg = d3.selectAll(conf.containerID)
                .append("svg")
                .attr("width", svgDim.width + "px")
                .attr("height", svgDim.height + "px")
                .style("background", '#F0F0F0')
                .style("border-radius", "0.5rem");
            //.attr("viewBox", "0 0 "+svgDim.width+" "+svgDim.width)
            //.attr("preserveAspectRatio", "xMinYMin meet");
            var dateFormat = d3.time.format(conf.dateFormat);
            var minDate = d3.min(data, function(d) {
                return dateFormat.parse(d['Date']);
            });
            var maxDate = d3.max(data, function(d) {
                return dateFormat.parse(d['Date']);
            });
            var startDate = offsetDate(minDate, -0.5);
            var endDate = offsetDate(maxDate, 1);
            console.log('startDate::' + startDate + ', endDate::' + endDate);
            timeScale = d3.time.scale()
                .domain([startDate, endDate])
                .range([0, svgDim.width - svgDim.pad]);

            var xAxis = d3.svg.axis()
                .scale(timeScale)
                .orient('top')
                .ticks(d3.time.year, 1)
                .outerTickSize(conf.lineHeight)
                .tickPadding(10)
                .tickFormat(d3.time.format('%d %b %y'));

            //rationalise data point to avoid overlap
            //data.sort(function(a,b){return a.Date - b.Date;});
            eventList = [];
            var inR = conf.inR,
                outR = conf.outR;
            data.forEach(function(obj, i) {
                eX = timeScale(dateFormat.parse(obj.Date));
                if (i === 0) eventObj = {
                    objList: [obj],
                    ex: eX
                };
                else {
                    var result = $.grep(eventList, function(e) {
                        return (e.ex + 2 * inR) > eX && eX > (e.ex - 2 * inR);
                    });
                    if (result.length > 0) result[0].objList.push(obj);
                    else eventList.push(eventObj = {
                        objList: [obj],
                        ex: eX
                    });
                }
            });
            var orgEventList = eventList;
            eventList.sort(function(a, b) {
                return a.ex - b.ex;
            });

            // eventList.forEach(function(d,i){
            // 	console.log(i+' len: '+d.objList.length+', x: '+d.ex);
            // });


            var axis = d3.selectAll('svg')
                .append('g')
                .attr('transform', 'translate(' + 0 + ', ' + (svgDim.height / 2) + ')')
                .call(xAxis)
                .style('fill', this.conf.lineColor)
                .selectAll("text")
                .style("text-anchor", "left")
                .attr("fill", "#666")
                .style("font-size", "0.8rem")
                .attr("dy", "3rem");

            var points = svg.selectAll('.points')
                .data(eventList)
                .enter()
                .append('g')
                .attr('class', 'points')
                .attr('transform', 'translate(' + 0 + ', ' + (svgDim.height / 2) + ')');


            // points.data().forEach(function(d,i){
            // 	console.log('points data: '+i+' len: '+d.objList.length+', x: '+d.ex);
            // });

            points.append('circle') // outer circle
            .attr('cx', function(d) {
                return d.ex;
            })
                .attr('cy', -this.conf.lineHeight / 2)
                .attr('r', outR)
                .attr('stroke', this.conf.pointColor)
                .attr('fill', this.conf.lineColor)
                .attr('cnt', function(d, i) {
                    //console.log('inR point draw '+i+' : '+d.objList[0].Date);
                    return d.objList.length;
                });

            points.append('circle') // inner circle
            .attr('cx', function(d) {
                return d.ex;
            })
                .attr('cy', -this.conf.lineHeight / 2)
                .attr('r', inR)
                .style('cursor', 'pointer')
                .attr('fill', this.conf.pointColor)
                .attr('cnt', function(d, i) {
                    //console.log('outR point draw '+i+' : '+d.objList[0].Date);
                    return d.objList.length;
                })
                .on('click', this.conf.pointOnClick);
            // .on('click',function(d){
            // 	console.log(d.objList[0].Date+', '+d.ex);

            // });

            points.append('text') // circle text
            .text(function(d) {
                if (d.objList.length > 1) return d.objList.length;
                return '';
            })
                .attr('transform', function(d) {
                    return 'translate(' + d.ex + ', ' + (-conf.lineHeight / 3) + ' )';
                })
                .attr('text-anchor', 'middle')
                .attr('fill', this.conf.lineColor)
                .attr('font-size', '0.7rem')
                .style('cursor', 'pointer')
                .on('click', this.conf.pointOnClick);

            points.append('line') // connector lines
            .style("stroke", this.conf.pointColor)
                .style("stroke-dasharray", ("3, 3"))
                .attr("x1", function(d) {
                    return d.ex;
                })
                .attr("y1", -this.conf.lineHeight / 2)
                .attr("x2", function(d) {
                    return d.ex;
                })
                .attr("y2", function(d, i) {
                    return getLevelY(d, i);
                });

            textBox = points.append('g');

            textBox.append('rect') // text box
            .style("fill", this.conf.textBoxColor)
                .style("stroke", this.conf.pointColor)
                .style("stroke-dasharray", function(d, i) {
                    if (i % 2 === 0) return conf.textBoxWidth + ',' + (conf.textBoxWidth * 2 + conf.textBoxHeight);
                    return conf.textBoxWidth + ',' + (conf.textBoxWidth + conf.textBoxHeight);
                })
                .style("stroke-dashoffset", function(d, i) {
                    if (i % 2 === 0) return 0;
                    else return conf.textBoxWidth;
                })
                .attr("x", function(d) {
                    return d.ex - conf.textBoxWidth / 2;
                })
                .attr("y", function(d, i) {
                    return getLevelY(d, i);
                })
                .attr('class', function(d, i) {
                    if (i % 2 === 0) return 'topRect';
                    else return 'bottomRect';
                })
                .attr("width", this.conf.textBoxWidth)
                .attr("height", this.conf.textBoxHeight)
                .on('click', this.conf.pointOnClick);

            textBox.append('text') // box text
            .text(function(d) {
                var str = d.objList[0]['Regulatory Event'];
                if (str.length >= 20) str = str.substring(0, 40) + '...';
                return str;
            })
                .attr("transform", function(d, i) {
                    mX = d.ex;
                    mY = getLevelY(d, i) + conf.textBoxHeight / 2;
                    return "translate(" + mX + "," + mY + ")";
                })
            //.attr('x',function(d,i){return d.ex - conf.textBoxWidth/2;})
            //.attr('y',function(d,i){return getLevelY(d,i);})
            .attr('dy', 0)
                .attr('text-anchor', 'middle')
                .attr('fill', 'black')
                .attr('font-size', '0.6rem')
                .style('cursor', 'pointer')
                .call(dhelp.wrap, this.conf.textBoxWidth, 1)
                .on('click', this.conf.pointOnClick);



        }
        var preLevel = 0;
        var getLevelY = function(d, i) {
            if (i % 2 === 0) even = true;
            else even = false;

            if (even) {
                level = preLevel + 1;
                if (i % 3 === 0) level = 0;
                preLevel = level;
            } else level = preLevel;
            //console.log('i: '+i+', even:'+even+', level:'+level+', preLevel:'+preLevel);
            if (even) return svgDim.height / 2 - ((this.conf.textBoxHeight + this.conf.textBoxPad) * level) - this.conf.textBoxHeight - this.conf.textBoxPad;
            else return -svgDim.height / 2 + ((this.conf.textBoxHeight + this.conf.textBoxPad) * level) + this.conf.textBoxPad;
        };

        function offsetDate(d, offset) {
            switch (this.conf.dateUnit) {
                case 'year':
                    return d3.time.year.offset(d, offset);
                case 'month':
                    return d3.time.month.offset(d, offset);
                case 'week':
                    return d3.time.week.offset(d, offset);
                case 'day':
                    return d3.time.day.offset(d, offset);
            }
        }

        function autoDimention(setting) {
            var domHeight = $(setting.containerID).height();
            var domWidth = $(setting.containerID).width();
            var svgDim = {
                height: setting.maxSvgHeight,
                width: domWidth,
                fontSize: '0.8rem',
                pad: domWidth * setting.padding,
            };


            if (domHeight < setting.maxHeight && domHeight !== 0) svgDim.height = domHeight;


            console.log('svgDim :: ' + JSON.stringify(svgDim));
            return svgDim;
        }


		function updateDataTable(points) {
            html = '';
            html += "<table class='ui red table striped compact'>";
            html += "<thead>";
            html += "<tr>";
            html += "<th></th>";
            html += "<th>Name</th>";
            html += "<th>Description</th>";
            html += "<th>Expected Date</th>";
            html += "</tr>";
            html += "</thead>";
            html += "<tbody>";
            points.forEach(function(point) {
                html += "<tr>";
                html += "<td>" + point.id + "</td>";
                html += "<td>" + point['Short Name'] + "</td>";
                html += "<td>" + point['Regulatory Event'] + "</td>";
                html += "<td>" + point['Expected Date'] + "</td>";
                html += "</tr>";
            });
            html += "</tbody>";
            html += "</table>";
            $(this.conf.dataTableID).html(html);
        }

        return {
			makeTimeLine: makeTimeLine
        };
    });