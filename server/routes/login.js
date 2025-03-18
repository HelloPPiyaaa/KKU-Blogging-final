const express = require("express");
const User = require("../models/user");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { id } = require("date-fns/locale");
const Admin = require("../models/admin");

const formDatatoSend = (user) => {
  const access_token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {expiresIn:"7d"});
  return {
    access_token,
    _id: user._id,
    profile_picture: user.profile_picture,
    username: user.username,
    fullname: user.fullname,
  };
};

const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (admin && admin.is_admin) {
      req.user = admin;
      next();
    } else {
      res.status(403).json({ message: "Access denied" });
    }
  } catch (error) {
    console.error("Error in isAdmin middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

router.post("/", (req, res) => {
  let { email, password } = req.body;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(403).json({ error: "ไม่พบผู้ใช้" });
      }
      if (!user.google_auth) {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            return res
              .status(403)
              .json({ error: "เกิดข้อผิดพลาดขณะเข้าสู่ระบบ โปรดลองอีกครั้ง" });
          }

          if (!result) {
            return res.status(403).json({ error: "รหัสผ่านไม่ถูกต้อง" });
          } else {
            return res.status(200).json(formDatatoSend(user));
          }
        });
      } else {
        return res.status(403).json({
          error:
            "บัญชีถูกสร้างด้วยบัญชี Google แล้ว โปรดเข้าสู่ระบบด้วย Google",
        });
      }
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

router.get("/auth",isAdmin,async (req,res)=>{
  res.send("ok");
});

module.exports = router;
