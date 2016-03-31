
// global variables
var timeScale, categories, catsUnfiltered,
    svgWidth, ganttAxisWidth,svgHeight, ganttHeight, ganttWidth,
    oneRow, svg, dateFormat, xTicks,
    taskDetailsID, taskHeight, taskGap,
    topPad, sidePad, bottomPad, leftPad, rightPad,
    colorScale, taskFontSize, iconLab, tasks,
    ganttData, ganttSettings;



// main function called by the user
function makeGant(ganttData, ganttSettings){

  var startTime = moment();
  //if(debug) console.log(arguments.callee.name+' :: startTime='+startTime);

  this.tasks = ganttData;
  //tasks.sort(sortByCategory);

  this.ganttSettings = ganttSettings;
  dateFormat = d3.time.format(ganttSettings.dateFormat);

  
  $(ganttSettings.containerID).html("");
  autoDimension();

  svg = d3.selectAll(ganttSettings.containerID)
  .append("svg")
  .attr("width",svgWidth+"px")
  .attr("height",svgHeight+"px")
  .attr("viewBox", "0 0 "+svgWidth+" "+svgHeight)
  .attr("preserveAspectRatio", "xMinYMin meet");

  //set up scales	
  if(!window.ganttData.taskFocus){
    timeScale = d3.time.scale()
    .domain([d3.min(tasks, function(d) {return dateFormat.parse(d.startTime);}),
             d3.max(tasks, function(d) {return dateFormat.parse(d.endTime);})])
    .range([0,ganttWidth-sidePad]);
    window.ganttData.timeScale = timeScale;
  }else{
    timeScale = window.ganttData.timeScale; // during task focus we need to use the original scale.
  }
  noMonths = moment(timeScale.domain()[1]).diff(moment(timeScale.domain()[0]),'months');
  xTicks = calTimeScaleTicks(1, noMonths);
  console.log('xTicks ::'+xTicks);

  //setup categories
  categories = Array();
  for (var i = 0; i < tasks.length; i++){categories.push(tasks[i].type);}

  catsUnfiltered = categories; //for vert labels
  categories = checkUnique(categories);

  colorScale = d3.scale.linear()
      .domain([0, categories.length])
      .range(["#00B9FA", "#F95002"])
      .interpolate(d3.interpolateHcl);

  makeGrid();
  drawRects();
  

  $('#ganttLoader').hide();

  //console.log("gantt.js makegantt processed in "+(new Date() - startTime)/100+"secs");
  logTime(startTime,'Gantt Drawn');
}

function calTimeScaleTicks(ticks, noMonths){
  if(ganttAxisWidth > ((noMonths/ticks) *30) ) return ticks;
  else return calTimeScaleTicks(++ticks, noMonths);
}

function sortByCategory(a,b){
  if (a.type>b.type) return 1;
  if (a.type<b.type) return -1;
  return 0;
}

function autoDimension(){
  //domSvgHeight = $(ganttSettings.containerID).height()*0.9;
  domSvgHeight = ganttSettings.maxSvgHeight;
  calSvgHeight = ganttSettings.defTaskHeight * tasks.length;
  calSvgHeight += 2* (0.02 * calSvgHeight); // manage the top and bottom pad

  svgHeight = calSvgHeight < domSvgHeight ? calSvgHeight : domSvgHeight;

  console.log('svgHeight='+svgHeight+' , calSvgHeight='+calSvgHeight+' , domSvgHeight='+domSvgHeight);

  //svgHeight = $(ganttSettings.containerID).height()*0.9;
  svgWidth  = $(ganttSettings.containerID).width();

  var noTasks = tasks.length; // manage conditions of 0 and max length

  sidePad = svgWidth * 0.2;
  topPad = bottomPad = svgHeight *0.02;
  if(topPad < ganttSettings.minGanttPadding){
    topPad = bottomPad = ganttSettings.minGanttPadding;
  }

  rightPad = leftPad = svgWidth *0.02;


  ganttHeight = svgHeight - bottomPad - topPad;
  ganttWidth = svgWidth - leftPad - rightPad;
  ganttAxisWidth = svgWidth - sidePad;
  oneRow = ganttHeight/noTasks;
  taskHeight = oneRow * 0.6;
  taskGap = oneRow - taskHeight;
  //taskFontSize = '14px'; // fix hard coding

  if(taskHeight > ganttSettings.maxTaskFontSize) taskFontSize = ganttSettings.maxTaskFontSize+'px';
  else taskFontSize = (taskHeight-1)+'px'; // fix hard coding

  

  if(debug) console.log("autoDimension: "+ svgWidth+"x"+svgHeight+"\n"+
    ", tasks length:"+noTasks+"\n"+
    ", oneRow:"+oneRow+"\n"+
    ", taskGap:"+taskGap+"\n"+
    ", taskHeight:"+taskHeight+"\n"+
    ", bottomPad:"+bottomPad+"\n"+
    ", sidePad:"+sidePad+"\n"+
    ", leftPad:"+leftPad+"\n"+
    ", rightPad:"+rightPad+"\n"+
    ", topPad:"+topPad);
}




