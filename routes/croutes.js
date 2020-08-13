var express =  require('express')
var {courseDb} = require ('../models/course')
var {sectionDb} = require('../models/section')
var {studentDb} = require ('../models/student');
var {enrollmentDb} = require ('../models/enrollment')
const { find } = require('../models/enrollment');
var router =  express.Router();

router.get('/', (req, res)=>{
     res.render('index')
 })

 router.get('/adminpage',async (req, res)=>{
    const allCourses =  await courseDb.find().sort({createdAt : 'desc'})
     res.render('admin', {courses : allCourses})
 })

 router.get('/addcoursepage', (req, res)=>{
     res.render('addcourse')
 })

 router.post('/addcourse', async (req, res, next)=>{
     req.newCourse = new courseDb();
     next();
 },saveNewCourse())

 router.delete('/delete/:id', async (req, res)=>{
     let deletedCourse = await courseDb.findByIdAndDelete(req.params.id)
     console.log(deletedCourse)
     res.redirect('/crs/adminpage') 
 })

router.get('/editpage/:id', async (req, res)=>{
    let courseToBeUpdated = await courseDb.findById(req.params.id, (err, result)=>{
        if (err) {
            console.log(err)
        }
    });
    res.render ('edit', {course : courseToBeUpdated })
})

router.post('/addsection/:id', async (req, res)=>{
    let newSection = req.body.section
    let course = await courseDb.findById(req.params.id, (err, result)=>{
        if (err) {
            console.log(err)
        }
    });
    
    sectionAlreadyExist = false;
    course.sections.forEach(section => {
         if (section.name == newSection){
             console.log ('matched')
             sectionAlreadyExist = true   
         }
    });

    if (sectionAlreadyExist){
        res.redirect('/crs/adminpage')
        return;
    }
    
    await course.sections.push({name:req.body.section})
    await course.save()
    res.redirect('/crs/adminpage')
})



 router.put('/edit/:id', async (req, res)=>{
     let updatedCourse = await courseDb.findByIdAndUpdate(req.params.id, 
     {title : req.body.title}, (err, result)=>{
         if (err){
             console.log (err)
         } else {
            console.log(result);
         } 
     })
     res.redirect('/crs/adminpage')
 })


 // returns an async function which add the new course to the database
 function saveNewCourse(){
    return async (req, res) => {
        let newCourse = req.newCourse;
        newCourse.title = req.body.title;
        let newSection = {
            name : req.body.section
        }
        newCourse.sections.push(newSection)
        try {
           newCourse =  await newCourse.save();
           console.log(newCourse);
           res.redirect ('/crs/adminpage')
        } catch (err) {
            console.log (err)
        }
    }
}

router.get ('/studentportal', async (req, res)=>{
    const allCourses = await courseDb.find().sort({createdAt : 'desc'})
    let studentInfo =  req.session.studentInfo
   
    res.render('student', {courses : allCourses,student : studentInfo} )
})

 router.post('/studentportal', async (req, res)=>{
     let studentRollNo = req.body.rollNo;
     console.log(studentRollNo)
     let isValid = await isValidRollNo(studentRollNo)
     if (!isValid) {
         console.log('Invalid Roll No');
         res.redirect('authenticate')
         return;
     } else {
        const studentInfo = await studentDb.findOne({rollNo : studentRollNo })
        req.session.studentInfo = studentInfo
        req.session.save()
        const allCourses = await courseDb.find().sort({createdAt : 'desc'})
        res.render('student', {courses : allCourses, student : studentInfo })
     }
 })


 async function isValidRollNo(studentRollNo){
     let allStudents = await studentDb.find();
     let bool = false;
     allStudents.forEach(student => {
         if (student.rollNo == studentRollNo){
            console.log('I returned true')
             bool = true;
         }
     })
     return bool
 }


 router.get('/authenticate',  (req, res)=>{
     res.render('authenticate')
 })


