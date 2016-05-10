var express = require('express');

module.exports = function(app) {

    // expose session to views
    app.use(function(req, res, next) {
        res.locals.session = req.session;
        next();
    })
}
