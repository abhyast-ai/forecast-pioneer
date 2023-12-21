///importing the express and its router for creating routes
var express = require("express");
const router = express.Router();
//importing the student controller file to use it in this route
const studentController = require('../Controllers/StudentController');
const authMiddleware = require('../Middleware/authMiddleware');


///GET REQUEST
router.get('/studentLogin',studentController.student_login);
router.get('/studentLogout',authMiddleware,studentController.student_logout);

///POST REQUEST
router.post('/studentLogin',studentController.student_login_post);

module.exports = router;