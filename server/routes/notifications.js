const express = require("express");
const router = express.Router();
const Notification = require("../models/notifaications");
const Notifications = require("../models/notifications");
const Report = require("../models/report");
const Post = require("../models/blog");
const Comment = require("../models/comment");
const Like = require("../models/like");
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

router.get("/:id", async (req, res) => {
  const { id: userId } = req.params; // Extract userId from req.params

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const userNotifications = await Notification.find({
      notification_for: userId,
    })
      .populate("user")
      .populate("blog")
      .populate("notification_for")
      .populate("reason")
      .exec();

    if (!userNotifications.length) {
      return res
        .status(404)
        .json({ message: "No notifications found for this user" });
    }

    res.json(userNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res
      .status(500)
      .json({ message: "Error fetching notifications: " + error.message });
  }
});

// Create a new notification
router.post("/", async (req, res) => {
  const { user, type, message, entity, entityModel } = req.body;

  if (!user || !type || !message || !entity || !entityModel) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const notification = new Notification({
      user,
      type,
      message,
      entity,
      entityModel,
    });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating notification: " + error.message });
  }
});

// Update notification to mark as read
router.patch("/:id/mark-as-read", async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { seen: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating notification: " + error.message });
  }
});

// Delete a notification
router.post("/delete", async (req, res) => {
  const { user, entity, type, entityModel } = req.body;

  if (!user || !entity || !type || !entityModel) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await Notification.deleteOne({
      user,
      entity,
      type,
      entityModel,
    });
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting notification: " + error.message });
  }
});

// Check if a similar notification already exists
router.post("/check", async (req, res) => {
  const { user, type, entity, entityModel } = req.body;

  if (!user || !type || !entity || !entityModel) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingNotification = await Notification.findOne({
      user,
      type,
      entity,
      entityModel,
    });

    if (existingNotification) {
      return res.status(200).json({
        exists: true,
        notification: existingNotification,
      });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error during notification check:", error.message);
    res.status(500).json({
      message: "Error checking notification: " + error.message,
    });
  }
});

router.post("/notifications", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { page, filter, deletedDoccount } = req.body;
  let maxLimit = 10;
  let findQuery = { notification_for: user_id, user: { $ne: user_id } };
  let skipDocs = (page - 1) * maxLimit;
  if (filter !== "all") {
    findQuery.type = filter;
  }
  if (deletedDoccount) {
    skipDocs -= deletedDoccount;
  }

  Notifications.find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate("blog", "topic blog_id")
    .populate("user", "fullname username profile_picture")
    .populate("comment", "comment")
    .populate("replied_on_comment", "comment")
    .populate("reply", "comment")
    .sort({ createdAt: -1 })
    .select("createdAt type seen reply reason")
    .then((notifications) => {
      
      Notifications.updateMany(findQuery, {seen: true})
      .skip(skipDocs)
      .limit(maxLimit)
      .then(() => console.log("ดูการแจ้งเตือนแล้ว"))

      // console.log(notifications)
      return res.status(200).json({ notifications });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

router.post("/all-notification-count", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { filter } = req.body;
  let findQuery = { notification_for: user_id, user: { $ne: user_id } };

  if (filter !== "all") {
    findQuery.type = filter;
  }
  Notifications.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

module.exports = router;
