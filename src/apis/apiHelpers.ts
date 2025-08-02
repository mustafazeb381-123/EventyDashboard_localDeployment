import axiosInstance from './axiosInstance';

// Example: get location
// export const getUserProfile = () => axiosInstance.get('/v1/get_locatioon');
export const getUserProfile = () =>
  axiosInstance.get('/v1/employees/my_profile');