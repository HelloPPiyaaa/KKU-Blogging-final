const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Post = require("../models/blog");
const Comment = require("../models/comment");
const Like = require("../models/like");
const SavedPost = require("../models/save");
const Notification = require("../models/notifaications");
const auth = require("./authMiddleware");
const jwt = require("jsonwebtoken");
const { NotiMailer } = require("../mail/noti_sender");
const BadWordScanner = require("../utils/badword");
const recommend = require("../utils/itembase");
const Report = require("../models/report");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token === null) {
    return res.status(401).json({ error: "ไม่มี token การเข้าถึง" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "การเข้าถึง token ไม่ถูกต้อง" });
    }

    req.user = user.id;
    next();
  });
};

router.get("/search", async (req, res) => {
  const query = req.query.query;
  if (!query || typeof query !== "string") {
    return res
      .status(400)
      .json({ message: "Query parameter is missing or not a string" });
  }

  try {
    const posts = await Post.find({
      $or: [
        { topic: new RegExp(query, "i") },
        { category: new RegExp(query, "i") },
        { content: new RegExp(query, "i") },
      ],
    });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    await BadWordScanner(req.body);
  } catch (err) {
    badword = err.toString().split(" ");
    badword = badword[badword.length - 1];
    return res.status(403).json({
      error: `ข้อความของคุณมีคำไม่เหมาะสม กรุณาตรวจสอบและแก้ไข : “${badword}”`,
      details: `$ข้อความของคุณมีคำไม่เหมาะสม กรุณาตรวจสอบและแก้ไข : “${badword}”`,
    });
  }
  const { user, topic, detail, category, image, contentWithImages } = req.body;

  if (!user || !topic || !category || !image) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const post = new Post({
      user,
      topic,
      detail,
      category,
      image,
      contentWithImages,
    });
    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error("Error creating post:", error); // แสดงข้อผิดพลาดที่เกิดขึ้น
    res.status(500).json({ message: "Error creating post: " + error.message });
  }
});

// Middleware สำหรับการดึงโพสต์ตาม ID
async function getPost(req, res, next) {
  let post;
  try {
    post = await Post.findById(req.params.id)
      .populate("user")
      .populate({
        path: "comments",
        populate: [
          {
            path: "author",
            model: "User",
          },
          {
            path: "replies",
            populate: {
              path: "author",
              model: "User",
            },
          },
        ],
      })
      .populate("likes");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    post.views += 1;
    await post.save();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error finding post: " + error.message });
  }

  res.post = post;
  next();
}

// ดึงข้อมูลโพสต์บล็อกทั้งหมด
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          model: "User",
        },
      })
      .populate("likes");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts: " + error.message });
  }
});

