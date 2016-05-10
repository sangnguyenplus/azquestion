var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

// tạo cấu trúc db
var schema = mongoose.Schema({
    userReported: {
        type: ObjectId,
        ref: 'User'
    },
    userId: {
        type: ObjectId,
        ref: 'User'
    },
    questionId: {
        type: ObjectId,
        ref: 'Question'
    },
    answerId: {
        type: ObjectId,
        ref: 'Answer'
    },
    type: {
        type: 'String',
        required: true
    },
    content: {
        type: 'String',
        default: null
    },
    status: {
        type: 'Boolean',
        default: false
    },
    creationDate: {
        type: 'Date',
        default: Date.now
    }
});
// tạo model cho Report và export vào app
module.exports = mongoose.model('Report', schema);
