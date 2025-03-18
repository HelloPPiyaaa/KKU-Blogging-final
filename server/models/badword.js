// server/models/badWord.js
const mongoose = require("mongoose");

const BadWordSchema = new mongoose.Schema(
  {
    words: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const BadWordGroup = mongoose.model("BadWordGroup", BadWordSchema);

module.exports = BadWordGroup;
