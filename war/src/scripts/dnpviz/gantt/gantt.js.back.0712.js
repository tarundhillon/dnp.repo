  
 




String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}    
    
var dateFormat = d3.time.format("%Y-%m-%d");






// global variables
var timeScale,categories,catsUnfiltered,svgWidth,svgHeight,oneRow,svg,taskDetailsID, 
    barHeight,gap,topPadding, sidePadding,colorScale;
var iconLab;

function sortByCategory(a,b){
  if (a.type>b.type) return 1;
  if (a.type<b.type) return -1;
  return 0;
}
function autoDimension(tasks){
  svgHeight = $("#ganttContainer").height()*0.9;
  svgWidth  = $("#ganttContainer").width();
  var noTasks = tasks.length; // manage conditions of 0 and max length

  oneRow = svgHeight/noTasks;
  barHeight = oneRow * 0.6;
  gap = oneRow - barHeight;
  sidePadding = svgWidth * 0.2;
  topPadding = 0;
  console.log("autoDimension: "+ svgWidth+"x"+svgHeight
    +", tasks length:"+noTasks
    +", oneRow:"+oneRow
    +", barHeight:"+barHeight
    +", sidePadding:"+sidePadding
    +", topPadding:"+topPadding);
}
// main function called by the user
function makeGant(ganttID, tasks,detailsID){
  var startTime = new Date();
  autoDimension(tasks);

  // sort dataset 
  tasks.sort(sortByCategory);


  // set the title 
  $('#ganttOverviewLabel')
    .html("Programme Overview  ("+ 
      gmoment(parseInt(dataList.items[curDataListIndex].timeStamp)).fromNow() 
      +")");

  // w = 500;
  // h = 500;
  
  taskDetailsID = detailsID;

  $("#"+ganttID).html("");

  svg = d3.selectAll("#"+ganttID)
  .append("svg")
  .attr("width",svgWidth+"px")
  .attr("height",svgHeight+"px")
  .attr("viewBox", "0 0 "+svgWidth+" "+svgHeight)
  .attr("preserveAspectRatio", "xMinYMin meet");

var mouseCord = svg.append("text")
  .text("0:0")
  .attr("x", 0)
  .attr("y", svgHeight-25)
  .attr("text-anchor", "left")
  .attr("font-size", 10);


  svg.on("mouseover", function(e){
    var x = Math.round(d3.mouse(this)[0]);
    var y = Math.round(d3.mouse(this)[1]);
    mouseCord.text(x+":"+y);

  });

  //set up scales	
  timeScale = d3.time.scale()
  .domain([d3.min(tasks, function(d) {return dateFormat.parse(d.startTime);}),
           d3.max(tasks, function(d) {return dateFormat.parse(d.endTime);})])
  .range([0,svgWidth-sidePadding]);

  //setup categories
  categories = new Array();
  for (var i = 0; i < tasks.length; i++){
      categories.push(tasks[i].type);
  }

  catsUnfiltered = categories; //for vert labels
  categories = checkUnique(categories);



  // barHeight = 30;
  // gap = barHeight + 10;
  // topPadding = 10;
  // sidePadding = 150;

  colorScale = d3.scale.linear()
      .domain([0, categories.length])
      .range(["#00B9FA", "#F95002"])
      .interpolate(d3.interpolateHcl);

  makeGrid(sidePadding, topPadding, svgWidth ,svgHeight);
  drawRects(ganttID, tasks, gap, topPadding, sidePadding, barHeight, colorScale);
  vertLabels(gap, topPadding, sidePadding, barHeight, colorScale);
  drawDataTable(ganttID,tasks);
  $('#ganttDataLoader').hide();
  adjustHeight();
  $('#ganttLoader').hide();

  console.log("gantt.js makegantt processed in "+(new Date() - startTime)/100+"secs");
}

// function updateGantt(ganttID, tasks){
//   $('#ganttLoader').show();
//   svg.selectAll("rect").remove();


//   // svg.selectAll("text").selectAll("text_type").remove();

//   d3.selectAll("[text_type='label']").remove()

//   drawRects(ganttID, tasks, gap, topPadding, sidePadding, barHeight, colorScale);
//   vertLabels(gap, topPadding, sidePadding, barHeight, colorScale);
  
//   $('#ganttLoader').hide();
// }

