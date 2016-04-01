var sockjs_url = '/log';
var sockjs = new SockJS(sockjs_url);

sockjs.onopen = function() { 
	console.log("log is open");
};

sockjs.onclose = function() { 
	console.log("log is closed");
};

sockjs.onmessage = function(e) {
	$("#logoutput").val($("#logoutput").val() + '\r' + e.data);
};

$(document).ready(function() {
	console.log("huhu hallo");
	$("#logoutput").val("logging area");
	
	$("#connect").click(function(){
		$.post('/sendcmd/connect', function(response) {
			console.log("connected");
	    }, 'json');
	}); 
	
	$("#submit").click(function(){
		console.log("sending");
		$.post('/sendcmd', $("#formCmd").serialize(), function(response) {
			console.log("cmd sent");
	    }, 'json');
	}); 
});
