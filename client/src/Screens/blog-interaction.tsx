import { useContext, useEffect, useState } from "react";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { FaRegCommentDots } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import { BlogContext } from "./blog.page";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { IoBookmarkOutline } from "react-icons/io5";
import { MdOutlineBookmark } from "react-icons/md";
import LikeModal from "../components/like-modal.component";
import { IoIosWarning } from "react-icons/io";
import { addReport } from "../api/post";
import { Button, Form, Modal } from "react-bootstrap";
import styled from "styled-components";
const StyledModal = styled(Modal)`
  .modal-content {
    border-radius: 12px;
    border: none;
    box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
    padding: 20px;
  }
  .modal-header {
    border-bottom: none;
    font-size: 18px;
    font-weight: bold;
  }
  .modal-footer {
    border-top: none;
    display: flex;
    justify-content: flex-end;
  }
  .btn-primary {
    background-color: #ff7782;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 16px;
    color: white;
  }
  .btn-cancel {
    background-color: #6c757d;
    color: #ffff;
    border: none;
    font-size: 16px;
    padding: 10px 20px;
  }
  .form-check {
    margin-bottom: 10px;
  }
`;

const BlogInteraction = () => {
  const blogContext = useContext(BlogContext);
  const userContext = useContext(UserContext);
  const [showLikesModal, setShowLikesModal] = useState(false);

  const userId = sessionStorage.getItem("userId");
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportSubmittedModal, setShowReportSubmittedModal] =
    useState(false);
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");

  const navigate = useNavigate();

  const handleShowReportModal = (id: string | undefined) => {
    setReportPostId(id || "");
    setShowReportModal(true);
  };
  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setReportPostId(null);
    setReportReason("");
  };
  const handleReportPost = async () => {
    if (reportPostId && reportReason) {
      try {
        if (!userId) {
          throw new Error("User is not logged in.");
        }

        const response = await addReport(reportPostId, reportReason, userId);

        if (response && response.status === 201) {
          toast.success("Report submitted successfully!");
          // ปิด modal รายงานและแสดง modal แจ้งผลสำเร็จ
          handleCloseReportModal();
          setShowReportSubmittedModal(true);
        } else {
          toast.error("Failed to submit the report.");
          handleCloseReportModal();
        }
      } catch (error) {
        console.error("Failed to report post:", error);
        toast.error("An error occurred while submitting the report.");
      }
    } else {
      toast.error("Please enter a reason for the report.");
    }
  };
  if (!blogContext || !userContext) {
    return null;
  }

  const {
    blog,
    blog: { _id, topic, blog_id, activity, activity: blogActivity, author },
    setBlog,
    islikedByUser,
    setLikeByUser,
    issavedByUser,
    setSaveByUser,
    setCommentWrapper,
  } = blogContext;

  const total_likes = blogActivity?.total_likes || 0;
  const total_saves = blogActivity?.total_saves || 0;
  const total_comments = blogActivity?.total_comments || 0;
  const author_username = author?.username || "Unknown";

  let {
    userAuth: { username, access_token },
  } = userContext;

  // const handleLike = () => {
  //   if (access_token) {
  //     setLikeByUser((preVal) => !preVal);
  //     !islikedByUser ? total_likes++ : total_likes--;
  //     setBlog({ ...blog, activity: { ...activity, total_likes } });
  //     console.log(islikedByUser);
  //   } else {
  //     toast.error("กรุณาเข้าสู่ระบบก่อนไลค์บล็อก");
  //   }
  // };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (access_token) {
      axios
        .post(
          `${process.env.REACT_APP_API_ENDPOINT}/create-blog/isliked-by-user`,
          { _id },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
        .then(({ data: { result } }) => {
          setLikeByUser(Boolean(result));
        })
        .catch((err) => {
          console.log(err);
        });
      // ตรวจสอบสถานะการบันทึก (saved-blogs)
      axios
        .get(`${process.env.REACT_APP_API_ENDPOINT}/create-blog/saved-blogs`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
        .then(({ data: { savedBlogs } }) => {
          const isSaved = savedBlogs.some((blog: any) => blog._id === _id);
          setSaveByUser(isSaved); // อัปเดตสถานะการบันทึก
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  const handleLike = () => {
    if (access_token) {
      setLikeByUser(!islikedByUser);

      const newTotalLikes = !islikedByUser ? total_likes + 1 : total_likes - 1;

      setBlog({
        ...blog,
        activity: {
          ...activity,
          total_likes: newTotalLikes,
          total_comments: activity?.total_comments || 0,
        },
      });

      axios
        .post(
          `${process.env.REACT_APP_API_ENDPOINT}/create-blog/like-blog`,
          {
            _id,
            islikedByUser,
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
        .then(({ data }) => {
          console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      toast.error("กรุณาเข้าสู่ระบบก่อนไลค์บล็อก");
    }
  };

  const handleSave = () => {
    if (access_token) {
      setSaveByUser(!issavedByUser);

      const newTotalSave = !issavedByUser ? total_saves + 1 : total_saves - 1;

      setBlog({
        ...blog,
        activity: {
          ...activity,
          total_saves: newTotalSave,
          total_comments: activity?.total_comments || 0,
        },
      });

      axios
        .post(
          `${process.env.REACT_APP_API_ENDPOINT}/create-blog/save-blog`,
          {
            _id,
            issavedByUser,
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
        .then(({ data }) => {
          console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      toast.error("กรุณาเข้าสู่ระบบก่อนบันทึกบล็อก");
    }
  };

  return (
    <>
      <Toaster />
      <hr className="border-grey my-2" />

      <div className="d-flex gap-2 justify-content-between">
        <div className="d-flex gap-2 align-items-center">
          <button
            className={
              "rounded-circle d-flex align-items-center justify-content-center " +
              (islikedByUser ? "liked" : "not-liked")
            }
            style={{
              width: "2.5rem",
              height: "2.5rem",
            }}
            onClick={handleLike}
          >
            {islikedByUser ? <FaHeart /> : <FaRegHeart />}
          </button>
          <button
            className="m-0"
            style={{ color: "#494949" }}
            onClick={() => setShowLikesModal(true)}
          >
            {total_likes}
          </button>

          <button
            onClick={() => setCommentWrapper((preVal) => !preVal)}
            className="rounded-circle d-flex align-items-center justify-content-center "
            style={{
              width: "2.5rem",
              height: "2.5rem",
              backgroundColor: "#f0f0f1",
            }}
          >
            <FaRegCommentDots />
          </button>
          <p className="m-0" style={{ color: "#494949" }}>
            {total_comments}
          </p>

          <button
            className={
              "rounded-circle d-flex align-items-center justify-content-center " +
              (issavedByUser ? "saved" : "not-saved")
            }
            style={{
              width: "2.5rem",
              height: "2.5rem",
              backgroundColor: "#f0f0f0",
            }}
            onClick={handleSave}
          >
            {issavedByUser ? <MdOutlineBookmark /> : <IoBookmarkOutline />}
          </button>
        </div>

        <div className="d-flex gap-2 align-items-center">
          {username === author_username ? (
            <Link
              to={`/editor/${blog_id}`}
              className="underline text-purple"
              style={{
                color: "inherit",
              }}
            >
              แก้ไข
            </Link>
          ) : (
            ""
          )}
          <div className="m-0 published-detail">
            {/* Only show the "Report Issue" button if the current user is not the author */}
            {userId !== author?._id && (
              <IoIosWarning
                style={{
                  fontSize: "22px",
                  marginTop: "2px",
                  marginBottom: "2px",
                  color:"black",
                  cursor: "pointer", 
                  transition: "0.2s", 
                }}
                onClick={() => handleShowReportModal(_id)}
              />
            )}
          </div>

          <Link
            to={`https://twitter.com/intent/tweet?text=Read ${topic}&url=${window.location.href}`}
            style={{
              color: "inherit",
              
            }}
          >
            <FaTwitter className="text-twitter" style={{fontSize: "20px", color:"black",}}/>
          </Link>
        </div>
      </div>
      {/* Report Modal */}
      <StyledModal
        show={showReportModal}
        onHide={handleCloseReportModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>รายงานปัญหา</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              {[
                "เนื้อหาไม่เหมาะสม",
                "เนื้อหามีการกลั่นแกล้งหรือคุกคาม",
                "เนื้อหามีการขายหรือส่งเสริมสินค้าต้องห้าม",
                "ข้อมูลเท็จ",
                "การแอบอ้างบุคคลอื่น",
                "สแปม",
              ].map((reason, index) => (
                <Form.Check
                  key={index}
                  type="radio"
                  label={reason}
                  name="reportReason"
                  value={reason}
                  onChange={(e) => setReportReason(e.target.value)}
                  checked={reportReason === reason}
                />
              ))}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-cancel" onClick={handleCloseReportModal}>
            ยกเลิก
          </Button>
          <Button className="btn-primary" onClick={handleReportPost}>
            รายงานปัญหา
          </Button>
        </Modal.Footer>
      </StyledModal>

      {/* Report Submitted Modal */}
      <StyledModal
        show={showReportSubmittedModal}
        onHide={() => setShowReportSubmittedModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>รายงานปัญหาสำเร็จ</Modal.Title>
        </Modal.Header>
        <Modal.Body>รายงานปัญหาของคุณได้รับการส่งเรียบร้อยแล้ว</Modal.Body>
        <Modal.Footer>
          <Button
            className="btn-cancel"
            onClick={() => setShowReportSubmittedModal(false)}
          >
            ปิด
          </Button>
          <Button
            className="btn-primary"
            onClick={() => navigate("/dashboard/reportcheck")}
          >
            ดูการรายงาน
          </Button>
        </Modal.Footer>
      </StyledModal>

      <LikeModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        postId={_id || ""}
        accessToken={access_token || ""}
      />
      <hr className="border-grey my-2" />
    </>
  );
};

export default BlogInteraction;
