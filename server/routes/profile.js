const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Post = require("../models/blog");
const Notification = require("../models/notifaications");
const Like = require("../models/like");
const Comment = require("../models/comment");
const Report = require("../models/report");
const bcrypt = require("bcrypt");
const BadWordScanner = require("../utils/badword");
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");

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

// Route URL to get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}).lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user data" });
  }
});

router.get("/within24hour", async (req, res) => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const users = await User.find({
      joinedAt: { $gte: twentyFourHoursAgo },
    }).lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user data" });
  }
});

// Route URL to get user data by ID
router.get("/:id", async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user data" });
  }
});

router.post("/edit-profile/update/:id", async (req, res) => {
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
  const userId = req.params.id;
  const userData = req.body;

  if (req.file) {
    userData.profile_picture = req.file.path;
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, userData, {
      new: true,
    });
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).send("Internal server error");
  }
});

router.put("/edit-profile/update-info/:id", async (req, res) => {
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
  const userId = req.params.id;
  const { fullname, email } = req.body;

  try {
    // Check if the new email already exists for another user
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ error: "Email is already in use." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullname, email },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).send("Internal server error");
  }
});

// Add this route in your existing user routes file
router.post("/edit-profile/notifications/:id", async (req, res) => {
  const userId = req.params.id;
  const { show_notifications } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { show_notifications },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating notification setting:", error);
    res.status(500).send("Internal server error");
  }
});

// Route URL to delete user profile by ID
router.delete("/edit-profile/delete/:id", async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    const admin = await Admin.findById(req.body.adminId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(
      req.body.adminPassword,
      admin.password
    );

    if (isMatch) {
      await Post.deleteMany({ author: req.params.id });
      await Notification.deleteMany({ user: req.params.id });
      await Like.deleteMany({ user: req.params.id });
      await Comment.deleteMany({ blog_author: req.params.id });
      await Report.deleteMany({
        $or: [{ post: req.params.id }, { reportedBy: req.params.id }],
      });
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "User deleted successfully" });
    } else {
      throw new Error("Password is Incorrect");
    }
  } catch (err) {
    console.error("Error deleting user and related data: ", err);
    res.status(500).json({ error: "Error deleting user and related data" });
  }
});

router.delete("/user/delete/:id", async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (isMatch) {
      await Post.deleteMany({ author: req.params.id });
      await Notification.deleteMany({ user: req.params.id });
      await Like.deleteMany({ user: req.params.id });
      await Comment.deleteMany({ blog_author: req.params.id });
      await Report.deleteMany({
        $or: [{ post: req.params.id }, { reportedBy: req.params.id }],
      });
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "User deleted successfully" });
    } else {
      throw new Error("Password is Incorrect");
    }
  } catch (err) {
    console.error("Error deleting user and related data: ", err);
    res.status(500).json({ error: "Error deleting user and related data" });
  }
});

router.post("/changepassword/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res
        .status(400)
        .json({ error: "New password cannot be the same as the old password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ error: "Error updating password" });
  }
});

// Use post instead get because the line 58 is conflict
router.post("/notification-status", verifyJWT, async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      notification_enable: user.notification_enable,
      notification_email_enable: user.notification_email_enable,
    });
  } catch (error) {
    console.error("Error fetching notification status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Toggle notification
router.patch("/notification-enable", verifyJWT, async (req, res) => {
  try {
    const userId = req.user;
    console.log(userId);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newValue = !user.notification_enable;
    console.log(user.notification_enable, newValue);
    user.notification_enable = newValue;
    await user.save();

    res.json({ status: "success", notification_enable: newValue });
  } catch (error) {
    console.error("Error updating notification_enable:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Toggle email notification
router.patch("/notification-email-enable", verifyJWT, async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newValue = !user.notification_email_enable;
    user.notification_email_enable = newValue;
    await user.save();

    res.json({ success: true, notification_email_enable: newValue });
  } catch (error) {
    console.error("Error updating notification_email_enable:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
