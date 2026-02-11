import axiosInstance from "./axiosInstance";

/** Event invitation user (invitee) */
export interface EventInvitationUser {
  id: number;
  event_invitation_id: number;
  email: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  source?: string;
  invitation_sent_at?: string;
  created_at: string;
  updated_at: string;
}

/** Invitation sender */
export interface InvitationSender {
  id: number;
  email: string;
  set_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Single event invitation (list item / get one) */
export interface EventInvitation {
  id: number;
  event_id: number;
  title: string;
  invitation_type: string;
  invitation_language: string;
  sender_email?: string;
  send_to?: string;
  invitation_email_subject: string;
  invitation_email_body?: string;
  scheduled_send_time?: string;
  enable_rsvp: boolean;
  is_vip_invitation: boolean;
  event_invitation_users_count: number;
  created_at: string;
  updated_at: string;
  invitations_users_import_file_url?: string;
  event_invitation_users?: EventInvitationUser[];
  invitation_senders?: InvitationSender[];
}

/** List response with pagination */
export interface EventInvitationsListResponse {
  data: EventInvitation[];
  meta?: {
    pagination: {
      current_page: number;
      next_page: number | null;
      prev_page: number | null;
      total_pages: number;
      total_count: number;
      per_page: number;
    };
  };
}

/** Backend: send_to enum */
export type SendTo = "all" | "imported_from_file" | "manually_entered";

/** Backend: invitation_type enum */
export type InvitationType = "email" | "sms" | "whatsapp";

/** Payload for create/update: user_import_object */
export interface UserImportItem {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  user_type?: string;
}

/** Create/update request body */
export interface EventInvitationPayload {
  event_invitation: {
    title?: string;
    invitation_type?: InvitationType;
    invitation_language?: string;
    sender_email?: string;
    /** all | imported_from_file | manually_entered */
    send_to?: SendTo;
    invitation_email_subject?: string;
    invitation_email_body?: string;
    scheduled_send_time?: string;
    enable_rsvp?: boolean;
    is_vip_invitation?: boolean;
    resend_invitations?: boolean;
    user_import_object?: UserImportItem[];
  };
}

/**
 * List all event invitations for an event (paginated).
 * GET /events/{event_id}/event_invitations
 */
export const getEventInvitations = (
  eventId: string | number,
  params?: { page?: number; per_page?: number }
) => {
  return axiosInstance.get<EventInvitationsListResponse>(
    `/events/${eventId}/event_invitations`,
    { params: { page: 1, per_page: 10, ...params } }
  );
};

/**
 * Create a new event invitation.
 * POST /events/{event_id}/event_invitations
 */
export const createEventInvitation = (
  eventId: string | number,
  payload: EventInvitationPayload
) => {
  return axiosInstance.post<EventInvitation>(
    `/events/${eventId}/event_invitations`,
    payload
  );
};

/**
 * Get a single event invitation.
 * GET /events/{event_id}/event_invitations/{id}
 */
export const getEventInvitation = (
  eventId: string | number,
  invitationId: string | number
) => {
  return axiosInstance.get<EventInvitation>(
    `/events/${eventId}/event_invitations/${invitationId}`
  );
};

/**
 * Update an event invitation.
 * PUT /events/{event_id}/event_invitations/{id}
 */
export const updateEventInvitation = (
  eventId: string | number,
  invitationId: string | number,
  payload: EventInvitationPayload
) => {
  return axiosInstance.put<EventInvitation>(
    `/events/${eventId}/event_invitations/${invitationId}`,
    payload
  );
};

/**
 * Delete an event invitation.
 * DELETE /events/{event_id}/event_invitations/{id}
 */
export const deleteEventInvitation = (
  eventId: string | number,
  invitationId: string | number
) => {
  return axiosInstance.delete(
    `/events/${eventId}/event_invitations/${invitationId}`
  );
};

/**
 * Remove invitees from an invitation.
 * POST /events/{event_id}/event_invitations/{id}/destroy_event_invitation_users
 */
export const destroyEventInvitationUsers = (
  eventId: string | number,
  invitationId: string | number,
  eventInvitationUserIds: number[]
) => {
  return axiosInstance.post(
    `/events/${eventId}/event_invitations/${invitationId}/destroy_event_invitation_users`,
    { event_invitation_user_ids: eventInvitationUserIds }
  );
};

/**
 * Preview invitees from file (before import).
 * POST /events/{event_id}/event_invitations/preview_import_from_file_invitees
 * Request body: { invitations_users_import_file: "string" } (likely base64 or URL; check backend for format)
 */
export const previewImportFromFileInvitees = (
  eventId: string | number,
  invitationsUsersImportFile: string
) => {
  return axiosInstance.post<{ invitees: unknown[] }>(
    `/events/${eventId}/event_invitations/preview_import_from_file_invitees`,
    { invitations_users_import_file: invitationsUsersImportFile }
  );
};

/**
 * Send a test invitation email.
 * POST /events/{event_id}/event_invitations/{id}/send_test_email
 */
export const sendTestInvitationEmail = (
  eventId: string | number,
  invitationId: string | number
) => {
  return axiosInstance.post<{ message: string }>(
    `/events/${eventId}/event_invitations/${invitationId}/send_test_email`
  );
};

/**
 * Record RSVP response (public endpoint; may use different base or no auth).
 * POST /api_dashboard/v1/event_invitations/rsvp_response?rsvp_token=...&rsvp_response=accepted|declined|maybe
 */
export const rsvpResponse = (
  rsvpToken: string,
  rsvpResponse: "accepted" | "declined" | "maybe"
) => {
  return axiosInstance.post(
    `/event_invitations/rsvp_response`,
    null,
    { params: { rsvp_token: rsvpToken, rsvp_response: rsvpResponse } }
  );
};
