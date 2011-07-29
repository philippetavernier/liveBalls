/**
 * Module dependencies.
 */

var express = require('express');
var io = require('socket.io');
var jade = require('jade');

var app = module.exports = express.createServer();
var io = io.listen(app);

// Configuration

app.configure(function() {
  app.register('.html', jade); //use HTML files directly
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
  res.render('index.html');
});


// List of connected players's hash
var tab_pl = [];
var i = 0;

// socket.io
io.sockets.on('connection', function (socket) {
  socket.on('client_connected', function (data) {
    data.id = socket.id;
    tab_pl[i] = data;
    socket.player = tab_pl[i];
    i++;
    console.log(tab_pl);
    socket.emit('get_all_balls', tab_pl);
    socket.emit('id_ball', socket.id);
    socket.broadcast.emit('new_ball', data);
  });
  socket.on('move_ball', function (data) {
	// maj the tab_pl
	var j = 0;
	while (j < tab_pl.length)
	{
	  if (tab_pl[j].id == data.id)
		tab_pl[j] = data;
	  j++;
	}
	socket.broadcast.emit('move_the_ball', data);
  });
  socket.on('tchat', function(msg) {
    socket.broadcast.emit('get_msg', socket.player, msg);
    socket.emit('get_msg', socket.player, msg);
  });
  socket.on('disconnect', function () {
    var j = 0;
    var n = 0;
    var tmp = [];

    while (n < tab_pl.length) {
        if (tab_pl[j].id == socket.id)
			n++;
		if (n < tab_pl.length) {
	  	    tmp[j] = tab_pl[n];
	  	    j++;
	  		n++;
	  	 }
	}
	tab_pl = tmp;
	i = j;
	socket.broadcast.emit('get_all_balls', tab_pl);
  });
});

// HEROKU
//var port = process.env.PORT || 3000;
//app.listen(port);

app.listen(8080);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

