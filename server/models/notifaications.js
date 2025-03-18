const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["like", "comment", "reply", "follow", "delete"],
      required: true,
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    notification_for: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    like: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Like",
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
    entity: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "entityModel",
      required: true,
    },
    entityModel: {
      type: String,
      enum: ["User"],
      required: true,
    },
    reason: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
