const express = require("express");
const User = require("../models/user");
const Admin = require("../models/admin"); // นำเข้าโมเดล Admin
const router = express.Router();
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  const { email, newPassword } = req.body;

  // ตรวจสอบว่าอีเมลและรหัสผ่านใหม่ถูกต้องหรือไม่
  if (!email) {
    return res.status(400).send({ message: "Email is required" });
  }

  if (!newPassword) {
    return res.status(400).send({ message: "New Password is required" });
  }

  try {
    // ค้นหาผู้ใช้ในฐานข้อมูลตามอีเมลในโมเดล User
    let user = await User.findOne({ email });
    
    // หากไม่พบผู้ใช้ในโมเดล User ให้ค้นหาในโมเดล Admin
    if (!user) {
      user = await Admin.findOne({ email });
    }

    // หากยังไม่พบผู้ใช้ให้ส่งข้อความตอบกลับ
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // เข้ารหัสรหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10); // ใช้รอบการเข้ารหัส 10 ครั้ง

    // อัปเดตรหัสผ่านในฐานข้อมูล
    user.password = hashedPassword;
    await user.save(); // บันทึกการเปลี่ยนแปลง

    // ส่งการตอบกลับสำเร็จ
    res.status(200).send({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error); // บันทึกข้อผิดพลาด
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error: error.message, // ส่งข้อความข้อผิดพลาด
    });
  }
});

module.exports = router;
