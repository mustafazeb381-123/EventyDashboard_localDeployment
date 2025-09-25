import axiosInstance from "./axiosInstance";

// Example: get location
// export const getUserProfile = () => axiosInstance.get('/v1/get_locatioon');
// export const getUserProfile = () =>
//   axiosInstance.get('/v1/employees/my_profile');

// signup
export const signupApi = (data: any) =>
  axiosInstance.post("/users/sign_up", data);

// signin

export const loginApi = (data: any) =>
  axiosInstance.post("/users/sign_in", data);

// event post api

// export const eventPostAPi = (data: any) => {
//   axiosInstance.post('/events', {
//     ...data
//   },
//     {
//       headers: {
//         "Content-Type": "multipart/form-data"
//       }
//     }
//   )
// }

export const eventPostAPi = (payload: FormData) => {
  return axiosInstance.post("/events", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getAllEvents = (params?: Record<string, any>) => {
  return axiosInstance.get("/events", { params });
};

export const postBadgesApi = (data: any, id: number) => {
  return axiosInstance.post(`/events/${id}/badges`, data);
};

export const postRegistrationTemplateFieldApi = (data: any, id: string) => {
  return axiosInstance.post(`/events/${id}/registration_fields`, data);
}

export const getRegistrationFieldApi = (id: string) => {
  return axiosInstance.get(`/events/${id}/registration_fields`);
}
export const deleteEvent = (id: string | number) => {
  return axiosInstance.delete(`/events/${id}`);
};
