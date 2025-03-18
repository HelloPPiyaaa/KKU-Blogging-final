const express = require("express");
const router = express.Router();
const View = require("../models/view");
const Blog = require("../models/blog")

router.get("/", async (req, res) => {
  try {
    const views = await View.find().lean();
    res.status(200).json(views);
  } catch (err) {
    console.error("Error fetching view data:", err);
    res.status(500).json({ error: "Error fetching view data" });
  }
});

router.get("/:blogId", async (req, res) => {
  const { blogId } = req.params;
  try {
    const blog = await Blog.findById(blogId).lean();
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error("Error fetching blog:", err);
    res.status(500).json({ error: "Error fetching blog" });
  }
});

module.exports = router;
