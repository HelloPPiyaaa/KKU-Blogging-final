const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    members: Array,
    deletedBy: {
      type: Map,
      of: Boolean,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const chatModel = mongoose.model("Chat", chatSchema);

module.exports = chatModel;
