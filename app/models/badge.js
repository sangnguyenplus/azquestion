var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var schema = mongoose.Schema({
    name: {
        type: 'String',
        required: true
    },
    score: {
        type: 'Number',
        default: 0
    },
    description: {
        type: 'String',
        default: null
    },
    color: {
        type: 'String',
        default: '#1d9977'
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
    console.log('A new badge "%s" was inserted', this._id);
    next();
});

module.exports = mongoose.model('Badge', schema);
