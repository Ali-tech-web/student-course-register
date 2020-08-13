var mongoose = require ('mongoose')
const {sectionSchema} = require ('../models/section')

var course = new mongoose.Schema ({
    title : {
        type : String,
        required : true,
        unique : true
    },
    sections : [sectionSchema],
    createdAt : {
        type: Date,
        default: Date.now
    } 
})

course.pre('validate', (next)=>{
    console.log ("I am about to validate course")
    next();
})

module.exports = {
    courseDb : mongoose.model('course', course),
    courseSchema : course
}
