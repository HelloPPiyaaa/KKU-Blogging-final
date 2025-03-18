import Cookies from "js-cookie";

const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT;

export const registerAdmin = async (admin: any): Promise<any> => {
  const url = `${API_BASE_URL}/admin/register`;
  console.log("Request URL:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(admin),
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
// Define a type for the response data
interface LoginResponse {
  token: string;
  id: string;
  [key: string]: any; // Allow other fields as well
}

export const loginAdmin = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const url = `${API_BASE_URL}/login`;

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
      const responseData = await response.text();
      console.warn("Unexpected response format:", responseData);
      throw new Error("Expected JSON response but got non-JSON.");
    }

    const responseData: LoginResponse = await response.json();
    if (responseData.token && responseData.id) {
      Cookies.set("token",responseData.token);
      localStorage.setItem("adminToken", responseData.token);
      localStorage.setItem("adminId", responseData.id);
      // Optional: Use React Router for redirection instead
      // useHistory().push(`/admin/${responseData.id}`);
      window.location.href = `/admin/${responseData.id}`;
    } else {
      console.error("Response does not contain expected fields:", responseData);
      throw new Error("Invalid response format.");
    }

    return responseData;
  } catch (error) {
    console.error("Error:", (error as Error).message);

    if (error instanceof TypeError) {
      console.error("Network error or CORS issue");
    } else if (error instanceof SyntaxError) {
      console.error("Error parsing JSON response");
    }

    throw error; // Re-throw to allow further handling
  }
};
