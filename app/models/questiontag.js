var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

// tạo cấu trúc db
var schema = mongoose.Schema({
    questionId: {
        type: ObjectId,
        ref: 'Question'
    },
    tagId: {
        type: ObjectId,
        ref: 'Tag'
    }

});

// tạo model cho QuestionTag và export vào app
module.exports = mongoose.model('QuestionTag', schema);
