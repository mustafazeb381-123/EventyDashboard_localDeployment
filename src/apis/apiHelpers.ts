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
  // return axiosInstance.post(`/events/${id}/badges`, data);
  return axiosInstance.post(`/events/${id}/badge_templates`, data);
};

export const postRegistrationTemplateFieldApi = (data: any, id: string) => {
  return axiosInstance.post(`/events/${id}/registration_fields`, data);
};

export const getRegistrationFieldApi = (id: string) => {
  return axiosInstance.get(`/events/${id}/registration_fields`);
};
export const deleteEvent = (id: string | number) => {
  return axiosInstance.delete(`/events/${id}`);
};

export const getEventbyId = (id: string | number) => {
  return axiosInstance.get(`/events/${id}`);
};

export const updateEventBannerById = (id: string | number, data: FormData) => {
  return axiosInstance.patch(`/events/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateRegistrationFieldToggleApi = (
  data: any,
  eventId: string,
  fieldId: string
) => {
  return axiosInstance.patch(
    `events/${eventId}/registration_fields/${fieldId}/toggle_active`
  );
};

export const updateEventById = (id: string | number, data: any) => {
  return axiosInstance.patch(`/events/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const createTemplatePostApi = (data: any, id: string) => {
  return axiosInstance.post(`/events/${id}/registration_templates`, data);
};

export const updatecreateTemplatePostApi = (data: any, id: string) => {
  return axiosInstance.patch(`/registration_templates/${id}`, data);
};

export const getShowEventData = (id: string | number) => {
  return axiosInstance.get(`/events/${id}`);
};

export const getRegistrationTemplateData = (id: string | number) => {
  return axiosInstance.get(`events/${id}/registration_templates/default`);
};

export const getEventBadges = (id: string | number) => {
  return axiosInstance.get(`/events/${id}/badge_templates`);
};

export const getBadgeType = (id: string | number) => {
  return axiosInstance.get(`/events/${id}/badges`);
};

// Create a new user for a specific event, with optional tenant UUID and image upload
export const createEventUser = (eventId: string, formData: FormData) => {
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
export const updateEventUser = (
  eventId: string,
  userId: string,
  formData: FormData
) => {
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

  return axiosInstance.post(`/events/${eventId}/event_users/import`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const sendCredentials = (
  eventId: string,
  userIds: number[] | string[]
) => {
  return axiosInstance.post(`/events/${eventId}/event_users/send_credentials`, {
    user_ids: userIds,
  });
};

export const createSessionAreaApi = (data: any, id: string) => {
  return axiosInstance.post(`events/${id}/session_areas`, data);
};

export const getSessionAreaApi = (id: string) => {
  return axiosInstance.get(`events/${id}/session_areas`);
};

export const deleteSessionAreaApi = (eventId: string, areaId: string) => {
  return axiosInstance.delete(`events/${eventId}/session_areas/${areaId}`);
};

export const updateSessionAreaApi = (
  eventId: string,
  areaId: string,
  data: any
) => {
  return axiosInstance.patch(`events/${eventId}/session_areas/${areaId}`, data);
};

export const createEmailTemplate = (
  eventId: string | number,
  confirmationData: any
) => {
  return axiosInstance.post(
    `events/${eventId}/confirmations`,
    confirmationData
  );
};
export const updatedEmailTemplate = (
  eventId: string | number,
  confirmationData: any
) => {
  return axiosInstance.patch(
    `events/${eventId}/confirmations`,
    confirmationData
  );
};

export const getEmailTemplate = (eventId: string | number) => {
  return axiosInstance.get(`events/${eventId}/confirmations`);
};

export const deleteEmailTemplate = (
  eventId: string | number,
  confirmationId: string | number
) => {
  return axiosInstance.delete(
    `events/${eventId}/confirmations/${confirmationId}`
  );
};

// Post Gate
export const createGate = (data: any) => {
  return axiosInstance.post(`/check_in_and_out_gates/`, data);
};

// Get Gates
export const getGates = (eventId: string) => {
  return axiosInstance.get(`/check_in_and_out_gates`, {
    params: { event_id: eventId },
  });
};

export const deleteGate = (
  gateId: string | number,
  eventId: string | number
) => {
  return axiosInstance.delete(`/check_in_and_out_gates/${gateId}`, {
    params: { event_id: eventId },
  });
};

// Get a specific gate by ID
export const getGateById = (gateId: string | number) => {
  return axiosInstance.get(`/check_in_and_out_gates/${gateId}`);
};

// ✅ Check in user
export const checkInUser = (
  eventId: string | number,
  userId: string | number
) => {
  return axiosInstance.post(
    `/events/${eventId}/check_user_event_statuses/check_in`,
    {
      check_user_event_status: {
        event_user_id: userId,
      },
    }
  );
};

// ✅ Check in user for area
export const checkInUserForArea = (
  eventId: string | number,
  userId: string | number,
  gateToken: string
) => {
  return axiosInstance.post(
    `/events/${eventId}/check_user_area_statuses/check_in`,
    {
      check_user_area_status: {
        event_user_id: userId,
        gate_token: gateToken,
      },
    }
  );
};

// ✅ Get users for check-in Event
export const usersForCheckIn = (eventId: string | number) => {
  return axiosInstance.get(
    `/events/${eventId}/check_user_event_statuses/need_check_in`
  );
};

// ✅ Get users for check-in Area
export const usersForCheckInArea = (
  eventId: string | number,
  gateToken: string
) => {
  return axiosInstance.get(
    `/events/${eventId}/check_user_area_statuses/need_check_in`,
    {
      params: { gate_token: gateToken },
    }
  );
};

// ✅ Get users for check-out Event
export const usersForCheckOutEvent = (eventId: string | number) => {
  return axiosInstance.get(
    `/events/${eventId}/check_user_event_statuses/need_check_out`
  );
};

// ✅ Get users for check-out Area
export const usersForCheckOutAreas = (
  eventId: string | number,
  gateToken?: string
) => {
  return axiosInstance.get(
    `/events/${eventId}/check_user_area_statuses/need_check_out`,
    {
      params: { gate_token: gateToken },
    }
  );
};

// ✅ Check-Out
export const checkOutUser = (
  eventId: string | number,
  userId: string | number,
  statusId: string | number
) => {
  return axiosInstance.patch(
    `/events/${eventId}/check_user_event_statuses/${statusId}/check_out`,
    {
      event_user_id: userId,
    }
  );
};

// ✅ Bulk Check-In
export const bulkCheckInUsers = (
  eventId: string | number,
  userIds: number[] | string[]
) => {
  return axiosInstance.post(
    `/events/${eventId}/check_user_event_statuses/check_in`,
    {
      event_user_ids: userIds,
    }
  );
};

export const tokenCheckIn = (eventId: string | number, token: string) => {
  return axiosInstance.post(
    `/events/${eventId}/check_user_event_statuses/token_check_in`,
    {
      token: token,
    }
  );
};

// ✅ QR/Token Check-Out
export const tokenCheckOut = (eventId: string | number, token: string) => {
  return axiosInstance.post(
    `/events/${eventId}/check_user_event_statuses/token_check_out`,
    {
      token: token,
    }
  );
};

export const getBadgeApi = (eventId: string | number) => {
  return axiosInstance.get(
    `/events/${eventId}/badge_templates/default_template`
  );
};
