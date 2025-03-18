// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { Post } from "../types/post";
// import { Badge } from "react-bootstrap";
// import { IoBookmark } from "react-icons/io5";
// import { GoHeartFill } from "react-icons/go";
// import { likePost, getPosts } from "../api/post";
// import "./SearchResults.css";
// import { TiDocumentText } from "react-icons/ti";
// import { IoIosHelpCircle } from "react-icons/io";
// import { MdManageAccounts } from "react-icons/md";
// import { FaUserFriends } from "react-icons/fa";

// const SearchResults: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [searchResult, setSearchResult] = useState<Post[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [selected, setSelected] = useState<string>("blogpost");

//   const userId = localStorage.getItem("userId");

//   useEffect(() => {
//     const fetchPosts = async () => {
//       setLoading(true);
//       try {
//         // ดึงโพสต์ทั้งหมดจาก API
//         const posts = await getPosts();
//         const searchQuery = location.state?.searchQuery?.toLowerCase() || "";

//         if (searchQuery) {
//           const filteredPosts = posts.filter(
//             (post) =>
//               post.topic.toLowerCase().includes(searchQuery) ||
//               post.contentWithImages.some((content) =>
//                 content.content.toLowerCase().includes(searchQuery)
//               ) ||
//               post.category.some((cat) =>
//                 cat.toLowerCase().includes(searchQuery)
//               )
//           );
//           setSearchResult(filteredPosts);
//         } else {
//           // ถ้าไม่มีคำค้นหา ให้แสดงโพสต์ทั้งหมด
//           setSearchResult(posts);
//         }
//       } catch (error) {
//         console.error("ข้อผิดพลาดในการดึงโพสต์:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPosts();
//   }, [location.state]);

//   const handleCategorySelection = (category: string) => {
//     setSelected(category);
//   };

//   const handleLike = async (id: string): Promise<void> => {
//     if (!userId) return;

//     try {
//       // ทำการไลค์โพสต์
//       await likePost(id);

//       // อัพเดตสถานะของโพสต์ใน searchResult
//       setSearchResult((prevResults) =>
//         prevResults.map((post) =>
//           post._id === id
//             ? {
//                 ...post,
//                 likes: post.likes.some((like) => like.user === userId)
//                   ? post.likes.filter((like) => like.user !== userId)
//                   : [...post.likes, { _id: "", user: userId }],
//               }
//             : post
//         )
//       );
//     } catch (error) {
//       console.error("Failed to like post:", error);
//     }
//   };

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (!searchResult || searchResult.length === 0) {
//     return <p>No search results found</p>;
//   }

//   return (
//     <div className="Searchpage">
//       <div className="aside-search">
//         <div className="sidebar">
//           <h3 className="text-center">ผลลัพธ์</h3>
//           <a
//             href="#"
//             onClick={(e) => {
//               e.preventDefault();
//               handleCategorySelection("blogpost");
//             }}
//             className={selected === "blogpost" ? "active" : ""}
//           >
//             <TiDocumentText />
//             <h3>บล็อก</h3>
//           </a>
//           <a
//             href="#"
//             onClick={(e) => {
//               e.preventDefault();
//               handleCategorySelection("dashboard");
//             }}
//             className={selected === "dashboard" ? "active" : ""}
//           >
//             <FaUserFriends />
//             <h3>ผู้ใช้</h3>
//           </a>
//           <a
//             href="#"
//             onClick={(e) => {
//               e.preventDefault();
//               handleCategorySelection("tag");
//             }}
//             className={selected === "tag" ? "active" : ""}
//           >
//             <IoIosHelpCircle />
//             <h3>หมวดหมู่</h3>
//           </a>
//           <a
//             href="#"
//             onClick={(e) => {
//               e.preventDefault();
//               handleCategorySelection("group");
//             }}
//             className={selected === "group" ? "active" : ""}
//           >
//             <MdManageAccounts />
//             <h3>กลุ่ม</h3>
//           </a>
//         </div>
//       </div>
//       {selected === "blogpost" && (
//         <div className="card1">
//           {searchResult.map((post) => {
//             const isLiked = post.likes.some((like) => like.user === userId);

//             return (
//               <div key={post._id} className="row">
//                 <div onClick={() => navigate(`/content/${post._id}`)}>
//                   <img src={post.image} alt={post.topic} />
//                   <div
//                     className="card-body"
//                     style={{ padding: "10px", textAlign: "left" }}
//                   >
//                     <h4 className="card-title" style={{ color: "#222222" }}>
//                       {post.topic}
//                     </h4>
//                     <p className="card-text" style={{ color: "#222222" }}>
//                       {post.detail}
//                     </p>
//                     <Badge bg="light" text="dark">
//                       {post.category.join(", ")}
//                     </Badge>
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         marginTop: "10px",
//                       }}
//                     >
//                       <Badge bg="light" text="dark">
//                         <GoHeartFill
//                           style={{
//                             marginRight: "5px",
//                             fontSize: "16px",
//                             cursor: "pointer",
//                             color: isLiked ? "red" : "black",
//                           }}
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleLike(post._id);
//                           }}
//                         />
//                         {post.likes.length}
//                       </Badge>
//                       <Badge bg="light" text="dark">
//                         <IoBookmark />
//                       </Badge>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SearchResults;

const SearchResults = () => {
    return <div>SearchResults</div>;
};

export default SearchResults;