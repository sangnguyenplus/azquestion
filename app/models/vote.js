var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

// tạo cấu trúc db
var schema = mongoose.Schema({
    questionId: {
        type: ObjectId,
        ref: 'Question'
    },
    userId: {
        type: ObjectId,
        ref: 'User'
    },
    answerId: {
        type: ObjectId,
        ref: 'Answer'
    },
    type: {
        type: 'Boolean',
        required: true
    },
    creationDate: {
        type: 'Date',
        default: Date.now
    }
});
// tạo model cho Favorite và export vào app
module.exports = mongoose.model('Vote', schema);
