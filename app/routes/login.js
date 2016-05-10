var User = require('../models/user');
var nodemailer = require('nodemailer');

var configMail = require('../../config/mail');

module.exports = function(app, passport) {
    //Quản lý thành viên
    app.get('/loggedin', function(req, res) {
        res.send(req.isAuthenticated() ? req.user : '0');
    });

    // xử lý trang đăng nhập
    app.post('/login', passport.authenticate('login'), function(req, res) {
        res.send(req.user);
    });

    // xử lý trang đăng ký
    app.post('/signup', passport.authenticate('signup'), function(req, res) {
        /*Gửi thư thông báo tạo tài khoản thành công*/
        // Thiết lập nội dung thư
        var domain = req.headers.host || 'azquestion.com';
        var mailOptions = {
            from: 'Mạng xã hội hỏi đáp <' + configMail.gmail.user + '>', // Địa chỉ người gửi
            to: req.user.email, //Danh sách người nhận, ngăn cách nhau bằng dấu phẩy
            subject: 'Email kích hoạt tài khoản', // Tiêu đề thư
            html: '<strong>Chúc mừng ' + req.user.displayName + ' đã đăng ký thành công tài khoản tại AZQuestion. </strong><br><p>Thông tin đăng ký</p><ul><li>Email: ' + req.user.email + '</li><li>Tên hiển thị: ' + req.user.displayName + '</li><li>Mật khẩu: ******</li></ul><br /><p>Vui lòng kích hoạt tài khoản bằng cách nhấn &nbsp;<a href="http://' + domain + '/users/active/' + req.user._id + '/' + req.user.activeToken + '"target="_blank">vào đây</a>' // Nội dung dạng html
        };

        // Tạo đối tượng transporter dùng SMTP transport
        var transporter = nodemailer.createTransport({
            service: configMail.gmail.service,
            auth: {
                user: configMail.gmail.user,
                pass: configMail.gmail.pass
            }
        });
        // gửi mail với đối tượng transporter đã được khai báo
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent: ' + info.response);
            }
        });
        return res.send(req.user);
    });

    // Đăng xuất
    app.get('/logout', function(req, res) {
        req.logout();
        req.session.destroy();
        res.send(200);
    });

    //Xử lý đăng nhập facebook -------------------------------

    // gửi thông tin đến facebook để yêu cầu xác thực
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: 'email'
    }));

    // xử lý callback sau khi facebook đã xác thực user
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));


    // Xử lý đăng nhập qua tài khoản google ---------------------------------

    // gửi thông tin đến facebook để yêu cầu xác thực
    app.get('/auth/google', passport.authenticate('google', {
        scope: ['profile', 'email']
    }));

    // xử lý callback sau khi goog đã xác thực user
    app.get('/auth/google/callback', passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));
}
