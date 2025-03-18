import { Post } from "../types/post";
import { User } from "../types/user";

const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT;

export const searchPost = async (query: string): Promise<Post[]> => {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `${API_BASE_URL}/posts/search?query=${encodedQuery}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const statusText = response.statusText || "Unknown Error";
      throw new Error(`Server returned ${response.status} ${statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const responseData = await response.text();
      console.error("Unexpected content type:", contentType);
      return [];
    }

    const responseData: Post[] = await response.json(); // กำหนดประเภทที่ถูกต้อง
    return responseData;
  } catch (error) {
    console.error("Error:", (error as Error).message);

    if (error instanceof TypeError) {
      console.error("Network error or CORS issue");
    } else if (error instanceof SyntaxError) {
      console.error("Error parsing JSON response");
    }

    return [];
  }
};

export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/search?query=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const statusText = response.statusText || "Unknown Error";
      throw new Error(`Server returned ${response.status} ${statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const responseData = await response.text();
      console.error("Unexpected content type:", contentType);
      return [];
    }

    const responseData = await response.json();
    return responseData; // ควรจะเป็น User[] ตามที่กำหนดไว้ใน backend
  } catch (error) {
    console.error("Error:", (error as Error).message);

    if (error instanceof TypeError) {
      console.error("Network error or CORS issue");
    } else if (error instanceof SyntaxError) {
      console.error("Error parsing JSON response");
    }

    return [];
  }
};
