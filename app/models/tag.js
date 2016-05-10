var mongoose = require('mongoose');

// tạo cấu trúc db
var schema = mongoose.Schema({
    tagName: {
        type: 'String',
        required: true
    },
    description: {
        type: 'String',
        required: true
    },
    count: {
        type: 'Number',
        default: 0
    },
    creationDate: {
        type: 'Date',
        default: Date.now
    },
    lastEditDate: {
        type: 'Date',
        default: Date.now
    }

});
schema.statics.getQuestionByTag = function(id, callback) {
return this.model('QuestionTag').find({
    tagId: id
}, callback);
}
// tạo model cho Tag và export vào app
module.exports = mongoose.model('Tag', schema);
