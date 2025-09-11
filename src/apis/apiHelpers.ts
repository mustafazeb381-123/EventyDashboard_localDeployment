import axiosInstance from './axiosInstance';

// Example: get location
// export const getUserProfile = () => axiosInstance.get('/v1/get_locatioon');
export const getUserProfile = () =>
  axiosInstance.get('/v1/employees/my_profile');

// signup
export const signupApi = (data: any) =>
  axiosInstance.post('/users/sign_up', data);
