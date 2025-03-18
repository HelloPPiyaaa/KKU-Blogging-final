import { Link } from "react-router-dom";
import { Post } from "../types/post";
import { getDay } from "../common/date";

interface BlogCardProps {
  blog: Post;
  index: number;
}

const MinimalBlogPost: React.FC<BlogCardProps> = ({ blog, index }) => {
  const { topic, blog_id: id, author, publishedAt } = blog;

  const fullname = author?.fullname || "ไม่ทราบผู้เขียน";
  const username = author?.username || "ไม่ทราบชื่อผู้ใช้";
  const profile_picture = author?.profile_picture || "default-image.jpg";

  return (
    <Link to={`/blog/${id}`} className="blog-link d-flex gap-4 mb-2">
      <h1 className="blog-index">{index < 10 ? "0" + (index + 1) : index}</h1>

      <div>
        <div className="d-flex gap-2 align-items-center mb-2">
          <img
            src={profile_picture}
            alt=""
            className=" rounded-circle"
            style={{ height: "24px", width: "24px" }}
          />
          <p
            className="m-0 fw-medium"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: "1",
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "220px",
            }}
          >
            {fullname} @{username}
          </p>
          <p className="w-auto m-0 fw-medium"> {getDay(publishedAt)}</p>
        </div>

        <h1 className="blog-title">{topic}</h1>
      </div>
    </Link>
  );
};

export default MinimalBlogPost;
