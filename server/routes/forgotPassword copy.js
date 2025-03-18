const express = require("express");
const User = require("../models/user");
const Admin = require("../models/admin"); // เพิ่มการเรียกใช้ Admin model
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const router = express.Router();

router.post("/", async (req, res) => {
  const { email } = req.body;

  // ตรวจสอบว่าอีเมลมีอยู่ใน User model หรือ Admin model
  let foundUser = await User.findOne({ email: email });
  let userType = "user";

  if (!foundUser) {
    foundUser = await Admin.findOne({ email: email });
    userType = "admin"; // เปลี่ยน userType เป็น admin หากพบใน Admin model
  }

  if (!foundUser) {
    return res.send({ Status: "User/Admin not existed" });
  }

  // สร้าง token สำหรับรีเซ็ตรหัสผ่าน
  const token = jwt.sign({ id: foundUser._id, type: userType }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  // ตั้งค่า nodemailer สำหรับส่งอีเมล
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "piyarat4543@gmail.com",
      pass: "wpsj ujix smjd cniw", // ต้องเปลี่ยนข้อมูลนี้เป็นของจริงสำหรับการใช้งาน
    },
  });

  var mailOptions = {
    from: "piyarat4543@gmail.com",
    to: foundUser.email,
    subject: "Reset Password Request",
    text: `${process.env.FRONTEND_ENDPOINT}/reset_password/${userType}/${foundUser._id}/${token}`, // เพิ่ม userType ใน URL
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return res.send({ Status: "Error sending email" });
    } else {
      console.log("Email sent: " + info.response);
      return res.send({ Status: "Success" });
    }
  });
});

module.exports = router;
