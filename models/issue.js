const mongoose = require('mongoose');

const issueSchema = mongoose.Schema({
   

     location : {
        type : String,
        default : "Brahmahnand Chowk, Delhi, Haryana"
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
        type: String,
        default : "One that has very slick, deep, mud or huge gullies or huge rocks to avoid. Most tourists never encounter these kinds of roads because they are usually the back way to somewhere that I have decided to go. Off the main, paved highways are many many gravel roads."
    },
    status:{
        type: String,
        default: "Pending"
    },
    naam : {
        type : String
    },
    email : {
        type : String
    },
    date : {
        type : String
    },
    time : {
        type : String
    },
    problem : {
        type : String,
        default : "Cracks"
    },
    coordinates : {
        type : String,
        default : "41°24'12.2N 2°10'26.5E"
    }
});

const issues= mongoose.model('issues', issueSchema);
module.exports = issues;