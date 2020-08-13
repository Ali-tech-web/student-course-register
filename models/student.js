var mongoose = require ('mongoose')
const {courseSchema} = require('../models/course')

var student = new mongoose.Schema ({
    rollNo : {
        type : String,
        required : true,
        unique : true
    },
    name : {
        type : String,
        required : true
    },
    createdAt : {
        type: Date,
        default: Date.now
    } 
})

student.pre ('validate', (next)=>{
    console.log("I am about to validate student")
    next();
})


module.exports ={
    studentDb : mongoose.model ('student', student),
    studentSchema :  student
    
}

