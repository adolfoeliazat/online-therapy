var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);
var redis = require('redis');
var socketioRedis = require('socket.io-redis');
//var adapter = socketioRedis();

var client = redis.createClient({ host: 'chat-redis.h4wjgc.0001.use1.cache.amazonaws.com', port: 6379 });
var adapter = socketioRedis({ host: 'chat-redis.h4wjgc.0001.use1.cache.amazonaws.com', port: 6379 });
//io.adapter(socketioRedis({ host: 'chat-redis.h4wjgc.0001.use1.cache.amazonaws.com', port: 6379 }));
io.adapter(adapter);

adapter.subClient.on("subscribe", function (channel, count) {
  console.log("Subscribe: "+ channel + " "+ count);
});
adapter.subClient.on("message", function (channel, message) {
  console.log("Message:" + channel + ": " + message);
});


//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io code goes here
var nsp = io.of('/private-talk');

nsp.on('connection', function(socket){
  var addedUser = false;
  var id = socket.client.conn.id;
  //console.log(id);
  //socket.join('1907');
  //Send Existing usernames to user
  client.SMEMBERS("username", function(err, reply){
    if (err) return;
    socket.emit('online users', {
      usernames: reply
    });
  });

  socket.on('new message', function(data){
    nsp.emit('new message', {
      username: socket.username,
      message: data.message
    });
  });

  socket.on('add user', function(data){
    if (addedUser) return;
    // store username in socket session
    client.SADD("username", data.username, function(err, reply){
      console.log("Username added to Redis: "+reply);
    });
    socket.username = data.username;
    addedUser = true;
    socket.broadcast.emit('user joined', {
      username: socket.username,
      message: socket.username + ' joined to room!',
      id: id
    });
  });

  socket.on('typing', function(){
    socket.broadcast.emit('typing', {
      username: socket.username
    })
  });

  socket.on('stop typing', function(){
    socket.broadcast.emit('stop typing', {
      username: socket.username
    })
  });

  socket.on('disconnect', function(){
    if (addedUser) {
      client.SREM("username", socket.username, function(err, reply){
        console.log("Username removed from Redis: "+reply);
      });
      socket.broadcast.emit('user left', {
        username: socket.username,
        message: socket.username + ' left the room!'
      });
    }
  });
});


app.use(function(req, res, next){
  res.io = io;
  next();
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send('Sorry, we cannot find that!');
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send('Sorry, we cannot find that!');
});


module.exports = {app: app, server: server};
