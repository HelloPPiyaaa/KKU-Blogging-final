// import React, { useEffect, useState } from "react";
// import { Post } from "../types/post";
// import {
//   addComment,
//   deleteComment,
//   deleteReply,
//   getPostById,
//   likePost,
//   Replycomment,
// } from "../api/post";
// import { useParams, useNavigate } from "react-router-dom";
// import dayjs from "dayjs";
// import { Dropdown, Image } from "react-bootstrap";
// import "../misc/content.css";
// import Col from "react-bootstrap/Col";
// import { GoHeartFill } from "react-icons/go";
// import { IoIosSend } from "react-icons/io";
// import { TiEye } from "react-icons/ti";
// import { IoBookmark } from "react-icons/io5";
// import moment from "moment";
// import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
// import { BsEmojiSmile } from "react-icons/bs";
// import { GiphyFetch } from "@giphy/js-fetch-api";
// import { Grid } from "@giphy/react-components";
// import { IGif } from "@giphy/js-types";
// import { PiGif } from "react-icons/pi";
// import { fetchUserProfile } from "../api/profile";
// import { TfiMoreAlt } from "react-icons/tfi";

// const gf = new GiphyFetch("TCp1TwZ7cSYa5MGmKp0BtZj9pOOIJ9SM");

// const Content = () => {
//   let { id } = useParams();
//   const navigate = useNavigate();

//   const [post, setPost] = useState<Post | undefined>(undefined);
//   const [loading, setLoading] = useState(true);
//   const [comment, setComment] = useState<string>("");
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [userProfilePicture, setUserProfilePicture] = useState<string>("");
//   const [showGifPicker, setShowGifPicker] = useState(false);
//   const [selectedGif, setSelectedGif] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [showDropdown, setShowDropdown] = useState<string | null>(null);
//   const [replyingCommentId, setReplyingCommentId] = useState<string | null>(
//     null
//   );
//   const [replyText, setReplyText] = useState("");
//   const [showReplies, setShowReplies] = useState(false);
//   const [replyToReplyingId, setReplyToReplyingId] = useState<string | null>(
//     null
//   );

//   const userId = localStorage.getItem("userId");
//   console.log(post);

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const res = await getPostById(id as string);
//         setPost(res);

//         const userId = localStorage.getItem("userId");
//         if (userId) {
//           const userRes = await fetchUserProfile(userId);
//           if (userRes && userRes.profile_picture) {
//             setUserProfilePicture(userRes.profile_picture);
//           } else {
//             setUserProfilePicture("path/to/default-profile-pic.jpg");
//           }
//         }
//         setLoading(false);
//       } catch (e) {
//         console.error(e);
//       }
//     }
//     fetchData();
//   }, [id]);

//   //แสดงความคิดเห็น
//   const handleAddComment = async () => {
//     try {
//       const finalComment = selectedGif
//         ? `${comment} <img src="${selectedGif}" alt="GIF" style="width: 100%; height: auto;"/>`
//         : comment;
//       await addComment(id as string, finalComment);
//       setComment("");
//       setSelectedGif(null);
//       const res = await getPostById(id as string);
//       setPost(res);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   ///ลบความคิดเห็น
//   const handleDeleteComment = async (postId: string, commentId: string) => {
//     try {
//       const result = await deleteComment(postId, commentId);
//       console.log("ความคิดเห็นถูกลบแล้ว", result);

//       setPost((prevPost) => ({
//         ...prevPost!,
//         comments:
//           prevPost?.comments.filter((comment) => comment._id !== commentId) ||
//           [],
//       }));
//     } catch (error) {
//       console.error("ลบความคิดเห็นไม่สำเร็จ", error);
//     }
//   };

//   const handleReplyClick = (commentId: string, username: string) => {
//     console.log("commentId", commentId);
//     setReplyingCommentId(replyingCommentId === commentId ? null : commentId);
//   };

//   const handleReplyChange = (event: any) => {
//     setReplyText(event.target.value);
//   };

//   //ส่งความคิดเห็น
//   const handleReplySubmit = async (
//     postId: string,
//     commentId: string,
//     replyTo: string
//   ) => {
//     if (!replyText.trim()) {
//       alert("Please enter a reply.");
//       return;
//     }

//     if (!userId) {
//       alert("User not authenticated.");
//       return;
//     }

//     const replyData = {
//       content: replyText.trim(),
//       author: userId,
//       replyTo: replyTo,
//     };

