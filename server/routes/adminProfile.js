const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Admin = require("../models/admin");
const AdminLoginLog = require("../models/adminLoginLog");
const User = require("../models/user");
const Post = require("../models/blog");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//Admin
// router.get("/", async (req, res) => {
//   try {
//     const admins = await Admin.find({}).lean();
//     res.json(admins);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Error fetching user data" });
//   }
// });

const formDatatoSend = (user) => {
    const access_token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    return {
        access_token,
        _id: user._id,
        role: user.is_admin == true ? "admin" : "user",
        profile_picture: user.profile_picture,
        username: user.username,
        fullname: user.fullname
    };
};

router.post("/", async (req, res) => {
    let { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email: email });

        if (!admin) {
            return res.status(403).json({ error: "ไม่พบผู้ใช้" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (isMatch) {
            try {
                await AdminLoginLog.create({
                    adminId: admin._id,
                    username: admin.username,
                    email: admin.email
                });

                return res.status(200).json(formDatatoSend(admin));
            } catch (logError) {
                console.error("Error creating login log:", logError);
                return res.status(200).json(formDatatoSend(admin));
            }
        } else {
            throw new Error("Password is incorrect");
        }
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: err.message });
    }
});

router.get("/login-history", async (req, res) => {
    try {
        const logs = await AdminLoginLog.find()
            .sort({ loginTime: -1 })
            .populate("adminId", "username email");
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching login history" });
    }
});

router.get("/get-login-history", async (req, res) => {
    try {
        const logs = await AdminLoginLog.find()
            .sort({ loginTime: -1 })
            .populate("adminId", "username email");
        res.json(logs);
    } catch (error) {
        console.error("Error fetching login history:", error);
        res.status(500).json({ message: "Error fetching login history" });
    }
});

// Middleware ตรวจสอบสิทธิ์ของแอดมิน
const isAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = (await Admin.findById(decoded.id)) || (await User.findById(decoded.id));
        if (admin && admin.is_admin) {
            req.user = admin;
            next();
        } else {
            res.status(403).json({ message: "Access denied" });
        }
    } catch (error) {
        console.error("Error in isAdmin middleware:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 1. รับข้อมูลผู้ใช้ทั้งหมด (แอดมิน)
// router.get("/users", isAdmin, async (req, res) => {
//   try {
//     const userCount = await User.countDocuments();
//     console.log("userCount", userCount); // This logs the count on the server-side
//     res.json({ count: userCount });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.get("/users", async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        return res.json(userCount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/users/within24hour", async (req, res) => {
    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const userCount = await User.countDocuments({
            joinedAt: { $gte: twentyFourHoursAgo }
        });
        return res.json(userCount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/viewer", async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/blogs/within24hour", async (req, res) => {
    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const posts = await Post.find({
            publishedAt: { $gte: twentyFourHoursAgo }
        });

        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/blogs/:id", async (req, res) => {
    const { id: user_id } = req.params;
    try {
        const posts = await Post.find({ author: user_id });
        if (!posts || posts.length === 0) {
            return res.status(404).json({ message: "No posts found for this user" });
        }
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// 2. รับข้อมูลผู้ใช้ตาม ID (แอดมิน)
router.get("/users/:id", isAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// 3. อัปเดตข้อมูลผู้ใช้ (แอดมิน)
router.put("/users/:id", isAdmin, async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const { firstname, lastname, email, tel, username } = req.body;

        if (email && email !== admin.email) {
            const existingAdmin = await Admin.findOne({ email });
            if (existingAdmin) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }

        if (username && username !== admin.username) {
            const existingUsername = await Admin.findOne({ username });
            if (existingUsername) {
                return res.status(400).json({ message: "Username already in use" });
            }
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(
            req.params.id,
            { firstname, lastname, email, tel, username },
            { new: true }
        );

        res.status(200).json(updatedAdmin);
    } catch (error) {
        console.error("Error updating admin:", error);
        res.status(500).json({
            message: "Error updating admin profile",
            error: error.message
        });
    }
});

// 4. ลบบัญชีผู้ใช้ (แอดมิน)
router.delete("/users/:id", isAdmin, async (req, res) => {
    try {
        const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
        if (!deletedAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.json({ message: "Admin deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting admin" });
    }
});

// ดึง admin ทั้งหมด
router.get("/all-admins", async (req, res) => {
    try {
        const admins = await Admin.find({}, "-password");
        res.json(admins);
    } catch (error) {
        console.error("Error fetching admins:", error);
        res.status(500).json({ message: "Error fetching admins" });
    }
});

router.get("/:id", async function (req, res) {
    try {
        const admin = await Admin.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(admin);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching user data" });
    }
});

// เปลี่ยนรหัสผ่าน
router.put("/change-password/:id", async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.params.id;

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
        }

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                message: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        admin.password = hashedPassword;
        await admin.save();

        res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
    } catch (error) {
        console.error("Password change error:", error);
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน",
            error: error.message
        });
    }
});

router.post("/register", isAdmin, async (req, res) => {
    try {
        const { email, password, username, firstname, lastname, tel } = req.body;

        if (!email || !password || !username || !firstname || !lastname) {
            return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
        }

        const existingEmail = await Admin.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "อีเมลนี้มีผู้ใช้งานแล้ว" });
        }

        const existingUsername = await Admin.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "ชื่อผู้ใช้นี้มีผู้ใช้งานแล้ว" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = await Admin.create({
            email,
            password: hashedPassword,
            username,
            firstname,
            lastname,
            tel: tel || "",
            is_admin: true
        });

        const adminWithoutPassword = { ...newAdmin.toObject() };
        delete adminWithoutPassword.password;

        res.status(201).json(adminWithoutPassword);
    } catch (error) {
        console.error("Error creating admin:", error);
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการเพิ่มแอดมิน",
            error: error.message
        });
    }
});

module.exports = router;
