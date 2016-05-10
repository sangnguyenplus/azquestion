var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

// tạo cấu trúc db
var schema = mongoose.Schema({
    userRecive: {
        type: ObjectId,
        ref: 'User'
    },
    userSend: {
        type: ObjectId,
        ref: 'User'
    },
    content: {
        type: 'String',
        require: true
    },
    questionId: {
        type: ObjectId,
        ref: 'Question'
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
// tạo model cho Notification và export vào app
module.exports = mongoose.model('Notifi', schema);
