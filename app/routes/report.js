var Answer = require('../models/answer');
var User = require('../models/user');
var Question = require('../models/question');
var Report = require('../models/report');



module.exports = function (app, passport) {
	app.get('/api/report/getAll', function(req, res){
		Report.find({}).populate('userReported').populate('questionId').populate('answerId').exec(function(err, list){
			if(err)
				res.send(err);
			res.json(list);
		});
	});
}