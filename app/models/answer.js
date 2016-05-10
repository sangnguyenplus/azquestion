var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var schema = mongoose.Schema({
    questionId: {
        type: ObjectId,
        ref: 'Question',
        index: true
    },
    userId: {
        type: ObjectId,
        ref: 'User',
        index: true
    },
    content: {
        type: 'String',
        required: true
    },
    score: {
        type: 'Number',
        default: 0
    },
    isAcepted: {
        type: 'Boolean',
        default: false
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

schema.pre('save', function(next) {
    console.log('A new answer "%s" was inserted', this._id);
    next();
});

module.exports = mongoose.model('Answer', schema);
