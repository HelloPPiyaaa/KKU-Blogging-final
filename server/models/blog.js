const mongoose = require("mongoose");

require("./user");
require("./comment");
require("./like");
require("./save");

// กำหนดโครงสร้างข้อมูลสำหรับโพสต์บล็อก
const postSchema = new mongoose.Schema(
  {
    blog_id: {
      type: String,
      unique: true,
    },
    topic: {
      type: String,
      required: true,
    },
    detail: {
      type: String,
      required: false,
    },
    category: {
      type: [String],
      required: true,
    },
    banner: {
      type: String,
    },
    des: {
      type: String,
      maxlength: 200,
    },
    content: {
      type: [],
    },
    tags: {
      type: [String],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activity: {
      total_likes: {
        type: Number,
        default: 0,
      },
      total_saves: {
        type: Number,
        default: 0,
      },
      total_comments: {
        type: Number,
        default: 0,
      },
      total_reads: {
        type: Number,
        default: 0,
      },
      total_parent_comments: {
        type: Number,
        default: 0,
      },
    },
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    }],
    draft: {
      type: Boolean,
      default: false,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Like",
    }],
    saves: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        blogId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
          required: true,
        },
        savedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    views: {
      total: { type: Number, default: 0 },
      daily: { type: Map, of: Number, default: {} },
      monthly: { type: Map, of: Number, default: {} },
      yearly: { type: Map, of: Number, default: {} },
    },
    visibility: {
      type: String,
      enum: ['public', 'followers'],
      default: 'public'
    },
  },
  {
    timestamps: {
      createdAt: "publishedAt",
    },
  }
);


postSchema.statics.canView = async function(userId, authorId) {
  if (userId && userId === authorId?.toString()) {
    return true;
  }
  
  if (!userId) {
    return { visibility: 'public' };
  }
  
  // Otherwise, check if user is a follower
  const user = await mongoose.model('User').findById(userId);
  const author = await mongoose.model('User').findById(authorId);
  const isFollower = author?.followers?.includes(userId);
  
  return {
    $or: [
      { visibility: 'public' },
      ...(isFollower ? [{ visibility: 'followers' }] : [])
    ]
  };
};


