import { useContext, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";

const NotificationCommentField = ({
  _id,
  blog_author,
  index = undefined,
  replyingTo = undefined,
  setReplying,
  notification_id,
  notificationData,
}: {
  _id: string;
  blog_author: { _id: string };
  setReplying: (replying: boolean) => void;
  notification_id: string;
  notificationData: any;
  index?: number;
  replyingTo?: string;
}) => {
  let [comment, setComment] = useState("");
  let { _id: user_id } = blog_author;
  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  let {
    notifications,
    notifications: { result },
    setNotifications,
  } = notificationData;

  const handleComment = () => {
    if (!comment.length) {
      return toast.error("เขียนอะไรบางอย่างเพื่อแสดงความคิดเห็น");
    }

    axios
      .post(
        `${process.env.REACT_APP_API_ENDPOINT}/create-blog/add-comment`,
        {
          _id,
          blog_author: user_id,
          comment,
          replying_to: replyingTo,
          notification_id,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        setReplying(false);
        result[index || ""].reply = { comment, _id: data._id };
        setNotifications({ ...notifications, result });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <Toaster />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="ตอบกลับ..."
        className="input-box comment-area"
      ></textarea>
      <button className="btn-dark mt-3 px-3" onClick={handleComment}>
        ตอบกลับ
      </button>
    </>
  );
};

export default NotificationCommentField;
