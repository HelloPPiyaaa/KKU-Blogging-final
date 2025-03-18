import axios, { AxiosResponse } from "axios";
import { Post } from "../types/post";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT;

const createPost = async (post: any): Promise<any> => {
  const url = `${API_BASE_URL}/posts`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post),
    });

    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status} ${response.statusText} for ${url}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const responseData = await response.json();
      return responseData;
    } else {
      const responseText = await response.text();
      throw new Error(
        `Expected JSON but received ${contentType}: ${responseText}`
      );
    }
  } catch (error: any) {
    console.error("Error:", (error as Error).message);
    throw error;
  }
};

const editPost = async (id: string, post: any): Promise<any> => {
  const url = `${API_BASE_URL}/posts/${id}`;

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post),
    });

    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status} ${response.statusText} for ${url}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const responseData = await response.text();
      return responseData;
    }

    const responseData = await response.json();
    return responseData;
  } catch (error: any) {
    console.error("Error:", (error as Error).message);
    throw error;
  }
};

// const addComment = async (id: string, content: string): Promise<void> => {
//   const url = `${API_BASE_URL}/posts/${id}/comment`;

//   const userId = localStorage.getItem("userId"); // ดึงค่า userId เป็นสตริง

//   if (!userId) {
//     throw new Error("User is not logged in.");
//   }

//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         author: userId,
//         content,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(
//         `Server returned ${response.status} ${response.statusText}`
//       );
//     }
//   } catch (error: any) {
//     console.error("Error:", error.message);
//     throw error;
//   }
// };

const addReport = async (
  postId: string,
  reason: string,
  userId: string
): Promise<AxiosResponse<any>> => {
  const url = `${API_BASE_URL}/api/report/add`; // Notice the `/api/report` here

  try {
    const response = await axios.post(url, {
      postId,
      reason,
      reportedBy: userId,
    });

    return response;
  } catch (error: any) {
    console.error("Error reporting post:", error.message);
    throw error;
  }
};

const addComment = async (id: string, content: string): Promise<void> => {
  const url = `${API_BASE_URL}/posts/${id}/comment`;
  const userId = localStorage.getItem("userId");

  if (!userId) {
    throw new Error("User is not logged in.");
  }

  try {
    const response = await axios.post(url, {
      author: userId,
      content,
    });

    if (response.status !== 201) {
      throw new Error(
        `Server returned ${response.status} ${response.statusText}`
      );
    }
  } catch (error: any) {
    console.error("Error:", error.message);
    throw error;
  }
};

const Replycomment = async (
  postId: string | undefined,
  commentId: string,
  replyData: { content: string; author: string; replyTo: string }
) => {
  try {
    const token = Cookies.get("token");
    if (!token) {
      throw new Error("ไม่พบ token หรือผู้ใช้ไม่ถูกต้อง");
    }

    const response = await fetch(
      `${API_BASE_URL}/posts/${postId}/comment/${commentId}/reply`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(replyData),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Error posting reply: " + response.statusText);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error posting reply:", error);
    throw error;
  }
};

export const ReplyToReply = async (
  postId: string,
  commentId: string,
  replyId: string,
  replyData: { content: string; author: string; replyTo: string }
) => {
  const response = await fetch(
    `${API_BASE_URL}/posts/${postId}/comments/${commentId}/replies/${replyId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(replyData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to reply to reply");
  }

  return response.json();
};

const deleteComment = async (postId: any, commentId: any) => {
  try {
    const token = Cookies.get("token");
    if (!token) {
      throw new Error("ไม่พบ token หรือผู้ใช้ไม่ถูกต้อง");
    }

    //ส่งคำขอลบไป API
    const response = await fetch(
      `${API_BASE_URL}/posts/${postId}/comment/delete/${commentId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );
    //ตรวจสอบการตอบกลับ
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "ข้อผิดพลาดในการลบความคิดเห็น");
    }
    const result = await response.json();
    console.log("ลบความคิดเห็นสำเร็จ", result);
    return result;
  } catch (error: any) {
    console.error("ข้อผิดพลาดในการลบความคิดเห็น", error);
    throw error;
  }
};

const deleteReply = async (postId: any, commentId: any, replyId: any) => {
  try {
    const token = Cookies.get("token");
    if (!token) {
      throw new Error("ไม่พบ token หรือผู้ใช้ไม่ถูกต้อง");
    }

    const response = await fetch(
      `${API_BASE_URL}/posts/${postId}/comment/${commentId}/reply/${replyId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("การลบการตอบกลับไม่สำเร็จ");
    }

    const result = await response.json();
    console.log("ลบการตอบกลับสำเร็จ:", result);
    return result; // อาจจะต้องใช้ข้อมูลนี้ในการอัปเดต UI
  } catch (error) {
    console.error("ข้อผิดพลาดในการลบการตอบกลับ:", error);
  }
};

const likePost = async (id: string): Promise<void> => {
  const url = `${API_BASE_URL}/posts/${id}/likes`;
  const userId = localStorage.getItem("userId");
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status} ${response.statusText}`
      );
    }
  } catch (error: any) {
    console.error("Error:", error.message);
    throw error;
  }
};

const getPosts = async (): Promise<Post[]> => {
  const url = `${API_BASE_URL}/posts`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return data;
    } else {
      const responseText = await response.text();
      throw new Error(
        `Expected JSON response but got ${contentType}: ${responseText}`
      );
    }
  } catch (error: any) {
    console.error("Error:", (error as Error).message);
    throw error;
  }
};

const getPostById = async (id: string): Promise<Post> => {
  const url = `${API_BASE_URL}/posts/${id}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return data;
    } else {
      const responseText = await response.text();
      throw new Error(
        `Expected JSON response but got ${contentType}: ${responseText}`
      );
    }
  } catch (error: any) {
    console.error("Error:", (error as Error).message);
    throw error;
  }
};

// const deletePostById = async (id: string): Promise<Post> => {
//   const url = `${API_BASE_URL}/posts/${id}`;

//   try {
//     const response = await fetch(url, {
//       method: 'DELETE',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     const data = await response.json();
//     return data;
//   } catch (error: any) {
//     console.error('Error:', (error as Error).message);
//     throw error;
//   }
// };

const deletePostById = async (id: string): Promise<any> => {
  try {
    const token = Cookies.get("token");
    if (!token) {
      throw new Error("Token is missing");
    }

    const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/posts/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include", // ส่ง Cookies ไปกับ Request
    });

    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status} ${response.statusText} for ${id}`
      );
    }

    return response.json();
  } catch (error: any) {
    console.error("Error deleting post by ID:", error.message);
    throw error;
  }
};

const savePost = async (postId: string): Promise<void> => {
  const userId = localStorage.getItem("userId");
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error("Failed to save post");
  }
};

export const getSavedPosts = async (userId: string): Promise<Post[]> => {
  const response = await fetch(`${API_BASE_URL}/posts/saved?userId=${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch saved posts");
  }
  return response.json();
};

const deleteSave = async (postId: string) => {
  const userId = localStorage.getItem("userId");

  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/save`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to unsave post");
    }
  } catch (error) {
    console.error("Error deleting save:", error);
    throw error;
  }
};

export {
  createPost,
  editPost,
  addComment,
  getPosts,
  getPostById,
  likePost,
  deletePostById,
  savePost,
  deleteSave,
  API_BASE_URL,
  deleteComment,
  Replycomment,
  deleteReply,
  addReport,
};
