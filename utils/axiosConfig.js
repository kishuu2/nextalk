import axios from "axios";

// Create an instance with smart server URL detection
let baseURL;

// Check if we're on localhost (client-side)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    baseURL = 'http://localhost:5000';
} else if (process.env.NEXT_PUBLIC_SERVER_URL) {
    baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
} else if (process.env.REACT_APP_API_URL) {
    baseURL = process.env.REACT_APP_API_URL;
} else {
    // Default to production server
    baseURL = 'https://nextalk-u0y1.onrender.com';
}

console.log('🌐 Axios baseURL:', baseURL);

const axiosInstance = axios.create({
    baseURL: baseURL,
    withCredentials: true,           // Crucial for sending cookies
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
    (config) => {
        console.log('📤 Axios request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('❌ Axios request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('✅ Axios response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ Axios response error:', error.message);
        if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
            console.error('🚨 Server connection failed. Is your backend running on', baseURL, '?');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
