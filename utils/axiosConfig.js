import axios from "axios";

// Create an instance with proper server URL
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL ||
             process.env.NEXT_PUBLIC_SERVER_URL ||
             (process.env.NODE_ENV === 'production'
               ? 'https://nextalk-u0y1.onrender.com'
               : 'http://localhost:5000'),
    withCredentials: true,           // Crucial for sending cookies
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;
