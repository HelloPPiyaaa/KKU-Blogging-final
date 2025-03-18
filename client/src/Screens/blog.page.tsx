import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/post";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";

import { FaEarthAmericas } from "react-icons/fa6";
import { FaUserAlt } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import AnimationWrapper from "./page-animation";
import Loader from "../components/loader.component";
import { getDay } from "../common/date";
import BlogInteraction from "./blog-interaction";
import { Post } from "../types/post";
import "../misc/blogpage.css";
import BlogCard from "../components/blogpost.component";
import BlogContent from "../components/blog.content.component";
import CommentsContainer, {
  fetchComments,
} from "../components/comments.components";
import toast from "react-hot-toast";
import { BsDot } from "react-icons/bs";

interface BlogContextType {
  blog: Partial<Post>;
  setBlog: Dispatch<SetStateAction<Partial<Post>>>;
  islikedByUser: boolean;
  setLikeByUser: React.Dispatch<React.SetStateAction<boolean>>;
  issavedByUser: boolean;
  setSaveByUser: React.Dispatch<React.SetStateAction<boolean>>;
  commentWrapper: boolean;
  setCommentWrapper: React.Dispatch<React.SetStateAction<boolean>>;
  totalParentCommentsLoaded: number;
  setTotalParentCommentsLoaded: React.Dispatch<React.SetStateAction<number>>;
}

export const BlogState: Partial<Post> = {
  _id: "",
  blog_id: "",
  topic: "",
  des: "",
  tags: "",
  content: [
    {
      blocks: [],
      time: 0,
      version: "",
    },
  ],
  author: {
    fullname: "",
    username: "",
    profile_picture: "",
  },
  banner: "",
  publishedAt: "",
  activity: {
    total_likes: 0,
    total_comments: 0,
    total_saves: 0,
  },
  views: {
    total: 0,
    daily: "",
    monthly: "",
    yearly: ""
  },
  visibility: "public",
};

export const BlogContext = createContext<BlogContextType | undefined>(
  undefined
);

