const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const BadWordScanner = require("../utils/badword");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token === null) {
    return res.status(401).json({ error: "ไม่มี token การเข้าถึง" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "การเข้าถึง token ไม่ถูกต้อง" });
    }

    req.user = user.id;
    next();
  });
};
router.get("/search", async (req, res) => {
  const query = req.query.query;
  if (!query || typeof query !== "string") {
    return res
      .status(400)
      .json({ message: "Query parameter is missing or not a string" });
  }

  try {
    const users = await User.find({
      $or: [
        { firstname: new RegExp(query, "i") },
        { lastname: new RegExp(query, "i") },
        { username: new RegExp(query, "i") },
      ],
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

router.get("/find/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/get-profile", (req, res) => {
  let { id } = req.body;

  User.findOne({ _id: id })
    .select("-password -google_auth -updatedAt -blogs")
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: err.message });
    });
});
router.post("/update-profile-img", verifyJWT, (req, res) => {
  let { url } = req.body;
  console.log("Updating user:", req.user, "with URL:", url);
  User.findOneAndUpdate({ _id: req.user }, { profile_picture: url })
    .then(() => {
      return res.status(200).json({ profile_picture: url });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

router.post("/update-profile", verifyJWT, async (req, res) => {
  let { username, bio, social_links } = req.body;

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

  let bioLimit = 150;
  if (username.length < 3) {
    return res
      .status(403)
      .json({ error: "ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร" });
  }
  if (bio.length > bioLimit) {
    return res
      .status(403)
      .json({ error: `ไบโอต้องไม่เกิน ${bioLimit} ตัวอักษร` });
  }

  let socialLinksArr = Object.keys(social_links);
  try {
    for (let i = 0; i < socialLinksArr.length; i++) {
      if (social_links[socialLinksArr[i]].length) {
        // let hostname = new URL.apply(social_links[socialLinksArr[i]]).hostname;

        let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

        if (
          !hostname.includes(`${socialLinksArr[i]}.com`) &&
          socialLinksArr[i !== "website"]
        ) {
          return res
            .status(403)
            .json({ error: `${socialLinksArr[i]} ลิงก์ไม่ถูกต้อง` });
        }
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "คุณต้องให้ลิงก์โซเชียลแบบเต็มด้วย http(s)" });
  }

  let updateObj = {
    username,
    bio,
    social_links,
  };

  User.findOneAndUpdate({ _id: req.user }, updateObj, {
    runValidators: true,
  })
    .then(() => {
      return res.status(200).json({ username });
    })
    .catch((err) => {
      if (err.code === 11000) {
        return res.status(409).json({ error: "ชื่อผู้ใช้ถูกใช้ไปแล้ว" });
      }
      return res.status(500).json({ error: err.message });
    });
});

module.exports = router;
