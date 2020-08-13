var mongoose = require('mongoose')
var enrollment = new mongoose.Schema({
    studentRoll : {
        type : String,
        required : true
    },
    courseId : {
        type : String,
        required : true
    },
    section : {
        type : String,
        required : true
    },
    createdAt : {
        type: Date,
        default: Date.now
    } 
}) 

 
module.exports = {
    enrollmentDb : mongoose.model('enrollment', enrollment),
    enrollmentSchema : enrollment
}
