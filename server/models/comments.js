const mongoose = require("mongoose");
require("../models/user");

const commentSchema = mongoose.Schema(
  {
    blog_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
    blog_author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
    comment: {
      type: String,
      required: true,
    },
    children: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "comments",
    },
    commented_by: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
    isReply: {
      type: Boolean,
      default: false,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments",
    },
  },
  {
    timestamps: {
      createdAt: "commentedAt",
    },
  }
);

module.exports = mongoose.model("comments", commentSchema);
