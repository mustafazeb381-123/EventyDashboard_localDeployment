import axios from 'axios';
import axiosInstance from './axiosInstance';

// Example: get location
// export const getUserProfile = () => axiosInstance.get('/v1/get_locatioon');
// export const getUserProfile = () =>
//   axiosInstance.get('/v1/employees/my_profile');

// signup
export const signupApi = async (data: any) => {
  try {
    console.log("📤 Signup payload:", data);
    const response = await axiosInstance.post("/users/sign_up", data);

    console.log("✅ Signup success:", response.data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("❌ Signup error response:", error.response.data);

      // Check if server returned HTML instead of JSON
      const contentType = error.response.headers['content-type'] || '';
      if (contentType.includes('text/html')) {
        console.error("Server returned HTML error page instead of JSON");
        throw new Error("Server error. Please try again later or contact support.");
      }

      // Handle JSON responses
      const errors = error.response.data?.errors;
      if (errors) {
        const messages: string[] = [];

        if (errors.email?.length) {
          messages.push(`Email: ${errors.email[0]}`);
        }

        if (errors.company?.length) {
          messages.push(`Company: ${errors.company[0]}`);
        }

        if (messages.length > 0) {
          throw new Error(messages.join(" | "));
        }
      }

      // Handle simple error message format
      if (error.response.data?.error) {
        throw new Error(error.response.data.error);
      }

      // Fallback
      throw new Error(error.response.data?.message || "Unknown signup error.");
    } else {
      console.error("❌ Signup network error:", error);
      throw new Error("Network error. Please try again later.");
    }
  }
};



// signin

export const loginApi = (data: any) => axiosInstance.post('/users/sign_in', data)
