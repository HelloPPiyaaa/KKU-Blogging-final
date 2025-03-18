const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const BadWordScanner = require("../utils/badword");

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

const formDatatoSend = (user) => {
  const access_token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  return {
    access_token,
    _id: user._id,
    profile_picture: user.profile_picture,
    username: user.username,
    fullname: user.fullname,
  };
};
module.exports = formDatatoSend;

const generateUsername = async (email) => {
  const { nanoid } = await import("nanoid");
  let username = email.split("@")[0];

  const isUsernameNotUnique = await User.exists({ username }).then(
    (result) => result
  );

  if (isUsernameNotUnique) {
    username += nanoid().substring(0, 5);
  }

  return username;
};

router.post("/", async (req, res) => {
  try {
    await BadWordScanner(req.body);
  } catch (err) {
    badword = err.toString().split(" ");
    badword = badword[badword.length - 1];
    return res.status(403).json({
      error: `ข้อความของคุณมีคำไม่เหมาะสม กรุณาตรวจสอบและแก้ไข : “${badword}”`,
      details: `$ข้อความของคุณมีคำไม่เหมาะสม กรุณาตรวจสอบและแก้ไข : “${badword}”`,
    });
  }
  const { fullname, email, password } = req.body;

  if (fullname.length < 3) {
    return res
      .status(403)
      .json({ error: "ชื่อต้องมีความยาวอย่างน้อย 3 ตัว อักษร" });
  }

  if (!email.length) {
    return res.status(403).json({ error: "ใส่ Email" });
  }
  if (!emailRegex.test(email)) {
    return res.status(403).json({ error: "Email ไม่ถูกต้อง" });
  }
  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        "รหัสผ่านควรมีความยาว 6-20 ตัวอักษร พร้อมตัวเลข ตัวพิมพ์เล็ก 1 ตัว ตัวพิมพ์ใหญ่ 1 ตัว",
    });
  }

  // แฮชรหัสผ่าน
  bcrypt.hash(password, 10, async (err, hashed_password) => {
    if (err) {
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในการแฮชรหัสผ่าน" });
    }

    const username = await generateUsername(email);

    // ตรวจสอบชื่อผู้ใช้
    if (username.length < 3) {
      return res
        .status(400)
        .json({ error: "ชื่อผู้ใช้ต้องมีความยาว 3 ตัวอักษรขึ้นไป" });
    }

    const user = new User({
      fullname,
      email,
      password: hashed_password,
      username,
    });

    user
      .save()
      .then((u) => {
        return res.status(200).json(formDatatoSend(u));
      })
      .catch((err) => {
        if (err.code === 11000) {
          return res.status(500).json({ error: "มีอีเมลอยู่แล้ว" });
        }
        return res.status(500).json({ error: err.message });
      });
  });
});

module.exports = router;
