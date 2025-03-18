import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT;

const getAuthHeaders = () => {
  const userData = sessionStorage.getItem("user");
  const token = userData ? JSON.parse(userData).access_token : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchBadWordGroupsAPI = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/badword`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching bad word groups:", error);
    throw error;
  }
};

export const addBadWordGroupAPI = async (words: string[]) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/badword`,
      { words },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding bad word group:", error);
    throw error;
  }
};

export const addWordsToBadWordGroupAPI = async (id: string, words: string[]) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/badword/${id}/add`,
      { words },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding words to bad word group:", error);
    throw error;
  }
};

export const updateBadWordGroupAPI = async (id: string, words: string[]) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/badword/${id}`,
        { words },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating bad word group:", error);
      throw error;
    }
  };
  

export const removeWordFromBadWordGroupAPI = async (id: string, word: string) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/badword/${id}/remove`,
      { word },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error removing word from bad word group:", error);
    throw error;
  }
};

export const deleteBadWordGroupAPI = async (id: string) => {
  try {
    await axios.delete(`${API_BASE_URL}/badword/${id}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    console.error("Error deleting bad word group:", error);
    throw error;
  }
};
