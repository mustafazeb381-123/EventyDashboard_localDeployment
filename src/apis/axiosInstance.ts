import axios from 'axios';


const TOKEN_KEY = 'token';




// Your identifier
// const identifier = storage.getString("identifier"); // Your identifier
// console.log('Identifier in the axios instance file:', identifier);
const axiosInstance = axios.create({
  baseURL: `https:scceventy.dev/en/api_dashboard/v1`, // Your API URL
  // headers: {
  //   'Content-Type': 'application/json',

  // },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem(TOKEN_KEY); // Retrieve token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found, redirecting to login...');
      // Navigate to login if token is not found
    }

    return config;
  },
  error => Promise.reject(error),
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.error('Unauthorized: Redirecting to login...');
      // Redirect to login on 401 error
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