router.post("/latest-blog", async (req, res) => {
  try {
    let { page } = req.body;
    const maxLimit = 5;

    let userId = null;
    let currentUser = null;

    // Get user ID from token
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        if (userId) {
          currentUser = await User.findById(userId);
        }
      } catch (err) {
        console.error("Token verification failed:", err);
      }
    }

    let query = { draft: false };

    if (userId && currentUser) {
      // For logged-in users
      query = {
        draft: false,
        $or: [
          // Show all public posts
          { visibility: "public" },

          // Show user's own posts
          { author: userId },

          // Show followers-only posts ONLY from authors the user follows
          {
            $and: [
              { visibility: "followers" },
              { author: { $in: currentUser.following } },
            ],
          },
        ],
      };
    } else {
      // For non-logged-in users, only show public posts
      query = {
        draft: false,
        visibility: "public",
      };
    }

    const blogs = await Post.find(query)
      .populate({
        path: "author",
        select: "profile_picture username fullname followers",
      })
      .sort({ publishedAt: -1 })
      .select(
        "blog_id topic des banner activity tags publishedAt visibility author"
      )
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);

    // Add user-specific information to each blog
    const blogsWithInfo = blogs.map((blog) => {
      const blogObj = blog.toObject();

      // Basic flags
      blogObj.isFollowersOnly = blog.visibility === "followers";
      blogObj.isAuthor = userId ? blog.author._id.toString() === userId : false;

      // Following status
      if (userId && currentUser) {
        blogObj.isFollowing = currentUser.following.includes(blog.author._id);
      } else {
        blogObj.isFollowing = false;
      }

      return blogObj;
    });

    return res.status(200).json({
      blogs: blogsWithInfo,
      currentPage: page,
      hasMore: blogs.length === maxLimit,
    });
  } catch (err) {
    console.error("Error in latest-blog:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/all-latest-blogs-count", (req, res) => {
  Post.countDocuments({ draft: false })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

router.get("/trending-blogs", (req, res) => {
  Post.find({ draft: false })
    .populate("author", "profile_picture username fullname -_id")
    .sort({
      "activity.total_read": -1,
      "activity.total_likes": -1,
      publishedAt: -1,
    })
    .select("blog_id topic publishedAt -_id")
    .limit(5)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

// ดึงข้อมูลโพสต์บล็อกตาม ID
router.get("/:id", getPost, (req, res) => {
  res.json(res.post);
});

router.patch("/:id", getPost, async (req, res) => {
  try {
    await BadWordScanner(req.body);
  } catch (err) {
    badword = err.toString().split(" ");
    badword = badword[badword.length - 1];
    return res.status(403).json({
      error: `ข้อความของคุณมีคำไม่เหมาะสม กรุณาตรวจสอบและแก้ไข : “${badword}”`,
      details: `$ข้อความของคุณมีคำไม่เหมาะสม กรุณาตรวจสอบและแก้ไข : “${badword}”`,
    });
  }
  const { topic, detail, category, image, contentWithImages } = req.body;

  if (topic != null) res.post.topic = topic;
  if (detail != null) res.post.detail = detail;
  if (category != null) res.post.category = category;
  if (image != null) res.post.image = image;
  if (contentWithImages != null) res.post.contentWithImages = contentWithImages;

  try {
    const updatedPost = await res.post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error updating post: " + error.message });
  }
});

// ลบข้อมูลโพสต์บล็อก
router.delete("/:id", auth, getPost, async (req, res) => {
  try {
    const post = res.post;

    if (post.user._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
    }

    await Comment.deleteMany({ post: post._id });
    await Like.deleteMany({ post: post._id });

    await Post.deleteOne({ _id: post._id });

    await Report.updateMany(
      { post: post._id },
      { $set: { status: "Cancel", verified: true } }
    );

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post: " + error.message });
  }
});

// เพิ่มหรือลบไลค์
// router.post("/:id/likes", async (req, res) => {
//   const postId = req.params.id;
//   const { userId } = req.body;

//   try {
//     const post = await Post.findById(postId);
//     const user = await User.findById(userId);

//     if (!post || !user) {
//       return res.status(404).json({ message: "Post or User not found" });
//     }

//     const existingLike = await Like.findOne({ post: postId, user: userId });

//     if (existingLike) {
//       await Like.deleteOne({ _id: existingLike._id });
//       post.likes = post.likes.filter(
//         (likeId) => !likeId.equals(existingLike._id)
//       );
//       await post.save();

//       await Notification.deleteOne({
//         user: post.user,
//         entity: postId,
//         type: "like",
//         entityModel: "Post",
//       });

//       res.status(200).json({ message: "Post disliked", post });
//     } else {
//       const like = new Like({ user: userId, post: postId });
//       await like.save();

//       post.likes.push(like._id);
//       await post.save();

//       const existingNotification = await Notification.findOne({
//         user: post.user,
//         entity: postId,
//         type: "like",
//         entityModel: "Post",
//       });

//       if (!existingNotification) {
//         const notification = new Notification({
//           user: post.user,
//           type: "like",
//           message: `${user.firstname} ${user.lastname || ""} liked your post.`,
//           entity: post._id,
//           entityModel: "Post",
//         });
//         await notification.save();
//       }

//       res.status(200).json({ message: "Post liked", post, like: like._id });
//     }
//   } catch (error) {
//     console.error("Error liking/disliking post:", error);
//     res
//       .status(500)
//       .json({ message: "Error liking/disliking post: " + error.message });
//   }
// });

router.post("/:id/likes", async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;

  try {
    const post = await Post.findById(postId);
    const user = await User.findById(userId);

    if (!post || !user) {
      return res.status(404).json({ message: "Post or User not found" });
    }

    const existingLike = await Like.findOne({ post: postId, user: userId });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      post.likes = post.likes.filter(
        (likeId) => !likeId.equals(existingLike._id)
      );
      await post.save();

      await Notification.deleteOne({
        user: post.user,
        entity: postId,
        type: "like",
        entityModel: "Post",
      });

      res.status(200).json({ message: "Post disliked", post });
    } else {
      const like = new Like({ user: userId, post: postId });
      await like.save();

      post.likes.push(like._id);
      await post.save();

      const existingNotification = await Notification.findOne({
        user: post.user,
        entity: postId,
        type: "like",
        entityModel: "Post",
      });

      if (!existingNotification) {
        const notification = new Notification({
          user: post.user,
          type: "like",
          message: `${user.firstname} ${user.lastname || ""} liked your post.`,
          entity: post._id,
          entityModel: "Post",
        });
        await notification.save();
        NotiMailer(notification.user, userId, notification.type, postId);
      }

      res.status(200).json({ message: "Post liked", post, like: like._id });
    }
  } catch (error) {
    console.error("Error liking/disliking post:", error);
    res
      .status(500)
      .json({ message: "Error liking/disliking post: " + error.message });
  }
});

router.get("/:id/likes", async (req, res) => {
  try {
    const postId = req.params.id;

    const likes = await Like.find({ post: postId })
      .populate("user", "fullname  username profile_picture")
      .sort({ createdAt: -1 });

    res.json(likes);
  } catch (error) {
    console.error("Error fetching post likes:", error);
    res
      .status(500)
      .json({ message: "Error fetching likes", error: error.message });
  }
});

// เพิ่มคอมเมนต์
router.post("/:id/comment", async (req, res) => {
  const postId = req.params.id;
  const { content, author } = req.body;

  try {
    const post = await Post.findById(postId).populate("user");
    const user = await User.findById(author);

    if (!post || !user) {
      return res.status(404).json({ message: "Post or User not found" });
    }

    const comment = new Comment({ content, author, post: postId });
    await comment.save();

    post.comments.push(comment._id);
    await post.save();

    const notification = new Notification({
      user: post.user._id,
      type: "comment",
      message: `${user.firstname} ${
        user.lastname || ""
      } commented on your post.`,
      entity: postId,
      entityModel: "Post",
    });
    await notification.save();
    NotiMailer(notification.user, author, notification.type, postId);

    res.status(201).json({
      message: "Comment created successfully",
      post,
      comment: comment._id,
    });
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ message: "Error creating comment: " + err.message });
  }
});

//ลบคอมเมนต์
router.delete("/:postId/comment/delete/:commentId", auth, async (req, res) => {
  const { postId, commentId } = req.params;
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    //ค้นหาคอมเมนต์
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    //ตรวจสอบว่าเป็นเจ้าของคอมเมนต์ไหม
    if (comment.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "ไม่สามรถลบได้ ผู้ใช้ไม่ถูกต้อง" });
    }

    await Post.findByIdAndUpdate(postId, {
      $pull: { comments: commentId },
    });

    //ลบคอมเมนต์จากฐานข้อมูล
    await comment.deleteOne();
    res.status(200).json({ message: "ลบความคิดเห็นสำเร็จ" });
  } catch (error) {
    console.error("ข้อผิดพลาดในการลบความคิดเห็น :", error);
    res
      .status(500)
      .json({ message: "ข้อผิดพลาดในการลบความคิดเห็น :" + error.message });
  }
});

