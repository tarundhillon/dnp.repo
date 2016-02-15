
var numWord = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen'];

function setupPage(alertify){
	//console.log("Action time:"+arguments.callee.name);
	var localhost = window.location.href.indexOf("127.0.0.1") > -1;
	$('#dnpHeader').load('/pages/header.html');
	$('#dnpFooter').load('/pages/footer.html');
	

	if(alertify) alertify.defaults.notifier.position = 'bottom-right';

	if(localhost && alertify) {
		if(debug) alertify.message("Local host detected");
		console.log("Local host detected");
	}
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function logTime(startTime, text){
	if(debug) console.log(arguments.callee.caller.name +' :: '+
		text+' in '+ moment().diff(startTime,'seconds',true)+' secs');
}

function clone(obj) {
    if (obj !== undefined || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function getRAGColor(rag){
	if(rag === undefined) rag = 'grey';
	rag = rag.toLowerCase();
	switch(rag){
		case 'amber': return 'orange';
	}
	return rag;
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function intPad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}
function jackPopup(){
	$("[data-content]").popup({
		content: $(this).attr('data-content'),
		lastResort: true,
		inverted: true
	});
}

function showLoader(domID){

	if($('#loader').length === 0){
		var html = "<div class='ui red inverted dimmer' id='loader'>";
		html += "<div class='content'><div class='center'>";
		html += "<i class='red big spinner loading icon'></i>";
		html +=  "</div></div></div>";
		$(domID).append(html);
		hideLoader();
	}
	$('#loader').dimmer('show');
}

function hideLoader(){
	$('#loader').dimmer('hide');
}


Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr;
};

function fitTextInBoxes(selector){
	var boxes = $(selector);
	for(i=0;i<boxes.length;i++) fitTextInBox(boxes[i].id);
}

function fitTextInBox(id){
	var selId = "a[id='"+id+"']";
	var boxes = $(selId);
	var boxWidth = boxes.innerWidth();
	if(boxes[0].scrollWidth > boxWidth)	{
		boxText = boxes[i].html().trim();
		boxText = boxText.substring(0,boxText.length-5)+"...";
		$(selId).html(boxText);
		fitTextInBox(id);
	}
}