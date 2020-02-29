const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    mobile : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : false,
        unique : false
    },
    college : {
        type : String
    },
    branch : {
        type : String
    },
    sem : {
        type : Number,
        min : 1,
        max : 8
    },
    shift : {
        type : String
    },
    yoa : {
        type: Number
    },
    rollno : {
        type : String
    },
    name :{
        type : String
    },
    father : {
        type : String
    },
    gender : {
        type : String
    },
    dob : {
        type : Date
    },
    fathermobile : {
        type : String
    },
    house_street_area : {
        type : String
    },
    landmark : {
        type : String
    },
    city : {
        type : String
    },
    state : {
        type : String
    },
    pin : {
        type : String
    },
    createdOn : {
        type : Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User',userSchema);