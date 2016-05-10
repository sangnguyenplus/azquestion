var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

// tạo cấu trúc db
var schema = mongoose.Schema({
    title: {
        type: 'String',
        required: true,
        index: true
    },
    content: {
        type: 'String',
        required: true
    },
    userId: {
        type: ObjectId,
        ref: 'User'
    },
    viewCount: {
        type: 'Number',
        default: 0
    },
    score: {
        type: 'Number',
        default: 0
    },
    activeToken: {
        type: 'String',
        default: null
    },
    isResolved: {
        type: 'Boolean',
        default: false
    },
    status: {
        type: 'Boolean',
        default: false
    },
    creationDate: {
        type: 'Date',
        required: true
    },
    lastEditDate: {
        type: 'Date',
        default: Date.now
    },
    closedDate: {
        type: 'Date',
        required: false
    } //Chỉ tồn tại nếu bài đăng được đóng.

});

schema.statics.findAnswers = function(id, callback) {
return this.model('Answer').find({
    questionId: id
}, callback);
}
schema.statics.findTags = function(id, callback) {
return this.model('QuestionTag').find({
    questionId: id
}, callback);
}

schema.pre('save', function(next) {
    next();
});

// tạo model cho Question và export vào app
module.exports = mongoose.model('Question', schema);