function drawRects(){

  var cats  = {}; // build an object with unique list of categories 
  for(var i = 0; i< tasks.length; i++) {
      var num = tasks[i].type;
      cats[num] = cats[num] ? cats[num]+1 : 1;
  }
  var catKeys = Object.keys(cats);

  var bigRects = svg.append("g")
      .selectAll("rect")
     .data(catKeys)
     .enter()
     .append("rect")
     .attr("x", 0)
     .attr("y", function(d, k){
        var mY = 0;
        for(var i =0; i<k;i++) mY += cats[catKeys[i]] * oneRow ;
        //console.log(mY) 
        return mY;
    })
     .attr("width", function(d){
       return svgWidth;
     })
     .attr("height",function(d,i){
      return oneRow * cats[d];
     })
     .attr("stroke", "none")
     .attr("fill", function(d,i){
        return getColor('cat',i);
     })
     .attr("id",function(d){return d.id;})
     .attr("opacity", 0.2);

var bigRectLabels = svg.append("g")
    .selectAll("rect")
    .data(catKeys)
    .enter()
    .append("text")
    .attr('font-size',taskFontSize)
    .text(function(d){
      return d;
      //return d.replaceAll(' ','\n\r');
    })
    .attr("x",leftPad)
    .attr("y",function(d,k){
      var mY = topPad/2;
      for(var i=0; i<k; i++)
        mY += cats[catKeys[i]] * oneRow ;
      mY += cats[d]*oneRow/2;
        return mY;
    })
    .attr("cursor","pointer")
    .on('click',function(d){
      if(!ganttData.taskFocus) ganttSettings.catOnClick(d);
      else return "";
      
    });



 var rectangles = svg.append('g')
     .selectAll("rect")
     .data(tasks)
     .enter();

var taskGroup = rectangles.append('g');
    drawTasks(taskGroup,'task');
    drawTasks(taskGroup,'pert');
    drawTaskLabels(taskGroup);   

}

function  getColor(type,i){
  color = [];
  if(type=='task') color = ganttSettings.taskColor;
  else color = ganttSettings.catColor;

  if(i%2) return color[0];
  else if(color.length > 1 ) return color[1];
  else return color[0];

}

// function drawTasksAndLabels(rectangles,type){
//   var group = rectangles.append("g");

//   group.append("rect")
//    .attr("rx", 1)
//    .attr("ry", 1)
//    .attr("id",function(d){
//       var id = 'ID';
//       if(type == 'pert') id = 'PID';
//       return id+d.id;
//    })
//    .attr("x", function(d){
//       var mX = timeScale(dateFormat.parse(d.startTime)) + sidePad;
//       return mX;
//     })
//    .attr("y", function(d, i){
//       var mY = i*oneRow + taskGap/2;
//       if(d.startTime == d.endTime) return mY + taskHeight/2 - taskGap/2;
//       return mY;
//     })
//    .attr("width", function(d){
//       var width = 0;
//       if(d.startTime == d.endTime) width = taskHeight * 0.75;
//       else width = (timeScale(dateFormat.parse(d.endTime))-timeScale(dateFormat.parse(d.startTime)));
//       if(type == 'pert' && d.pert !== undefined) width = width * (d.pert/100);
//       return width;
//    })
//    .attr("height", function(d){
//       if(d.startTime == d.endTime) return taskHeight * 0.75;
//       return taskHeight;
//     })
//    .attr("stroke", "none")
//    .attr("cursor","pointer")
//    .attr("opacity",function(){
//       if(type == 'pert') return "1";
//       return "0.4";
//    })
//    .attr("fill", function(d){
//       for (var i = 0; i < categories.length; i++){
//           if (d.type == categories[i]) return getColor('task',i);
//       }
//     })
//    .attr("transform",function(d){
//       var mX = timeScale(dateFormat.parse(d.startTime)) + sidePad;
//       var mY = d3.select(this).attr('y') - d3.select(this).attr('height');
//       if(d.startTime == d.endTime) return "rotate(45,"+mX+","+mY+")";
//       else return "rotate(0)";
//    });

