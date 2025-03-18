import { useParams } from "react-router-dom";
import InPageNavigation from "../components/Inpage-navigation";
import { useEffect, useState } from "react";
import { Post } from "../types/post";
import Loader from "../components/loader.component";
import AnimationWrapper from "./page-animation";
import BlogCard from "../components/blogpost.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import axios from "axios";
import { API_BASE_URL } from "../api/post";
import { filterPaginationData } from "../components/filter-pagination";
import { User } from "../types/user";
import UserCard from "../components/usercard.component";
import { LuUser2 } from "react-icons/lu";
import { Link } from "react-router-dom";


interface BlogState {
  result: Post[];
  totalDocs: number;
  page: number;
}

const SearchPage = () => {
  const { query } = useParams();
  const [blogs, setBlogs] = useState<BlogState | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);

  const searchBlog = ({ page = 1, create_new_arr = false }) => {
    axios
      .post(API_BASE_URL + "/search-blogs", { query, page })
      .then(async ({ data }) => {
        console.log(data.blogs);

        let formatData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { query },
          create_new_arr,
        });
        setBlogs(formatData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchUsers = () => {
    axios
      .post(API_BASE_URL + "/search-users", { query })
      .then(({ data: { users } }) => {
        console.log(users);
        setUsers(users);
      });
  };

  useEffect(() => {
    resetState();
    searchBlog({ page: 1, create_new_arr: true });
    fetchUsers();
  }, [query]);

  const resetState = () => {
    setBlogs(null);
    setUsers(null);
  };



const UserCardWrapper = () => {
  return (
    <>
      {users === null ? (
        <Loader />
      ) : users.length > 0 ? (
        users.map((user, i) => (
          <AnimationWrapper
            key={i}
            transition={{ duration: 1, delay: i * 0.08 }}
          >
            <Link
              to={`/user/${user._id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <UserCard user={user} />
            </Link>
          </AnimationWrapper>
        ))
      ) : (
        <NoDataMessage message="ไม่พบผู้ใช้" />
      )}
    </>
  );
};

  
  return (
    <section className="h-cover d-flex justify-content-center gap-2">
      <div className="w-100">
        <InPageNavigation
          routes={[`ผลลัพธ์การค้นหาจาก "${query}"`, "บัญชีที่พบ"]}
          defaultHidden={["บัญชีที่พบ"]}
        >
          <>
            {blogs === null ? (
              <Loader />
            ) : blogs.result.length ? (
              blogs.result.map((blog, i) => {
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
            <LoadMoreDataBtn state={blogs} fetchDataFun={searchBlog} />
          </>

          <UserCardWrapper />
        </InPageNavigation>
      </div>

      <div className="userSearch">
        <h1 className="fw-medium mb-4" style={{ fontSize: "16px" }}>
          User to search <LuUser2 />
        </h1>
        <UserCardWrapper />
      </div>
    </section>
  );
};

export default SearchPage;
