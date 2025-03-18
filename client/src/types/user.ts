export type User = {
  _id: string;
  fullname: string;
  username: string;
  profile_picture: string;
  email: string;
  isFollowing?: boolean;
  createAt: Date;
};
