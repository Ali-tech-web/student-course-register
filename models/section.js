
var mongoose = require ('mongoose')
var section =  new mongoose.Schema({
    name : {
        type: String,
        required : true
    },

    maxLimit : {
        type : Number,
        default : 50
    }
})

section.pre('validate', (next)=>{
    console.log ("I am about to validate section")
    next();
})

module.exports = {
    sectionDb : mongoose.model ('section', section),
    sectionSchema : section
}