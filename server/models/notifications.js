const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["like", "comment", "reply","follow","delete"],
      required: true,
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
    notification_for: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments",
    },
    reply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments",
    },
    replied_on_comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments",
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notifications", notificationSchema);
