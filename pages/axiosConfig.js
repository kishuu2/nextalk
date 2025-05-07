import axios from "axios";

// Create an instance
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // Backend URL
    withCredentials: true,           // Crucial for sending cookies
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;
