var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var schema = mongoose.Schema({
    about: {
        type: 'String',
        default: null
    },
    policy: {
        type: 'String',
        default: null
    },
    help: {
        type: 'String',
        default: null
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
    console.log('System setting "%s" was updated', this._id);
    next();
});

module.exports = mongoose.model('System', schema);
