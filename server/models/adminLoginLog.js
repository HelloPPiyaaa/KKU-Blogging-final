const mongoose = require("mongoose");

const adminLoginLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true
    },
    loginTime: {
        type: Date,
        default: Date.now
    },
    username: String,
    email: String
});

const AdminLoginLog = mongoose.model("AdminLoginLog", adminLoginLogSchema);
module.exports = AdminLoginLog;
