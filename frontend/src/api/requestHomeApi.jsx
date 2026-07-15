import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/room";

export const listHomeInformation = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Error fetching customer:", response.data.message);
    }
  } catch (error) {
    console.error(
      "Error fetching places:",
      error.response?.data || error.message
    );
  }
};

export const detailRoomInformation = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Error fetching customer:", response.data.message);
    }
  } catch (error) {
    console.error(
      "Error fetching places:",
      error.response?.data || error.message
    );
  }
};

export const updateRoomStatus = async (id, status) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}/status`, { status });
    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Error updating room status:", response.data.message);
    }
  } catch (error) {
    console.error(
      "Error updating room status:",
      error.response?.data || error.message
    );
  }
};
