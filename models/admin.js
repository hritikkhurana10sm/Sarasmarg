const mongoose = require('mongoose');

const adminsSchema = mongoose.Schema({
    username:{
        type: String
    },
    email:{
        type: String
    },
    password:{
        type: String
    }
});

const admins= mongoose.model('admin', adminsSchema);
module.exports = admins;