// server/models/view.js
const mongoose = require("mongoose");

const ViewSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    count: {
      type: Number,
      default: 1,
    },
    last_viewed: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

ViewSchema.index({ user: 1, blog: 1 }, { unique: true });

const View = mongoose.model("View", ViewSchema);

module.exports = View;
