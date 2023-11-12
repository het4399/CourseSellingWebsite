const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const adminiAuthenication=(req,res,next) => {
    const {username,password} = req.headers
    const admin=ADMINS.find(a=>a.username=== username && a.password===password)
    if(admin) {
        next()
    }
    else{
        res.status(403).json({message:'Admin authentication failed'});
    }
}
const userAuthenication=(req,res,next) => {
    const {username,password} = req.headers
    const user=ADMINS.find(a=>a.username=== username && a.password===password)
    if(user) {
      req.user=user;
        next()
    }
    else{
        res.status(403).json({message:'User authentication failed'});
    }
}

// Admin routes
app.post('/admin/signup', (req, res) => {
  const admin=req.body; 
  const existingAdmin=ADMINS.find(a=>a.username===admin.username);
  if(existingAdmin){
    res.status(403).json({message:'admin already exists'})
  }
  else{
    ADMINS.push(admin)
    res.json({message:'Admin created successfully'})
  }
});

app.post('/admin/login',adminiAuthenication,(req, res) => {
  res.json({message:'Login successful'})
});

app.post('/admin/courses', (req, res) => {
  const course=req.body
  course.id=Date.now()
  COURSES.push(course)
  res.json({message:'Course Created successfully',courseId: course.id})
});
 
app.put('/admin/courses/:courseId', adminiAuthenication,(req, res) => {
  const courseId=parseInt(req.params.courseId);
  const course=COURSES.find(c=>c.id ===courseId);
  if(course){
    Object.assign(course.req.body);
    res.json({message: 'Course updated successfully'}) 
  }
  else{
    res.status(404).json({message: 'COurse Not Found'});
  }
});

app.get('/admin/courses', adminiAuthenication,(req, res) => {
  res.json({course:COURSES})
  // logic to get all courses
});
// User routes
app.post('/users/signup', (req, res) => {
  // const user={...req.body,purchasedCourses:[]};
  const user={
    username:req.body.username,
    password:req.body.password,
    purchasedCourses:[]
  }
  USERS.push(user)
  res.json({message: 'User created successfully'});
});

app.post('/users/login',userAuthenication, (req, res) => {
  res.json({message: 'Logged in successfully'});
  // logic to log in user
});

app.get('/users/courses', (req, res) => {
  res.json({course:COURSES.filter(c => c.published)})
  // logic to list all courses
});

app.post('/users/courses/:courseId', userAuthenication,(req, res) => {
  const courseId=parseInt(req.params.courseId);
  const course=COURSES.find(c => c.id === courseId && COURSES.published);
  if(course) {
    req.user.purchasedCourses.push(courseId);
    res.json({message: 'Course Purchase successfully'})
  }
  else{
    res.status(404).json({message: 'Course not found or not available'})
  }
  // logic to purchase a course
});

app.get('/users/purchasedCourses', (req, res) => {
  const purchasedCourses=COURSES.filter(c => req.user.purchasedCourses.includes(c.id));
  res.json({purchasedCourses})
  // logic to view purchased courses

});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});