const addReplyComment = async (commentId, reply) => {
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (!reply || !reply.content || !reply.author || !reply.replyTo) {
      throw new Error("Invalid reply data");
    }

    comment.replies.push(reply);

    await comment.save();

    return comment;
  } catch (err) {
    console.error("Error adding reply comment:", err.message);
    throw new Error("Error adding reply comment");
  }
};

//การตอบกลับความคิดเห็น
router.post("/:postId/comment/:commentId/reply", auth, async (req, res) => {
  try {
    await BadWordScanner(req.body);
  } catch (err) {
    badword = err.toString().split(" ");
    badword = badword[badword.length - 1];
    return res.status(403).json({
      error: `ข้อความของคุณมีคำไม่เหมาะสม กรุณาตรวจสอบและแก้ไข : “${badword}”`,
      details: `$ข้อความของคุณมีคำไม่เหมาะสม กรุณาตรวจสอบและแก้ไข : “${badword}”`,
    });
  }
  const { postId, commentId } = req.params;
  const { content, author, replyTo } = req.body;

  if (!content || !author || !replyTo) {
    return res
      .status(400)
      .json({ message: "Content, author, and replyTo are required" });
  }

  try {
    const post = await Post.findById(postId).populate("user");
    const user = await User.findById(author);
    const comment = await Comment.findById(commentId).populate("author");

    if (!post || !comment || !user) {
      return res
        .status(404)
        .json({ message: "Post, Comment, or User not found" });
    }

    const reply = {
      content,
      author,
      created_at: new Date(),
      replyTo, // This will now properly reference the User model
    };

    const updateComment = await addReplyComment(commentId, reply);

    if (!user._id.equals(comment.author._id)) {
      const notification = new Notification({
        user: comment.author._id,
        type: "reply",
        message: `${user.firstname} ${
          user.lastname || ""
        } replied to your comment.`,
        entity: postId,
        entityModel: "Comment",
      });
      await notification.save();
      NotiMailer(notification.user, author, notification.type, postId);
    }

    res.status(201).json({
      message: "Reply and notification created successfully",
      updateComment,
    });
  } catch (err) {
    console.error("Error creating reply or notification: ", err);
    res.status(500).json({
      message: "Error creating reply or notification: " + err.message,
    });
  }
});

