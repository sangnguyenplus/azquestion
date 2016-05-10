
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var randtoken = require('rand-token');

// load model User
var User = require('../app/models/user');

// Khởi tạo biến xác thực
var configAuth = require('./auth');

module.exports = function(passport) {

// sử dụng tạo session
passport.serializeUser(function(user, done) {
    return done(null, user.id);
});

// sử dụng để hủy session
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        return done(err, user);
    });
});

// =========================================================================
// ĐĂNG NHẬP HỆ THỐNG ======================================================
// =========================================================================
passport.use('login', new LocalStrategy({
    // mặc định passport sử dụng username để đăng nhập. Ở đây dùng email để thay thế
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // cho phép sử dụng route gọi đến để kiểm tra đăng nhập hay chưa
}, function(req, email, password, done) {

    // bất đồng bộ
    process.nextTick(function() {
        User.findOne({
            'email': email
        }, function(err, user) {
            // nếu có lỗi thì trả về lỗi.
            if (err) {
                return done(err);
            }

            if (!user || !user.validPassword(password)) {
                return done(null, false);
            }
            // thực hiện thành công thì trả về thông tin user
            else {
                return done(null, user);
            }
        });
    });
}));

// =========================================================================
// ĐĂNG KÝ THÀNH VIÊN ======================================================
// =========================================================================

passport.use('signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {

    process.nextTick(function() {

        // kiểm tra xem email đã được sử dụng hay chưa
        User.findOne({
            'email': email
        }, function(err, existingUser) {

            if (err) {
                return done(err);
            }

            // nếu tồn tại user với email này
            if (existingUser) {
                return done(null, false);
            }
            //  Ngược lại thì tạo mới user
            else {

                var newUser = new User();
                newUser.displayName = req.body.displayName;
                newUser.email = email;
                newUser.password = newUser.generateHash(password);
                newUser.avatar = 'images/default.png';
                newUser.role = 'user';
                newUser.activeToken = randtoken.generate(60);

                newUser.save(function(err) {
                    if (err) {
                        throw err;
                    }
                    return done(null, newUser);
                });
            }
        });
    });
}));

// =========================================================================
// ĐĂNG NHẬP BẰNG FACEBOOK =================================================
// =========================================================================

passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    passReqToCallback: true,
    profileFields: ['id', 'displayName', 'photos', 'emails']

}, function(req, token, refreshToken, profile, done) {

    process.nextTick(function() {
        User.findOne({
            'email': profile.emails[0].value
        }, function(err, user) {
            if (err) {
                return done(err);
            }

            if (user) {
                return done(null, user);
            } else {
                // if there is no user, create them
                var newUser = new User();
                newUser.displayName = profile.displayName;
                newUser.email = profile.emails[0].value;
                newUser.avatar = profile.photos[0].value;
                newUser.role = 'user';
                newUser.status = 1;
                newUser.save(function(err) {
                    if (err) {
                        throw err;
                    }
                    return done(null, newUser);
                });
            }
        });
    });

}));

// =========================================================================
// ĐĂNG NHẬP BẰNG TÀI KHOẢN GOOGLE =========================================
// =========================================================================

passport.use(new GoogleStrategy({
    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL,
    passReqToCallback: true
}, function(req, token, refreshToken, profile, done) {
    process.nextTick(function() {
        User.findOne({
            'email': profile.emails[0].value
        }, function(err, user) {
            if (err) {
                return done(err);
            }

            if (user) {
                return done(null, user);
            } else {
                var newUser = new User();
                newUser.displayName = profile.displayName;
                newUser.email = profile.emails[0].value;
                newUser.avatar = 'images/default.png';
                newUser.role = 'user';
                newUser.status = 1;
                newUser.save(function(err) {
                    if (err) {
                        throw err;
                    }
                    return done(null, newUser);
                });
            }
        });
    });
}));
};