function adjustHeight(){
  // adjust the height 
    // var segHeight = $('#ganttDetailsMenu').parent().height() - 60;  
    // var segWidth = $('#ganttDetailsMenu').parent().width() - 20;  

    var segHeight = $('#ganttDetailsMenu').parent().height();  
    var segWidth = $('#ganttDetailsMenu').parent().width();  
    // console.log('Height adjusted sHeight:'+segHeight+' sWidth:'+segWidth);
    // $('#ganttDetailsMenu').parent().find('div[data-tab]').height(segHeight);
    // $('#data_table').width(segWidth);
    // $('#data_table').height(segHeight);
    //$('#ganttHistoryTable').height(segHeight);
    $('#data_table').css('height',(segHeight-100)+'px');
}
var datatable, pasteEvent =0;
function drawDataTable(ganttID,tasks){
  adjustHeight();

  // e// $("#data_table").removeAttr('class');
  var container = document.getElementById('data_table');
  if(!datatable){
    datatable = new Handsontable(container,{
        data:tasks,
        rowHeaders: false,
        autoColumnSize: true,
        colHeaders: true,
        colHeaders: [
                      "<i class='block layout icon' title='Category' ></i>",
                      "<i class='tasks icon' title='Task' ></i>",
                      "<i class='bullseye icon' title='Percentage completion' ></i>",
                      "<i class='calendar icon' title='Start date' ></i>",                
                      "<i class='calendar outline icon' title='End date' ></i>",                                     
                      "<i class='comments icon' title='Comments' ></i>"
                      ],
        stretchH: 'all',
        autoWrapRow: false,
        minSpareRows: 1,
        manualColumnResize: false,
        //colWidths: ['95%'],
        colWidths: ['15%','20%','5%','12%','12%','20%'],
        //colWidths: ['120','120','30','80','80','190'],
        columns: [
          { data:'type', type: 'text'},
          { data:'task', type: 'text'},
          { data:'pert', type: 'text'},
          // { data:'startTime', type: 'date', dateFormat: 'YYYY-MM-DD'},
          // { data:'endTime', type: 'date', dateFormat: 'YYYY-MM-DD'},
          { data:'startTime', type: 'text'},
          { data:'endTime', type: 'text'},
          { data:'details', type: 'text'}
        ]

    }); 
    //console.log("datatable:"+ JSON.stringify($('#data_table')));
  }else {
    // needs to be visible else messes by the formatting.
    $.tab('change tab','first');
    $('#ganttDetailsMenu').tab({path:'first'});
    $.tab('change tab','second');

  }  
  
  datatable.addHook('afterChange', function(changes, source) {
    // make intelligent updates
      //if(source == 'paste') 

      console.log('Event paste '+pasteEvent++);
      var jsonData = makeJSON(datatable.getData())
      //console.log("afterchange fired ... "+ JSON.stringify(jsonData));
      makeGant('mainGantt', jsonData, 'ganttDetaisTable');
      //updateGantt(ganttID,jsonData);
    }); 

}

function makeJSON(data){
  var jsonList = [];
  var json = {};  
  for(i=0;i<data.length;i++){
    json = {};  
    if(data[i][0] && data[i][1]  && data[i][3] && data[i][4]) {
      json.type = data[i][0];
      json.task = data[i][1];
      json.pert = data[i][2];
      json.startTime = data[i][3];
      json.endTime = data[i][4];
      json.details = data[i][5];
      json.timeStamp = data[i][6];
      jsonList.push(json);
    }
    

  }
  return jsonList;
}




