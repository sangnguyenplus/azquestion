var question = require('./question');
var user = require('./user');
var answer = require('./answer');
var login = require('./login');
var tag = require('./tag');
var badge = require('./badge');
var system = require('./system');
var chat = require('./chat');
var notifi = require('./notifi');
var report = require('./report');

var mongoose = require('mongoose');

module.exports = function(app, passport) {

    // Quản lý câu hỏi
    question(app);
    //Quản lý thành viên
    user(app);
    //Quản lý các câu trả lời
    answer(app);
    //Quản lý việc đăng ký, đăng nhập, đăng xuất của thành viên.
    login(app, passport);
    //Quản lý tag
    tag(app);
    //Quản lý danh hiệu
    badge(app);
    //Quản lý các thông tin cấu hình trên hệ thống
    system(app);
    chat(app);
    notifi(app);
    report(app);


    //Tất cả request phải đi qua trang index.html để xử lý.
    app.get('*', function(req, res) {
        res.sendfile('public/index.html');
    });
};
