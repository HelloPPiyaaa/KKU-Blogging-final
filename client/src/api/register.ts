const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT;

const registerUser = async (user: any): Promise<any> => {
  const url = `${API_BASE_URL}/admin/register`;
  console.log("Request URL:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
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
    console.log("responseData", responseData);
    return responseData;
  } catch (error: any) {
    console.error("Error:", (error as Error).message);
    throw error;
  }
};

export { registerUser };
