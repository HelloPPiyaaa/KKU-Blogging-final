const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin", // Reference to the admin who created the question
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
