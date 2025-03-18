const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  tel: {
    type: String,
    required: true,
  },
  profile_picture: {
    type: String,
  },
  cover_pic: {
    type: String,
  },
  is_admin: {
    type: Boolean,
    default: true,
  },
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