//    group.append("text")
//   .text(function(d){
//     if(d.pert > 0 ) return d.task +' '+d.pert+'%';
//     else return d.task;
//   })
//   .attr("height",taskHeight)
//   .attr("text-anchor","left")
//   .attr("text-height", function(d){
//       var taskBox = d3.select("rect[id='ID"+d.id+"']").node().getBBox();
//       return taskBox.height;
//   })
//   .attr("transform",function(d){
//     var taskBox = d3.select("rect[id='ID"+d.id+"']").node().getBBox();
//     //mX = taskBox.x + taskBox.width * 0.05;
//     mX = taskBox.x;
//     mY = taskBox.y + taskBox.height *0.75; //+ this.getBBox().height/2;
//     return "translate("+mX+","+mY+")";
//   })
  
//   // .attr("x", function(d){
//   //   var taskBox = d3.select("rect[id='ID"+d.id+"']").node().getBBox();
//   //   return taskBox.x + taskBox.width * 0.05;
//   //   // var mX = 0;
//   //   // if(d.startTime == d.endTime)
//   //   //   mX = timeScale(dateFormat.parse(d.startTime)) + sidePad;
//   //   // else
//   //   //   mX = sidePad + timeScale(dateFormat.parse(d.startTime)) + sidePad * 0.02;
//   //   // return mX;
//   // })
//   // .attr("y", function(d,i){
//   //   var taskBox = d3.select("rect[id='ID"+d.id+"']").node().getBBox();
//   //   return taskBox.y;

//   //     // var mY = i*oneRow  + taskHeight;
//   //     // if(d.startTime == d.endTime) return mY + taskHeight/2 - taskGap/2;
//   //     // return mY;
//   // })
//   .attr("font-size", taskFontSize)
//   .attr("font-style",'oblique')
//   .attr("cursor","pointer")
//   .attr("fill", "#333")
//   .on('click', function(d){
//     if(!ganttData.taskFocus) ganttSettings.taskOnClick(d);
//     else return "";
//   });

// }

function drawTasks(taskGroup,type){
  taskGroup.append("rect")
   .attr("rx", 1)
   .attr("ry", 1)

   // .attr("x", function(d){
   //    var mX = timeScale(dateFormat.parse(d.startTime)) + sidePad;
   //    return mX;
   //  })
   // .attr("y", function(d, i){
   //    var mY = i*oneRow + taskGap/2;
   //    if(d.startTime == d.endTime) return mY + taskHeight/2 - taskGap/2;
   //    return mY;
   //  })
   .attr("width", function(d){
      var width = 0;
      if(d.startTime == d.endTime) width = taskHeight * 0.75;
      else width = (timeScale(dateFormat.parse(d.endTime))-timeScale(dateFormat.parse(d.startTime)));
      if(type == 'pert' && d.pert !== undefined) width = width * (d.pert/100);
      return width;
   })
   .attr("height", function(d){
      if(d.startTime == d.endTime) return taskHeight * 0.75;
      return taskHeight;
    })
    .attr("transform",function(d,i){
      var mX = timeScale(dateFormat.parse(d.startTime)) + sidePad;
      var mY = i*oneRow + taskGap;
      var rotate = 0;
      if(d.startTime == d.endTime){
        mY = mY  - taskGap/2;
        rotate = 45;
      }
      return "translate("+mX+","+mY+") rotate("+rotate+")";
   })
   .attr("stroke", "none")
   .attr("cursor","pointer")
   .attr("id",function(d,i){
      var id = 'ID';
      if(type == 'pert') id = 'PID';
      return id+i;
   })
   .attr("opacity",function(){
      if(type == 'pert') return "1";
      return "0.4";
   })
   .attr("fill", function(d){
      for (var i = 0; i < categories.length; i++){
          if (d.type == categories[i]) return getColor('task',i);
      }
    });
       // .attr("transform",function(d){
   //    var mX = timeScale(dateFormat.parse(d.startTime)) + sidePad;
   //    var mY = d3.select(this).attr('y') - d3.select(this).attr('height');
   //    if(d.startTime == d.endTime) return "rotate(45,"+mX+","+mY+")";
   //    else return "rotate(0)";
   // });

}

