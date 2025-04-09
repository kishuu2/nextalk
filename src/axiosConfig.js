import axios from "axios";

// Create an instance
const axiosInstance = axios.create({
  baseURL: "https://nextalk-u0y1.onrender.com", // Backend URL
  withCredentials: true,           // Crucial for sending cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
