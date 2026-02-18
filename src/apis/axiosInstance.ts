import axios from 'axios';

const TOKEN_KEY = 'token';




// Your identifier
// const identifier = storage.getString("identifier"); // Your identifier
// console.log('Identifier in the axios instance file:', identifier);
// In dev, use same-origin path so Vite proxy can forward to API (avoids CORS). In prod, use full API URL.
const API_BASE =
  typeof import.meta !== "undefined" && import.meta.env?.DEV
    ? "/en/api_dashboard/v1"
    : "https://scceventy.dev/en/api_dashboard/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  config => {
    // RSVP endpoints are public — no auth required (rsvp response + rsvp template)
    const url = config.url ?? '';
    const isRsvpPublic = url.includes('rsvp_response') || url.includes('rsvp_template');
    if (isRsvpPublic) {
      return config;
    }
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
      // Do NOT redirect to login on public pages (registration, RSVP)
      const isPublicRegistration = pathname.startsWith('/register/') || pathname.startsWith('/register');
      const isPublicRsvp = pathname.startsWith('/rsvp/') || pathname.startsWith('/rsvp');
      if (!isPublicRegistration && !isPublicRsvp) {
        localStorage.removeItem("token"); // clear old token
        console.error('Unauthorized: Redirecting to login...');
        window.location.href = '/login'; // force redirect for dashboard routes only
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
