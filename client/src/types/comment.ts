import { Author } from "./post";

export type ReplyComment = {
  _id: string;
  content: string;
  author: Author;
  replyTo: Author;
  created_at: Date;
};

export type Comment = {
  _id: string;
  author: Author;
  comment: string;
  replies: ReplyComment[];
  created_at: Date;
  commented_by: Author;
  childrenLevel: number;
  children: string[];
  isReplyingLoaded?: boolean;
  parentIndex?: number;
};

export type CommentsData = {
  results: Comment[]; // ผลลัพธ์ของความคิดเห็น
};
