console.log('Loading dnp.index');
var dnpMain = requirejs(['pages/dnp.main'],function(dnp){
	console.log('dnp.main Loaded in dnp.index');
});


var dm = requirejs(['dnpMain'],function(dnp){
	console.log('dnpMain Loaded in dnp.index');
});