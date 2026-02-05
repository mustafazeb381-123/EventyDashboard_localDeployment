/**
 * RSVP email template content (data only). Will be dynamic later; static for now.
 * Extracted from the RSVP invitation email design.
 */

export type RsvpTemplateContent = {
  /** Event header */
  event: {
    eventName: string;
    eventDate: string;
    eventLocation: string;
    poweredBy: string;
  };
  /** Invitation body */
  invitation: {
    recipientName: string;
    mainMessage: string;
    date: string;
    location: string;
  };
  /** RSVP action section */
  rsvp: {
    instruction: string;
    noteAfterConfirm: string;
    acceptButtonText: string;
    declineButtonText: string;
    closingMessage: string;
  };
};

/** Static RSVP template data (will be dynamic later). */
export const RSVP_TEMPLATE_DATA: RsvpTemplateContent = {
  event: {
    eventName: "FUTURE MINERALS FORUM",
    eventDate: "13 - 15 January 2026",
    eventLocation:
      "King Abdulaziz International Conference Centre, Riyadh, Saudi Arabia",
    poweredBy: "ESNAD",
  },
  invitation: {
    recipientName: "Mr Abdullah Saleh",
    mainMessage:
      "We are pleased to invite you to attend FUTURE MINERALS FORUM. Kindly confirm your availability below.",
    date: "13 - 15 January 2026",
    location:
      "King Abdulaziz International Conference Center, Riyadh, Saudi Arabia",
  },
  rsvp: {
    instruction:
      "Please confirm your attendance by selecting one of the options below.",
    noteAfterConfirm:
      "After confirming, you will be redirected to complete your registration details.",
    acceptButtonText: "Yes, I'll Attend",
    declineButtonText: "No, I Can't Attend",
    closingMessage: "Your response helps us plan better. Thank you!",
  },
};