//     try {
//       const result = await Replycomment(postId, commentId, replyData);
//       console.log("Reply posted successfully:", result);

//       const res = await getPostById(postId);
//       setPost(res);

//       // ล้างช่องกรอกข้อความหลังจากส่งสำเร็จ
//       setReplyText("");
//     } catch (error) {
//       console.error("Error posting reply:", error);
//       alert("Failed to post reply. Please try again.");
//     }
//   };

//   // จัดการการแสดงความคิดเห็นตอบกลับ
//   const handleReplyToReplyClick = (replyId: string, username: string) => {
//     setReplyToReplyingId(replyToReplyingId === replyId ? null : replyId);
//   };

//   // ส่งการตอบกลับความคิดเห็น
//   const handleReplyToReplySubmit = async (
//     postId: string,
//     commentId: string,
//     replyTo: string
//   ) => {
//     console.log("handleReplyToReplySubmit", postId, commentId, replyTo);
//     if (!replyText.trim()) {
//       alert("Please enter a reply.");
//       return;
//     }

//     if (!userId) {
//       alert("User not authenticated.");
//       return;
//     }

//     const replyData = {
//       content: replyText.trim(),
//       author: userId,
//       replyTo: replyTo,
//     };

//     try {
//       const result = await Replycomment(postId, commentId, replyData);
//       console.log("Reply posted successfully:", result);

//       const res = await getPostById(postId);
//       setPost(res);

//       setReplyText("");
//       setReplyToReplyingId(null);
//     } catch (error) {
//       console.error("Error posting reply:", error);
//       alert("Failed to post reply. Please try again.");
//     }
//   };

//   const handleDeleteReply = async (
//     postId: string,
//     commentId: string,
//     replyId: string
//   ) => {
//     await deleteReply(postId, commentId, replyId);

//     // ตรวจสอบว่า prevPost ไม่เป็น undefined ก่อนทำการอัปเดต
//     setPost((prevPost) => {
//       if (!prevPost) {
//         console.error("โพสต์ไม่พบเพื่ออัปเดต");
//         return prevPost; // หรืออาจจะส่งคืนค่าเริ่มต้น
//       }

//       return {
//         ...prevPost,
//         comments: prevPost.comments.map((comment) =>
//           comment._id === commentId
//             ? {
//                 ...comment,
//                 replies: comment.replies.filter(
//                   (reply) => reply._id !== replyId
//                 ),
//               }
//             : comment
//         ),
//       };
//     });
//   };

//   const onEmojiClick = (emojiData: EmojiClickData) => {
//     setComment(comment + emojiData.emoji);
//     setShowEmojiPicker(false);
//   };

//   const onGifClick = (gif: IGif, e: React.SyntheticEvent) => {
//     e.preventDefault();
//     setSelectedGif(gif.images.fixed_height.url);
//     setShowGifPicker(false);
//   };

//   const fetchGifs = (offset: number) => {
//     return gf.search(searchTerm, { offset, limit: 10 });
//   };

//   const fetchTrendingGifs = (offset: number) => {
//     return gf.trending({ offset, limit: 10 });
//   };

//   const handleLike = async () => {
//     try {
//       await likePost(id as string);
//       const res = await getPostById(id as string);
//       setPost(res);
//     } catch (error) {}
//   };

//   const getCategoryBadgeClass = (category: string) => {
//     switch (category) {
//       case "วิชาเสรี":
//         return "category-วิชาเสรี";
//       case "ข่าวสาร/ประชาสัมพันธ์":
//         return "category-ข่าวสารประชาสัมพันธ์";
//       case "น้องใหม่":
//         return "category-น้องใหม่";
//       case "ลงทะเบียนเรียน":
//         return "category-ลงทะเบียนเรียน";
//       case "กีฬา":
//         return "category-กีฬา";
//       case "ทั่วไป":
//         return "category-ทั่วไป";
//       case "รีวิวมข":
//         return "category-รีวิวมข";
//       default:
//         return ""; // หรือคลาส default
//     }
//   };

//   const formatDuration = (created_at: Date) => {
//     const duration = moment.duration(moment().diff(moment(created_at)));

