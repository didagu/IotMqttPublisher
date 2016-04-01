
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , bodyParser = require('body-parser')
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , methodOverride = require('method-override')
  , http = require('http')
  , sockjs = require('sockjs');

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/images/favicon.png'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

if (app.get('env') == 'development') {
	app.locals.pretty = true;
}

app.get('/', routes.index);

// websocket for logging
var sockjs_opts = {sockjs_url: "http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js"};

var sockjs_log = sockjs.createServer(sockjs_opts);
sockjs_log.on('connection', function(conn) {
	global.clientlog = conn;
	console.log("log client connected");
    
    conn.on('close', function() {
    	global.clientlog = null;
    	console.log("log client disconnected");
    });
});

// application context
var mqttsendcmd = require('./sendcmd.js');
var connection = new mqttsendcmd();
app.set('connection', connection);
var router = require('./routes/router.js');
app.use('/sendcmd', router);


// start server
var server = http.createServer(app).listen(app.get('port'), function(){
  sockjs_log.installHandlers(server, {prefix:'/log'});
  console.log("Express server listening on port " + app.get('port'));
});
