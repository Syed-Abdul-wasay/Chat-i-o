var mongoose = require('mongoose');
var schema = mongoose.Schema;

var userschema = new schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    confirm_password: {
        type: String,
        required: true,
    }
})
module.exports = mongoose.model('user', userschema);
