var express = require ('express');
var mongoose =  require ('mongoose')
var app = express();
var crRouter =  require('./routes/croutes')
var session = require('express-session');
const methodOverride = require('method-override')


// connecting to database
const options = {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true};
mongoose.connect('mongodb://localhost/courseregister',options, (err)=>{
    if (err) console.log (err)
    else console.log ("Connections Successful")
})

app.set('view engine','ejs')
app.use(session({
    secret: "shhh secret", 
    proxy: true,
    resave: true,
    saveUninitialized: true
}));

app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use('/crs', crRouter)

var server = app.listen(5000,()=>{
    console.log ('I am listening at port 5000');
})