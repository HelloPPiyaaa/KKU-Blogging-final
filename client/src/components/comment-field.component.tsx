import { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import { BlogContext } from "../Screens/blog.page";
import axios from "axios";
import { API_BASE_URL } from "../api/post";

interface CommentFieldProps {
  action: string;
  index?: number;
  replyingTo?: string;
  setReplying?: React.Dispatch<React.SetStateAction<boolean>>;
}

const CommentField = ({
  action,
  index = undefined,
  replyingTo = undefined,
  setReplying = () => {}
}: CommentFieldProps) => {
  const [comment, setComment] = useState("");

  const blogContext = useContext(BlogContext);
  let {
    userAuth: { access_token, username, fullname, profile_picture }
  } = useContext(UserContext);

  if (!blogContext) {
    return null;
  }
  const {
    blog,
    blog: {
      _id,
      author,
      comments,
      comments: { results: commentsArr } = { results: [] },
      activity,
      activity: blogActivity
    },
    setBlog,
    setTotalParentCommentsLoaded
  } = blogContext;

  const blog_author = author?._id;
  const total_comments = blogActivity?.total_comments || 0;
  const total_parent_comments = blogActivity?.total_parent_comments || 0;

  const handleComment = () => {
    if (!access_token) {
      return toast.error("เข้าสู่ระบบเพื่อแสดงความคิดเห็น");
    }
    if (!comment.length) {
      return toast.error("เขียนอะไรบางอย่างเพื่อแสดงความคิดเห็น");
    }
    let loadingToast = toast.loading("กำลังคอมเมนต์...");

    axios
      .post(
        API_BASE_URL + "/create-blog/add-comment",
        { _id, blog_author, comment, replying_to: replyingTo },
        {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        }
      )
      .then(({ data }) => {
        toast.dismiss(loadingToast);
        toast.success("สำเร็จ");
        setComment("");
        data.commented_by = { username, profile_picture, fullname, _id: sessionStorage.getItem("userId") ? sessionStorage.getItem("userId") : null };

        let newCommentArr;

        if (replyingTo && index !== undefined) {
          commentsArr[index].children.push(data._id);

          data.childrenLevel = commentsArr[index].childrenLevel + 1;
          data.parentIndex = index;

          commentsArr[index].isReplyingLoaded = true;

          commentsArr.splice(index + 1, 0, data);

          newCommentArr = commentsArr;

          setReplying(false);
        } else {
          data.childrenLevel = 0;
          newCommentArr = [data, ...commentsArr];
        }

        let parentCommentIncrementVal = replyingTo ? 0 : 1;

        setBlog({
          ...blog,
          comments: { ...comments, results: newCommentArr || [] },
          activity: {
            ...activity,
            total_comments: total_comments + 1,
            total_parent_comments: total_parent_comments + parentCommentIncrementVal
          }
        });

        setTotalParentCommentsLoaded((preVal) => preVal + parentCommentIncrementVal);
      })
      .catch((err) => {
        toast.dismiss(loadingToast);
        toast.error(err.response.data.error);
      });
  };
  return (
    <>
      <Toaster />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="แสดงความคิดเห็น..."
        className="input-box comment-area"
      ></textarea>
      <button className="btn-dark mt-3 px-3" onClick={handleComment}>
        {action}
      </button>
    </>
  );
};

export default CommentField;
