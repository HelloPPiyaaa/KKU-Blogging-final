const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT;

export const fetchProfile = async (me: string | null): Promise<any> => {
  console.log("me", me);
  if (!me) {
    throw new Error("Invalid user ID");
  }

  const url = `${API_BASE_URL}/follow/${me}`;

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
    if (responseData._id) {
    } else {
      console.error("Response does not contain ID:", responseData);
    }
    console.log("responseData", responseData);
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

export const fetchFollow = async (me: string | null): Promise<any> => {
  if (!me) {
    throw new Error("Invalid user ID");
  }
  const url = `${API_BASE_URL}/follow/users/${me}`;
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
    console.log("responseData", responseData);
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