const BlogPage = () => {
  let { blog_id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(BlogState);
  const [similarBlogs, setSimilarBlogs] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  let { _id, topic, content, banner, author, publishedAt, visibility } = blog;
  const [islikedByUser, setLikeByUser] = useState(false);
  const [issavedByUser, setSaveByUser] = useState(false);
  const [commentWrapper, setCommentWrapper] = useState(false);
  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);

  const fullname = author?.fullname || "Unknown Author";
  const author_username = author?.username || "Unknown Username";
  const profile_picture = author?.profile_picture || "";
  const tagList = Array.isArray(blog.tags)
    ? blog.tags
    : blog.tags
    ? [blog.tags]
    : [];

  const getAuthHeaders = () => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return {};

    try {
      const user = JSON.parse(userStr);
      if (user?.access_token) {
        return {
          Authorization: `Bearer ${user.access_token}`,
          "Content-Type": "application/json",
        };
      }
    } catch (err) {
      console.error("Error parsing user data:", err);
    }

    return { "Content-Type": "application/json" };
  };

  const fetchBlog = async () => {
    try {
      const headers = getAuthHeaders();

      const { data } = await axios.post(
        `${API_BASE_URL}/create-blog/get-blog`,
        { blog_id },
        { headers }
      );

      if (data.blog) {
        const blogData = data.blog;
        blogData.comments = await fetchComments({
          blog_id: blogData._id,
          setParentCommentCountFun: setTotalParentCommentsLoaded,
        });

        setBlog(blogData);
        await incrementView();

        // Fetch similar blogs
        const similarResponse = await axios.post(
          `${API_BASE_URL}/search-blogs`,
          {
            tag: blogData.tags[0],
            limit: 6,
            eliminate_blog: blog_id,
          },
          { headers }
        );

        if (similarResponse.data.blogs) {
          setSimilarBlogs(similarResponse.data.blogs);
        }
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching blog:", err);
      setLoading(false);

      if (err.response?.status === 403) {
        const errorMessage =
          err.response.data.error ||
          "You don't have permission to view this post";
        setError(errorMessage);
        toast.error(errorMessage);
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError("Error loading blog post");
        toast.error("Error loading blog post");
      }
    }
  };

  const incrementView = async () => {
    try {
      const headers = getAuthHeaders();
      const userId = sessionStorage.getItem("userId");

      if (userId) {
        const response = await axios.post(
          `${API_BASE_URL}/create-blog/increment-view`,
          { blog_id, userId },
          { headers }
        );

        if (response.data && response.data.views) {
          setBlog((prev) => ({
            ...prev,
            views: response.data.views,
          }));
        }
      }
    } catch (err) {
      console.error("Error incrementing view:", err);
    }
  };

  useEffect(() => {
    resetState();
    fetchBlog();
  }, [blog_id]);

  const resetState = () => {
    setBlog(BlogState);
    setSimilarBlogs(null);
    setLoading(true);
    setLikeByUser(false);
    setCommentWrapper(false);
    setTotalParentCommentsLoaded(0);
    setError(null);
  };

  if (error) {
    return (
      <AnimationWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-center text-red-500">{error}</p>
        </div>
      </AnimationWrapper>
    );
  }

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider
          value={{
            blog,
            setBlog,
            islikedByUser,
            setLikeByUser,
            issavedByUser,
            setSaveByUser,
            commentWrapper,
            setCommentWrapper,
            totalParentCommentsLoaded,
            setTotalParentCommentsLoaded,
          }}
        >
          <CommentsContainer />

          <div className="blogpage">
            <img src={banner} alt="banner" style={{ aspectRatio: "16/9" }} />

            <div className="mt-2">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex justify-content-start align-items-center">
                  <h2 className="mt-4 fs-3 mb-0">{topic}</h2>
                  <p className="mb-0 ms-3 mt-4 "></p>
                </div>
              </div>

              <div className="detail-user d-flex justify-content-between my-4">
                <div className="d-flex gap-2 align-items-start">
                  <img
                    src={profile_picture}
                    alt=""
                    className="rounded-circle"
                    style={{ width: "3rem", height: "3rem" }}
                  />

                  <p className="m-0" style={{ textTransform: "capitalize" }}>
                    {fullname}
                    <br />@
                    <Link
                      to={`/user/${author?._id}`}
                      className="underline"
                      style={{ color: "inherit" }}
                    >
                      {author_username}
                    </Link>
                    <BsDot style={{ marginRight: "5px" }} />
                    {publishedAt
                      ? `${getDay(publishedAt)} ${
                          new Date(publishedAt).getFullYear() + 543
                        } เวลา ${new Date(publishedAt).toLocaleTimeString(
                          "th-TH",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}`
                      : "ไม่ทราบวันที่"}
                  </p>
                  <p className="mb-0 ms-3 mt-4 ">
                    <BsDot style={{ marginRight: "5px" }} />
                    <FaEye
                      style={{ fontSize: "20px", marginRight: "0.1rem" }}
                    />{" "}
                    {blog?.views?.total || 0}
                    {visibility === "followers" ? (
                      <>
                        <FaUserAlt
                          style={{
                            marginRight: "0.2rem",
                            marginLeft: "0.5rem",
                          }}
                        />
                        ผู้ติดตาม
                      </>
                    ) : (
                      <>
                        <FaEarthAmericas
                          style={{
                            marginRight: "0.2rem",
                            marginLeft: "0.5rem",
                          }}
                        />
                        สาธารณะ
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="my-4 blog-page-content">
              {content &&
              Array.isArray(content[0].blocks) &&
              content[0].blocks.length > 0
                ? content[0].blocks.map((block, i) => (
                    <div key={i} className="my-2 md:my-8">
                      <BlogContent block={block} />
                    </div>
                  ))
                : // <p>No content available</p>
                  null}
            </div>
            <div className="d-flex gap-3 mt-3 tags-description">
              {tagList.map((tag: string, index: number) => (
                <span key={index} className="btn-light">
                  {tag}
                </span>
              ))}
            </div>
            <BlogInteraction />
            

            <CommentsContainer />

            {similarBlogs !== null && similarBlogs.length ? (
              <>
                <h1 className="mt-4 mb-2 fw-medium fs-4">บล็อกที่คล้ายกัน</h1>
                {similarBlogs.map((blog, i) => {
                  const author = blog.author || {
                    fullname: "Unknown Author",
                    username: "unknown",
                    profile_picture: "default_profile_picture_url",
                  };

                  const {
                    fullname,
                    username: author_username,
                    profile_picture,
                  } = author;

                  return (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.08 }}
                    >
                      <BlogCard
                        content={blog}
                        author={{
                          fullname,
                          username: author_username,
                          profile_picture,
                        }}
                      />
                    </AnimationWrapper>
                  );
                })}
              </>
            ) : null}
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
