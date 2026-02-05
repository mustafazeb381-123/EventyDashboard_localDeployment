import type { CustomFormField } from "@/components/AdvanceEventComponent/CustomFormBuilder/types";

/** Default fields for the RSVP response form: First name, Last name, Email, Phone number. Confirm/Decline are shown as action buttons at the end. */
export const DEFAULT_RSVP_FORM_FIELDS: CustomFormField[] = [
  {
    id: "rsvp-field-firstname",
    type: "text",
    label: "First Name",
    name: "firstname",
    placeholder: "Enter your first name",
    required: true,
    unique: false,
  },
  {
    id: "rsvp-field-lastname",
    type: "text",
    label: "Last Name",
    name: "lastname",
    placeholder: "Enter your last name",
    required: true,
    unique: false,
  },
  {
    id: "rsvp-field-email",
    type: "email",
    label: "Email Address",
    name: "email",
    placeholder: "Enter your email address",
    required: true,
    unique: false,
  },
  {
    id: "rsvp-field-phone",
    type: "text",
    label: "Phone Number",
    name: "phone",
    placeholder: "Enter your phone number",
    required: false,
    unique: false,
    inputVariant: "phone",
  },
];
