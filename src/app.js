const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require('multer');
const moment = require('moment');
let ejs = require('ejs');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
require("./db/conn");
const { Student, Attendance } = require('./models/register');
const { Console, log } = require("console");



let storage = multer.diskStorage({
  destination: path.join(__dirname, '../public/css/images'),
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

let upload = multer({
  storage: storage
}).single('photo');


const port = process.env.PORT || 3000;
const static_path = path.join(__dirname, "../public");
app.use(express.static(static_path));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

console.log(__dirname)



//upload image
// app.post("/img", upload, async (req, res) => {
//   try {
//     console.log(req.file.filename);
//     const id = 'your_user_id'; // Replace with the actual user ID
//     const result = await register.updateOne(
//       { _id: id },
//       {
//         $set: {
//           profilePicture: req.photo.filename
//         }
//       }
//     );
//   } catch (error) {
//     res.status(400).send(error)
//   }

// });


app.post("/img", upload, async (req, res) => {
  try {
    console.log(req.file.filename);
    const studentId =req.body.stuid; 

    // Find the existing student document
    const student = await Student.findById(studentId);

      student.set({ profilePicture: req.file.filename });

      await student.save();

    res.status(200).send("Profile picture updated successfully");
  } catch (error) {
    res.status(400).send(error);
  }
});




//user dashboard

app.post("/mark-attendance", async (req, res) => {
  try {
    var id = req.body.stuid;
    var attendance= req.body.attendance;
    const student = await Student.findOne({ _id: id });
    var formattedDate = moment().format('YYYY-MM-DD');
    const oldatend = await Attendance.findOne({ userid: id }).sort({ date: -1 }).limit(1);

      if (oldatend) {     
        var olddate = moment(oldatend.date).format('YYYY-MM-DD');
      }
      if (olddate && olddate === formattedDate) {
        // res.send("already entered");
        res.status(201).render('userDashBoard', { user: student, message: 'already entered'  });
      } else {
        const newAttendance = new Attendance({
          userid: id,
          date: formattedDate, // Set the date to the desired value
          attendence: attendance // Set the present status to true/false as needed
        });
        const savedAttendance = await newAttendance.save();
        res.status(201).render('userDashBoard', { user: student, message: 'attendance entered' });
    }
  } catch (error) {
    console.error('Error adding attendance to student:', error);
    // Handle the error appropriately
  }
});


//////register page

app.get("/register", (req, res) => {
  res.render("index");
});


app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    console.log(req.body.cpassword);
    console.log(req.body.email);

    if (password === cpassword) {
      const registerstudent = new Student({
        name: req.body.name,
        email: req.body.email,
        password: password,
        cpassword: cpassword
      });
      const registered = await registerstudent.save();
      res.status(201).render("login");
    } else {
      res.send("password mismatch");
    }
  } catch (error) {
    res.status(400).send(error)
  }
});

//login page

app.get("/", (req, res) => {
  res.render("login");
});

app.post("/", async (req, res) => {
  try {
    const email = req.body.email;
    
    const password = req.body.password;

    const student = await Student.findOne({ email: email });

    if (student.password === password) {
      res.status(201).render('userDashBoard', { user: student, message: null });

    } else {
      res.send("Wrong credentials");
    }
  } catch (error) {
    res.status(400).send("Wrong Email")
  }
});






//admin panel

app.get("/admin", (req, res) => {
  res.render("adminlogin");
});


app.post("/admin", async (req, res) => {
  // Get the database
  // const db = client.db(affandb);
  // Find all documents in the collection
  try {
    const pass= req.body.password;
    const id= req.body.Id;
    if (pass==="admin"&&id=="admin") {
      const a = await Student.find({});
      console.log(a);
      console.log(req.body.Id);
      res.render("admindashboard", { data: a });
    }else
    {
      res.send("wrong password");
    }

  } catch (err) {
    console.error(err);
    res.send(err);
    // Handle the error
  }

  // res.render("admindashboard", {
  //   collection: {collection}
  // })
});




//editing attendences
// Add this code after the line `app.use(express.json());`
// Define a route to view attendance for a single student
app.get("/attendance/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    // Fetch the student from the database based on the provided studentId
    const student = await Student.findById(studentId);
    const attendance = await Attendance.find({ userid: studentId });
    console.log(attendance);


    if (!student) {
      return res.status(404).send("Student not found");
    }

    // Render the attendance view and pass the student data
    res.render("attendences", { student, attendance });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});