function drawRects(ganttID, theArray, theGap, theTopPad, theSidePad, theBarHeight, theColorScale){

  var cats  = {}; // build an object with unique list of categories 
  for(var i = 0; i< theArray.length; i++) {
      var num = theArray[i].type;
      cats[num] = cats[num] ? cats[num]+1 : 1;
  }
  var catKeys = Object.keys(cats);

  var bigRects = svg.append("g")
      .selectAll("rect")
     //.data(theArray)
     .data(catKeys)
     .enter()
     .append("rect")
     .attr("x", 0)
     .attr("y", function(d, k){
        var mY = 0;
        for(var i =0; i<k;i++)
           mY += cats[catKeys[i]] * oneRow ;
        console.log(mY) 
        return mY;
        //return i*theGap + theTopPad - 2;
    })
     .attr("width", function(d){
        //return w-theSidePad/2;
  	   //return w;
      // console.log(' rect width :'+ $('#'+ganttID).width() +' theSidePad : '+theSidePad);
       //return $('#'+ganttID).width()+ theSidePad;
       return svgWidth;
     })
     //.attr("height", theGap)
     .attr("height",function(d,i){
      var height = 0;  
        height = oneRow * cats[d];
        //if ( d.type == categories[i]) height +=oneRow;
      return height;
     })
     .attr("stroke", "none")
     .attr("fill", function(d,i){
        return d3.rgb(theColorScale(i));
      // for (var i = 0; i < categories.length; i++){
      //     if (d.type == categories[i]){
      //       return d3.rgb(theColorScale(i));
      //     }
      // }
     })
     .attr("opacity", 0.2);


 var rectangles = svg.append('g')
     .selectAll("rect")
     .data(theArray)
     .enter();


 var innerRects = rectangles.append("rect")
     .attr("rx", 3)
     .attr("ry", 3)
     .attr("x", function(d){
      var mX = timeScale(dateFormat.parse(d.startTime)) + theSidePad;
      //if(d.startTime == d.endTime)
      //console.log('bar mX = '+mX)
      return mX;
      })
     .attr("y", function(d, i){
        //var mY = i*theGap + theTopPad + 5;
        var mY = i*oneRow + theGap/2;
        if(d.startTime == d.endTime) return mY + theBarHeight/4;
        return mY;
      })
     .attr("width", function(d){
         var width = (timeScale(dateFormat.parse(d.endTime))-timeScale(dateFormat.parse(d.startTime)));; 
         if(d.startTime == d.endTime) return theBarHeight/2;
        return width;
     })
     .attr("height", function(d){ 
        //var width = (timeScale(dateFormat.parse(d.endTime))-timeScale(dateFormat.parse(d.startTime)));
        if(d.startTime == d.endTime) return theBarHeight/2;
        return theBarHeight;
      })
     .attr("stroke", "none")
     .attr("cursor","pointer")
     .attr("opacity","0.6")
     .attr("fill", function(d){
        for (var i = 0; i < categories.length; i++){
            if (d.type == categories[i]){
              return d3.rgb(theColorScale(i));
            }
        }
      })
     .attr("transform",function(d){
        var mX = timeScale(dateFormat.parse(d.startTime)) + theSidePad;
        var mY = d3.select(this).attr('y') - d3.select(this).attr('height')
        if(d.startTime == d.endTime) return "rotate(45,"+mX+","+mY+")";
        else return "rotate(0)"          
     });


  var pertRects = rectangles.append("rect")
     .attr("rx", 3)
     .attr("ry", 3)
     .attr("x", function(d){
        var mX = timeScale(dateFormat.parse(d.startTime)) + theSidePad;
       // if(d.startTime == d.endTime)
      //  console.log('bar mX = '+mX)
        return mX;
      })
     .attr("y", function(d, i){
        //var mY = i*theGap + theTopPad + 5;
        var mY = i*oneRow + theGap/2;
        if(d.startTime == d.endTime) return mY + theBarHeight/4;
        return mY;

      })
     .attr("width", function(d){
        if(d.pert > 0 ) {
          if(d.startTime == d.endTime) return theBarHeight/2 * (d.pert/100);
          return (timeScale(dateFormat.parse(d.endTime))-timeScale(dateFormat.parse(d.startTime))) * (d.pert/100);
        }  
        else return 0; 
        //  return (timeScale(dateFormat.parse(d.endTime))-timeScale(dateFormat.parse(d.startTime)));
     })
     .attr("height", function(d){ 
        //var width = (timeScale(dateFormat.parse(d.endTime))-timeScale(dateFormat.parse(d.startTime)));
        if(d.startTime == d.endTime) return theBarHeight/2;
        return theBarHeight;
      })
     .attr("stroke", "none")
     .attr("cursor","pointer")
     .attr("opacity","1")
     .attr("fill", function(d){
        for (var i = 0; i < categories.length; i++){
            if (d.type == categories[i]){
              return d3.rgb(theColorScale(i));
            }
        }
      })
     .attr("transform",function(d){
        var mX = timeScale(dateFormat.parse(d.startTime)) + theSidePad;
        var mY = d3.select(this).attr('y') - d3.select(this).attr('height')
        //var mY = d3.select(this).attr('y');
        if(d.startTime == d.endTime) return "rotate(45,"+mX+","+mY+")";
        else return "rotate(0)"          
      });   
     

  var rectText = rectangles.append("text")
      .text(function(d){
        if(d.pert > 0 ) return d.task +' '+d.pert+'%';
        else return d.task;
      })
      .attr("x", function(d){
        if(d.startTime == d.endTime){
          var mX = timeScale(dateFormat.parse(d.startTime)) + theSidePad ;
          //console.log('milestone x :'+mX);
          return mX;
        } 
        return (timeScale(dateFormat.parse(d.endTime))-timeScale(dateFormat.parse(d.startTime)))/2 + timeScale(dateFormat.parse(d.startTime)) + theSidePad;
      })
      .attr("y", function(d,i){
        var mY = i*oneRow;
        if(d.startTime == d.endTime) return mY + (barHeight)*3/4;
        return mY + barHeight*3/4;
    
        // if(d.startTime == d.endTime) return i*theGap + theTopPad + (barHeight)*3/4;
        // return i*theGap + theTopPad + barHeight*3/4;
        //return i* (theGap + barHeight) + theTopPad + barHeight/2;
      })
      .attr("font-size", 14)
      .attr("text_type","label")
      .attr("text-anchor", function(d){ 
        if(d.startTime == d.endTime) return "left";
        else return "middle";
      })
      .attr("text-height", theBarHeight)
      .attr("cursor","pointer")
      .attr("fill", "#333");


  // removing the tooltip and using the click option  
  // innerRects.on('mouseover', showToolTip); 
  // rectText.on('mouseover',showToolTip);

  // innerRects.on('mouseout', hideToolTip); 
  // //rectText.on('mouseout',hideToolTip);

      
      rectText.on('click',taskOnClick);
      innerRects.on('click', taskOnClick);       

}


