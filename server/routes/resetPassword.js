const express = require("express");
const bcrypt = require("bcrypt");
const ResetPasswordToken = require("../models/resetPasswordToken");
const User = require("../models/user");
const Admin = require("../models/admin");
const router = express.Router();

router.post("/", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, message: "Invalid data" });
  }

  const existingToken = await ResetPasswordToken.findOne({ token })

  if (!existingToken) {
    return res.status(400).json({ success: false, message: "Invalid token" })
  }

  if (existingToken.expires < Date.now()) {
    return res.status(400).json({ success: false, message: "Token expired" })
  }

  let role = "user"
  let user = await User.findOne({ email: existingToken.email })

  if (!user) {
    user = await Admin.findOne({ email: existingToken.email })
    role = "admin"

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid user" })
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10) // ใช้รอบการเข้ารหัส 10 ครั้ง

  user.password = hashedPassword
  await user.save()

  await ResetPasswordToken.deleteOne({ token })

  res.status(200).json({ success: true, message: "Password reset successfully", role })
});

module.exports = router