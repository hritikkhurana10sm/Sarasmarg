const mongoose = require('mongoose');

const cctvSchema = mongoose.Schema({
   

     location : {
        type : String,
        default : "Brahmahnand Chowk, Delhi, Haryana"
    }
    ,
    files:{
        type: String,
        default: ""
    },
   
    status:{
        type: String,
        default: "Pending"
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
        default : "12.95281,77.57852"
    }
});

const cctv= mongoose.model('cctv', cctvSchema);
module.exports = cctv;