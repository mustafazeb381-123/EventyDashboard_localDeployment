export type TabId =
  | "invitation-details"
  | "email-template"
  | "rsvp-template"
  | "invitees";

export type InvitationEmailTemplate = {
  id: string;
  title: string;
  html: string;
  design: any;
};

export type InvitationForm = {
  invitationName: string;
  communicationType: string;
  invitationCategory: string;
  event: string;
  language: string;
  scheduleSendAt: string;
  emailSubject: string;
  backgroundColor: string;
  emailSender: string;
};
