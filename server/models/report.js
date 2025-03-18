const mongoose = require("mongoose");

require("../models/user");
require("./blog");

const reportSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "Pending",
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
