var mongoose = require('mongoose');
var schema = mongoose.Schema;

var adminschema = new schema({
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    }, 
    password:{
        type:String,
        required:true,
    }
})

module.exports = mongoose.model('admin',adminschema);