var showToolTip = function(e){
  var tag = "";
  var output = $("#tag");  

  if (d3.select(this).data()[0].details != undefined){
  tag = "Task: " + d3.select(this).data()[0].task + "<br/>" + 
        "Type: " + d3.select(this).data()[0].type + "<br/>" + 
        "Starts: " + d3.select(this).data()[0].startTime + "<br/>" + 
        "Ends: " + d3.select(this).data()[0].endTime + "<br/>" + 
        "Details: " + d3.select(this).data()[0].details;
  } else {
  tag = "Task: " + d3.select(this).data()[0].task + "<br/>" + 
        "Type: " + d3.select(this).data()[0].type + "<br/>" + 
        "Starts: " + d3.select(this).data()[0].startTime + "<br/>" + 
        "Ends: " + d3.select(this).data()[0].endTime;
  }
  var output = document.getElementById("tag");
  var x = d3.event.pageX + "px"; 
  var y = (d3.event.pageY - 20) +"px";

  var output = $("#tag");
  output.html(tag);
  output.css("top", y);
  output.css("left", x);
  if(!output.is("visible")) output.show(100);
}  

var hideToolTip =  function() {
    $("#tag").hide("slow");
}

function makeGrid(theSidePad, theTopPad, svgWidth, svgHeight){

  var xAxis = d3.svg.axis()
      .scale(timeScale)
      .orient('bottom')
      .ticks(d3.time.week, 1)
      .tickSize(-svgHeight+theTopPad+20, 0, 0)
      .tickFormat(d3.time.format('%d %b'));

  var grid = svg.append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(' +theSidePad + ', ' + (svgHeight - 50) + ')')
      .call(xAxis)
      .selectAll("text")  
              .style("text-anchor", "middle")
              .attr("fill", "#000")
              .attr("stroke", "none")
              .attr("font-size", 10)
              .attr("dy", "1em");


}

function vertLabels(theGap, theTopPad, theSidePad, theBarHeight, theColorScale){
  var numOccurances = new Array();
  var prevGap = 0;

  for (var i = 0; i < categories.length; i++){
    numOccurances[i] = [categories[i], getCount(categories[i], catsUnfiltered)];
  }

  var axisText = svg.append("g") //without doing this, impossible to put grid lines behind text
   .selectAll("text")
   .data(numOccurances)
   .enter()
   .append("text")
   .text(function(d){
    //return d[0].capitalize();
    return d[0];
   })
   .attr("x", 10)
   .attr("y", function(d, i){
    if (i > 0){
        for (var j = 0; j < i; j++){
          prevGap += numOccurances[i-1][1];
         // console.log(prevGap);
          return d[1]*theGap/2 + prevGap*theGap + theTopPad;
        }
    } else{
    return d[1]*theGap/2 + theTopPad;
    }
   })
   .attr("font-size", 14)
   .attr("text-anchor", "start")
   .attr("text-height", 14)
   .attr("fill", function(d){
    for (var i = 0; i < categories.length; i++){
        if (d[0] == categories[i]){
        //  console.log("true!");
          return d3.rgb(theColorScale(i)).darker();
        }
    }
   });

}

//from this stackexchange question: http://stackoverflow.com/questions/1890203/unique-for-arrays-in-javascript
function checkUnique(arr) {
    var hash = {}, result = [];
    for ( var i = 0, l = arr.length; i < l; ++i ) {
        if ( !hash.hasOwnProperty(arr[i]) ) { //it works with objects! in FF, at least
            hash[ arr[i] ] = true;
            result.push(arr[i]);
        }
    }
    return result;
}

//from this stackexchange question: http://stackoverflow.com/questions/14227981/count-how-many-strings-in-an-array-have-duplicates-in-the-same-array
function getCounts(arr) {
    var i = arr.length, // var to loop over
        obj = {}; // obj to store results
    while (i) obj[arr[--i]] = (obj[arr[i]] || 0) + 1; // count occurrences
    return obj;
}

// get specific from everything
function getCount(word, arr) {
    return getCounts(arr)[word] || 0;
}

// ---- Manage the gantt setting 
    $("#ganttSetting").click(function(){
      $("#ganttSettingModal").modal('show');
    });

    $('[change-font-size]').click(function(){
      var size = $(this).attr('change-font-size');
      d3.selectAll("[text_type='label']").attr('font-size',size);
    });

    

    // ----- End the Gantt setting  


