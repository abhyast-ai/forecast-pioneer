///importing student model from db
const Student = require("../../models/student");

//get the teacher login page
const teacher_login = (req, res) => {
  res.render("teacher/login", { error: null });
};

///get the add record web page
const student_register = (req, res) => {
  res.render("teacher/add");
};

///get the edit web page with the original data
const edit_student = async (req, res) => {
  const student = await Student.findById(req.params.id);
  // Render the template with the updated student object
  res.render("teacher/edit", { student });
};

///delete the selected record in the db
const delete_student = async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.redirect("/allresults");
};

///get the all results page with the data from db
const teacher_allresults = async (req, res) => {
  const Students = await Student.find().sort({ rollNo: 1 }); //1-> Asc and -1 -> Desc order
  res.render("teacher/allresults", { Students });
};

///for teacher logout
const teacher_logout = (req, res) => {
  req.session.userType = null;
  res.redirect("/");
};

///post the login credentials for authentication
const teacher_login_post = (req, res) => {
  const { teacherId, password } = req.body;
  if ((teacherId && teacherId == 11) && (password && password == "Google") ) {    
      //correct teacher
      // Set session variable to indicate teacher is logged in
      // Teacher Login Success
      req.session.userType = "teacher";
      res.redirect("/allresults");
    }
   else res.render("teacher/login", { error: "invalid login" }); //invalid credentials
};

//add the new record to the db
const student_register_post = async (req, res) => {
    const singleStudent = new Student({
    name: req.body.name,
    rollNo: parseInt(req.body.rollNo),
    dob: req.body.dob,
    score: parseInt(req.body.score),
  });
  try {
    await Student.create(singleStudent);
    res.redirect("/allresults");
  } catch (err) {
    console.log(err);
    res.send("error");
  }
};

///edit and post the modified data into the db
const edit_student_post = async (req, res) => {
  await Student.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/allresults");
};

module.exports = {
  teacher_login,
  teacher_login_post,
  teacher_allresults,
  student_register,
  student_register_post,
  edit_student,
  edit_student_post,
  delete_student,
  teacher_logout,
};
