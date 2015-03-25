var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash 	 = require('connect-flash');

var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookieSession =   require('cookie-session');
var session      = require('express-session');
var methodOverride = require('method-override');
var path =            require('path');

var busboy = require('connect-busboy');
var async = require('async');
var crypto = require('crypto');
var csrf =  require('csurf');




// view engine setup
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'html');



//Kết nối cơ sở dữ liệu
var db = require('./config/database');
mongoose.connect(db.url);

require('./config/passport')(passport); // pass passport for configuration

app.use(morgan('dev'));
app.use(cookieParser()); // Đọc cookies
app.use(bodyParser.json());
app.use(bodyParser.json({type:'application/vnd.api+json'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/public'));
app.use(busboy());
app.enable('trust proxy');

// required for passport
app.use(session({ secret: 'sangplus' })); // session secret

var env = process.env.NODE_ENV || 'development';
if ('development' === env || 'production' === env) {
    app.use(csrf());
    app.use(function(req, res, next) {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        next();
    });
}


app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session



var middleware = require('./app/middleware');
var routes =require('./app/routes');
// Định tuyến ======================================================================
middleware(app, passport);
routes(app, passport);


//Chạy server
server.listen(port);
console.log('Server is running on '+ port);
exports = module.exports=app;

// Chatroom

// usernames which are currently connected to the chat
var usernames = {};

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (data) {
    // we store the username in the socket session for this client
    socket.username = data.displayName;
    socket.avatar = data.avatar;
    // add the client's username to the global list
    usernames[socket.username] = socket.id;
    addedUser = true;
    socket.emit('login', {
      usernames: usernames
    });
    console.log(usernames);
  });

   // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    //usernames[socket.username].emit('new message', {
    socket.broadcast.emit('new message', {
      username: socket.username,
      avatar: socket.avatar,
      message: data.message
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username,
      avatar: socket.avatar
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username,
      avatar: socket.avatar
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        avatar: socket.avatar,
        usernames: usernames
      });
    }
  });
  socket.on('new answer', function(data){
    socket.broadcast.emit('new answer', data);
  });
});
