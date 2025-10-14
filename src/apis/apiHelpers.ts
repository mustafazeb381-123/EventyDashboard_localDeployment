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

export const getEventBadges = (id: string | number) => {
  return axiosInstance.get(`/events/${id}/badge_templates`);
}

export const getBadgeType = (id: string | number) => {
  return axiosInstance.get(`/events/${id}/badges`);
};

// Create a new user for a specific event, with optional tenant UUID and image upload
export const createEventUser = (
  eventId: string,
  userData: any,
  tenantUuid?: string,
  imageFile?: File // optional image
) => {
  const formData = new FormData();

  // Append tenant_uuid if provided
  if (tenantUuid) formData.append("tenant_uuid", tenantUuid);

  // Append user data
  formData.append("event_user[name]", userData.name);
  formData.append("event_user[phone_number]", userData.phone_number);
  formData.append("event_user[email]", userData.email);
  if (userData.position) formData.append("event_user[position]", userData.position);
  if (userData.organization) formData.append("event_user[organization]", userData.organization);

  // Append image if provided
  if (imageFile) formData.append("event_user[image]", imageFile);

  return axiosInstance.post(`/events/${eventId}/event_users`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Get all users for a specific event
export const getEventUsers = (eventId: string) => {
  return axiosInstance.get(`/events/${eventId}/event_users`);
};

// Delete a specific user from an event
export const deleteEventUser = (eventId: string, userId: string | number) => {
  return axiosInstance.delete(`/events/${eventId}/event_users/${userId}`);
};

// Update a specific user's details for an event
export const updateEventUser = (eventId: string, userId: string, data: any) => {
  return axiosInstance.patch(`/events/${eventId}/event_users/${userId}`, {
    event_user: data,
  });
};












