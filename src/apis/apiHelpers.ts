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
  formData: FormData
) => {
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
export const updateEventUser = (eventId: string, userId: string, formData: FormData) => {
  return axiosInstance.patch(
    `/events/${eventId}/event_users/${userId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};


// ✅ Download Excel template for event users
export const downloadEventUserTemplate = (eventId: string) => {
  return axiosInstance.get(`/events/${eventId}/event_users/download_template`, {
    responseType: "blob", // very important for binary files
  });
};

export const uploadEventUserTemplate = (eventId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file); // 'file' is what the backend expects

  return axiosInstance.post(
    `/events/${eventId}/event_users/import`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const sendCredentials = (eventId: string, userIds: number[] | string[]) => {
  return axiosInstance.post(`/events/${eventId}/event_users/send_credentials`, {
    user_ids: userIds,
  });
};







export const createSessionAreaApi = (data: any, id: string) => {
  return axiosInstance.post(`events/${id}/session_areas`, data);
}

export const getSessionAreaApi = (id: string) => {
  return axiosInstance.get(`events/${id}/session_areas`);
};

export const deleteSessionAreaApi = (eventId: string, areaId: string) => {
  return axiosInstance.delete(`events/${eventId}/session_areas/${areaId}`);
};

export const updateSessionAreaApi = (eventId: string, areaId: string, data: any) => {
  return axiosInstance.patch(`events/${eventId}/session_areas/${areaId}`, data);
}