//     if (duration.days() > 0) {
//       return `${duration.days()}d`;
//     } else if (duration.hours() > 0) {
//       return `${duration.hours()}h`;
//     } else if (duration.minutes() > 0) {
//       return `${duration.minutes()}m`;
//     } else {
//       return `${duration.seconds()}s`;
//     }
//   };

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div className="container-con">
//       {post && (
//         <div className="post-container">
//           <div className="head-user">
//             <div className="user-info">
//               <a href={`/profile/${post.user?._id}`}>{post?.user?.username}</a>
//               {dayjs(post.createdAt).format("DD/MM/YYYY HH:mm:ss")}
//             </div>

//             <div className="d-flex justify-content-between align-items-center">
//               <div className="icon-like d-flex align-items-center">
//                 <GoHeartFill
//                   onClick={handleLike}
//                   color={
//                     post.likes?.some((l) => l.user === userId) ? "red" : "black"
//                   }
//                 />
//                 <p className="m-0">{post?.likes?.length} ถูกใจ</p>
//               </div>

//               <div className="icon-save d-flex align-items-center">
//                 <IoBookmark />
//               </div>

//               <div className="icon-view d-flex align-items-center">
//                 <TiEye />
//                 <p className="m-0">{`${post.views} ยอดดู`}</p>
//               </div>
//             </div>
//           </div>

//           <div className="image-container">
//             {post.image && <Image src={post.image} fluid />}
//           </div>

//           <div className="topic-con mt-2">
//             <h2>{post.topic}</h2>
//           </div>
//           <div className="category-con">
//             {post.category &&
//               post.category.map((category) => (
//                 <span
//                   key={category}
//                   className={`category ${getCategoryBadgeClass(category)}`}
//                   style={{ marginRight: "5px" }}
//                 >
//                   {category}
//                 </span>
//               ))}
//           </div>

//           <div
//             className="detail-blog"
//             style={{ padding: "0 5rem", fontSize: "16px" }}
//           >
//             <p style={{ fontSize: "16px" }}>{post.detail}</p>
//           </div>
//           <Col>
//             <div
//               className="post-con"
//               style={{ padding: "0 5rem", fontSize: "16px" }}
//             >
//               {post.contentWithImages &&
//                 post.contentWithImages.length > 0 &&
//                 post.contentWithImages.map((contentItem, index) => (
//                   <div key={index}>
//                     {contentItem.images && contentItem.images.length > 0 && (
//                       <div>
//                         {contentItem.images.map((img, imgIndex) => (
//                           <Image key={imgIndex} src={img} />
//                         ))}
//                       </div>
//                     )}
//                     <p>{contentItem.content}</p>
//                   </div>
//                 ))}
//             </div>

