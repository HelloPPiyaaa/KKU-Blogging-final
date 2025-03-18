const express = require("express")
const ResetPasswordToken = require("../models/resetPasswordToken")
const router = express.Router()

router.get("/check/:token", async (req, res) => {
  const { token } = req.params
  if (!token) {
    return res.status(400).json({ success: false, message: "Invalid token" })
  }

  const existingToken = await ResetPasswordToken.findOne({ token })

  if (!existingToken) {
    return res.status(400).json({ success: false, message: "Invalid token" })
  }

  if (existingToken.expires < Date.now()) {
    return res.status(400).json({ success: false, message: "Token expired" })
  }

  res.status(200).json({ success: true, message: "Token valid" })
})

module.exports = router