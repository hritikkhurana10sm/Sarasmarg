var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new Schema({

email : {type : String },

username : {type : String },

password : {type:String },

file : {type : String , default : "file-1655418263289.jpg" }

// complaints array - model

});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('user' , UserSchema);