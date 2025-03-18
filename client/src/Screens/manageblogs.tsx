import {
  ChangeEvent,
  useContext,
  useEffect,
  useState,
  KeyboardEvent,
} from "react";
import { UserContext } from "../App";
import axios from "axios";
import { filterPaginationData } from "../components/filter-pagination";
import { Toaster } from "react-hot-toast";
import { IoIosSearch } from "react-icons/io";
import "../misc/blogpage.css";
import InpageNavigation from "../components/Inpage-navigation";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "./page-animation";
import {
  ManageDraftBlogPost,
  ManagePublishedBlogCard,
  SaveBlog,
} from "../components/manage-blogcard.component";
import LoadMoreDataBtn from "../components/load-more.component";
import { useSearchParams } from "react-router-dom";

interface GetBlogsParams {
  page: number;
  draft: boolean;
  deleteDocCount?: number;
}

interface Blog {
  blog_id: string;
  topic: string;
  publishedAt: string;
  activity: { [key: string]: number };
  des?: string;
}

interface BlogsResponse {
  result: Blog[];
  deleteDocCount: number;
}

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState<BlogsResponse | null>(null);
  const [drafts, setDraft] = useState<BlogsResponse | null>(null);
  const [save, setSave] = useState<BlogsResponse | null>(null);
  const [query, setQuery] = useState("");

  let activeTab = useSearchParams()[0].get("tab");

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  const getBlogs = ({ page, draft, deleteDocCount = 0 }: GetBlogsParams) => {
    axios
      .post(
        `${process.env.REACT_APP_API_ENDPOINT}/create-blog/user-written-blog`,
        {
          page,
          draft,
          query,
          deleteDocCount,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: draft ? drafts : draft === null ? save : blogs, // เช็คให้แน่ใจว่า state เป็นสิ่งที่เหมาะสม
          save: blogs, // ส่ง save เป็น parameter ให้ถูกต้อง
          data: data.blogs,
          page,
          user: access_token || undefined,
          countRoute: "/create-blog/user-written-blog-count",
          data_to_send: { draft, query },
        });
        console.log("draft" + draft, formatedData);
        if (draft) {
          setDraft(formatedData);
        } else if (save === null) {
          setSave(formatedData);
        } else {
          setBlogs(formatedData);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (access_token) {
      if (blogs === null) {
        getBlogs({ page: 1, draft: false });
      }
      if (drafts === null) {
        getBlogs({ page: 1, draft: true });
      }
    }
  }, [access_token, blogs, drafts, query]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement> & KeyboardEvent<HTMLInputElement>
  ) => {
    let searchQuery = e.target.value;
    setQuery(searchQuery);

    if (e.key === "Enter" && searchQuery.length) {
      setBlogs(null);
      setDraft(null);
    }
  };

  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;

    if (!target.value.length) {
      setQuery("");
      setBlogs(null);
      setDraft(null);
    }
  };

  return (
    <>
      <h1 className="topic-mangeBlog">จัดการบล็อก</h1>
      <Toaster />

      <div className="position-relative search-mangepage">
        <input
          type="search"
          className="w-100 search-input"
          style={{ background: "#f0f0f0" }}
          placeholder="Search Blogs..."
          onChange={handleChange}
          onKeyDown={handleSearch}
        />

        <IoIosSearch className="position-absolute iosearch" />
      </div>

      <InpageNavigation
        routes={["บล็อกที่เผยแพร่แล้ว", "บล็อกที่บันทึกร่าง", "บล็อกที่บันทึก"]}
        defaultActiveIndex={activeTab !== "draft" ? 0 : 1}
      >
        {blogs === null ? (
          <Loader />
        ) : blogs.result.length ? (
          <>
            {blogs.result.map((blog, i) => {
              return (
                <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                  <ManagePublishedBlogCard
                    blog={{ ...blog, index: i, setStateFunc: setBlogs }}
                  />
                </AnimationWrapper>
              );
            })}
            <LoadMoreDataBtn
              state={blogs}
              fetchDataFun={getBlogs}
              additionalParam={{
                drafts: false,
                deleteDocCount: blogs.deleteDocCount,
              }}
            />
          </>
        ) : (
          <NoDataMessage message="ไม่มีบล็อกที่เผยแพร่" />
        )}

        {drafts === null ? (
          <Loader />
        ) : drafts.result.length ? (
          <>
            {drafts.result.map((blog, i) => {
              return (
                <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                  <ManageDraftBlogPost
                    blog={{ ...blog, index: i, setStateFunc: setDraft }}
                  />
                </AnimationWrapper>
              );
            })}
            <LoadMoreDataBtn
              state={drafts}
              fetchDataFun={getBlogs}
              additionalParam={{
                drafts: true,
                deleteDocCount: drafts.deleteDocCount,
              }}
            />
          </>
        ) : (
          <NoDataMessage message="ไม่มีบล็อกที่ร่างไว้" />
        )}

        {save === null ? (
          <Loader />
        ) : save.result.length ? (
          <>
            {save.result.map((blog, index) => (
              <SaveBlog key={index} blog={blog} />
            ))}
            <LoadMoreDataBtn
              state={save}
              fetchDataFun={getBlogs}
              additionalParam={{
                drafts: false,
                deleteDocCount: save.deleteDocCount,
              }}
            />
          </>
        ) : (
          <NoDataMessage message="ไม่มีบล็อกที่บันทึก" />
        )}
      </InpageNavigation>
    </>
  );
};

export default ManageBlogs;
