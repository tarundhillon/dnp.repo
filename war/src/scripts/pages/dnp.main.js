/**
 * http://usejsdoc.org/
 */
//requirejs(['jquery', 'dnpHelper', 'd3'], function ($, dnp_helper, d3){
define('dnpMain', ['jquery', 'd3', 'dnpHelper'], function($, d3, dnpHelper) {
    var debug = true,
        localhost = window.location.href.indexOf("127.0.0.1") > -1;

        
    console.log("dnpMain fired... ");
    dnpHelper.setupPage();

    if (localhost) {
        console.log("Local host detected");
    }


    //load visualisation 
    console.log('launching hexbin');
    var viz = requirejs(['hexbin'], function(hexbin) {
        //alertify.message("All scripts loaded successfully",1);
        console.log('launching loaded');
        $('#hexbinLoader').hide();
    });

    var projectControlList = {
        name: 'Assurance',
        icon: 'travel',
        color: 'red',
        links: [{
                text: 'Business Value Realisation'
            }, {
                text: 'Requirements Management',
                color: 'red',
                icon: 'file text',
                link: '/src/pages/req.html'
            }, {
                text: 'Planning & Monitoring',
                color: 'red',
                icon: 'setting',
                link: '/src/pages/plan.html'
            }, {
                text: 'Change Request Management'
            }, {
                text: 'Solution Design'
            }, {
                text: 'Testing Coverage'
            }, {
                text: 'Training',
                color: '',
                icon: 'student',
                link: '/src/pages/training.html'
            }, {
                text: 'Target Operating Model',
                icon: 'grid layout',
                link: '/src/pages/tom.html'
            }, {
                text: 'Organisation Design & Management',

            }, {
                text: 'Product Selection'
            },

        ]
    };

    var industryInsightsList = {
        name: 'Insights',
        icon: 'wizard',
        color: 'green',
        links: [{
                text: 'Regulatory Timeline',
                icon: 'history',
                link: '/src/pages/timeline.html'
            }, {
                text: 'Solvency II'
            }, {
                text: 'Future Clearing Model'
            }, {
                text: 'SEPA'
            }, {
                text: 'UK Payments'
            }, {
                text: 'Risk Management'
            }, {
                text: 'Core Banking Transformation'
            }, {
                text: 'Telephony Transformation'
            },

        ]
    };

    var dataLabsList = {
        name: 'Labs',
        icon: 'lab',
        color: 'blue',
        links: [{
            text: 'Earth Quakes',
            statu: '',
            icon: 'world',
            link: '/src/pages/earthquake.html'
        }, {
            text: 'Euro Millons'
        }, {
            text: 'Cheese'
        }, {
            text: 'Brexit'
        }, {
            text: 'Block Chain'
        }, ]
    };


    makeSelectionGrid('#projectControlGrid', projectControlList);
    makeSelectionGrid('#industryInsightsGrid', industryInsightsList);
    makeSelectionGrid('#dataLabsGrid', dataLabsList);


    function makeSelectionGrid(domID, conList) {
        var html = "";
        html += "<div class='nopad column'>";
        html += "<div class='ui " + conList.color + " header'><i class='" + conList.icon + " icon '></i>" + conList.name + "</div>";
        html += "<div class='ui basic segment " + conList.color + " '>";
        html += "<div class='ui three column grid'>";
        conList.links.forEach(function(content) {
            if (content.link === undefined) {
                content.link = '#';
                content.color = 'grey';
            } else content.color = conList.color;
            if (content.icon === undefined) content.icon = 'spinner';
            html += "<div class='nopad column'>";
            html += "<a href='" + content.link + "' class='ui segment inverted " + content.color + " itemBox'>";
            html += "<i class='" + content.icon + " large circular icon'></i>";
            html += "<div class='itemBoxLabel'>" + content.text + "</div>";
            html += "</a>";
            html += "</div>";
        });
        html += "</div>";
        html += "</div>";
        html += "</div>";
        $(domID).html(html);

    }

    

});