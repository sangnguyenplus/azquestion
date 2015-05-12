var Answer = require('../models/answer');
var User = require('../models/user');
var Question = require('../models/question');
var Report = require('../models/report');



module.exports = function (app, passport) {
	app.get('/api/report/getAll', function(req, res){
		Report.find({}).populate('userId').populate('questionId').populate('answerId').exec(function(err, list){
			if(err)
				res.send(err);
			res.json(list);
		});
	});
	app.delete('/api/report/delete/:id', function(req, res){
		Report.remove(req.params.id, function(err, report){
			if(err)
				res.send(err);
			res.json({deleted: "true"});
		});
	});
}