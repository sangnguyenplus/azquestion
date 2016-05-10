var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;


// tạo cấu trúc db
var schema = mongoose.Schema({
    userSend: {
        type: ObjectId,
        ref: 'User'
    },
    userRecive: {
        type: ObjectId,
        ref: 'User'
    },
    msg: {
        type: 'String',
        require: true
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
// tạo model cho Chat và export vào app
module.exports = mongoose.model('Chat', schema);
