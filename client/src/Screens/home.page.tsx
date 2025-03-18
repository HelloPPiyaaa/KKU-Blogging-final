import AnimationWrapper from "./page-animation";
import InPageNavigation from "../components/Inpage-navigation";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import { Post } from "../types/post";
import BlogCard from "../components/blogpost.component";
import MinimalBlogPost from "./nobanner-blog";
import { MdAutoGraph } from "react-icons/md";
import { activeTabRef } from "../components/Inpage-navigation";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../components/filter-pagination";
import LoadMoreDataBtn from "../components/load-more.component";
import { FaTags } from "react-icons/fa";

interface BlogState {
  result: Post[];
  totalDocs: number;
  page: number;
}

const HomePage = () => {
  const API_URL =
    process.env.REACT_APP_API_ENDPOINT ||
    "https://kku-blog-server-ak2l.onrender.com";
  const [recommend, setRecommend] = useState<BlogState | null>(null);
  const [blogs, setBlogs] = useState<BlogState | null>(null);
  const [uniqueBlogs, setUniqueBlogs] = useState<BlogState | null>(null);
  const [trendingBlogs, setTrendingBlogs] = useState<Post[] | null>(null);
  const [pageState, setPageState] = useState("หน้าหลัก");
  const [allTags, setAllTags] = useState<string[]>([]);

  const getUniqueTags = (posts: Post[]): string[] => {
    const tagCount: Record<string, number> = {};

    // นับจำนวนครั้งที่แต่ละแท็กถูกใช้
    posts.forEach((post) => {
      if (Array.isArray(post.tags)) {
        // ตรวจสอบว่า tags เป็น array หรือไม่
        post.tags.forEach((tag: string) => {
          if (tag) {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          }
        });
      } else if (typeof post.tags === "string" && post.tags) {
        // ถ้าเป็น string ให้แปลงเป็น array
        tagCount[post.tags] = (tagCount[post.tags] || 0) + 1;
      }
    });

    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  };

  const loadBlogBycategory = (e: React.MouseEvent<HTMLButtonElement>) => {
    const categories = (
      e.currentTarget as HTMLButtonElement
    ).innerText.toLowerCase();
    setBlogs(null);

    if (pageState === categories) {
      setPageState("หน้าหลัก");
      return;
    }
    setPageState(categories);
  };

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

  const fetchLatestBlogs = ({ page = 1 }) => {
    const headers = getAuthHeaders();
    axios
      .post(API_URL + "/posts/latest-blog", { page }, { headers })
      .then(async ({ data }) => {
        console.log(data.blogs);

        let formatData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/posts/all-latest-blogs-count",
        });
        const uniqueTags = getUniqueTags(data.blogs);
        setAllTags(uniqueTags);
        setBlogs(formatData);

        console.log(formatData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchBlogsByCategory = ({ page = 1 }) => {
    axios
      .post(API_URL + "/search-blogs", { tag: pageState, page })
      .then(async ({ data }) => {
        let formatData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { tag: pageState },
        });

        setBlogs(formatData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchTrendingBlogs = () => {
    axios
      .get(API_URL + "/posts/trending-blogs")
      .then(({ data }) => {
        setTrendingBlogs(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // recommend
  useEffect(() => {
    const headers = getAuthHeaders();

    axios
      .post(API_URL + "/posts/blog-recommends", {}, { headers })
      .then(async ({ data }) => {
        let formatData = await filterPaginationData({
          state: recommend,
          data: data.blogs,
          page: 1,
          countRoute: "/posts/all-latest-blogs-count",
        });

        setRecommend(formatData);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    if (recommend?.result && blogs?.result) {
      const combinedBlogs = [...recommend.result, ...blogs.result];

      const uniqueBlogsResult = combinedBlogs.reduce((acc, blog) => {
        if (!acc.some((b) => b.blog_id === blog.blog_id)) {
          acc.push(blog);
        }
        return acc;
      }, [] as Post[]);

      const totalDocs = uniqueBlogsResult.length;

      const page = recommend?.page ?? blogs?.page ?? 1;

      setUniqueBlogs({
        result: uniqueBlogsResult,
        totalDocs,
        page,
      });
    } else {
      setUniqueBlogs(blogs);
    }
  }, [recommend, blogs]);

  useEffect(() => {
    activeTabRef.current?.click();

    if (pageState === "หน้าหลัก") {
      fetchLatestBlogs({ page: 1 });
    } else {
      fetchBlogsByCategory({ page: 1 });
    }

    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [pageState]);

  return (
    <AnimationWrapper>
      <section
        className="h-cover d-flex justify-content-center"
        style={{ gap: "2.5rem" }}
      >
        <div className="w-100">
          <InPageNavigation
            routes={[pageState, "บล็อกยอดนิยม"]}
            defaultHidden={["บล็อกยอดนิยม"]}
          >
            <>
              {blogs === null ? (
                <Loader />
              ) : uniqueBlogs?.result.length ? (
                uniqueBlogs?.result.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <BlogCard content={blog} author={blog.author} />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message="ไม่มีบล็อกที่เผยแพร่" />
              )}
              <LoadMoreDataBtn
                state={blogs}
                fetchDataFun={
                  pageState === "หน้าหลัก"
                    ? fetchLatestBlogs
                    : fetchBlogsByCategory
                }
              />
            </>
            {trendingBlogs === null ? (
              <Loader />
            ) : trendingBlogs.length ? (
              trendingBlogs.map((blog, i) => {
                return (
                  <AnimationWrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                    key={i}
                  >
                    <MinimalBlogPost blog={blog} index={i} />
                  </AnimationWrapper>
                );
              })
            ) : (
              <NoDataMessage message="ไม่มีบล็อกที่ติดเทรนด์" />
            )}
          </InPageNavigation>
        </div>
        <div
          className="trending-blog"
          style={{
            position: "relative", // ทำให้แน่ใจว่า position ของ container ถูกกำหนด
            zIndex: 10,
            top: 0,
          }}
        >
          <div
            className="d-flex flex-column gap-3 "
            style={{
              position: "sticky", // กำหนด sticky ให้แท็ก
              top: "20px", // ตำแหน่งที่มันจะอยู่เมื่อ scroll
              zIndex: 10, // ควบคุมชั้นการแสดงผล
              backgroundColor: "#fff", // เพิ่มพื้นหลังเพื่อไม่ให้เกิดปัญหาการทับซ้อน
            }}
          >
            <div>
              <h1 className="fw-medium mb-3 fs-5">
                แท็กยอดนิยม
                <FaTags
                  style={{
                    fontSize: "20px",
                    marginBottom: "5px",
                    marginLeft: "7px",
                  }}
                />
              </h1>

              <div
                className="d-flex gap-3 flex-wrap tag-blogpage"
                style={{
                  position: "sticky", // sticky ให้กับแท็ก
                  top: "60px", // ตำแหน่งที่แท็กจะยึดติด
                  zIndex: 9,
                }}
              >
                {allTags.map((tag, i) => (
                  <button
                    onClick={loadBlogBycategory}
                    className={pageState === tag ? "tag changeColor" : "tag"}
                    key={i}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                position: "sticky",
                top: "100px", // ปรับตำแหน่งของเนื้อหาถัดไป
                zIndex: 10,
                backgroundColor: "#fff",
              }}
            >
              <h1
                className="fw-medium mb-3 fs-5"
                style={{ position: "sticky", top: "20px", zIndex: "10" }}
              >
                บล็อกที่มีคนถูกใจมากที่สุด{" "}
                <MdAutoGraph
                  style={{ fontSize: "25px", marginBottom: "5px" }}
                />
              </h1>

              {trendingBlogs === null ? (
                <Loader />
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <MinimalBlogPost blog={blog} index={i} />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message="ไม่มีบล็อกที่ติดเทรนด์" />
              )}
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