//             {/* Comment */}
//             <div className="comment-con">
//               <div className="comment-head text-center">
//                 <h4>ความคิดเห็น ({post.comments && post.comments.length})</h4>
//               </div>
//               <div>
//                 {post.comments &&
//                   post.comments.map((comment) => (
//                     <div key={comment._id} className="comment mt-2 p-2">
//                       <div className="mt-2 d-flex">
//                         <span>
//                           <a href={`/profile/${comment.author._id}`}>
//                             <img
//                               className="profile-comment"
//                               src={comment.author.profile_picture}
//                               alt=""
//                             />
//                           </a>
//                         </span>
//                         <div className="comment-all">
//                           <div className="user-comment d-flex align-items-center justify-content-between">
//                             <span>
//                               <a
//                                 href={`/profile/${comment.author._id}`}
//                                 style={{ color: "black", marginRight: "10px" }}
//                               >
//                                 {comment.author.username}
//                               </a>
//                             </span>
//                             <div className="select-detail">
//                               <TfiMoreAlt
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   setShowDropdown((prev) =>
//                                     prev === comment._id ? null : comment._id
//                                   );
//                                 }}
//                               />
//                               {showDropdown === comment._id && (
//                                 <Dropdown show={showDropdown === comment._id}>
//                                   <Dropdown.Menu variant="dark">
//                                     {userId === comment.author._id && (
//                                       <>
//                                         <Dropdown.Item
//                                           onClick={() =>
//                                             handleDeleteComment(
//                                               post._id,
//                                               comment._id
//                                             )
//                                           }
//                                         >
//                                           ลบ
//                                         </Dropdown.Item>
//                                       </>
//                                     )}
//                                     <Dropdown.Item>
//                                       ตั้งค่าความเป็นส่วนตัว
//                                     </Dropdown.Item>
//                                   </Dropdown.Menu>
//                                 </Dropdown>
//                               )}
//                             </div>
//                           </div>
//                           <div className="comment-content">
//                             <span
//                               dangerouslySetInnerHTML={{
//                                 __html: comment.content,
//                               }}
//                               style={{ display: "grid" }}
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       <div className="reply-comment">
//                         <div
//                           className="reply-button d-flex align-items-center"
//                           style={{ fontWeight: "500", gap: "10px" }}
//                         >
//                           <span
//                             className="ms2"
//                             style={{ fontSize: "14px", marginLeft: "3.8rem" }}
//                           >
//                             {formatDuration(comment.created_at)}
//                           </span>
//                           <p
//                             className="m-0"
//                             onClick={() => {
//                               handleReplyClick(
//                                 comment._id,
//                                 comment.author.username
//                               );
//                             }}
//                           >
//                             ตอบกลับ
//                           </p>
//                           {comment.replies.length > 0 && (
//                             <button
//                               className="btn btn-link"
//                               onClick={() => setShowReplies((prev) => !prev)}
//                               style={{
//                                 textDecoration: "none",
//                                 color: "black",
//                                 cursor: "pointer",
//                                 padding: "0",
//                               }}
//                             >
//                               {showReplies
//                                 ? "ซ่อน"
//                                 : `แสดงการตอบกลับ (${comment.replies.length})`}
//                             </button>
//                           )}
//                         </div>

//                         {showReplies &&
//                           comment.replies &&
//                           comment.replies.map((reply) => {
//                             return (
//                               <div>
//                                 <div
//                                   key={reply._id}
//                                   className="reply mt-2 p-2"
//                                   style={{ marginLeft: "3rem" }}
//                                 >
//                                   <div className="d-flex">
//                                     <span>
//                                       <a href={`/profile/${reply.author._id}`}>
//                                         <img
//                                           className="profile-comment"
//                                           src={reply.author.profile_picture}
//                                           alt=""
//                                         />
//                                       </a>
//                                     </span>
//                                     <div className="comment-all">
//                                       <div className="user-comment d-flex align-items-center justify-content-between">
//                                         <span className="reply-people">
//                                           <a
//                                             href={`/profile/${reply.author._id}`}
//                                             style={{
//                                               color: "black",
//                                               marginRight: "10px",
//                                             }}
//                                           >
//                                             {reply.author.username}
//                                           </a>
//                                         </span>

//                                         <div className="select-detail">
//                                           <TfiMoreAlt
//                                             onClick={(e) => {
//                                               e.stopPropagation();
//                                               setShowDropdown((prev) =>
//                                                 prev === reply._id
//                                                   ? null
//                                                   : reply._id
//                                               );
//                                             }}
//                                           />
//                                           {showDropdown === reply._id && (
//                                             <Dropdown
//                                               show={showDropdown === reply._id}
//                                             >
//                                               <Dropdown.Menu variant="dark">
//                                                 {userId ===
//                                                   reply.author._id && (
//                                                   <>
//                                                     <Dropdown.Item
//                                                       onClick={() =>
//                                                         handleDeleteReply(
//                                                           post._id,
//                                                           comment._id,
//                                                           reply._id
//                                                         )
//                                                       }
//                                                     >
//                                                       ลบ
//                                                     </Dropdown.Item>
//                                                   </>
//                                                 )}
//                                                 <Dropdown.Item>
//                                                   ตั้งค่าความเป็นส่วนตัว
//                                                 </Dropdown.Item>
//                                               </Dropdown.Menu>
//                                             </Dropdown>
//                                           )}
//                                         </div>
//                                       </div>
//                                       <div className="reply-content">
//                                         <a
//                                           href={`/profile/${reply.replyTo._id}`}
//                                           style={{
//                                             marginRight: "5px",
//                                           }}
//                                         >
//                                           {reply.replyTo.fullname}
//                                         </a>
//                                         <span
//                                           dangerouslySetInnerHTML={{
//                                             __html: reply.content,
//                                           }}
//                                         />
//                                       </div>
//                                     </div>
//                                   </div>
//                                   <div
//                                     className="reply-button d-flex align-items-center"
//                                     style={{ fontWeight: "500", gap: "10px" }}
//                                   >
//                                     <span
//                                       className="ms2"
//                                       style={{
//                                         fontSize: "14px",
//                                         marginLeft: "3.8rem",
//                                       }}
//                                     >
//                                       {formatDuration(reply.created_at)}
//                                     </span>
//                                     <p
//                                       className="m-0"
//                                       onClick={() =>
//                                         handleReplyToReplyClick(
//                                           reply._id,
//                                           reply.author.username
//                                         )
//                                       }
//                                     >
//                                       ตอบกลับ
//                                     </p>
//                                   </div>
//                                 </div>
//                                 <div className="replytoreply">
//                                   {replyToReplyingId === reply._id && (
//                                     <div className="d-flex">
//                                       <div className="img-pro">
//                                         <img
//                                           src={userProfilePicture}
//                                           alt="Profile"
//                                           style={{
//                                             width: "50px",
//                                             height: "50px",
//                                             borderRadius: "50%",
//                                             marginRight: "10px",
//                                           }}
//                                         />
//                                       </div>
//                                       <div className="input-reply">
//                                         <p>{reply.author.username}</p>
//                                         <textarea
//                                           value={replyText}
//                                           onChange={handleReplyChange}
//                                           placeholder="Write a reply..."
//                                         />
//                                         <button
//                                           onClick={() => {
//                                             handleReplyToReplySubmit(
//                                               post._id,
//                                               comment._id,
//                                               reply.author._id
//                                             );
//                                           }}
//                                           className="send-icon1"
//                                         >
//                                           <IoIosSend />
//                                         </button>
//                                       </div>
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         {replyingCommentId === comment._id && (
//                           <div
//                             className="reply d-flex"
//                             style={{ marginLeft: "3.8rem" }}
//                           >
//                             <div className="d-flex">
//                               <img
//                                 src={userProfilePicture}
//                                 alt="Profile"
//                                 style={{
//                                   width: "50px",
//                                   height: "50px",
//                                   borderRadius: "50%",
//                                   marginRight: "10px",
//                                 }}
//                               />
//                             </div>
//                             <div className="reply-input">
//                               <p>
//                                 <strong>{comment.author.username}</strong>
//                               </p>
//                               <textarea
//                                 value={replyText}
//                                 onChange={handleReplyChange}
//                                 placeholder="Write your reply..."
//                               />
//                               <button
//                                 onClick={() =>
//                                   handleReplySubmit(
//                                     post._id,
//                                     comment._id,
//                                     post.user._id
//                                   )
//                                 }
//                                 className="send-icon1"
//                               >
//                                 <IoIosSend />
//                               </button>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//               </div>
//               <div className="comment-area ">
//                 <img
//                   src={userProfilePicture}
//                   alt="Profile"
//                   style={{
//                     width: "50px",
//                     height: "50px",
//                     borderRadius: "50%",
//                     marginRight: "10px",
//                   }}
//                 />
//                 <input
//                   type="text"
//                   className="input-comment"
//                   name=""
//                   id=""
//                   value={comment}
//                   onChange={(e) => setComment(e.target.value)}
//                   placeholder="แสดงความคิดเห็น..."
//                 />

//                 <div className="emoji-icon">
//                   <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
//                     <BsEmojiSmile />
//                   </button>
//                   {showEmojiPicker && (
//                     <div className="emoji-picker">
//                       <EmojiPicker onEmojiClick={onEmojiClick} />
//                     </div>
//                   )}
//                 </div>

//                 <div className="gif-icon">
//                   <button
//                     className="gif-button"
//                     onClick={() => setShowGifPicker(!showGifPicker)}
//                   >
//                     <PiGif />
//                   </button>
//                   {showGifPicker && (
//                     <div className="gif-picker-container">
//                       <input
//                         type="text"
//                         className="gif-search-input"
//                         placeholder="ค้นหา GIF"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                       />
//                       <div className="gif-grid-container">
//                         <div className="gif-grid">
//                           <Grid
//                             fetchGifs={
//                               searchTerm ? fetchGifs : fetchTrendingGifs
//                             }
//                             width={400}
//                             columns={3}
//                             gutter={6}
//                             key={searchTerm}
//                             onGifClick={onGifClick}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div className="send-icon">
//                   <IoIosSend onClick={handleAddComment} />
//                 </div>
//               </div>
//               <div className="comment-display">
//                 <div
//                   dangerouslySetInnerHTML={{ __html: comment }}
//                   style={{ display: "none" }}
//                 />
//                 {selectedGif && (
//                   <div>
//                     <img
//                       src={selectedGif}
//                       alt="Selected GIF"
//                       style={{ maxWidth: "100%", height: "auto" }}
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>
//           </Col>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Content;

const Content = () => {
    return <div>Content</div>;
};

export default Content;