const mongoose = require("mongoose");
const resetPasswordTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  ref: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expires: {
    type: Date,
    required: true,
  },
});

const ResetPasswordToken = mongoose.model("ResetPasswordToken", resetPasswordTokenSchema);

module.exports = ResetPasswordToken;