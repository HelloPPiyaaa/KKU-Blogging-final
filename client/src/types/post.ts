import { User } from "./user";
import { Comment, CommentsData } from "./comment";
import { Like } from "./like";
import { save } from "./save"; // ตรวจสอบว่าชื่อไฟล์เป็น Save หรือ save

export type ContentWithImages = {
  content: string;
  images: string[];
};

export interface Author {
  _id?: string;
  fullname: string;
  profile_picture: string;
  username: string;
}

export type Post = {
  _id: string;
  blog_id: string;
  user: User;
  author: Author;
  comments: CommentsData;
  content: [
    {
      blocks: [];
      time: number;
      version: string;
    }
  ];
  likes: Like[];
  saves: save[];
  topic: string;
  detail?: string;
  category: string[];
  image: string;
  images: string[];
  contentWithImages: ContentWithImages[];
  publishedAt: string;
  createdAt: string;
  visibility: 'public' | 'followers';
  isSaved?: boolean;
  views: {
    total?:number,
    daily: string,
    monthly: string,
    yearly: string
  };
  tags: string;
  des: string;
  banner: string;
  activity: {
    total_likes?: number;
    total_comments?: number;
    total_saves?: number;
    total_parent_comments?: number;
  };
};