function drawTaskLabels(rectangles){
  var mX = 0;
  rectangles.append("text")
  .text(function(d){
    if(d.pert > 0 ) return d.task +' '+d.pert+'%';
    else return d.task;
  })
  .attr('type','label')
  .attr("id",function(d,i){
    return i;
  })
  .attr("text-height", function(d,i){
      var taskBox = d3.select("rect[id='ID"+i+"']").node().getBBox();
      return taskBox.height;
  })
  .attr("transform",function(d,i){
    var taskBox = d3.select("rect[id='ID"+i+"']");
    //mX = taskBox.x + taskBox.width * 0.02;
    
    tX = d3.transform(taskBox.attr("transform")).translate[0];
    tY = d3.transform(taskBox.attr("transform")).translate[1];
    tH = parseInt(taskBox.attr("height"),10);
    tW = parseInt(taskBox.attr("width"),10);

    var mX = tX + tW *0.05;
    if(mX + this.getBBox().width > svgWidth){
      //while(mX+this.getBBox().width >= tX){
        console.log(d.task+' mX::'+ mX + " width="+this.getBBox().width + ' taskBox.x'+tX);
        //mX = mX - this.getBBox().width;
        mX -= this.getComputedTextLength();
      //}
    }
    
    if(d.startTime == d.endTime){
      mY = tY + taskHeight;
      mX += tW;
    }
    else mY = tY + tH *0.80;

    return "translate("+mX+","+mY+")";
  })
  .attr("font-size", taskFontSize)
  .attr("font-style",'oblique')
  //.attr("text-height", taskHeight)
  .attr("cursor","pointer")
  .attr("fill", "#333")
  .on('click', function(d){
    if(!ganttData.taskFocus) ganttSettings.taskOnClick(d);
    else return "";
  });

}


function makeGrid(){

  var xAxis = d3.svg.axis()
      .scale(timeScale)
      .orient('bottom')
      .ticks(d3.time.month, xTicks)
      .tickSize(-ganttHeight, 0, 0)
      .tickFormat(d3.time.format('%d %b'));

  var grid = svg.append('g')
      .attr('class', 'grid')
      //.attr('transform', 'translate(' +sidePad + ', ' + (svgHeight - bottomPad - topPad) + ')')
      .attr('transform', 'translate(' +sidePad + ', ' + (ganttHeight) + ')')
      .call(xAxis)
      .selectAll("text")
              .style("text-anchor", "middle")
              .attr("fill", "#999")
              .attr("stroke", "none")
              .attr("font-size", 10)
              //.attr("y", -bottomPad)
              .attr("dy", "1em");

  //var today = moment(); //TODO this needs to be week dependent. 
  var ganttStatusDate = getGantStatusDate();
  //mX = timeScale(dateFormat.parse(moment().format(ganttSettings.momentDateFormat))) + sidePad;
  mX = timeScale(dateFormat.parse(ganttStatusDate.format(ganttSettings.momentDateFormat))) + sidePad;

  svg.append("line")          // attach a line
    .style("stroke", "red")  // colour the line
    .style("stroke-dasharray", ("3, 3"))
    .attr("x1", mX)     // x position of the first end of the line
    .attr("y1", 0)      // y position of the first end of the line
    .attr("x2", mX)     // x position of the second end of the line
    .attr("y2", ganttHeight);

}

function getGantStatusDate(){
  var curWeek = window.ganttData.week.getInteger();
  var maxWeek = window.ganttData.weekList[window.ganttData.weekList.length-1].getInteger();
  var today = moment();
  return today.subtract(maxWeek - curWeek,'week');

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



