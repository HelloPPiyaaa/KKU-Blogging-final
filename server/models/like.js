const mongoose = require("mongoose");

require("../models/user");
require("./blog");

const LikeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  });

const Like = mongoose.model("Like", LikeSchema);

module.exports = Like;
