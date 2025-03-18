import { useContext, useState } from "react";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import CommentField from "./comment-field.component";
import { FaRegCommentDots, FaEdit, FaTrashAlt } from "react-icons/fa";
import { BlogContext } from "../Screens/blog.page";
import axios from "axios";
import { API_BASE_URL } from "../api/post";

interface CommentCardProps {
  index: number;
  leftVal: number;
  commentData: {
    comment: string;
    commented_by: {
      profile_picture: string;
      fullname: string;
      username: string;
      _id?: string;
    };
    commentedAt?: string;
    _id?: string;
    isReplyingLoaded?: boolean;
    childrenLevel: number;
    children?: string[];
  };
}

const CommentCard = ({ index, leftVal, commentData }: CommentCardProps) => {
  let {
    commented_by: { profile_picture, fullname, username, _id: commentedById },
    comment,
    _id,
    commentedAt,
    children = []
  } = commentData;

  let {
    userAuth: { access_token }
  } = useContext(UserContext);

  const [isReplying, setReplying] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment);
  const [isDeleting, setDeleting] = useState(false); // State for handling the delete confirmation

  const context = useContext(BlogContext);

  if (!context) {
    return null;
  }

  let {
    blog,
    blog: { comments, comments: { results: commentArr } = { results: [] } },
    setBlog
  } = context;
  const handleReplyClick = () => {
    if (!access_token) {
      return;
    }
    setReplying((preVal) => !preVal);
  };

  const handleEditClick = () => {
    if (!access_token || isEditing || isDeleting) {
      return; // Disable edit if already editing or deleting
    }
    setEditing(true);
  };

  const handleSaveEdit = () => {
    axios
      .patch(API_BASE_URL + "/create-blog/update-comment", { _id, comment: editedComment }, {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      })
      .then(() => {
        setEditing(false);
        // Update the comment in the context
        commentArr[index].comment = editedComment;
        setBlog({ ...blog, comments: { results: commentArr } });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleDeleteClick = () => {
    if (!access_token || isEditing || isDeleting) {
      return; // Disable delete if already editing or deleting
    }
    setDeleting(true); // Show the delete confirmation
  };

  const confirmDelete = () => {
    axios
      .post(API_BASE_URL + "/create-blog/delete-comment", { _id }, {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      })
      .then((res) => {
        // Remove the comment from the context
        commentArr.splice(index, 1);
        const updatedActivity = blog.activity
          ? {
            ...blog.activity,
            total_comments: (blog.activity.total_comments || 0) - res.data.totalCommentsToDelete
          }
          : { total_comments: 0 };
        setBlog({ ...blog, comments: { results: commentArr }, activity: updatedActivity });
      })
      .catch((err) => {
        console.log(err);
      });
    setDeleting(false); // Hide the delete confirmation
  };

  const cancelDelete = () => {
    setDeleting(false); // Hide the delete confirmation if cancelled
  };

  const removeCommentsCards = (startingPoint: number) => {
    if (commentArr[startingPoint]) {
      while (commentArr[startingPoint].childrenLevel > commentData.childrenLevel) {
        commentArr.splice(startingPoint, 1);

        if (!commentArr[startingPoint]) {
          break;
        }
      }
    }
    setBlog({ ...blog, comments: { results: commentArr } });
  };

  const hideReplies = () => {
    commentData.isReplyingLoaded = false;
    removeCommentsCards(index + 1);
  };

  const loadReplies = ({ skip = 0 }) => {
    if (children.length) {
      hideReplies();

      axios
        .post(API_BASE_URL + "/create-blog/get-replies", { _id, skip })
        .then(({ data: { replies } }) => {
          commentData.isReplyingLoaded = true;
          for (let i = 0; i < replies.length; i++) {
            replies[i].childrenLevel = commentData.childrenLevel + 1;

            commentArr.splice(index + 1 + i + skip, 0, replies[i]);
          }

          setBlog({ ...blog, comments: { ...comments, results: commentArr } });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <div className="w-100" style={{ paddingLeft: `${leftVal * 10}px` }}>
      <div className="my-3 p-3" style={{ borderRadius: "0.375rem", border: "1px solid #f0f0f0" }}>
        <div className="d-flex gap-3 align-items-center mb-4">
          <img
            src={profile_picture}
            alt=""
            className="rounded-circle"
            style={{ width: "1.5rem", height: "1.5rem" }}
          />

          <p
            className="m-0"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: "1",
              overflow: "hidden"
            }}
          >
            {fullname} @{username}
          </p>
          <p className="m-0" style={{ minWidth: "fit-content" }}>
            {getDay(commentedAt || "ไม่ทราบวันที่")}
          </p>
        </div>

        {isEditing ? (
          <div>
            <textarea
              value={editedComment}
              onChange={(e) => setEditedComment(e.target.value)}
              rows={3}
              className="form-control"
              style={{
                padding: "10px",
                borderRadius: "0.375rem",
                border: "1px solid #ccc"
              }}
            />
            <div className="d-flex gap-2 mt-2">
              <button
                className="btn btn-primary flex-fill"
                onClick={handleSaveEdit}
                style={{
                  backgroundColor: "black", // พื้นหลังสีดำ
                  color: "white", // ตัวอักษรเป็นสีขาว
                  border: "1px solid black", // ขอบปุ่มสีดำ
                  borderRadius: "30px", // ขอบโค้ง
                  padding: "0.65rem 0.75rem", // การปรับขนาดปุ่ม
                  fontWeight: 500, // ตัวอักษรหนาขึ้นเล็กน้อย
                  cursor: "pointer" // แสดงเคอร์เซอร์เป็นมือเมื่อชี้ไปที่ปุ่ม
                }}
              >
                บันทึกการแก้ไข
              </button>
              <button
                className="btn btn-secondary flex-fill"
                onClick={() => {
                  setEditedComment(comment); // ยกเลิกการแก้ไข
                  setEditing(false); // ปิดโหมดการแก้ไข
                }}
                style={{
                  borderRadius: "30px", // ขอบโค้ง
                  padding: "0.65rem 0.75rem", // การปรับขนาดปุ่ม
                  fontWeight: 500, // ตัวอักษรหนาขึ้นเล็กน้อย
                  cursor: "pointer" // แสดงเคอร์เซอร์เป็นมือเมื่อชี้ไปที่ปุ่ม
                }}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        ) : (
          <p className="m-0 ml-3">{comment}</p>
        )}

        {/* Confirm delete button moved here */}
        {isDeleting && (
          <div className="mt-3 mb-3">
            <div className="d-flex gap-2">
              <button
                style={{
                  backgroundColor: "black", // พื้นหลังสีดำ
                  color: "white", // ตัวอักษรเป็นสีขาว
                  border: "1px solid black", // ขอบปุ่มสีดำ
                  borderRadius: "30px", // ขอบโค้ง
                  padding: "0.65rem 0.75rem", // การปรับขนาดปุ่ม
                  fontWeight: 500, // ตัวอักษรหนาขึ้นเล็กน้อย
                  cursor: "pointer" // แสดงเคอร์เซอร์เป็นมือเมื่อชี้ไปที่ปุ่ม
                }}
                className="btn btn-danger flex-fill"
                onClick={confirmDelete}
              >
                ยืนยันการลบ
              </button>
              <button
                className="btn btn-secondary flex-fill"
                onClick={cancelDelete}
                style={{
                  borderRadius: "30px", // ขอบโค้ง
                  padding: "0.65rem 0.75rem", // การปรับขนาดปุ่ม
                  fontWeight: 500, // ตัวอักษรหนาขึ้นเล็กน้อย
                  cursor: "pointer" // แสดงเคอร์เซอร์เป็นมือเมื่อชี้ไปที่ปุ่ม
                }}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        <div className="d-flex gap-3 align-items-center mt-2" onClick={hideReplies}>
          {commentData.isReplyingLoaded ? (
            <button className="p-2 px-3 d-flex align-items-center gap-2 text-hide">
              <FaRegCommentDots />
              ซ่อนการตอบกลับ
            </button>
          ) : (
            <button
              className="p-2 px-3 d-flex align-items-center gap-2 text-hide"
              onClick={() => loadReplies({ skip: 0 })}
            >
              <FaRegCommentDots />
              {children.length}ตอบกลับ
            </button>
          )}
          <button
            className="text-decoration-underline"
            onClick={handleReplyClick}
            disabled={isEditing || isDeleting} // Disable if editing or deleting
          >
            ตอบกลับ
          </button>

          {commentData.commented_by._id == sessionStorage.getItem("userId") ?
            <>
              <button
                className="text-decoration-underline"
                onClick={handleEditClick}
                disabled={isEditing || isDeleting}
              >
                แก้ไข
              </button>
              <button
                className="text-decoration-underline"
                onClick={handleDeleteClick}
                disabled={isEditing || isDeleting}
              >
                ลบ
              </button>
            </>
            : null}

        </div>

        {isReplying ? (
          <div className="mt-4">
            <CommentField
              action="ตอบกลับ"
              index={index}
              replyingTo={_id}
              setReplying={setReplying}
            />
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default CommentCard;
