
var Notifi = require('../models/notifi');

module.exports = function (app, passport) {
    app.post('/api/notifi/create', function(req, res) {
            Notifi.create({
                userSend : req.user._id,
                userRecive: req.body.userRecive,
                content : req.body.content,
                questionId:req.body.questionId,
                creationDate: new Date(),
            }, function(err, msgs) {
                if (err)
                    res.send(err);
                    res.json(msgs);
            });
    });
    app.get('/api/notifi/detail/:userRecive', function(req, res){
        var id=req.params.userRecive;
        Notifi.find({userRecive:id}).populate('userRecive').populate('userSend').exec(function(err, list){
            res.json(list);
        });
    });
    app.get('/api/notifi/count/:userRecive', function(req, res) {
        var id=req.params.userRecive;
        Notifi.find( { $and: [ { status: false},{userRecive:id} ] } ).count(function(err, sfc){
            if (err)
                res.send(err)
            res.json(sfc);
        });
     });
    app.get('/api/notifi/update',function(req,res)
    {
        Notifi.update({userRecive:req.user._id }, { $set: { status: true }},{multi:true}).exec(function(err,not)
            {
                if(err)
                    res.send(err);
                res.json(not);
            });
    });
}
