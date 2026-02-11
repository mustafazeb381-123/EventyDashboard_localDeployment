export type TabId =
  | "invitation-details"
  | "email-template"
  | "rsvp-template"
  | "invitees";

/** API enum: invitation_type */
export type InvitationType = "email" | "sms" | "whatsapp";

export type InvitationEmailTemplate = {
  id: string;
  title: string;
  html: string;
  design: any;
};

export type InvitationForm = {
  invitationName: string;
  communicationType: InvitationType;
  invitationCategory: string;
  event: string;
  language: string;
  scheduleSendAt: string;
  emailSubject: string;
  backgroundColor: string;
  emailSender: string;
};
