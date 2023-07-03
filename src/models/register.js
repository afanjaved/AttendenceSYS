const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  cpassword:{
    type: String,
    required: true  
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  profilePicture: {
    type: String,
    default: "images.png"
  }
});

const Student = mongoose.model('Student', studentSchema);





//attendence schema

const attendanceSchema = new mongoose.Schema({
  userid: {
    type: String
  }, 
  date: {
    type: Date,
    required: true
  },
  attendence: {
    type: String,
    enum: ['absent', 'present', 'leave', 'pending'],
    default: 'absent'
  }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = { Student, Attendance };





