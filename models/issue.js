const mongoose = require('mongoose');

const issueSchema = mongoose.Schema({
   

     location : {
        type : String,
        default : ""
    }
    ,
    files:{
        type: String,
        default: ""
    },
    result:{
        type: String
    },
    description:{
        type: String
    },
    status:{
        type: String,
        default: 'pending'
    }
});

const issues= mongoose.model('issues', issueSchema);
module.exports = issues;