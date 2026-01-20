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

export const getBadgesApi = (id: number) => {
  // return axiosInstance.post(`/events/${id}/badges`, datfa);
  return axiosInstance.get(`/events/${id}/badge_templates`);
};

export const deleteBadgeTemplateApi = (eventId: number, templateId: number) => {
  return axiosInstance.delete(`/events/${eventId}/badge_templates/${templateId}`);
};

export const updateBadgeTemplateApi = (eventId: number, templateId: number, data: any) => {
  return axiosInstance.put(`/events/${eventId}/badge_templates/${templateId}`, data);
};

export const postRegistrationTemplateFieldApi = (data: any, id: string) => {
  return axiosInstance.post(`/events/${id}/registration_fields`, data);
};

// Create a new registration field
export const createRegistrationFieldApi = (
  eventId: string | number,
  fieldData: {
    field: string;
    name: string;
    order?: number;
    active?: boolean;
    custom?: boolean;
    required?: boolean;
    full_width?: boolean;
    validation_type?: string;
    max_companion?: number;
    field_options?: string[];
  }
) => {
  return axiosInstance.post(`/events/${eventId}/registration_fields`, {
    event_registration_field: fieldData,
  });
};

// Delete a registration field
export const deleteRegistrationFieldApi = (
  eventId: string | number,
  fieldId: number
) => {
  return axiosInstance.delete(
    `/events/${eventId}/registration_fields/${fieldId}`
  );
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

export const reorderRegistrationFieldApi = (
  eventId: string | number,
  fieldId: number,
  targetFieldId: number
) => {
  return axiosInstance.patch(
    `events/${eventId}/registration_fields/reorder`,
    {
      field_id: fieldId,
      target_field_id: targetFieldId,
    }
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

// Get all registration form templates for an event
export const getRegistrationFormTemplates = (
  eventId: string | number,
  params?: { name?: string; page?: number; per_page?: number }
) => {
  return axiosInstance.get(
    `/events/${eventId}/registration_form_templates`,
    { params }
  );
};

// Get the default registration form template for an event (returns either custom or old template)
export const getDefaultRegistrationFormTemplate = (
  eventId: string | number
) => {
  return axiosInstance.get(
    `/events/${eventId}/registration_form_templates/default_template`
  );
};

// Create a new registration form template
export const createRegistrationFormTemplate = (
  eventId: string | number,
  data: {
    registration_form_template: {
      name: string;
      default?: boolean;
      form_template_data: {
        fields?: any[];
        bannerImage?: string;
        theme?: {
          logo?: string;
          formBackgroundImage?: string;
          primaryColor?: string;
          secondaryColor?: string;
          [key: string]: any;
        };
        [key: string]: any;
      };
    };
  }
) => {
  return axiosInstance.post(
    `/events/${eventId}/registration_form_templates`,
    data
  );
};

// Update an existing registration form template
export const updateRegistrationFormTemplate = (
  eventId: string | number,
  templateId: string | number,
  data: {
    registration_form_template: {
      name: string;
      default?: boolean;
      form_template_data: {
        fields?: any[];
        bannerImage?: string;
        theme?: {
          logo?: string;
          formBackgroundImage?: string;
          primaryColor?: string;
          secondaryColor?: string;
          [key: string]: any;
        };
        [key: string]: any;
      };
    };
  }
) => {
  return axiosInstance.put(
    `/events/${eventId}/registration_form_templates/${templateId}`,
    data
  );
};

// Delete a registration form template
export const deleteRegistrationFormTemplate = (
  eventId: string | number,
  templateId: string | number
) => {
  return axiosInstance.delete(
    `/events/${eventId}/registration_form_templates/${templateId}`
  );
};

// Set a registration form template as default
export const setRegistrationFormTemplateAsDefault = (
  eventId: string | number,
  templateId: string | number
) => {
  return axiosInstance.patch(
    `/events/${eventId}/registration_form_templates/${templateId}/set_as_default`
  );
};

export const getEventBadges = (id: string | number) => {
  return axiosInstance.get(`/events/${id}/badge_templates`);
};

export const getBadgeType = (id: string | number) => {
  return axiosInstance.get(`/events/${id}/badges`);
};

// Create a new user for a specific event, with optional tenant UUID and image upload
export const createEventUser = (eventId: string, formData: FormData) => {
  // Don't set Content-Type manually - axios will set it automatically with boundary for FormData
  return axiosInstance.post(`/events/${eventId}/event_users`, formData);
};

// Get all users for a specific event with pagination
export const getEventUsers = (
  eventId: string,
  params?: { page?: number; per_page?: number }
) => {
  return axiosInstance.get(`/events/${eventId}/event_users`, { params });
};

// Get registration metrics for event users
export const getEventUserMetrics = (eventId: string | number) => {
  return axiosInstance.get(`/events/${eventId}/event_users/metrics`);
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

export const getSessionAreaApi = (
  id: string,
  params?: { page?: number; per_page?: number }
) => {
  return axiosInstance.get(`events/${id}/session_areas`, { params });
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

// -------------------------------------------- Areas -----------------------------------------------------

// ✅ Get Check-Ins
export const getCheckIns = (eventId: string | number, sessionAreaId: string | number) => {
  return axiosInstance.get(`/events/${eventId}/session_areas/${sessionAreaId}/need_check_in`);
};

// ✅ Get Check-Outs
export const getCheckOuts = (eventId: string | number, sessionAreaId: string | number) => {
  return axiosInstance.get(`/events/${eventId}/session_areas/${sessionAreaId}/need_check_out`);
};

// ✅ Post Check-Ins
export const postCheckIns = (
  eventId: string | number,
  sessionAreaId: string | number,
  eventUserId: string | number
) => {
  return axiosInstance.post(
    `/events/${eventId}/session_areas/${sessionAreaId}/check_in`,
    {
      check_user_area_status: {
        event_user_id: eventUserId,
      },
    }
  );
};

// ✅ Post Check-Outs
export const postCheckOuts = (
  eventId: string | number,
  sessionAreaId: string | number,
  eventUserId: string | number
) => {
  return axiosInstance.post(
    `/events/${eventId}/session_areas/${sessionAreaId}/check_out`,
    {
      check_user_area_status: {
        event_user_id: eventUserId,
      },
    }
  );
};

// ✅ QR Check-In
export const QRCheckIn = (
  eventId: string | number,
  sessionAreaId: string | number,
  token: string
) => {
  return axiosInstance.post(
    `/events/${eventId}/session_areas/${sessionAreaId}/token_check_in`,
    { token }
  );
};

// ✅ QR Check-Out
export const QRCheckOut = (
  eventId: string | number,
  sessionAreaId: string | number,
  token: string
) => {
  return axiosInstance.post(
    `/events/${eventId}/session_areas/${sessionAreaId}/token_check_out`,
    { token }
  );
};

export const resetCheckInOutStatus = (
  eventId: string | number,
  eventUserId: string | number
) => {
  return axiosInstance.put(
    `/events/${eventId}/check_user_event_statuses/reset_check_in_out`,
    {
      check_user_event_status: {
        event_user_id: eventUserId,
      },
    }
  );
};

// Event-level check-in (not session area specific)
export const checkInUser = (
  eventId: string | number,
  eventUserId: string | number
) => {
  return axiosInstance.post(
    `/events/${eventId}/check_user_event_statuses/check_in`,
    {
      check_user_event_status: {
        event_user_id: eventUserId,
      },
    }
  );
};

// Event-level check-out (not session area specific)
export const checkOutUser = (
  eventId: string | number,
  eventUserId: string | number
) => {
  return axiosInstance.post(
    `/events/${eventId}/check_user_event_statuses/check_out`,
    {
      check_user_event_status: {
        event_user_id: eventUserId,
      },
    }
  );
};

export const getBadgeApi = (eventId: string | number) => {
  return axiosInstance.get(
    `/events/${eventId}/badge_templates/default_template`
  );
};

export const deleteBadgeType = (
  eventId: string | number,
  badgeId: string | number
) => {
  console.log("API Helper - Deleting badge:", badgeId, "from event:", eventId);

  // REMOVE the data: {} object - DELETE requests usually don't need a body
  return axiosInstance.delete(`/events/${eventId}/badges/${badgeId}`);
  // No need for: , { data: {} }
};

export const addGuestType = (eventId: number | string, name: string) => {

  return axiosInstance.post(
    `/events/${eventId}/badges`,
    {
      badge: {
        name: name,
        event_id: eventId,
        default: false
      }
    },
  );

};

//---------------------- speaker partner agenda -------------------------


export const createSpeakerApi = (eventId: string | number, data: FormData) => {
  return axiosInstance.post(`events/${eventId}/speakers`, data, {
  });
};

export const getSpeakersApi = (eventId: string | number) => {
  return axiosInstance.get(`events/${eventId}/speakers`);
};

export const deleteSpeakerApi = (eventId: string | number, speakerId: string | number) => {
  return axiosInstance.delete(`events/${eventId}/speakers/${speakerId}`);
};

export const updateSpeakerApi = (eventId: string | number, speakerId: string | number, data: FormData) => {
  return axiosInstance.put(`events/${eventId}/speakers/${speakerId}`, data);
};


export const updateExhibitorApi = (eventId: string | number, exhibitorId: string | number, data: FormData) => {
  return axiosInstance.put(`events/${eventId}/exhibitors/${exhibitorId}`, data);
};

export const createExhibitorApi = (eventId: string | number, data: FormData) => {
  return axiosInstance.post(`events/${eventId}/exhibitors`, data);
};

export const getExhibitorsApi = (eventId: string | number) => {
  return axiosInstance.get(`events/${eventId}/exhibitors`);
};

export const deleteExhibitorApi = (eventId: string | number, exhibitorId: string | number) => {
  return axiosInstance.delete(`events/${eventId}/exhibitors/${exhibitorId}`);
};




export const createPartnerApi = (eventId: string | number, data: FormData) => {
  return axiosInstance.post(`events/${eventId}/partners`, data, {
  });
};

export const getPartnerApi = (eventId: string | number) => {
  return axiosInstance.get(`events/${eventId}/partners`);
};

export const deletePartnerApi = (eventId: string | number, speakerId: string | number) => {
  return axiosInstance.delete(`events/${eventId}/partners/${speakerId}`);
};

export const updatePartnerApi = (eventId: string | number, speakerId: string | number, data: FormData) => {
  return axiosInstance.put(`events/${eventId}/partners/${speakerId}`, data);
};




export const createAgendaApi = (eventId: string | number, data: any) => {
  return axiosInstance.post(`events/${eventId}/agendas`, data);
};


export const getAgendaApi = (eventId: string | number) => {
  return axiosInstance.get(`events/${eventId}/agendas`);
};

export const deleteAgendaApi = (eventId: string | number, agendaId: string | number) => {
  return axiosInstance.delete(`events/${eventId}/agendas/${agendaId}`);
};

export const updateAgendaApi = (eventId: string | number, agendaId: string | number, data: any) => {
  return axiosInstance.put(`events/${eventId}/agendas/${agendaId}`, data);
};

// ---------------------- Email Templates (New Unified API) ----------------------

// Map flow types to API template types
const getEmailTemplateType = (flowType: string): string => {
  const map: Record<string, string> = {
    welcome: "welcome",
    "thank_you": "thank_you",
    thanks: "thank_you", // Alias for thanks
    confirmation: "welcome", // Map confirmation to welcome type
    reminder: "reminder",
    rejection: "rejection", // Add rejection type
  };
  return map[flowType] || "welcome";
};

// Get all email templates for an event (optionally filtered by type)
export const getEmailTemplatesApi = (
  eventId: string | number,
  templateType?: string
) => {
  const params = templateType ? { template_type: getEmailTemplateType(templateType) } : {};
  return axiosInstance.get(`/events/${eventId}/email_templates`, { params });
};

// Get a specific email template by ID
export const getEmailTemplateByIdApi = (
  eventId: string | number,
  templateId: string | number
) => {
  return axiosInstance.get(`/events/${eventId}/email_templates/${templateId}`);
};

// Create a new email template
export const createEmailTemplateApi = (
  eventId: string | number,
  templateType: string,
  html: string,
  name: string = "Custom Template",
  design?: any
) => {
  const payload: any = {
    email_template: {
      name: name,
      template_type: getEmailTemplateType(templateType),
      body: html,
    },
  };

  // Include design if provided (store as JSON string)
  // Note: Backend may not support this field yet, but we send it anyway
  // If backend doesn't support it, the field will be ignored but won't cause errors
  if (design) {
    payload.email_template.design = typeof design === 'string' ? design : JSON.stringify(design);
  }

  return axiosInstance.post(`/events/${eventId}/email_templates`, payload);
};

// Update an existing email template (using PUT as per API spec)
export const updateEmailTemplateApi = (
  eventId: string | number,
  templateId: string | number,
  templateType: string,
  html: string,
  name: string,
  design?: any
) => {
  const payload: any = {
    email_template: {
      name: name,
      template_type: getEmailTemplateType(templateType),
      body: html,
    },
  };

  // Include design if provided (store as JSON string)
  // Note: Backend may not support this field yet, but we send it anyway
  // If backend doesn't support it, the field will be ignored but won't cause errors
  if (design) {
    payload.email_template.design = typeof design === 'string' ? design : JSON.stringify(design);
  }

  return axiosInstance.put(
    `/events/${eventId}/email_templates/${templateId}`,
    payload
  );
};

// Delete an email template
export const deleteEmailTemplateApi = (
  eventId: string | number,
  templateId: string | number
) => {
  return axiosInstance.delete(
    `/events/${eventId}/email_templates/${templateId}`
  );
};

// ---------------------- Event Users Questions API ----------------------

// Get all event user questions for an agenda (with optional status filter)
export const getEventUserQuestionsApi = (
  eventId: string | number,
  agendaId: string | number,
  params?: {
    status?: "all" | "pending" | "accepted" | "rejected";
    page?: number;
    per_page?: number;
  }
) => {
  return axiosInstance.get(
    `/events/${eventId}/agendas/${agendaId}/event_users_questions`,
    { params }
  );
};

// Get a specific event user question by ID
export const getEventUserQuestionByIdApi = (
  eventId: string | number,
  agendaId: string | number,
  questionId: string | number
) => {
  return axiosInstance.get(
    `/events/${eventId}/agendas/${agendaId}/event_users_questions/${questionId}`
  );
};

// Create a new event user question
export const createEventUserQuestionApi = (
  eventId: string | number,
  agendaId: string | number,
  data: {
    event_users_question: {
      question: string;
      event_user_id: number;
      display_name?: boolean;
      privacy_status?: "public_question" | "private_question";
    };
  }
) => {
  return axiosInstance.post(
    `/events/${eventId}/agendas/${agendaId}/event_users_questions`,
    data
  );
};

// Update an event user question
export const updateEventUserQuestionApi = (
  eventId: string | number,
  agendaId: string | number,
  questionId: string | number,
  data: {
    event_users_question: {
      question?: string;
      display_name?: boolean;
      privacy_status?: "public_question" | "private_question";
    };
  }
) => {
  return axiosInstance.put(
    `/events/${eventId}/agendas/${agendaId}/event_users_questions/${questionId}`,
    data
  );
};

// Delete an event user question
export const deleteEventUserQuestionApi = (
  eventId: string | number,
  agendaId: string | number,
  questionId: string | number
) => {
  return axiosInstance.delete(
    `/events/${eventId}/agendas/${agendaId}/event_users_questions/${questionId}`
  );
};

// Update question status (accept/reject)
export const updateEventUserQuestionStatusApi = (
  eventId: string | number,
  agendaId: string | number,
  questionId: string | number,
  questionStatus: "pending" | "accepted" | "rejected"
) => {
  return axiosInstance.patch(
    `/events/${eventId}/agendas/${agendaId}/event_users_questions/${questionId}/update_status`,
    {
      question_status: questionStatus,
    }
  );
};

// Bulk update question status (accept/reject multiple questions)
export const bulkUpdateEventUserQuestionStatusApi = (
  eventId: string | number,
  agendaId: string | number,
  questionIds: (string | number)[],
  questionStatus: "pending" | "accepted" | "rejected"
) => {
  return axiosInstance.patch(
    `/events/${eventId}/agendas/${agendaId}/event_users_questions/bulk_update_status`,
    {
      question_ids: questionIds,
      question_status: questionStatus,
    }
  );
};

// Like or unlike a question (toggle)
export const likeEventUserQuestionApi = (
  eventId: string | number,
  agendaId: string | number,
  questionId: string | number
) => {
  return axiosInstance.post(
    `/events/${eventId}/agendas/${agendaId}/event_users_questions/${questionId}/like_question`
  );
};








