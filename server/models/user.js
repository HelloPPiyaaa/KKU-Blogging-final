const mongoose = require("mongoose");

let profile_imgs_name_list = [
  "Garfield",
  "Tinkerbell",
  "Annie",
  "Loki",
  "Cleo",
  "Angel",
  "Bob",
  "Mia",
  "Coco",
  "Gracie",
  "Bear",
  "Bella",
  "Abby",
  "Harley",
  "Cali",
  "Leo",
  "Luna",
  "Jack",
  "Felix",
  "Kiki",
];
let profile_imgs_collections_list = [
  "notionists-neutral",
  "adventurer-neutral",
  "fun-emoji",
];

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      minlength: [3, "Username must be 3 letters long"],
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
    },
    fullname: {
      type: String,
      lowercase: true,
      required: true,
      minlength: [3, "fullname must be 3 letters long"],
    },
    date_of_birth: {
      type: Date,
    },
    gender: {
      type: String,
    },
    tel: {
      type: String,
    },
    profile_picture: {
      type: String,
      default: () => {
        return `https://api.dicebear.com/6.x/${
          profile_imgs_collections_list[
            Math.floor(Math.random() * profile_imgs_collections_list.length)
          ]
        }/svg?seed=${
          profile_imgs_name_list[
            Math.floor(Math.random() * profile_imgs_name_list.length)
          ]
        }`;
      },
    },
    cover_pic: {
      type: String,
    },
    is_admin: {
      type: Boolean,
      default: false,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    bio: {
      type: String,
      maxlength: [200, "Bio should not be more than 200"],
      default: "",
    },
    social_links: {
      youtube: {
        type: String,
        default: "",
      },
      instagram: {
        type: String,
        default: "",
      },
      facebook: {
        type: String,
        default: "",
      },
      twitter: {
        type: String,
        default: "",
      },
      github: {
        type: String,
        default: "",
      },
      website: {
        type: String,
        default: "",
      },
    },
    total_posts: {
      type: Number,
      default: 0,
    },
    total_reads: {
      type: Number,
      default: 0,
    },
    google_auth: {
      type: Boolean,
      default: false,
    },
    blogs: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "posts",
      default: [],
    },
    viewed_posts: {
      type: [String], 
      default: [],
    },
    liked_posts: {
      type: [String], 
      default: [],
    },
    saved_posts: {
      type: [String], 
      default: [],
    },
    commented_posts: {
      type: [String], 
      default: [],
    },
    notification_enable: {
      type: Boolean, 
      default: true,
    },
    notification_email_enable: {
      type: Boolean, 
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "joinedAt",
    },
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
