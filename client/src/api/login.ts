const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT;

export const loginUser = async (
  email: string,
  password: string
): Promise<any> => {
  const url = `${API_BASE_URL}/login`;
  console.log("Request URL:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const statusText = response.statusText || "Unknown Error";
      throw new Error(
        `Server returned ${response.status} ${statusText} for ${url}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      // Handle non-JSON response
      const responseData = await response.text();
      console.error(
        `Expected JSON but received ${contentType}: ${responseData}`
      );
      throw new Error(`Expected JSON but received ${contentType}`);
    }

    // Handle JSON response
    const responseData = await response.json();
    if (responseData.token) {
      // Save token to localStorage
      localStorage.setItem("token", responseData.token);
    } else {
      console.error("Response does not contain token:", responseData);
      throw new Error("Response does not contain token");
    }

    return responseData;
  } catch (error: any) {
    console.error("Error:", (error as Error).message);

    // Handle different error types
    if (error instanceof TypeError) {
      console.error("Network error or CORS issue");
    } else if (error instanceof SyntaxError) {
      console.error("Error parsing JSON response");
    } else {
      console.error("An unexpected error occurred");
    }

    throw error;
  }
};
