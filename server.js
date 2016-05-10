var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var session = require('express-session');
var methodOverride = require('method-override');
var path = require('path');

var busboy = require('connect-busboy');
var async = require('async');
var crypto = require('crypto');
var csrf = require('csurf');

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
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/public'));
app.use(busboy());
app.enable('trust proxy');

// required for passport
app.use(session({
    secret: 'sangplus'
})); // session secret

var env = process.env.NODE_ENV || 'development';

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

var middleware = require('./app/middleware');
var routes = require('./app/routes');

// Định tuyến ======================================================================
middleware(app, passport);
routes(app, passport);

//Chạy server
server.listen(port);
console.log('Server is running on ' + port);
exports = module.exports = app;

// Chatroom

// usernames which are currently connected to the chat
var users = {};

io.on('connection', function(socket) {
    var addedUser = false;

    socket.broadcast.emit('new connection');

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function(data) {
        if (!(data in users)) {
            addedUser = true;
            socket.nickname = data.username;
            socket._id = data._id;
            socket.avatar = data.avatar;
            users[socket.nickname] = socket;
            updateNicknames();
        }
    });

    function updateNicknames() {
        io.sockets.emit('usernames', Object.keys(users));
    }

    socket.on('reconnect', function() {
        io.sockets.emit('new connection');
    });

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function(data) {
        // we tell the client to execute 'new message'
        if (data.username in users) {
            users[data.username].emit('new message', {
                _id: socket._id,
                username: socket.nickname,
                avatar: socket.avatar,
                message: data.message
            });
        }
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function(data) {
        if (data.username in users) {
            users[data.username].emit('typing', {
                _id: socket._id,
                username: socket.nickname,
                avatar: socket.avatar
            });
        }
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function(data) {
        if (data.username in users) {
            users[data.username].emit('stop typing', {
                _id: socket._id,
                username: socket.nickname,
                avatar: socket.avatar
            });
        }
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function() {
        // remove the username from global usernames list
        if (addedUser) {
            if (!socket.nickname) {
                return;
            }
            delete users[socket.nickname];
            updateNicknames();

            // echo globally that this client has left
            socket.broadcast.emit('logout', Object.keys(users));
            console.log(Object.keys(users));
        }
    });

    // Xử lý socket notifications
    // Voteup
    socket.on('voteup', function(data) {
        socket.broadcast.emit('voteup', data);
    });

    //Duyệt bài
    socket.on('approve', function(data) {
        socket.broadcast.emit('approve', data);
    });

    // Favourite
    socket.on('Favorite', function(data) {
        socket.broadcast.emit('Favorite', data);
    });

    // deleteQuestion
    socket.on('deleteQuestion', function(data) {
        socket.broadcast.emit('deleteQuestion', data);
    });

    // createAnswer
    socket.on('createAnswer', function(data) {
        socket.broadcast.emit('createAnswer', data);
    });

    socket.on('new question', function() {
        io.sockets.emit('new question');
    });

    // reportQuestion
    socket.on('reportQuestion', function(data) {
        socket.broadcast.emit('reportQuestion', data);
    });

    // Total answer
    socket.on('total answer', function() {
        io.sockets.emit('total answer');
    });

    // Total tag
    socket.on('total tag', function() {
        io.sockets.emit('total tag');
    });

    // New answer
    socket.on('new answer', function() {
        io.sockets.emit('new answer');
    });
});
