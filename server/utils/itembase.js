const mongoose = require("mongoose");
const User = require("../models/user");
const Post = require("../models/blog");
const knn = require("ml-knn");

const weightFactors = {
    viewed: 1,
    liked: 3,
    commented: 5,
    saved: 3,
};

async function recommend(userId, topN) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error("Invalid userId format");
        return [];
    }

    const user = await User.findById(userId, 'followers').lean();
    if (!user) {
        console.error("User not found");
        return [];
    }

    topN = Math.floor(Number(topN));
    if (isNaN(topN) || topN < 0 || !Number.isInteger(topN)) {
        console.error("Invalid topN value");
        return [];
    }
    console.log(topN);

    const followedUserIds = user.followers;

    // ค้นหาทั้งโพสต์จากผู้ที่ผู้ใช้ติดตาม
    const postsFromFollowedUsers = await Post.find({ 'author': { $in: followedUserIds } })
        .sort({ engagementScore: -1 })
        .limit(topN);

    // ค้นหาโพสต์จากผู้ที่ไม่ได้ติดตาม
    const postsFromOtherUsers = await Post.find({ 'author': { $nin: followedUserIds } })
        .sort({ engagementScore: -1 })
        .limit(topN);

    const recommendedPosts = [...postsFromFollowedUsers, ...postsFromOtherUsers];

    recommendedPosts.forEach(post => {
        post.engagementScore = calculateEngagementScore(post);
        console.log(`Post ID: ${post._id}, Engagement Score: ${post.engagementScore}`);
    });

    recommendedPosts.sort((a, b) => b.engagementScore - a.engagementScore);
    return recommendedPosts.slice(0, topN).map(post => post._id);
}

function calculateEngagementScore(post) {
    if (!post.activity) return 0;

    return (
        (post.activity.total_reads || 0) * weightFactors.viewed +
        (post.activity.total_likes || 0) * weightFactors.liked +
        (post.activity.total_comments || 0) * weightFactors.commented + 
        (post.activity.total_saves || 0) * weightFactors.saved
    );
}


module.exports = recommend;