//list all students
 router.get('/studentlistview', async (req, res)=>{
     const allStudents = await studentDb.find().sort({createdAt : 'desc'})
     res.render('studentlistview', {students : allStudents })
 })

 router.get('/addstudentpage', async (req, res)=>{
     res.render('addstudent')
 })

 router.post('/addstudent',async (req, res, next)=>{
     req.newStudent =  new studentDb();
     next();
 }, saveNewStudent())

 function saveNewStudent(){
     return async (req, res)=>{
        let newStudent =  req.newStudent
        newStudent.rollNo = req.body.rollNo
        newStudent.name = req.body.name
        try {
            newStudent =  await newStudent.save();
            console.log(newStudent);
            res.redirect ('/crs/studentlistview')
         } catch (err) {
             console.log (err)
         }
     }
}

// delete a student
router.delete("/deletestudent/:id", async (req, res)=>{
    let studentToBeDeleted =  await studentDb.findByIdAndDelete(req.params.id)
    console.log(studentToBeDeleted)
    res.redirect('/crs/studentlistview')
})

router.get('/editstudentpage/:id', async (req, res)=>{
    let studentToBeEdited = await studentDb.findById(req.params.id, (err, result)=>{
        if (err) {
            console.log(err)
        }
    });
    console.log(studentToBeEdited)
    res.render ('editstudentpage', {student : studentToBeEdited })
})


//update a student
router.put("/editstudent/:id", async (req, res)=>{
    let studentToBeEdited =  await studentDb.findByIdAndUpdate(req.params.id,
        {rollNo : req.body.rollNo, name : req.body.name}, (err, result)=>{
            if (err){
                console.log (err)
            } else {
               console.log(result);
            } 
        })
    res.redirect('/crs/studentlistview')
})

router.post ('/register/:courseId', async (req, res, next)=>{
    var studentRoll = req.session.studentInfo.rollNo;
    var courseId = req.params.courseId;
    var section = req.body.section
    var flag = req.body.reg

    if (flag == 'register'){
        await saveNewEnrollment(studentRoll, courseId, section)
      

    } else if (flag == 'unRegister'){
        await deleteEnrollment(studentRoll, courseId, section)
       
    }
    res.redirect('showregistered')
})

router.get('/register/showregistered', async (req, res)=>{
    var studentInfo = req.session.studentInfo;
    var rollNo = studentInfo.rollNo;
    enrollments = await enrollmentDb.find({studentRoll : rollNo }).sort({createdAt : 'desc'})
    enrollments.forEach(async enrollment =>{
        var courseInfo = await courseDb.findById(enrollment.courseId)
        enrollment.courseTitle = courseInfo.title
        console.log(courseInfo.title)
    })
    courses =  await enrollmentDb.find({})
    res.render('registeredlist', {
        student : studentInfo,
        enrollments : enrollments
    })
})


async function saveNewEnrollment(studentRoll, courseId, section){
    var newEnrollment = new enrollmentDb();
    newEnrollment.studentRoll = studentRoll
    newEnrollment.courseId = courseId
    newEnrollment.section = section
    try {
        var newEnroll = await newEnrollment.save()
        console.log(newEnroll)
        var all = await enrollmentDb.find();
        console.log ('Displaying Database')
        all.forEach (enroll =>{
            console.log(enroll)
        })
    } catch (e){
        console.log ('Error = ' + e)
    }
}

async function deleteEnrollment(studentRoll, courseId, section){
   await enrollmentDb.findOneAndRemove({studentRoll: studentRoll, courseId : courseId, section: section}, 
        function (err, docs) { 
            if (err){ 
            console.log(err) 
            } 
            else{ 
            console.log("Removed User : ", docs); 
            } 
            }); 
}

router.get('/showregistered', async (req, res)=>{
    var studentInfo = req.session.studentInfo;
    var rollNo = studentInfo.rollNo;
    enrollments = await enrollmentDb.find({studentRoll : rollNo }).sort({createdAt : 'desc'})
    enrollments.forEach(async enrollment =>{
        var courseInfo = await courseDb.findById(enrollment.courseId)
        enrollment.courseTitle = courseInfo.title
        console.log(courseInfo.title)
    })
    courses =  await enrollmentDb.find({})
    res.render('registeredlist', {
        student : studentInfo,
        enrollments : enrollments
    })
})

router.get('/unregister/:courseid/:section', async (req, res)=>{
    var courseId = req.params.courseid
    var section =  req.params.section;
    var studentRoll = req.session.studentInfo.rollNo;
    await deleteEnrollment(studentRoll, courseId, section)
    res.redirect('/crs/showregistered')
    
})

module.exports = router;