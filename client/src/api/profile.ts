const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT;

export const fetchUserProfile = async (id: string): Promise<any> => {
  if (!id) {
    throw new Error("Invalid user ID");
  }

  const url = `${API_BASE_URL}/profile/${id}`;
  console.log("Request URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const statusText = response.statusText || "Unknown Error";
      throw new Error(
        `Server returned ${response.status} ${statusText} for ${url}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const responseData = await response.text();
      return responseData;
    }

    const responseData = await response.json();
    if (responseData.id) {
    } else {
      console.error("Response does not contain ID:", responseData);
    }
    return responseData;
  } catch (error) {
    console.error("Error:", (error as Error).message);

    if (error instanceof TypeError) {
      console.error("Network error or CORS issue");
    } else if (error instanceof SyntaxError) {
      console.error("Error parsing JSON response");
    }

    return null;
  }
};

export const fetchPostsByUser = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts?user=${userId}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching posts by user:", error);
    throw error;
  }
};

export const fetchLikedPosts = async (userId: string) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/posts/likedPosts/${userId}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Fetched liked posts:", data);
    return data;
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    return [];
  }
};

export const updateUserProfile = async (
  id: string,
  userData: any
): Promise<any> => {
  const url = `${API_BASE_URL}/profile/edit-profile/update/${id}`;
  console.log("Request URL:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData), // ส่งข้อมูลผู้ใช้งานไปพร้อมกับ request
    });

    if (!response.ok) {
      const statusText = response.statusText || "Unknown Error";
      throw new Error(
        `Server returned ${response.status} ${statusText} for ${url}`
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error:", (error as Error).message);

    if (error instanceof TypeError) {
      console.error("Network error or CORS issue");
    } else if (error instanceof SyntaxError) {
      console.error("Error parsing JSON response");
    }

    throw error;
  }
};

export const fetchSavedPosts = async (userId: string) => {
  const url = `${API_BASE_URL}/posts/saved/${userId}`;
  console.log("Request URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const statusText = response.statusText || "Unknown Error";
      throw new Error(
        `Server returned ${response.status} ${statusText} for ${url}`
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error fetching saved posts:", (error as Error).message);

    if (error instanceof TypeError) {
      console.error("Network error or CORS issue");
    } else if (error instanceof SyntaxError) {
      console.error("Error parsing JSON response");
    }

    return [];
  }
};

export const deleteUserProfile = async (id: string): Promise<any> => {
  if (!id) {
    throw new Error("Invalid user ID");
  }

  const url = `${API_BASE_URL}/profile/edit-profile/delete/${id}`;
  console.log("Request URL:", url);

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const statusText = response.statusText || "Unknown Error";
      throw new Error(
        `Server returned ${response.status} ${statusText} for ${url}`
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error:", (error as Error).message);

    if (error instanceof TypeError) {
      console.error("Network error or CORS issue");
    } else if (error instanceof SyntaxError) {
      console.error("Error parsing JSON response");
    }

    throw error;
  }
};

export const changePassword = async (data: any) => {
  const url = `${API_BASE_URL}/profile/changepassword`;
  console.log("Request URL:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const statusText = response.statusText || "Unknown Error";
      throw new Error(
        `Server returned ${response.status} ${statusText} for ${url}`
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error:", (error as Error).message);

    if (error instanceof TypeError) {
      console.error("Network error or CORS issue");
    } else if (error instanceof SyntaxError) {
      console.error("Error parsing JSON response");
    }

    throw error;
  }
};