postSchema.statics.calculateStatistics = async function (postId) {
  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    throw new Error("Invalid postId");
  }

  const post = await this.findById(postId);
  if (!post) throw new Error("Post not found");

  const now = new Date();
  const todayDate = new Date().toISOString().split("T")[0];

  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  const dayOfWeek = now.getUTCDay();
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const startOfWeek = new Date(now);
  startOfWeek.setUTCDate(startOfWeek.getUTCDate() + diffToMonday);
  startOfWeek.setUTCHours(0, 0, 0, 0);

  let weekDays = [];
  const isCurrentWeek = weekDays.some(({ date }) => date === todayDate);

  if (!isCurrentWeek) {
    weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setUTCDate(day.getUTCDate() + i);
      return { date: day.toISOString().split("T")[0], day: day.getUTCDay() };
    });
  }

  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );
  const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));

  if (!weekDays.some((d) => d.date === todayDate)) {
    weekDays = [
      ...weekDays.slice(1),
      { date: todayDate, day: now.getUTCDay() },
    ];
  }

  const monthlyStats = Array.from({ length: 12 }, (_, i) => {
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), i, 1));
    const endOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), i + 1, 0, 23, 59, 59, 999)
    );
    return { month: i, start: startOfMonth, end: endOfMonth };
  });
  const statistics = await this.aggregate([
    { $match: { _id: post._id } },
    {
      $lookup: {
        from: "likes",
        localField: "likes",
        foreignField: "_id",
        as: "likesDetails",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "comments",
        foreignField: "_id",
        as: "commentsDetails",
      },
    },
    {
      $project: {
        views: 1,
        totalLikes: { $size: { $ifNull: ["$likesDetails", []] } },
        totalSaves: { $size: { $ifNull: ["$saves", []] } },
        totalComments: { $size: { $ifNull: ["$comments", []] } },
        totalReads: { $ifNull: ["$views.total", 0] },

        // Daily
        dailyLikes: {
          $size: {
            $filter: {
              input: { $ifNull: ["$likesDetails", []] },
              as: "like",
              cond: { $gte: ["$$like.created_at", startOfDay] },
            },
          },
        },
        dailySaves: {
          $size: {
            $filter: {
              input: { $ifNull: ["$saves", []] },
              as: "save",
              cond: { $gte: ["$$save.savedAt", startOfDay] },
            },
          },
        },
        dailyComments: {
          $size: {
            $filter: {
              input: { $ifNull: ["$commentsDetails", []] },
              as: "comment",
              cond: { $gte: ["$$comment.commentedAt", startOfDay] },
            },
          },
        },
        dailyReads: {
          $ifNull: [
            {
              $getField: {
                field: todayDate,
                input: "$views.daily",
              },
            },
            0,
          ],
        },

        // Monthly
        monthlyLikes: {
          $size: {
            $filter: {
              input: { $ifNull: ["$likesDetails", []] },
              as: "like",
              cond: { $gte: ["$$like.created_at", startOfMonth] },
            },
          },
        },
        monthlySaves: {
          $size: {
            $filter: {
              input: { $ifNull: ["$saves", []] },
              as: "save",
              cond: { $gte: ["$$save.savedAt", startOfMonth] },
            },
          },
        },
        monthlyComments: {
          $size: {
            $filter: {
              input: { $ifNull: ["$commentsDetails", []] },
              as: "comment",
              cond: { $gte: ["$$comment.commentedAt", startOfMonth] },
            },
          },
        },
        monthlyReads: {
          $cond: {
            if: { $gte: ["$updatedAt", startOfMonth] },
            then: "$views.monthly",
            else: 0,
          },
        },

        weeklyStats: {
          $map: {
            input: weekDays,
            as: "day",
            in: {
              date: "$$day.date",
              day: "$$day.day",
              likes: {
                $size: {
                  $filter: {
                    input: { $ifNull: ["$likesDetails", []] },
                    as: "like",
                    cond: {
                      $eq: [
                        {
                          $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$$like.created_at",
                          },
                        },
                        "$$day.date",
                      ],
                    },
                  },
                },
              },
              comments: {
                $size: {
                  $filter: {
                    input: { $ifNull: ["$commentsDetails", []] },
                    as: "comment",
                    cond: {
                      $eq: [
                        {
                          $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$$comment.commentedAt",
                          },
                        },
                        "$$day.date",
                      ],
                    },
                  },
                },
              },
              saves: {
                $size: {
                  $filter: {
                    input: { $ifNull: ["$saves", []] },
                    as: "save",
                    cond: {
                      $eq: [
                        {
                          $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$$save.savedAt",
                          },
                        },
                        "$$day.date",
                      ],
                    },
                  },
                },
              },
              reads: {
                $cond: {
                  if: {
                    $eq: [
                      {
                        $dateToString: {
                          format: "%Y-%m-%d",
                          date: "$updatedAt",
                        },
                      },
                      "$$day.date",
                    ],
                  },
                  then: {
                    $getField: {
                      input: { $first: { $objectToArray: "$views.daily" } },
                      field: "v",
                    },
                  },
                  else: 0,
                },
              },
            },
          },
        },

        yearlyStats: monthlyStats.map(({ month, start, end }) => ({
          month,
          likes: {
            $size: {
              $filter: {
                input: { $ifNull: ["$likesDetails", []] },
                as: "like",
                cond: {
                  $and: [
                    { $gte: ["$$like.created_at", start] },
                    { $lte: ["$$like.created_at", end] },
                  ],
                },
              },
            },
          },
          comments: {
            $size: {
              $filter: {
                input: { $ifNull: ["$commentsDetails", []] },
                as: "comment",
                cond: {
                  $and: [
                    { $gte: ["$$comment.commentedAt", start] },
                    { $lte: ["$$comment.commentedAt", end] },
                  ],
                },
              },
            },
          },
          saves: {
            $size: {
              $filter: {
                input: { $ifNull: ["$saves", []] },
                as: "save",
                cond: {
                  $and: [
                    { $gte: ["$$save.savedAt", start] },
                    { $lte: ["$$save.savedAt", end] },
                  ],
                },
              },
            },
          },
          reads: {
            $cond: {
              if: {
                $and: [
                  { $gte: ["$updatedAt", start] },
                  { $lte: ["$updatedAt", end] },
                ],
              },
              then: {
                $getField: {
                  input: { $first: { $objectToArray: "$views.monthly" } },
                  field: "v",
                },
              },
              else: 0,
            },
          },
        })),
      },
    },
  ]);

  console.log("Statistics result:", statistics[0]);
  console.log("views.daily data:", statistics[0]?.views?.daily);
  console.log("views.monthly data:", statistics[0]?.views?.monthly);
  console.log("todayDate:", todayDate);
  console.log("dailyReads raw:", statistics[0]?.dailyReads);

  return statistics[0] || {};
};

const Post = mongoose.model("Post", postSchema);

module.exports = Post;