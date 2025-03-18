export const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT;

export const postRequest = async (url: string, body: any) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  });

  const data = await response.json();

  if (!response.ok) {
    let message;
    if (data?.message) {
      message = data.message;
    } else {
      message = data;
    }
    return { error: true, message };
  }
  return data;
};

export const getRequest = async (
  url: string
): Promise<{ error: boolean; message: string } | any> => {
  const response = await fetch(url);

  const data = await response.json();
  if (!response.ok) {
    let message = "An error occurred...";

    if (data?.message) {
      message = data.message;
    }
    return { error: true, message };
  }

  return data;
};
