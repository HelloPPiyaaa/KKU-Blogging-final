const express = require("express");
const Question = require("../models/Question");
const BadWordScanner = require("../utils/badword");
const router = express.Router();

// Get all questions
router.get("/", async (req, res) => {
  try {
    const questions = await Question.find().populate(
      "createdBy",
      "firstname lastname"
    );
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new question
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
  const { topic, answer, createdBy } = req.body;

  try {
    const newQuestion = new Question({ topic, answer, createdBy });
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error creating question" });
  }
});

// Update a question
router.put("/:id", async (req, res) => {
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
  const { topic, answer } = req.body;

  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { topic, answer },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json(updatedQuestion);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error updating question" });
  }
});

// Delete a question
router.delete("/:id", async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);

    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
