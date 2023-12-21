///import student model from the db
const Student = require("../../models/student");

///for getting the student login
const student_login = (req, res) => {  
  res.render("student/login", { error: null });
};

///for verify and redirecting to view result
const student_login_post = async (req, res) => {
  //handle the rollNo and dob found  
  const findStudentRollNo = req.body.rollNo;
  const findStudentDob = req.body.dob;
  try {
    const foundStudent = await Student.findOne({ rollNo: findStudentRollNo });
    //no student with that Id
    if (!foundStudent) {
      res.render("student/login", {
        error: "Login with correct roll number",
      });
    } else if (
      foundStudent.dob.toISOString().split("T")[0] === findStudentDob
    ) {
      // Set session variable to indicate student is logged in
      // Student Login Success
      req.session.userType = "student";
      res.render("student/view", { foundStudent }); //correct data found
    } else {
      res.render("student/login", {
        error: "Login with correct DOB", //invalid DOB
      });
    }
  } catch (error) {
    // Handle the error here and render the error message
    res.render("student/login", {
      error: "An error occurred. Please try again later.",
    });
  }
};

///student logout
const student_logout = (req, res) => {
  req.session.userType=null;
  res.redirect("/");
};

module.exports = { student_login, student_login_post, student_logout };
