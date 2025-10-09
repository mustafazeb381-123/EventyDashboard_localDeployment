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


export const getEventbyId = (id: string | number) => {
  return axiosInstance.get(`/events/${id}`);
}

export const updateEventBannerById = (id: string | number, data: FormData) => {
  return axiosInstance.patch(`/events/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}


export const updateRegistrationFieldToggleApi = (data: any, eventId: string, fieldId: string) => {
  return axiosInstance.patch(`events/${eventId}/registration_fields/${fieldId}/toggle_active`);
}

export const updateEventById = (id: string | number, data: any) => {
  return axiosInstance.patch(`/events/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",

    }
  });

}

export const createTemplatePostApi = (data: any, id: string) => {
  return axiosInstance.post(`/events/${id}/registration_templates`, data);
}

export const updatecreateTemplatePostApi = (data: any, id: string) => {
  return axiosInstance.patch(`/registration_templates/${id}`, data);
}


export const getShowEventData = (id: string | number) => {
  return axiosInstance.get(`/events/${id}`);
}


export const getRegistrationTemplateData = (id: string | number) => {
  return axiosInstance.get(`events/${id}/registration_templates/default`)
}


// Get all badge templates for a specific event.
export const getEventBadges = (id: string | number) => {
  return axiosInstance.get(`/events/${id}/badge_templates`);
}

export const getBadgeType = (id: string | number) => {
  return axiosInstance.get(`/events/${id}/badges`);
};


export const createAreaSessionApi = (data: any, id: string) => {
  return axiosInstance.post(`events/${id}/session_areas`, data);
}



