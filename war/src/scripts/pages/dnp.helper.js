var globalErrorHandler;
define('dnpHelper', ['semuiDimmer'], function(_dim) {

    console.log('Inside the helper function');



    var numWord = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen'];

    function setupPage() {
        console.log("Action time:" + arguments.callee.name);
        var localhost = window.location.href.indexOf("127.0.0.1") > -1;
        $('#dnpHeader').load('/src/pages/header.html', function() {
            initHashScroll();
        });
        $('#dnpFooter').load('/src/pages/footer.html');

        //$('head').append($.load('/src/pages/head.html'));

        $.get('/src/pages/head.html', function(data) {
            $('head').prepend(data);
        });

        //if(alertify) alertify.defaults.notifier.position = 'bottom-right';

        if (localhost) {
            console.log("Local host detected");
        }
        //checkFireWall();
        //setupErrorHandling();
        //causeError();

        window.onerror = globalErrorHandler;
    }

    globalErrorHandler = function(message, file, line, col, error) {
        console.log("window.error"+message, "from", file, line, col, error);
        // - check is there is access to external urls -- google dsn
        // - how to check if the icons are working 
        // - IE11 work
        
        // error message should drive the type of error. 

        if(error.toString().indexOf("access") > -1) showWarningMessage(error);
        if(error.toString().indexOf("Access") > -1) showWarningMessage(error);
    };



    function initHashScroll() {
        //console.log('Smooth Scrolling ::'+$('a[href*=#]:not([href=#])').length);
        //$('#dnpHeader, #dnpFooter').on('ready',function(){
        //$(window).load(function(){
        //	console.log('Page ready ::'+$('a[href*=#]:not([href=#])').length);
        $('a[href*=#]:not([href=#])').click(function() {
            //console.log('Link clicked');
            window.location.hash = this.hash.slice(1);
            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') &&
                location.hostname == this.hostname) {
                var target = $(this.hash);

                target = target.length ? target : $('[data-anchor=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top
                    }, 1000);
                    return false;
                }

                $(this).click();
            }
        });
        //});

    }

    // String.prototype.capitalize = function() {
    //     return this.charAt(0).toUpperCase() + this.slice(1);
    // };

    function logTime(startTime, text) {
        if (debug) console.log(arguments.callee.caller.name + ' :: ' +
            text + ' in ' + moment().diff(startTime, 'seconds', true) + ' secs');
    }

    function clone(obj) {
        if (obj !== undefined || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    function getRAGColor(rag) {
        if (rag === undefined) rag = 'grey';
        rag = rag.toLowerCase();
        switch (rag) {
            case 'amber':
                return 'orange';
        }
        return rag;
    }



    function showLoader(domID) {

        if ($('#loader').length === 0) {
            var html = "<div class='ui red inverted dimmer' id='loader'>";
            html += "<div class='content'><div class='center'>";
            html += "<i class='red big spinner loading icon'></i>";
            html += "</div></div></div>";
            $(domID).append(html);
            hideLoader();
        }
        $('#loader').dimmer('show');
    }

    function hideLoader() {
        $('#loader').dimmer('hide');
    }

    function causeError() {
        $.ajax({
            type: "GET",
            //url: "http://dnp.associates/src/pages/index.html",
            url: 'https://docs.google.com/spreadsheets/d/1Jv8JNT8N9wE4PQ00ISwPCYgYkXDOPsoXNoWQNBMSyKA/edit#gid=1926982963',
            //dataType: "jsonp",
            success: function() {
                consle.log('firewall test successful');
            },
            error: function(xhr, ajaxOptions, thrownError) {
                console.log('firewall test unsuccessful');
            }
        });

    }

    var isWarningVisible = false;
    function showWarningMessage(msg) {

        if(isWarningVisible) return;
        else isWarningVisible = true;
        var html = "<div class='ui yellow attached message toppad'>";
        html += "<div class='header'><i class='red warning sign icon'></i> Firewall restrictions detected</div>";
        html += "<p> Our site may not work properly due the firewall restrictions in this network, to view the full features please try to access the site outside the firewall.</p>";
        if(msg !== undefined) html+='<br><i>'+msg+'<i>';

        html += "</div>";
        $('#dnpHeader').after(html);

    }

    function fitTextInBoxes(selector) {
        var boxes = $(selector);
        for (i = 0; i < boxes.length; i++) fitTextInBox(boxes[i].id);
    }

    function fitTextInBox(id) {
        var selId = "a[id='" + id + "']";
        var boxes = $(selId);
        var boxWidth = boxes.innerWidth();
        if (boxes[0].scrollWidth > boxWidth) {
            boxText = boxes[i].html().trim();
            boxText = boxText.substring(0, boxText.length - 5) + "...";
            $(selId).html(boxText);
            fitTextInBox(id);
        }
    }



    function wrap(text, width, lineH) {
        this.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = lineH, // rem
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "rem");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "rem").text(word);
                }
            }
        });
    }


    // // this function will return the width and height

    function getDimention(domID, minW, minH) {
        var W = minW,
            H = minH,
            domH = $(domID).height(),
            domW = $(domID).width();

        if (domH > minH) H = domH;
        if (domW > minW) W = domW;
        console.log('dim :: w=' + W + ', h=' + H + ',  domW=' + domW + ', domH=' + domH);
        return {
            width: W,
            height: H
        };
    }

    // });



    function intPad(num, size) {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }

    function jackPopup() {
        $("[data-content]").popup({
            content: $(this).attr('data-content'),
            lastResort: true,
            inverted: true
        });
    }

    String.prototype.getInteger = function() {
        return parseInt(this.replace(/^\D+/g, ''), 10);
    };

    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };

    Array.prototype.contains = function(v) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] === v) return true;
        }
        return false;
    };

    Array.prototype.unique = function() {
        var arr = [];
        for (var i = 0; i < this.length; i++) {
            if (!arr.contains(this[i])) {
                arr.push(this[i]);
            }
        }
        return arr;
    };

    String.prototype.shorternName = function(){
        
        var str;
        if(this !== undefined){
            var tags = this.split(' ');
            if(tags.length > 1){
                str=tags[0];
                for(var i=1; i<tags.length; i++)
                    str+=tags[i].substring(0,1).toUpperCase();
            } else str = this;
        }
        return str;

    };

    return {
        setupPage: setupPage,
        initHashScroll: initHashScroll,
        //capitalize: capitalize,
        logTime: logTime,
        showLoader: showLoader,
        hideLoader: hideLoader,
        clone: clone,
        getRAGColor: getRAGColor,
        getDimention: getDimention,
        wrap: wrap,
        fitTextInBox: fitTextInBox,
        fitTextInBoxes: fitTextInBoxes,
        jackPopup: jackPopup,
        intPad: intPad,
        numWord: numWord,
        causeError:causeError,
        showWarningMessage:showWarningMessage,
       // shorternName: shorternName

    };

});