//leave requests
app.post("/leaves", async (req, res) => {
  try {

    const leaveRequest = await Attendance.find({attendence:"pending"}).populate({
      path: 'userid',
      model: 'Student',
      select: 'email'
    });
    console.log(leaveRequest);

    // Render the attendance view and pass the student data
    res.render("leaves", { data:leaveRequest });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// GET /attendance/:email?start=timestamp1&end=timestamp2
// app.get('/attendance/:email', async (req, res) => {
//   const { email } = req.params;
//   const { start, end } = req.query;

//   try {
//     const student = await Student.findOne({ email });

//     if (!student) {
//       return res.status(404).json({ error: 'Student not found' });
//     }

//     const attendance = await Attendance.find({
//       userid: student._id,
//       date: {
//         $gte: new Date(start),
//         $lte: new Date(end)
//       }
//     });

//     res.json(attendance);
//   } catch (error) {
//     console.error('Error retrieving attendance:', error);
//     res.status(500).json({ error: 'An error occurred while retrieving attendance' });
//   }
// });




//for all students data
app.post("/allStudents", async (req, res) => {
  try {
    const { studentId } = req.params;

    const a = await Student.find({});

    res.render("allStudents", { data: a });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

//from to dates system report
app.post("/systemReport", async (req, res) => {
  try {
    const startDate = req.body.startdate;
    const endDate = req.body.enddate;
    console.log(startDate);
    // const a = await Attendance.find({
    //   date: { $gte: startDate, $lte: endDate }
    // });
    const a = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate({
      path: 'userid',
      model: 'Student',
      select: 'email'
    });
    res.render("allStudentReport", { data: a });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/systemReportForm", (req, res) => {
  res.render("systemReportForm");
});


//for post requeest
app.post("/process_leave", async (req, res) => {
  try {
    const leave_id = req.body.leave_id;
    const leave_status = req.body.action;
    const data = req.body.data;
    if(leave_status==="Accept")
    {
      await Attendance.updateOne({ _id: leave_id }, { $set: { attendence: 'leave' } });
    }else{
      await Attendance.updateOne({ _id: leave_id }, { $set: { attendence: 'absent' } });
    }
    const successMessage = "Leave request processed successfully";
    const leaveRequest = await Attendance.find({attendence:"pending"}).populate({
      path: 'userid',
      model: 'Student',
      select: 'email'
    });

    res.render("leaves", { data:leaveRequest });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

//for grading system
app.post("/grading-system", async (req, res) => {
  try {
    res.render("gradingSys");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

function calculateGrade(attendanceDays) {
  if (attendanceDays >= 26) {
    return 'A';
  } else if (attendanceDays >= 20) {
    return 'B';
  } else if (attendanceDays >= 15) {
    return 'C';
  } else if (attendanceDays >= 10) {
    return 'D';
  } else {
    return 'F';
  }
}

app.post("/grades", async (req, res) => {
  try {
      const email = req.body.email;
      const student = await Student.findOne({ email: email });
      
    if (!student) {
      // Handle the case when the student doesn't exist
      return res.status(404).send("Student not found");
    }
    const presents = await Attendance.countDocuments({
      $and: [{ attendence: 'present' }, { userid: student._id }]
      });
      const absents = await Attendance.countDocuments({
      $and: [{ attendence: 'absent' }, { userid: student._id }]
      });
      const leaves = await Attendance.countDocuments({
      $and: [{ attendence: 'leave' }, { userid: student._id }]
      });
    console.log(presents);
    const grade=  calculateGrade(presents);
    res.render('grades', { student, presents, absents, leaves,grade });
  } catch (error) {
    res.status(500).send("Internal Server Error");    
  }
});

//edit attendance
app.post("/attendance-edit", async (req, res) => {
  try {
    res.render("editAttendance",{message: null});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post('/editAtt', async (req, res) => {
  try {
    const email = req.body.email;
    const date = req.body.date;
    const value= req.body.menu;
    const student = await Student.findOne({ email: email });
    let message;
  if (!student) {
    // Handle the case when the student doesn't exist
    return res.status(404).send("Student not found");
  }
    
  if (value==='delete') {
    const result = await Attendance.deleteOne({ date: date, userid: student._id });
    message = 'Document deleted';
  } else {
    const options = { upsert: true }; // Create a new document if no match is found
    const result = await Attendance.updateOne(
      { date: date, userid: student._id },
      { $set: { attendence: value } },
      options
    );
    console.log(result.upsertedCount);
     if (result.upsertedCount > 0) {
    message = 'New document created';
  } else if (result.modifiedCount> 0) {
    message = 'Document updated';
  } else {
    message = 'Document already has the specified attendance value';
  }
}

  res.render("editAttendance",{ message: message });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error updating document' });
  }
});

//user attendence report
app.post("/userReport", async (req, res) => {
  try {
    const email = req.body.email;
    const startDate = req.body.startdate;
    const endDate = req.body.enddate;
    const student = await Student.findOne({ email: email });

    if (!student) {
      // If student is not found, send an appropriate response
      return res.status(404).json({ message: 'Student not found' });
    }
    const a = await Attendance.find({
      $and:[ {date: { $gte: startDate, $lte: endDate }},{userid: student._id}]
    });
    res.render("singleStudentReport", { data: a , student:student});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/attendance-report", async (req, res) => {
  try {
    res.render("userReportForm");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});



app.listen(port, () => {
  console.log(`server is running at port number ${port}`)
});

// student.attendance.push(savedAttendance);
// const updatedStudent = await student.save();
// res.send("attendence added");

// console.log('Attendance added to student:', updatedStudent);
// // Handle any further operations or responses
// } else {

// const newLeaveRequest = new leave({
//   date: formattedDate, // Set the date to the desired value
//   approved: false // Set the approved status to true/false as needed
// });

// const savedLeaveRequest = await newLeaveRequest.save();

// student.leaveRequests.push(savedLeaveRequest);
// const updatedStudent = await student.save();
// res.send("leave request added");
// console.log('Leave request added to student:', updatedStudent);
// // Handle any further operations or responses
// }


 // } catch (error) {
  //   res.send("already entered");
  //   console.error('Error adding attendance to student:', error);
  //   // Handle the error appropriately
  // }



      //   const newAttendance = new Attendance({
      //   userid: id,
      //   date: formattedDate, // Set the date to the desired value
      //   present: true // Set the present status to true/false as needed
      // });
      // const savedAttendance = await newAttendance.save();