// การลบการตอบกลับความคิดเห็น
router.delete(
  "/:postId/comment/:commentId/reply/:replyId",
  auth,
  async (req, res) => {
    const { postId, commentId, replyId } = req.params;

    try {
      // ค้นหาโพสต์ที่มี postId
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "ไม่พบบล็อก" });
      }

      // ค้นหาคอมเมนต์ที่มี commentId
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: "ไม่พบความคิดเห็น" });
      }

      // กรองการตอบกลับที่ต้องการลบออกจาก replies ของคอมเมนต์นี้
      comment.replies = comment.replies.filter(
        (reply) => reply._id.toString() !== replyId
      );

      // บันทึกคอมเมนต์ที่อัปเดต
      await comment.save();

      res.status(200).json({
        message: "ลบการตอบกลับสำเร็จ",
        updatedComment: comment,
      });
    } catch (err) {
      console.error("ข้อผิดพลาดในการลบการตอบกลับความคิดเห็น: ", err);
      res.status(500).json({
        message: "ข้อผิดพลาดในการลบการตอบกลับความคิดเห็น: " + err.message,
      });
    }
  }
);

// ดึงข้อมูลโพสต์ที่ถูกใจตาม User ID
router.get("/likedPosts/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    // ดึงข้อมูลไลค์ที่เกี่ยวข้องกับ userId
    const likes = await Like.find({ user: userId }).populate("post");

    // ดึงข้อมูลโพสต์ที่เกี่ยวข้องกับไลค์
    const likedPosts = likes.map((like) => like.post);

    if (!likedPosts || likedPosts.length === 0) {
      return res.status(404).json({ message: "Liked posts not found" });
    }

    res.status(200).json(likedPosts);
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ฟังก์ชันบันทึกโพสต์
router.post("/:id/save", async (req, res) => {
  try {
    const userId = req.body.userId;
    const postId = req.params.id;

    const existingSavedPost = await SavedPost.findOne({
      user: userId,
      post: postId,
    });

    if (existingSavedPost) {
      await SavedPost.deleteOne({ user: userId, post: postId });

      // Remove the save reference from the post
      await Post.findByIdAndUpdate(postId, {
        $pull: { saves: existingSavedPost._id },
      });

      return res.status(200).json({ success: true, message: "Post unsaved" });
    } else {
      const savedPost = new SavedPost({
        user: userId,
        post: postId,
      });
      await savedPost.save();

      // Add the save reference to the post
      await Post.findByIdAndUpdate(postId, {
        $push: { saves: savedPost._id },
      });

      return res.status(201).json({ success: true, message: "Post saved" });
    }
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ success: false, message: "Error saving post" });
  }
});

router.get("/saved/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const savedPosts = await SavedPost.find({ user: userId }).populate("post");

    res.status(200).json(savedPosts.map((savedPost) => savedPost.post));
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching saved posts" });
  }
});

router.delete("/:postId/save", async (req, res) => {
  const postId = req.params.postId;
  const userId = req.body.userId;

  try {
    const savedPost = await SavedPost.findOneAndDelete({
      user: userId,
      post: postId,
    });
    if (!savedPost) {
      return res.status(404).send({ error: "Save not found" });
    }

    // อัพเดตโพสต์ให้ลบ reference ของ savedPost
    await Post.findByIdAndUpdate(postId, {
      $pull: { saves: savedPost._id },
    });

    res.status(200).send({ message: "Save removed successfully" });
  } catch (error) {
    console.error("Error removing save:", error);
    res.status(500).send({ error: "Failed to remove save" });
  }
});

router.post("/blog-recommends", verifyJWT, async (req, res) => {
  let user_id = req.user;
  try {
    console.log("User ID:", user_id);
    const rec = await recommend(user_id, 10);
    const currentUser = await User.findById(user_id);
    const postIds = rec;

    const blogs = await Post.find({ _id: { $in: postIds } })
      .populate({
        path: "author",
        select: "profile_picture username fullname followers",
      })
      .select(
        "blog_id topic des banner activity tags publishedAt visibility author engagementScore"
      )
      .lean();

    // เรียงโพสต์ตาม Engagement Score ที่คำนวณจาก recommend
    const orderedBlogs = postIds
      .map(id => blogs.find(blog => blog._id.equals(id)))
      .filter(blog => blog)
      .sort((a, b) => b.engagementScore - a.engagementScore);

    // กรองโพสต์ที่ตรงตามเงื่อนไข visibility
    const filteredBlogs = orderedBlogs.filter((blog) => {
      if (blog.visibility === "public") {
        return true;
      }
      return (
        blog.visibility === "followers" &&
        blog.author.followers.includes(user_id)
      );
    });

    return res.status(200).json({ blogs: filteredBlogs });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:postId/statistics", verifyJWT, async (req, res) => {
  const { postId } = req.params;
  const statistics = await Post.calculateStatistics(postId);
  res.status(200).json(statistics);
});

module.exports = router;
