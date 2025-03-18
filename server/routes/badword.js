const express = require("express");
const router = express.Router();
const BadWordGroup = require("../models/badword");
const jwt = require("jsonwebtoken");
const { loadBadWordsFromDB } = require("../utils/badword");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
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

router.get("/",verifyJWT,async (req, res) => {
  try {
    const badWords = await BadWordGroup.find();
    res.status(200).json(badWords);
  } catch (err) {
    console.error("❌ Error fetching bad words:", err);
    res.status(500).json({ error: "Error fetching bad words" });
  }
});

router.get("/:id",verifyJWT,async (req, res) => {
  try {
    const badWordGroup = await BadWordGroup.findById(req.params.id);
    if (!badWordGroup) {
      return res.status(404).json({ error: "Bad word group not found" });
    }
    res.status(200).json(badWordGroup);
  } catch (err) {
    console.error("❌ Error fetching bad word group:", err);
    res.status(500).json({ error: "Error fetching bad word group" });
  }
});

router.post("/", verifyJWT, async (req, res) => {
  try {
    const { words } = req.body;
    const newGroup = new BadWordGroup({ words });
    await newGroup.save();
    await loadBadWordsFromDB();
    res.status(201).json(newGroup);
  } catch (err) {
    console.error("❌ Error adding bad word group:", err);
    res.status(500).json({ error: "Error adding bad word group" });
  }
});

router.put("/:id", verifyJWT, async (req, res) => {
  try {
    const { words } = req.body;
    const updatedGroup = await BadWordGroup.findByIdAndUpdate(
      req.params.id,
      { words },
      { new: true }
    );

    if (!updatedGroup) {
      return res.status(404).json({ error: "Bad word group not found" });
    }

    await loadBadWordsFromDB();
    res.status(200).json(updatedGroup);
  } catch (err) {
    console.error("❌ Error updating bad word group:", err);
    res.status(500).json({ error: "Error updating bad word group" });
  }
});

router.patch("/:id/add", verifyJWT, async (req, res) => {
  try {
    const { words } = req.body;
    const updatedGroup = await BadWordGroup.findByIdAndUpdate(
      req.params.id,
      { $push: { words: { $each: words } } },
      { new: true }
    );

    if (!updatedGroup) {
      return res.status(404).json({ error: "Bad word group not found" });
    }

    await loadBadWordsFromDB();
    res.status(200).json(updatedGroup);
  } catch (err) {
    console.error("❌ Error adding words:", err);
    res.status(500).json({ error: "Error adding words" });
  }
});

router.patch("/:id/remove", verifyJWT, async (req, res) => {
  try {
    const { word } = req.body;
    const updatedGroup = await BadWordGroup.findByIdAndUpdate(
      req.params.id,
      { $pull: { words: word } },
      { new: true }
    );

    if (!updatedGroup) {
      return res.status(404).json({ error: "Bad word group not found" });
    }

    await loadBadWordsFromDB();
    res.status(200).json(updatedGroup);
  } catch (err) {
    console.error("❌ Error removing word:", err);
    res.status(500).json({ error: "Error removing word" });
  }
});

router.delete("/:id", verifyJWT, async (req, res) => {
  try {
    const deletedGroup = await BadWordGroup.findByIdAndDelete(req.params.id);
    if (!deletedGroup) {
      return res.status(404).json({ error: "Bad word group not found" });
    }

    await loadBadWordsFromDB();
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting bad word group:", err);
    res.status(500).json({ error: "Error deleting bad word group" });
  }
});

module.exports = router;