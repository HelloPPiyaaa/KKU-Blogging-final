import { useContext } from "react";
import "../misc/blogpage.css";
import { BlogContext } from "../Screens/blog.page";
import { MdClose } from "react-icons/md";
import CommentField from "./comment-field.component";
import axios from "axios";
import { API_BASE_URL } from "../api/post";
import NoDataMessage from "./nodata.component";
import AnimationWrapper from "../Screens/page-animation";
import CommentCard from "./commentcard.component";



export const fetchComments = async ({
  skip = 0,
  blog_id,
  setParentCommentCountFun,
  comment_array = null,
}: {
  skip?: number;
  blog_id: string;
  setParentCommentCountFun: (val: number) => void;
  comment_array?: any[] | null;
}) => {
  let res;

  await axios
    .post<{ childrenLevel?: number }[]>(
      API_BASE_URL + "/create-blog/get-blog-comments",
      { blog_id, skip }
    )
    .then(({ data }) => {
      console.log("Fetched Comments:", data);
      data.map((comment) => {
        comment.childrenLevel = 0;
      });

      // ดึงค่า parent comment ปัจจุบันจาก state แล้วคำนวณจำนวนใหม่
      const newParentCommentCount = data.length;
      setParentCommentCountFun(newParentCommentCount);

      if (comment_array === null) {
        res = { results: data };
      } else {
        res = { results: [...comment_array, ...data] };
      }
    });
  return res;
};

const CommentsContainer = () => {
  const context = useContext(BlogContext);

  // ตรวจสอบว่า context ไม่ใช่ undefined
  if (!context) {
    return null;
  }

  const {
    blog,
    blog: {
      topic,
      comments: { results: commentsArr } = { results: [] },
      _id,
      activity,
    },
    commentWrapper,
    setCommentWrapper,
    totalParentCommentsLoaded,
    setTotalParentCommentsLoaded,
    setBlog,
  } = context;

  const totalParentComments = activity?.total_parent_comments ?? 0;

  const loadmoreComments = async () => {
    if (!_id) {
      console.error("Blog ID is undefined");
      return;
    }

    console.log("Loading more comments..."); // เพิ่มบรรทัดนี้
    console.log("Current Loaded Parent Comments:", totalParentCommentsLoaded);

    let newCommentsArr = await fetchComments({
      skip: totalParentCommentsLoaded,
      blog_id: _id,
      setParentCommentCountFun: setTotalParentCommentsLoaded,
      comment_array: commentsArr,
    });
    setBlog({ ...blog, comments: newCommentsArr });
  };

  return (
    <div
      className={
        "comments-component " +
        (commentWrapper ? "commentWrapper " : "commentWrapper2") +
        " comments-component2"
      }
    >
      <div className="position-relative">
        <h1 className="fw-medium fs-4">ความคิดเห็น</h1>
        <p className="m-0 p-topicincommemt">{topic}</p>

        <button
          onClick={() => setCommentWrapper((preVal) => !preVal)}
          className="position-absolute top-0  d-flex justify-content-center align-items-center rounded-circle "
          style={{
            height: "3rem",
            width: "3rem",
            background: "#f0f0f0",
            right: "0",
          }}
        >
          <MdClose className=" fs-3" />
        </button>
      </div>

      <hr
        className="border-grey my-4"
        style={{ width: "120%", marginLeft: "-1.5rem" }}
      />
      <CommentField action={"แสดงความคิดเห็น"} />

      {commentsArr && commentsArr.length ? (
        commentsArr.map((comment, i) => {
          return (
            <AnimationWrapper key={i}>
              <CommentCard
                index={i}
                leftVal={comment.childrenLevel * 4}
                commentData={comment}
              />
            </AnimationWrapper>
          );
        })
      ) : (
        <NoDataMessage message="ไม่มีความคิดเห็น" />
      )}

      {totalParentComments > totalParentCommentsLoaded && commentsArr && commentsArr.length ? (
        <button
          onClick={loadmoreComments}
          className="p-2 px-3 d-flex align-items-center gap-2 btn-loadmore"
        >
          โหลดเพิ่มเติม
        </button>
      ) : (
        ""
      )}
    </div>
  );
};

export default CommentsContainer;
