const express = require("express");
const router = express.Router();
const Notification = require("../models/notifaications");
const User = require("../models/user");
const { NotiMailer } = require("../mail/noti_sender");
 
router.post("/", async (req, res) => {
  try {
    const { you: youId, me: meId } = req.body;
 
    const you = await User.findById(youId);
    const me = await User.findById(meId);
 
    if (!you || !me) {
      return res.status(404).json({ message: "User not found" });
    }
 
    let isUpdated = false;
 
    if (!you.followers.some((followerId) => followerId.equals(me._id))) {
      you.followers.push(me._id);
      isUpdated = true;
    }
 
    if (!me.following.some((followingId) => followingId.equals(you._id))) {
      me.following.push(you._id);
      isUpdated = true;
    }
 
    if (isUpdated) {
      await you.save();
      await me.save();
 
      const existingNotification = await Notification.findOne({
        user: you._id,
        entity: me._id,
        type: "follow",
        entityModel: "User",
      });
 
      if (!existingNotification) {
        const notification = new Notification({
          user: me._id, // Who receives the notification (you)
          notification_for: you._id, // Who is creating the notification (me)
          type: "follow",
          entity: you._id, // The entity involved, which is a user
          entityModel: "User", // Entity model type
        });
        await notification.save();
        NotiMailer(notification.notification_for,notification.user,notification.type);
      }
    }
 
    const checkFollowers = you.followers.some((followerId) =>
      followerId.equals(me._id)
    );
 
    const newFollow = { ...you.toObject(), if_followed: checkFollowers };
 
    res.status(200).json({ message: "Successfully added follower", newFollow });
  } catch (err) {
    console.error("Error in follow route:", err);
    res.status(500).json({ error: "Error updating user data" });
  }
});
 
// Route URL to get user data by ID
router.get("/:id", async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id)
      .lean()
      .populate("followers", "username fullname")
      .populate("following", "username fullname");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user data" });
  }
});
 
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("followers", "username fullname")
      .populate("following", "username fullname");
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
 
router.delete("/delete", async (req, res) => {
  try {
    const { you: youId, me: meId } = req.body;
    const you = await User.findById(youId);
    const me = await User.findById(meId);
 
    if (you && me) {
      const checkUnFollowers = you.followers.pull(me._id);
      const checkUnFollowings = me.following.pull(you._id);
      await you.save();
      await me.save();
 
      await Notification.findOneAndDelete({
        user: you._id,
        entity: me._id,
        type: "follow",
        entityModel: "User",
      });
 
      const unFollow = { ...you.toObject(), if_unfollowed: checkUnFollowers };
      res.json({ message: "Successfully removed follower", unFollow });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error in unfollow route:", error);
    res
      .status(500)
      .json({ message: "Error deleting follower: " + error.message });
  }
});
 
module.exports = router;
 