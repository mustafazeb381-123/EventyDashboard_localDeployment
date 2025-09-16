import axios from 'axios';
import axiosInstance from './axiosInstance';

// Example: get location
// export const getUserProfile = () => axiosInstance.get('/v1/get_locatioon');
// export const getUserProfile = () =>
//   axiosInstance.get('/v1/employees/my_profile');

// signup
export const signupApi = (data: any) =>
  axiosInstance.post('/users/sign_up', data);

// signin

export const loginApi = (data: any) => axiosInstance.post('/users/sign_in', data)

// event post api

export const eventPostApi = (data: any) => {
  const formData = new FormData();

  // Loop through object keys and append to FormData
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });

  return axiosInstance.post('/events', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
