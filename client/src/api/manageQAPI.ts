const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT;

// Function to fetch all questions (ไม่ต้องล็อกอิน)
export const fetchQuestionsAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/api/questions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }

  const data = await response.json();
  return data;
};

// Function to add a new question (ต้องล็อกอิน)
export const addQuestionAPI = async (
  topic: string,
  answer: string,
  createdBy: string
) => {
  const token = sessionStorage.getItem("userId");
  if (!token) {
    console.error("No token found, redirecting to login...");
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/api/questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ topic, answer, createdBy }),
  });

  if (!response.ok) {
    throw new Error("Failed to add question");
  }

  const data = await response.json();
  return data;
};

// Function to update a question (ต้องล็อกอิน)
export const updateQuestionAPI = async (
  id: string,
  topic: string,
  answer: string
) => {
  const token = sessionStorage.getItem("userId");
  if (!token) {
    throw new Error("No admin token found. Unauthorized request.");
  }

  const response = await fetch(`${API_BASE_URL}/api/questions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ topic, answer }),
  });

  if (!response.ok) {
    throw new Error("Failed to update question");
  }

  const data = await response.json();
  return data;
};

// Function to delete a question (ต้องล็อกอิน)
export const deleteQuestionAPI = async (id: string) => {
  const token = sessionStorage.getItem("userId");
  if (!token) {
    console.error("No token found, redirecting to login...");
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/api/questions/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete question");
  }
};
