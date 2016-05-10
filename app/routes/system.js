
var System = require('../models/system');

module.exports = function(app, passport) {
    app.get('/api/system', function(req, res) {
        System.findOne({}, function(err, system) {
            if (err) {
                return res.send(err);
            }
            return res.json(system);
        });
    });

    app.post('/api/system/about/edit', function(req, res) {
        System.findById(req.body._id, function(err, s) {
            if (err) {
                return res.send(err);
            }
            s.about = req.body.about;
            s.help = req.body.help;
            s.policy = req.body.policy;
            s.lastEditDate = new Date();
            s.save(function(err, system) {
                if (err) {
                    return res.send(err);
                }
                return res.json(system);
            });
        });
    });
}
