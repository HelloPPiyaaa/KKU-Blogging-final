const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Report = require("../models/report");
const Post = require("../models/blog");
const Comment = require("../models/comment");
const Like = require("../models/like");
const Notification = require("../models/notifaications");
const jwt = require("jsonwebtoken");
const { NotiMailer } = require("../mail/noti_sender");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
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

router.get("/", async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate("reportedBy")
      .populate({
        path: "post",
        populate: {
          path: "author",
          model: "User",
        },
      });

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/by/:id", async (req, res) => {
  try {
    const reports = await Report.find({ 
      reportedBy: req.params.id, 
      status: { $ne: "Cancel" }
    })
      .populate("reportedBy")
      .populate({
        path: "post",
        populate: {
          path: "author",
          model: "User",
        },
      });

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// Add a new report
router.post("/add", async (req, res) => {
  const { postId, reason, reportedBy } = req.body;

  if (!postId || !reason) {
    return res
      .status(400)
      .json({ message: "Post ID and reason for the report are required." });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const reportData = {
      post: postId,
      reason,
      verified: false,
      reportedBy: reportedBy || null,
    };

    const report = new Report(reportData);
    await report.save();

    res.status(201).json({
      message: "Report submitted successfully.",
      report,
    });
    return "Success";
  } catch (error) {
    console.error("Failed to report post:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Verify a report
router.patch("/:id/verify",verifyJWT, async (req, res) => {
  const { verified } = req.body;
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.verified = true;
    report.status = verified ? "Approved" : "Declined";

    await report.save();

    res.status(200).json({ message: "Report updated", report });
  } catch (error) {
    console.error("Error updating report:", error);
    res
      .status(500)
      .json({ message: "Error updating report: " + error.message });
  }
});

// Cancel a report
router.patch("/:id/cancel",verifyJWT, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.verified = true;
    report.status = "Cancel";

    await report.save();

    res.status(200).json({ message: "Report updated", report });
  } catch (error) {
    console.error("Error updating report:", error);
    res
      .status(500)
      .json({ message: "Error updating report: " + error.message });
  }
});

// Delete post associated with a report and verify the report
router.delete("/:reportId/deletePost",verifyJWT, async (req, res) => {
  const { postId } = req.body;
  let user_id = req.user;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required to delete." });
  }

  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    await Comment.deleteMany({ post: post._id });
    await Like.deleteMany({ post: post._id });

    await Post.deleteOne({ _id: post._id });

    Report.updateMany(
      { post: post._id, status: "Pending" },
      { $set: { status: "Declined", verified: true } }
    ).then(()=>{
      console.log("update all report success");
    })
    
    report.verified = true;
    report.status = "Declined";
    await report.save();

    const notification = new Notification({
      user: user_id,
      notification_for: post.author.toString(),
      type: "delete",
      entity: post.author.toString(),
      entityModel: "User",
      reason: report.reason
    });
    await notification.save();

    NotiMailer(notification.notification_for,'System',notification.type,post.topic,notification.reason);

    res.status(200).json({
      message: "Post deleted successfully and report marked as declined.",
    });
  } catch (error) {
    console.error("Error deleting post and updating report:", error);
    res
      .status(500)
      .json({ message: "Error processing request: " + error.message });
  }
});

module.exports = router;
