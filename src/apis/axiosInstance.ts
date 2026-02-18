import axios from 'axios';
import { useNavigation } from 'react-router-dom';

const TOKEN_KEY = 'token';




// Your identifier
// const identifier = storage.getString("identifier"); // Your identifier
// console.log('Identifier in the axios instance file:', identifier);
const axiosInstance = axios.create({
  baseURL: `https://scceventy.dev/en/api_dashboard/v1`, // Your API URL
  // headers: {
  //   'Content-Type': 'application/json',

  // },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem(TOKEN_KEY);
    const tenantUuid = typeof window !== 'undefined' ? localStorage.getItem('tenant_uuid') : null;
    if (token) {
      console.log('token------', token);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found, redirecting to login...');
      // Navigate to login if token is not found
    }
    console.log('tenant_uuid------', tenantUuid);

    return config;
  },
  error => Promise.reject(error),
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const pathname = window.location.pathname || '';
      // Do NOT redirect to login on public registration page — let the page show "Event not found" or handle 401
      const isPublicRegistration = pathname.startsWith('/register/') || pathname.startsWith('/register');
      if (!isPublicRegistration) {
        localStorage.removeItem("token"); // clear old token
        console.error('Unauthorized: Redirecting to login...');
        window.location.href = '/login'; // force redirect for dashboard routes only
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
