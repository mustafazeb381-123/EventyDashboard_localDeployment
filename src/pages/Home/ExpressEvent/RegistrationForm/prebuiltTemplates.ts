/**
 * Pre-built registration form templates
 *
 * Each template leverages the Custom Form Builder's full feature set:
 * containers, rows, columns, bootstrap grid, layoutProps, fieldStyle,
 * helperText boxes, spacers, dividers, event details, and rich themes.
 *
 * Compatible with the `registration_form_templates` API.
 */

import type {
  CustomFormField,
  FormTheme,
} from "@/components/AdvanceEventComponent/CustomFormBuilder/types";

/* -------------------------------------------------------------------------- */
/*  Helper: generate short deterministic IDs                                  */
/* -------------------------------------------------------------------------- */

const fid = (prefix: string, idx: number) => `${prefix}-field-${idx}`;

/* -------------------------------------------------------------------------- */
/*  Interfaces                                                                */
/* -------------------------------------------------------------------------- */

export interface PrebuiltTemplate {
  /** Unique key (slug) – never changes */
  key: string;
  /** Display name translation key (dashboard namespace) */
  nameKey: string;
  /** Description translation key (dashboard namespace) */
  descriptionKey: string;
  /** Accent / brand colour shown in the template card badge */
  accentColor: string;
  /** Preview gradient for the card thumbnail */
  previewGradient: string;
  /** Icon name from lucide-react */
  icon: string;
  /** Category tag */
  category: "minimal" | "corporate" | "creative" | "elegant" | "conference" | "social" | "workshop" | "gala";
  /** The form fields */
  fields: CustomFormField[];
  /** The form theme */
  theme: FormTheme;
}

/* ========================================================================== */
/*  1 - MINIMAL CLEAN                                                         */
/*  Single-column, ultra-clean, big rounded inputs, centered event header     */
/* ========================================================================== */

const minimalCleanFields: CustomFormField[] = [
  {
    id: fid("mc", 0), type: "spacer", label: "", name: "spacer_top",
    required: false, unique: false, height: "8px",
  },
  // Name + Email side by side in a row container
  {
    id: fid("mc", 1), type: "text", label: "Row", name: "row_name_email",
    required: false, unique: false,
    containerType: "row",
    children: [fid("mc", 2), fid("mc", 3)],
    layoutProps: { gap: "20px", flexDirection: "row", alignItems: "flex-start" },
  },
  {
    id: fid("mc", 2), type: "text", label: "Full Name", name: "full_name",
    placeholder: "Jane Doe", required: true, unique: false,
    labelTranslations: { en: "Full Name", ar: "الاسم الكامل" },
    placeholderTranslations: { en: "Jane Doe", ar: "الاسم الكامل" },
  },
  {
    id: fid("mc", 3), type: "email", label: "Email", name: "email",
    placeholder: "hello@example.com", required: true, unique: true,
    labelTranslations: { en: "Email", ar: "البريد الإلكتروني" },
    placeholderTranslations: { en: "hello@example.com", ar: "بريدك@email.com" },
  },
  {
    id: fid("mc", 4), type: "text", label: "Phone Number", name: "phone",
    placeholder: "+966 5XX XXX XXXX", required: false, unique: false,
    inputVariant: "phone",
    labelTranslations: { en: "Phone Number", ar: "رقم الهاتف" },
    placeholderTranslations: { en: "+966 5XX XXX XXXX", ar: "+966 5XX XXX XXXX" },
  },
  {
    id: fid("mc", 5), type: "spacer", label: "", name: "spacer_mid",
    required: false, unique: false, height: "4px",
  },
  {
    id: fid("mc", 6), type: "button", label: "Register", name: "submit_btn",
    required: false, unique: false,
    buttonText: "Register Now",
    buttonTextTranslations: { en: "Register Now", ar: "سجّل الآن" },
    buttonType: "submit", buttonAlignment: "center", buttonWidth: "full",
  },
];

const minimalCleanTheme: FormTheme = {
  formMaxWidth: "520px",
  formAlignment: "center",
  formBackgroundColor: "#ffffff",
  formPadding: "44px",
  formBorderRadius: "20px",
  formBorderColor: "transparent",
  formBorderWidth: "0px",
  headingColor: "#111827",
  headingFontSize: "28px",
  headingFontWeight: "700",
  labelColor: "#6b7280",
  labelFontSize: "12px",
  labelFontWeight: "500",
  textColor: "#111827",
  inputBackgroundColor: "#f3f4f6",
  inputBorderColor: "transparent",
  inputBorderWidth: "0px",
  inputBorderRadius: "14px",
  inputTextColor: "#111827",
  inputPlaceholderColor: "#9ca3af",
  inputFocusBorderColor: "#6366f1",
  inputFocusBackgroundColor: "#eef2ff",
  inputPadding: "16px 20px",
  buttonBackgroundColor: "#111827",
  buttonTextColor: "#ffffff",
  buttonBorderRadius: "14px",
  buttonPadding: "16px 36px",
  buttonHoverBackgroundColor: "#374151",
  eventName: "Your Event Name",
  eventDescription: "Fill in your details below to secure your spot.",
  eventDetailsAlignment: "center",
  eventDetailsColor: "#111827",
};

/* ========================================================================== */
/*  2 - CORPORATE PROFESSIONAL                                                */
/*  2-column bootstrap grid, info box, footer, structured sections            */
/* ========================================================================== */

const corporateFields: CustomFormField[] = [
  {
    id: fid("cp", 0), type: "helperText", label: "Info", name: "info_box",
    required: false, unique: false,
    content: "📋  Please complete all fields to process your registration. Your data is handled in accordance with our privacy policy.",
    fieldStyle: {
      backgroundColor: "#eff6ff", borderColor: "#93c5fd", borderWidth: "1px",
      borderRadius: "10px", padding: "14px 18px",
      textColor: "#1e40af", fontSize: "13px", marginBottom: "8px",
    },
    labelTranslations: { en: "Info", ar: "معلومات" },
  },
  {
    id: fid("cp", 1), type: "text", label: "Name Row", name: "name_row",
    required: false, unique: false,
    containerType: "column",
    children: [fid("cp", 2), fid("cp", 3)],
    layoutProps: { gap: "16px" },
  },
  {
    id: fid("cp", 2), type: "text", label: "First Name", name: "first_name",
    placeholder: "First Name", required: true, unique: false,
    bootstrapClass: "col-6",
    labelTranslations: { en: "First Name", ar: "الاسم الأول" },
    placeholderTranslations: { en: "First Name", ar: "الاسم الأول" },
  },
  {
    id: fid("cp", 3), type: "text", label: "Last Name", name: "last_name",
    placeholder: "Last Name", required: true, unique: false,
    bootstrapClass: "col-6",
    labelTranslations: { en: "Last Name", ar: "اسم العائلة" },
    placeholderTranslations: { en: "Last Name", ar: "اسم العائلة" },
  },
  {
    id: fid("cp", 4), type: "text", label: "Contact Row", name: "contact_row",
    required: false, unique: false,
    containerType: "column",
    children: [fid("cp", 5), fid("cp", 6)],
    layoutProps: { gap: "16px" },
  },
  {
    id: fid("cp", 5), type: "email", label: "Work Email", name: "work_email",
    placeholder: "name@company.com", required: true, unique: true,
    bootstrapClass: "col-6",
    labelTranslations: { en: "Work Email", ar: "البريد المهني" },
    placeholderTranslations: { en: "name@company.com", ar: "اسم@شركة.com" },
  },
  {
    id: fid("cp", 6), type: "text", label: "Phone", name: "phone",
    placeholder: "+966 5XX XXX XXXX", required: false, unique: false,
    bootstrapClass: "col-6", inputVariant: "phone",
    labelTranslations: { en: "Phone", ar: "الهاتف" },
    placeholderTranslations: { en: "+966 5XX XXX XXXX", ar: "+966 5XX XXX XXXX" },
  },
  {
    id: fid("cp", 7), type: "text", label: "Work Row", name: "work_row",
    required: false, unique: false,
    containerType: "column",
    children: [fid("cp", 8), fid("cp", 9)],
    layoutProps: { gap: "16px" },
  },
  {
    id: fid("cp", 8), type: "text", label: "Company", name: "company",
    placeholder: "Acme Corp", required: true, unique: false,
    bootstrapClass: "col-6",
    labelTranslations: { en: "Company", ar: "الشركة" },
    placeholderTranslations: { en: "Acme Corp", ar: "اسم الشركة" },
  },
  {
    id: fid("cp", 9), type: "text", label: "Job Title", name: "job_title",
    placeholder: "e.g. Product Manager", required: false, unique: false,
    bootstrapClass: "col-6",
    labelTranslations: { en: "Job Title", ar: "المسمى الوظيفي" },
    placeholderTranslations: { en: "e.g. Product Manager", ar: "مثال: مدير منتجات" },
  },
  {
    id: fid("cp", 10), type: "select", label: "Country", name: "country",
    placeholder: "Select your country", required: false, unique: false,
    optionsSource: "countries",
    labelTranslations: { en: "Country", ar: "الدولة" },
    placeholderTranslations: { en: "Select your country", ar: "اختر دولتك" },
  },
  {
    id: fid("cp", 11), type: "divider", label: "", name: "div_bottom",
    required: false, unique: false,
  },
  {
    id: fid("cp", 12), type: "button", label: "Submit", name: "submit_btn",
    required: false, unique: false,
    buttonText: "Submit Registration",
    buttonTextTranslations: { en: "Submit Registration", ar: "تقديم التسجيل" },
    buttonType: "submit", buttonAlignment: "center", buttonWidth: "auto",
    fieldStyle: { marginTop: "4px" },
  },
];

const corporateTheme: FormTheme = {
  formMaxWidth: "680px",
  formAlignment: "center",
  formBackgroundColor: "#ffffff",
  formPadding: "40px",
  formBorderRadius: "12px",
  formBorderColor: "#e2e8f0",
  formBorderWidth: "1px",
  headingColor: "#0f172a",
  headingFontSize: "24px",
  headingFontWeight: "700",
  labelColor: "#334155",
  labelFontSize: "13px",
  labelFontWeight: "600",
  textColor: "#1e293b",
  inputBackgroundColor: "#f8fafc",
  inputBorderColor: "#cbd5e1",
  inputBorderWidth: "1px",
  inputBorderRadius: "8px",
  inputTextColor: "#1e293b",
  inputPlaceholderColor: "#94a3b8",
  inputFocusBorderColor: "#3b82f6",
  inputPadding: "12px 16px",
  buttonBackgroundColor: "#1e3a5f",
  buttonTextColor: "#ffffff",
  buttonBorderRadius: "8px",
  buttonPadding: "14px 40px",
  buttonHoverBackgroundColor: "#1e40af",
  footerEnabled: true,
  footerText: "🔒  Your information is kept confidential and secure.",
  footerTextColor: "#94a3b8",
  footerAlignment: "center",
  footerFontSize: "12px",
  footerPadding: "16px 0 0",
  eventName: "Business Summit 2026",
  eventDetailsAlignment: "left",
  eventDetailsColor: "#0f172a",
};

/* ========================================================================== */
/*  3 - CREATIVE GRADIENT                                                     */
/*  Centered hero vibe, gradient button, styled containers, pill inputs       */
/* ========================================================================== */

const creativeFields: CustomFormField[] = [
  {
    id: fid("cg", 0), type: "helperText", label: "Hero", name: "hero_box",
    required: false, unique: false,
    content: "✨  Reserve your spot at the most exciting event of the year!",
    fieldStyle: {
      backgroundColor: "#f5f3ff", borderColor: "#c4b5fd", borderWidth: "2px",
      borderRadius: "20px", padding: "20px 24px",
      textColor: "#6d28d9", fontSize: "15px", textAlign: "center",
      marginBottom: "8px",
    },
  },
  {
    id: fid("cg", 1), type: "text", label: "Name Row", name: "name_row",
    required: false, unique: false,
    containerType: "row",
    children: [fid("cg", 2), fid("cg", 3)],
    layoutProps: { gap: "16px", alignItems: "flex-end" },
  },
  {
    id: fid("cg", 2), type: "text", label: "Your Name", name: "full_name",
    placeholder: "What should we call you?", required: true, unique: false,
    labelTranslations: { en: "Your Name", ar: "اسمك" },
    placeholderTranslations: { en: "What should we call you?", ar: "ماذا نناديك؟" },
  },
  {
    id: fid("cg", 3), type: "email", label: "Email", name: "email",
    placeholder: "your@email.com", required: true, unique: true,
    labelTranslations: { en: "Email", ar: "البريد الإلكتروني" },
    placeholderTranslations: { en: "your@email.com", ar: "بريدك@email.com" },
  },
  {
    id: fid("cg", 4), type: "text", label: "Phone", name: "phone",
    placeholder: "+966 5XX XXX XXXX", required: false, unique: false,
    inputVariant: "phone",
    labelTranslations: { en: "Phone", ar: "الهاتف" },
    placeholderTranslations: { en: "+966 5XX XXX XXXX", ar: "+966 5XX XXX XXXX" },
  },
  {
    id: fid("cg", 5), type: "text", label: "Excitement Row", name: "excitement_container",
    required: false, unique: false,
    containerType: "row",
    children: [fid("cg", 6), fid("cg", 7)],
    layoutProps: {
      gap: "16px", alignItems: "flex-end",
      backgroundColor: "#faf5ff", borderRadius: "16px", padding: "16px 20px",
      borderColor: "#e9d5ff", borderWidth: "1px",
    },
  },
  {
    id: fid("cg", 6), type: "select", label: "Most excited about?", name: "excitement",
    placeholder: "Pick one…", required: false, unique: false,
    options: [
      { label: "Keynote Speakers", value: "keynotes", labelTranslations: { en: "Keynote Speakers", ar: "المتحدثون الرئيسيون" } },
      { label: "Networking", value: "networking", labelTranslations: { en: "Networking", ar: "التواصل" } },
      { label: "Workshops", value: "workshops", labelTranslations: { en: "Workshops", ar: "ورش العمل" } },
      { label: "Everything!", value: "all", labelTranslations: { en: "Everything!", ar: "كل شيء!" } },
    ],
    labelTranslations: { en: "Most excited about?", ar: "ما أكثر شيء يحمّسك؟" },
    placeholderTranslations: { en: "Pick one…", ar: "اختر واحداً…" },
  },
  {
    id: fid("cg", 7), type: "select", label: "How did you hear?", name: "source",
    placeholder: "Select…", required: false, unique: false,
    options: [
      { label: "Social Media", value: "social", labelTranslations: { en: "Social Media", ar: "وسائل التواصل" } },
      { label: "Friend", value: "friend", labelTranslations: { en: "Friend", ar: "صديق" } },
      { label: "Email", value: "email_source", labelTranslations: { en: "Email", ar: "بريد إلكتروني" } },
      { label: "Other", value: "other", labelTranslations: { en: "Other", ar: "آخر" } },
    ],
    labelTranslations: { en: "How did you hear?", ar: "كيف عرفت عنّا؟" },
    placeholderTranslations: { en: "Select…", ar: "اختر…" },
  },
  {
    id: fid("cg", 8), type: "spacer", label: "", name: "spacer_bottom",
    required: false, unique: false, height: "8px",
  },
  {
    id: fid("cg", 9), type: "button", label: "Count me in!", name: "submit_btn",
    required: false, unique: false,
    buttonText: "Count Me In! 🎉",
    buttonTextTranslations: { en: "Count Me In! 🎉", ar: "!أنا قادم 🎉" },
    buttonType: "submit", buttonAlignment: "center", buttonWidth: "full",
  },
];

const creativeTheme: FormTheme = {
  formMaxWidth: "560px",
  formAlignment: "center",
  formBackgroundColor: "#ffffff",
  formPadding: "40px",
  formBorderRadius: "28px",
  formBorderColor: "#e9d5ff",
  formBorderWidth: "2px",
  headingColor: "#7c3aed",
  headingFontSize: "32px",
  headingFontWeight: "800",
  labelColor: "#6d28d9",
  labelFontSize: "13px",
  labelFontWeight: "600",
  textColor: "#4c1d95",
  inputBackgroundColor: "#faf5ff",
  inputBorderColor: "#ddd6fe",
  inputBorderWidth: "2px",
  inputBorderRadius: "50px",
  inputTextColor: "#4c1d95",
  inputPlaceholderColor: "#c4b5fd",
  inputFocusBorderColor: "#a78bfa",
  inputFocusBackgroundColor: "#f5f3ff",
  inputPadding: "14px 24px",
  buttonBackgroundColor: "#7c3aed",
  buttonTextColor: "#ffffff",
  buttonBorderRadius: "50px",
  buttonPadding: "16px 36px",
  buttonHoverBackgroundColor: "#6d28d9",
  eventName: "Creative Summit",
  eventDescription: "Where ideas collide 💡",
  eventDetailsAlignment: "center",
  eventDetailsColor: "#7c3aed",
};

/* ========================================================================== */
/*  4 - ELEGANT DARK                                                          */
/*  Dark navy bg, gold accents, decorative dividers, radio cards, textarea    */
/* ========================================================================== */

const elegantDarkFields: CustomFormField[] = [
  {
    id: fid("ed", 0), type: "divider", label: "", name: "div_top",
    required: false, unique: false,
    fieldStyle: { borderColor: "#c9a96e", marginBottom: "4px" },
  },
  {
    id: fid("ed", 1), type: "helperText", label: "Welcome", name: "welcome_box",
    required: false, unique: false,
    content: "You are cordially invited. Please provide your details to confirm your attendance.",
    fieldStyle: {
      backgroundColor: "#16213e", borderColor: "#c9a96e55",
      borderWidth: "1px", borderRadius: "12px", padding: "16px 20px",
      textColor: "#d4c5a0", fontSize: "14px", textAlign: "center",
      marginBottom: "8px",
    },
  },
  {
    id: fid("ed", 2), type: "text", label: "Row1", name: "row_top",
    required: false, unique: false,
    containerType: "row",
    children: [fid("ed", 3), fid("ed", 4)],
    layoutProps: { gap: "20px", alignItems: "flex-start" },
  },
  {
    id: fid("ed", 3), type: "text", label: "Full Name", name: "full_name",
    placeholder: "Your full name", required: true, unique: false,
    labelTranslations: { en: "Full Name", ar: "الاسم الكامل" },
    placeholderTranslations: { en: "Your full name", ar: "اسمك الكامل" },
  },
  {
    id: fid("ed", 4), type: "email", label: "Email", name: "email",
    placeholder: "your@email.com", required: true, unique: true,
    labelTranslations: { en: "Email", ar: "البريد الإلكتروني" },
    placeholderTranslations: { en: "your@email.com", ar: "بريدك@email.com" },
  },
  {
    id: fid("ed", 5), type: "text", label: "Phone", name: "phone",
    placeholder: "+966 5XX XXX XXXX", required: false, unique: false,
    inputVariant: "phone",
    labelTranslations: { en: "Phone", ar: "الهاتف" },
    placeholderTranslations: { en: "+966 5XX XXX XXXX", ar: "+966 5XX XXX XXXX" },
  },
  {
    id: fid("ed", 6), type: "text", label: "Attendance Container", name: "attendance_container",
    required: false, unique: false,
    containerType: "row",
    children: [fid("ed", 7)],
    layoutProps: {
      backgroundColor: "#16213e", borderRadius: "12px", padding: "16px 20px",
      borderColor: "#c9a96e33", borderWidth: "1px",
    },
  },
  {
    id: fid("ed", 7), type: "radio", label: "Attendance Type", name: "attendance_type",
    required: true, unique: false,
    options: [
      { label: "In-Person", value: "in_person", labelTranslations: { en: "In-Person", ar: "حضور شخصي" } },
      { label: "Virtual", value: "virtual", labelTranslations: { en: "Virtual", ar: "افتراضي" } },
    ],
    labelTranslations: { en: "Attendance Type", ar: "نوع الحضور" },
  },
  {
    id: fid("ed", 8), type: "textarea", label: "Special Requirements", name: "special_requirements",
    placeholder: "Dietary needs, accessibility, etc.",
    required: false, unique: false,
    labelTranslations: { en: "Special Requirements", ar: "المتطلبات الخاصة" },
    placeholderTranslations: { en: "Dietary needs, accessibility, etc.", ar: "احتياجات غذائية، إمكانية وصول، إلخ." },
  },
  {
    id: fid("ed", 9), type: "divider", label: "", name: "div_bottom",
    required: false, unique: false,
    fieldStyle: { borderColor: "#c9a96e" },
  },
  {
    id: fid("ed", 10), type: "button", label: "RSVP", name: "submit_btn",
    required: false, unique: false,
    buttonText: "Confirm Attendance",
    buttonTextTranslations: { en: "Confirm Attendance", ar: "تأكيد الحضور" },
    buttonType: "submit", buttonAlignment: "center", buttonWidth: "full",
  },
];

const elegantDarkTheme: FormTheme = {
  formMaxWidth: "580px",
  formAlignment: "center",
  formBackgroundColor: "#1a1a2e",
  formPadding: "48px",
  formBorderRadius: "20px",
  formBorderColor: "#c9a96e",
  formBorderWidth: "1px",
  headingColor: "#f5f0e8",
  headingFontSize: "30px",
  headingFontWeight: "700",
  labelColor: "#d4c5a0",
  labelFontSize: "12px",
  labelFontWeight: "500",
  textColor: "#f5f0e8",
  inputBackgroundColor: "#16213e",
  inputBorderColor: "#c9a96e44",
  inputBorderWidth: "1px",
  inputBorderRadius: "10px",
  inputTextColor: "#f5f0e8",
  inputPlaceholderColor: "#8890a0",
  inputFocusBorderColor: "#c9a96e",
  inputFocusBackgroundColor: "#1a1a3e",
  inputPadding: "14px 18px",
  buttonBackgroundColor: "#c9a96e",
  buttonTextColor: "#1a1a2e",
  buttonBorderRadius: "10px",
  buttonPadding: "16px 36px",
  buttonHoverBackgroundColor: "#d4b97a",
  buttonHoverTextColor: "#1a1a2e",
  eventName: "EXCLUSIVE INVITATION",
  eventDetailsAlignment: "center",
  eventDetailsColor: "#f5f0e8",
};

/* ========================================================================== */
/*  5 - CONFERENCE                                                            */
/*  Multi-section coloured headers, 3-col grid, checkboxes, session tracks    */
/* ========================================================================== */

const conferenceFields: CustomFormField[] = [
  {
    id: fid("cf", 0), type: "helperText", label: "Section Personal", name: "section_personal",
    required: false, unique: false,
    content: "👤  PERSONAL INFORMATION",
    fieldStyle: {
      backgroundColor: "#fff1f2", borderColor: "#fda4af", borderWidth: "0 0 0 4px",
      borderRadius: "0px 8px 8px 0px", padding: "10px 16px",
      textColor: "#be123c", fontSize: "12px",
      marginBottom: "4px",
    },
  },
  {
    id: fid("cf", 1), type: "text", label: "Personal Row", name: "personal_row",
    required: false, unique: false,
    containerType: "column",
    children: [fid("cf", 2), fid("cf", 3), fid("cf", 4)],
    layoutProps: { gap: "14px" },
  },
  {
    id: fid("cf", 2), type: "text", label: "First Name", name: "first_name",
    placeholder: "First Name", required: true, unique: false,
    bootstrapClass: "col-4",
    labelTranslations: { en: "First Name", ar: "الاسم الأول" },
    placeholderTranslations: { en: "First Name", ar: "الاسم الأول" },
  },
  {
    id: fid("cf", 3), type: "text", label: "Last Name", name: "last_name",
    placeholder: "Last Name", required: true, unique: false,
    bootstrapClass: "col-4",
    labelTranslations: { en: "Last Name", ar: "اسم العائلة" },
    placeholderTranslations: { en: "Last Name", ar: "اسم العائلة" },
  },
  {
    id: fid("cf", 4), type: "email", label: "Email", name: "email",
    placeholder: "you@example.com", required: true, unique: true,
    bootstrapClass: "col-4",
    labelTranslations: { en: "Email", ar: "البريد الإلكتروني" },
    placeholderTranslations: { en: "you@example.com", ar: "you@example.com" },
  },
  {
    id: fid("cf", 5), type: "text", label: "Phone", name: "phone",
    placeholder: "+966 5XX XXX XXXX", required: false, unique: false,
    inputVariant: "phone",
    labelTranslations: { en: "Phone", ar: "رقم الهاتف" },
    placeholderTranslations: { en: "+966 5XX XXX XXXX", ar: "+966 5XX XXX XXXX" },
  },
  {
    id: fid("cf", 6), type: "helperText", label: "Section Pro", name: "section_pro",
    required: false, unique: false,
    content: "💼  PROFESSIONAL DETAILS",
    fieldStyle: {
      backgroundColor: "#fff1f2", borderColor: "#fda4af", borderWidth: "0 0 0 4px",
      borderRadius: "0px 8px 8px 0px", padding: "10px 16px",
      textColor: "#be123c", fontSize: "12px",
      marginTop: "8px", marginBottom: "4px",
    },
  },
  {
    id: fid("cf", 7), type: "text", label: "Pro Row", name: "pro_row",
    required: false, unique: false,
    containerType: "column",
    children: [fid("cf", 8), fid("cf", 9)],
    layoutProps: { gap: "14px" },
  },
  {
    id: fid("cf", 8), type: "text", label: "Organization", name: "organization",
    placeholder: "Your company", required: false, unique: false,
    bootstrapClass: "col-6",
    labelTranslations: { en: "Organization", ar: "المؤسسة" },
    placeholderTranslations: { en: "Your company", ar: "شركتك" },
  },
  {
    id: fid("cf", 9), type: "text", label: "Job Title", name: "job_title",
    placeholder: "e.g. Engineer", required: false, unique: false,
    bootstrapClass: "col-6",
    labelTranslations: { en: "Job Title", ar: "المسمى الوظيفي" },
    placeholderTranslations: { en: "e.g. Engineer", ar: "مثال: مهندس" },
  },
  {
    id: fid("cf", 10), type: "select", label: "Session Track", name: "session_track",
    placeholder: "Choose a track", required: false, unique: false,
    options: [
      { label: "Business & Strategy", value: "business", labelTranslations: { en: "Business & Strategy", ar: "الأعمال والاستراتيجية" } },
      { label: "Technology & Innovation", value: "tech", labelTranslations: { en: "Technology & Innovation", ar: "التكنولوجيا والابتكار" } },
      { label: "Design & UX", value: "design", labelTranslations: { en: "Design & UX", ar: "التصميم وتجربة المستخدم" } },
      { label: "Leadership", value: "leadership", labelTranslations: { en: "Leadership", ar: "القيادة" } },
    ],
    labelTranslations: { en: "Session Track", ar: "مسار الجلسة" },
    placeholderTranslations: { en: "Choose a track", ar: "اختر مساراً" },
  },
  {
    id: fid("cf", 11), type: "text", label: "Extras Container", name: "extras_container",
    required: false, unique: false,
    containerType: "row",
    children: [fid("cf", 12)],
    layoutProps: {
      backgroundColor: "#fef2f2", borderRadius: "12px", padding: "16px 20px",
      borderColor: "#fecdd3", borderWidth: "1px",
    },
  },
  {
    id: fid("cf", 12), type: "checkbox", label: "Add-ons", name: "addons",
    required: false, unique: false,
    options: [
      { label: "🍽️ Networking Dinner", value: "dinner", labelTranslations: { en: "🍽️ Networking Dinner", ar: "🍽️ عشاء التواصل" } },
      { label: "🔧 Workshop Pass", value: "workshop", labelTranslations: { en: "🔧 Workshop Pass", ar: "🔧 تصريح ورشة" } },
      { label: "⭐ VIP Lounge", value: "vip", labelTranslations: { en: "⭐ VIP Lounge", ar: "⭐ صالة كبار الشخصيات" } },
    ],
    labelTranslations: { en: "Add-ons", ar: "إضافات" },
  },
  {
    id: fid("cf", 13), type: "spacer", label: "", name: "spacer_end",
    required: false, unique: false, height: "4px",
  },
  {
    id: fid("cf", 14), type: "button", label: "Register", name: "submit_btn",
    required: false, unique: false,
    buttonText: "Register for Conference",
    buttonTextTranslations: { en: "Register for Conference", ar: "سجّل في المؤتمر" },
    buttonType: "submit", buttonAlignment: "left", buttonWidth: "auto",
  },
];

const conferenceTheme: FormTheme = {
  formMaxWidth: "740px",
  formAlignment: "center",
  formBackgroundColor: "#ffffff",
  formPadding: "36px",
  formBorderRadius: "12px",
  formBorderColor: "#e2e8f0",
  formBorderWidth: "1px",
  headingColor: "#0f172a",
  headingFontSize: "22px",
  headingFontWeight: "700",
  labelColor: "#334155",
  labelFontSize: "12px",
  labelFontWeight: "600",
  textColor: "#1e293b",
  inputBackgroundColor: "#ffffff",
  inputBorderColor: "#cbd5e1",
  inputBorderWidth: "1px",
  inputBorderRadius: "8px",
  inputTextColor: "#0f172a",
  inputPlaceholderColor: "#94a3b8",
  inputFocusBorderColor: "#e11d48",
  inputPadding: "11px 14px",
  buttonBackgroundColor: "#e11d48",
  buttonTextColor: "#ffffff",
  buttonBorderRadius: "8px",
  buttonPadding: "13px 28px",
  buttonHoverBackgroundColor: "#be123c",
  requiredIndicatorColor: "#e11d48",
  eventName: "Tech Conference 2026",
  eventDescription: "Register below — fields marked * are required",
  eventDate: "March 20-22, 2026",
  eventLocation: "Riyadh Convention Center",
  eventDetailsAlignment: "left",
  eventDetailsColor: "#0f172a",
};

/* ========================================================================== */
/*  6 - SOCIAL & FUN                                                          */
/*  Warm, emoji-rich, guest count + food pref, pill inputs, centred           */
/* ========================================================================== */

const socialFields: CustomFormField[] = [
  {
    id: fid("sf", 0), type: "helperText", label: "Banner", name: "banner_callout",
    required: false, unique: false,
    content: "🎈 🎉 🥳  Let's make this celebration unforgettable! RSVP below!",
    fieldStyle: {
      backgroundColor: "#fff7ed", borderColor: "#fdba74", borderWidth: "2px",
      borderRadius: "24px", padding: "18px 24px",
      textColor: "#c2410c", fontSize: "16px", textAlign: "center",
      marginBottom: "8px",
    },
  },
  {
    id: fid("sf", 1), type: "text", label: "Name Row", name: "name_row",
    required: false, unique: false,
    containerType: "row",
    children: [fid("sf", 2), fid("sf", 3)],
    layoutProps: { gap: "16px", alignItems: "flex-start" },
  },
  {
    id: fid("sf", 2), type: "text", label: "Your Name", name: "full_name",
    placeholder: "What's your name?", required: true, unique: false,
    labelTranslations: { en: "Your Name", ar: "اسمك" },
    placeholderTranslations: { en: "What's your name?", ar: "ما اسمك؟" },
  },
  {
    id: fid("sf", 3), type: "email", label: "Email", name: "email",
    placeholder: "your@email.com", required: true, unique: true,
    labelTranslations: { en: "Email", ar: "البريد الإلكتروني" },
    placeholderTranslations: { en: "your@email.com", ar: "بريدك@email.com" },
  },
  {
    id: fid("sf", 4), type: "text", label: "Details Card", name: "details_card",
    required: false, unique: false,
    containerType: "column",
    children: [fid("sf", 5), fid("sf", 6)],
    layoutProps: {
      gap: "14px",
      backgroundColor: "#fffbeb", borderRadius: "20px", padding: "20px 24px",
      borderColor: "#fed7aa", borderWidth: "2px",
    },
  },
  {
    id: fid("sf", 5), type: "text", label: "Phone", name: "phone",
    placeholder: "+966 5XX XXX XXXX", required: false, unique: false,
    inputVariant: "phone", bootstrapClass: "col-6",
    labelTranslations: { en: "Phone", ar: "الهاتف" },
    placeholderTranslations: { en: "+966 5XX XXX XXXX", ar: "+966 5XX XXX XXXX" },
  },
  {
    id: fid("sf", 6), type: "number", label: "Number of Guests", name: "guest_count",
    placeholder: "How many are coming?", required: false, unique: false,
    validation: { min: 1, max: 10 }, bootstrapClass: "col-6",
    labelTranslations: { en: "Number of Guests", ar: "عدد الضيوف" },
    placeholderTranslations: { en: "How many are coming?", ar: "كم عددكم؟" },
  },
  {
    id: fid("sf", 7), type: "radio", label: "Food Preference", name: "food_pref",
    required: false, unique: false,
    options: [
      { label: "🥩 Non-Vegetarian", value: "non_veg", labelTranslations: { en: "🥩 Non-Vegetarian", ar: "🥩 غير نباتي" } },
      { label: "🥗 Vegetarian", value: "veg", labelTranslations: { en: "🥗 Vegetarian", ar: "🥗 نباتي" } },
      { label: "🌱 Vegan", value: "vegan", labelTranslations: { en: "🌱 Vegan", ar: "🌱 نباتي صرف" } },
    ],
    labelTranslations: { en: "Food Preference", ar: "تفضيل الطعام" },
  },
  {
    id: fid("sf", 8), type: "button", label: "RSVP", name: "submit_btn",
    required: false, unique: false,
    buttonText: "I'm Coming! 🙌",
    buttonTextTranslations: { en: "I'm Coming! 🙌", ar: "!أنا قادم 🙌" },
    buttonType: "submit", buttonAlignment: "center", buttonWidth: "full",
  },
];

const socialTheme: FormTheme = {
  formMaxWidth: "520px",
  formAlignment: "center",
  formBackgroundColor: "#ffffff",
  formPadding: "36px",
  formBorderRadius: "32px",
  formBorderColor: "#fdba74",
  formBorderWidth: "2px",
  headingColor: "#ea580c",
  headingFontSize: "28px",
  headingFontWeight: "800",
  labelColor: "#c2410c",
  labelFontSize: "13px",
  labelFontWeight: "600",
  textColor: "#9a3412",
  inputBackgroundColor: "#fff7ed",
  inputBorderColor: "#fed7aa",
  inputBorderWidth: "2px",
  inputBorderRadius: "50px",
  inputTextColor: "#9a3412",
  inputPlaceholderColor: "#fdba74",
  inputFocusBorderColor: "#f97316",
  inputFocusBackgroundColor: "#fff7ed",
  inputPadding: "14px 22px",
  buttonBackgroundColor: "#ea580c",
  buttonTextColor: "#ffffff",
  buttonBorderRadius: "50px",
  buttonPadding: "16px 36px",
  buttonHoverBackgroundColor: "#c2410c",
  eventName: "You're Invited! 🎈",
  eventDetailsAlignment: "center",
  eventDetailsColor: "#ea580c",
};

/* ========================================================================== */
/*  7 - WORKSHOP / TRAINING                                                   */
/*  Left-aligned, green accent, step indicators, experience level, terms      */
/* ========================================================================== */

const workshopFields: CustomFormField[] = [
  {
    id: fid("ws", 0), type: "helperText", label: "Step1", name: "step_1",
    required: false, unique: false,
    content: "STEP 1 — Your Details",
    fieldStyle: {
      backgroundColor: "#ecfdf5", borderColor: "#6ee7b7", borderWidth: "0 0 0 4px",
      borderRadius: "0px 10px 10px 0px", padding: "10px 18px",
      textColor: "#047857", fontSize: "12px",
      marginBottom: "4px",
    },
  },
  {
    id: fid("ws", 1), type: "text", label: "Details Row", name: "details_row",
    required: false, unique: false,
    containerType: "row",
    children: [fid("ws", 2), fid("ws", 3)],
    layoutProps: { gap: "16px", alignItems: "flex-start" },
  },
  {
    id: fid("ws", 2), type: "text", label: "Full Name", name: "full_name",
    placeholder: "Enter your name", required: true, unique: false,
    labelTranslations: { en: "Full Name", ar: "الاسم الكامل" },
    placeholderTranslations: { en: "Enter your name", ar: "أدخل اسمك" },
  },
  {
    id: fid("ws", 3), type: "email", label: "Email", name: "email",
    placeholder: "your@email.com", required: true, unique: true,
    labelTranslations: { en: "Email", ar: "البريد الإلكتروني" },
    placeholderTranslations: { en: "your@email.com", ar: "بريدك@email.com" },
  },
  {
    id: fid("ws", 4), type: "text", label: "Phone", name: "phone",
    placeholder: "+966 5XX XXX XXXX", required: false, unique: false,
    inputVariant: "phone",
    labelTranslations: { en: "Phone", ar: "الهاتف" },
    placeholderTranslations: { en: "+966 5XX XXX XXXX", ar: "+966 5XX XXX XXXX" },
  },
  {
    id: fid("ws", 5), type: "helperText", label: "Step2", name: "step_2",
    required: false, unique: false,
    content: "STEP 2 — Workshop Preferences",
    fieldStyle: {
      backgroundColor: "#ecfdf5", borderColor: "#6ee7b7", borderWidth: "0 0 0 4px",
      borderRadius: "0px 10px 10px 0px", padding: "10px 18px",
      textColor: "#047857", fontSize: "12px",
      marginTop: "8px", marginBottom: "4px",
    },
  },
  {
    id: fid("ws", 6), type: "text", label: "Pref Container", name: "pref_container",
    required: false, unique: false,
    containerType: "column",
    children: [fid("ws", 7), fid("ws", 8)],
    layoutProps: {
      gap: "14px",
      backgroundColor: "#f0fdf4", borderRadius: "14px", padding: "20px",
      borderColor: "#a7f3d0", borderWidth: "1px",
    },
  },
  {
    id: fid("ws", 7), type: "select", label: "Experience Level", name: "experience_level",
    placeholder: "Select your level", required: true, unique: false,
    bootstrapClass: "col-6",
    options: [
      { label: "Beginner", value: "beginner", labelTranslations: { en: "Beginner", ar: "مبتدئ" } },
      { label: "Intermediate", value: "intermediate", labelTranslations: { en: "Intermediate", ar: "متوسط" } },
      { label: "Advanced", value: "advanced", labelTranslations: { en: "Advanced", ar: "متقدم" } },
    ],
    labelTranslations: { en: "Experience Level", ar: "مستوى الخبرة" },
    placeholderTranslations: { en: "Select your level", ar: "اختر مستواك" },
  },
  {
    id: fid("ws", 8), type: "textarea", label: "Learning Goals", name: "learning_goals",
    placeholder: "What do you hope to learn?", required: false, unique: false,
    bootstrapClass: "col-6",
    labelTranslations: { en: "Learning Goals", ar: "أهداف التعلم" },
    placeholderTranslations: { en: "What do you hope to learn?", ar: "ماذا تأمل أن تتعلم؟" },
  },
  {
    id: fid("ws", 9), type: "checkbox", label: "Terms", name: "terms_agree",
    required: true, unique: false,
    options: [
      { label: "I agree to the workshop terms & conditions", value: "agreed", labelTranslations: { en: "I agree to the workshop terms & conditions", ar: "أوافق على شروط وأحكام الورشة" } },
    ],
    labelTranslations: { en: "Terms", ar: "الشروط" },
  },
  {
    id: fid("ws", 10), type: "button", label: "Enroll", name: "submit_btn",
    required: false, unique: false,
    buttonText: "Enroll Now →",
    buttonTextTranslations: { en: "Enroll Now →", ar: "→ سجّل الآن" },
    buttonType: "submit", buttonAlignment: "left", buttonWidth: "auto",
  },
];

const workshopTheme: FormTheme = {
  formMaxWidth: "620px",
  formAlignment: "center",
  formBackgroundColor: "#ffffff",
  formPadding: "36px",
  formBorderRadius: "16px",
  formBorderColor: "#86efac",
  formBorderWidth: "1px",
  headingColor: "#065f46",
  headingFontSize: "22px",
  headingFontWeight: "700",
  labelColor: "#047857",
  labelFontSize: "12px",
  labelFontWeight: "600",
  textColor: "#064e3b",
  inputBackgroundColor: "#ffffff",
  inputBorderColor: "#a7f3d0",
  inputBorderWidth: "1px",
  inputBorderRadius: "10px",
  inputTextColor: "#064e3b",
  inputPlaceholderColor: "#6ee7b7",
  inputFocusBorderColor: "#10b981",
  inputFocusBackgroundColor: "#f0fdf4",
  inputPadding: "12px 16px",
  buttonBackgroundColor: "#059669",
  buttonTextColor: "#ffffff",
  buttonBorderRadius: "10px",
  buttonPadding: "14px 32px",
  buttonHoverBackgroundColor: "#047857",
  eventName: "📚 Workshop Enrollment",
  eventDescription: "Secure your place in our hands-on learning experience",
  eventDetailsAlignment: "left",
  eventDetailsColor: "#065f46",
};

/* ========================================================================== */
/*  8 - GALA / VIP                                                            */
/*  Warm gold, wide form, 3-col grid, dress code radio, dietary textarea,     */
/*  ornamental dividers, event details header + footer                        */
/* ========================================================================== */

const galaFields: CustomFormField[] = [
  {
    id: fid("gl", 0), type: "divider", label: "", name: "div_top",
    required: false, unique: false,
    fieldStyle: { borderColor: "#d97706" },
  },
  {
    id: fid("gl", 1), type: "helperText", label: "Intro", name: "gala_intro",
    required: false, unique: false,
    content: "An evening of elegance, networking, and excellence.\nPlease confirm your attendance and preferences below.",
    fieldStyle: {
      backgroundColor: "#fefce8", borderColor: "#fbbf24", borderWidth: "1px",
      borderRadius: "12px", padding: "18px 22px",
      textColor: "#92400e", fontSize: "14px", textAlign: "center",
      marginBottom: "8px",
    },
  },
  {
    id: fid("gl", 2), type: "text", label: "Identity Row", name: "identity_row",
    required: false, unique: false,
    containerType: "column",
    children: [fid("gl", 3), fid("gl", 4), fid("gl", 5)],
    layoutProps: { gap: "14px" },
  },
  {
    id: fid("gl", 3), type: "text", label: "Full Name", name: "full_name",
    placeholder: "Mr. / Mrs. / Dr.", required: true, unique: false,
    bootstrapClass: "col-4",
    labelTranslations: { en: "Full Name", ar: "الاسم الكامل" },
    placeholderTranslations: { en: "Mr. / Mrs. / Dr.", ar: "السيد / السيدة / د." },
  },
  {
    id: fid("gl", 4), type: "email", label: "Email", name: "email",
    placeholder: "your@email.com", required: true, unique: true,
    bootstrapClass: "col-4",
    labelTranslations: { en: "Email", ar: "البريد الإلكتروني" },
    placeholderTranslations: { en: "your@email.com", ar: "بريدك@email.com" },
  },
  {
    id: fid("gl", 5), type: "text", label: "Phone", name: "phone",
    placeholder: "+966 5XX XXX XXXX", required: false, unique: false,
    bootstrapClass: "col-4", inputVariant: "phone",
    labelTranslations: { en: "Phone", ar: "الهاتف" },
    placeholderTranslations: { en: "+966 5XX XXX XXXX", ar: "+966 5XX XXX XXXX" },
  },
  {
    id: fid("gl", 6), type: "text", label: "Org Row", name: "org_row",
    required: false, unique: false,
    containerType: "column",
    children: [fid("gl", 7), fid("gl", 8)],
    layoutProps: { gap: "14px" },
  },
  {
    id: fid("gl", 7), type: "text", label: "Organization", name: "organization",
    placeholder: "Company or institution", required: false, unique: false,
    bootstrapClass: "col-6",
    labelTranslations: { en: "Organization", ar: "المؤسسة" },
    placeholderTranslations: { en: "Company or institution", ar: "الشركة أو المؤسسة" },
  },
  {
    id: fid("gl", 8), type: "select", label: "Table Preference", name: "table_pref",
    placeholder: "Select seating", required: false, unique: false,
    bootstrapClass: "col-6",
    options: [
      { label: "VIP Front Row", value: "vip_front", labelTranslations: { en: "VIP Front Row", ar: "الصف الأمامي VIP" } },
      { label: "Standard Seating", value: "standard", labelTranslations: { en: "Standard Seating", ar: "الجلوس العادي" } },
      { label: "No Preference", value: "none", labelTranslations: { en: "No Preference", ar: "بدون تفضيل" } },
    ],
    labelTranslations: { en: "Table Preference", ar: "تفضيل الطاولة" },
    placeholderTranslations: { en: "Select seating", ar: "اختر الجلوس" },
  },
  {
    id: fid("gl", 9), type: "text", label: "Prefs Row", name: "prefs_row",
    required: false, unique: false,
    containerType: "row",
    children: [fid("gl", 10), fid("gl", 11)],
    layoutProps: { gap: "16px", alignItems: "stretch" },
  },
  {
    id: fid("gl", 10), type: "radio", label: "Dress Code", name: "dress_code",
    required: true, unique: false,
    options: [
      { label: "Black Tie", value: "black_tie", labelTranslations: { en: "Black Tie", ar: "ربطة عنق سوداء" } },
      { label: "Formal Attire", value: "formal", labelTranslations: { en: "Formal Attire", ar: "ملابس رسمية" } },
    ],
    labelTranslations: { en: "Dress Code", ar: "قواعد اللباس" },
    fieldStyle: {
      backgroundColor: "#fefce8", borderColor: "#fde68a", borderWidth: "1px",
      borderRadius: "12px", padding: "16px",
    },
  },
  {
    id: fid("gl", 11), type: "textarea", label: "Dietary Requirements", name: "dietary",
    placeholder: "Any allergies or dietary needs?", required: false, unique: false,
    labelTranslations: { en: "Dietary Requirements", ar: "المتطلبات الغذائية" },
    placeholderTranslations: { en: "Any allergies or dietary needs?", ar: "أي حساسية أو احتياجات غذائية؟" },
    fieldStyle: {
      backgroundColor: "#fefce8", borderColor: "#fde68a", borderWidth: "1px",
      borderRadius: "12px", padding: "16px",
    },
  },
  {
    id: fid("gl", 12), type: "divider", label: "", name: "div_bottom",
    required: false, unique: false,
    fieldStyle: { borderColor: "#d97706" },
  },
  {
    id: fid("gl", 13), type: "button", label: "RSVP", name: "submit_btn",
    required: false, unique: false,
    buttonText: "Confirm RSVP",
    buttonTextTranslations: { en: "Confirm RSVP", ar: "تأكيد الحضور" },
    buttonType: "submit", buttonAlignment: "center", buttonWidth: "full",
  },
];

const galaTheme: FormTheme = {
  formMaxWidth: "700px",
  formAlignment: "center",
  formBackgroundColor: "#fffef5",
  formPadding: "44px",
  formBorderRadius: "16px",
  formBorderColor: "#d97706",
  formBorderWidth: "2px",
  headingColor: "#7c2d12",
  headingFontSize: "28px",
  headingFontWeight: "800",
  labelColor: "#92400e",
  labelFontSize: "12px",
  labelFontWeight: "600",
  textColor: "#78350f",
  inputBackgroundColor: "#fffbeb",
  inputBorderColor: "#fbbf24",
  inputBorderWidth: "1px",
  inputBorderRadius: "8px",
  inputTextColor: "#78350f",
  inputPlaceholderColor: "#d97706",
  inputFocusBorderColor: "#f59e0b",
  inputFocusBackgroundColor: "#fef3c7",
  inputPadding: "13px 16px",
  buttonBackgroundColor: "#92400e",
  buttonTextColor: "#fef3c7",
  buttonBorderRadius: "8px",
  buttonPadding: "16px 36px",
  buttonHoverBackgroundColor: "#78350f",
  buttonHoverTextColor: "#fef3c7",
  eventName: "VIP Gala Night",
  eventDescription: "An evening of elegance, networking, and excellence",
  eventDate: "Saturday, April 12, 2026",
  eventLocation: "The Grand Ballroom, Riyadh",
  eventDetailsAlignment: "center",
  eventDetailsColor: "#92400e",
  footerEnabled: true,
  footerText: "Black Tie Required  •  Complimentary Valet Parking",
  footerTextColor: "#b45309",
  footerAlignment: "center",
  footerFontSize: "12px",
  footerPadding: "16px 0 0",
};

/* ========================================================================== */
/*  EXPORT ALL TEMPLATES                                                      */
/* ========================================================================== */

export const PREBUILT_TEMPLATES: PrebuiltTemplate[] = [
  {
    key: "minimal-clean",
    nameKey: "prebuiltTemplates.minimalClean",
    descriptionKey: "prebuiltTemplates.minimalCleanDesc",
    accentColor: "#111827",
    previewGradient: "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)",
    icon: "Minus",
    category: "minimal",
    fields: minimalCleanFields,
    theme: minimalCleanTheme,
  },
  {
    key: "corporate-professional",
    nameKey: "prebuiltTemplates.corporateProfessional",
    descriptionKey: "prebuiltTemplates.corporateProfessionalDesc",
    accentColor: "#1e3a5f",
    previewGradient: "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
    icon: "Briefcase",
    category: "corporate",
    fields: corporateFields,
    theme: corporateTheme,
  },
  {
    key: "creative-gradient",
    nameKey: "prebuiltTemplates.creativeGradient",
    descriptionKey: "prebuiltTemplates.creativeGradientDesc",
    accentColor: "#8b5cf6",
    previewGradient: "linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%)",
    icon: "Sparkles",
    category: "creative",
    fields: creativeFields,
    theme: creativeTheme,
  },
  {
    key: "elegant-dark",
    nameKey: "prebuiltTemplates.elegantDark",
    descriptionKey: "prebuiltTemplates.elegantDarkDesc",
    accentColor: "#c9a96e",
    previewGradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    icon: "Crown",
    category: "elegant",
    fields: elegantDarkFields,
    theme: elegantDarkTheme,
  },
  {
    key: "conference",
    nameKey: "prebuiltTemplates.conference",
    descriptionKey: "prebuiltTemplates.conferenceDesc",
    accentColor: "#e11d48",
    previewGradient: "linear-gradient(135deg, #fff1f2 0%, #fecdd3 100%)",
    icon: "Users",
    category: "conference",
    fields: conferenceFields,
    theme: conferenceTheme,
  },
  {
    key: "social-fun",
    nameKey: "prebuiltTemplates.socialFun",
    descriptionKey: "prebuiltTemplates.socialFunDesc",
    accentColor: "#ea580c",
    previewGradient: "linear-gradient(135deg, #fffbeb 0%, #fed7aa 100%)",
    icon: "PartyPopper",
    category: "social",
    fields: socialFields,
    theme: socialTheme,
  },
  {
    key: "workshop-training",
    nameKey: "prebuiltTemplates.workshopTraining",
    descriptionKey: "prebuiltTemplates.workshopTrainingDesc",
    accentColor: "#059669",
    previewGradient: "linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 100%)",
    icon: "BookOpen",
    category: "workshop",
    fields: workshopFields,
    theme: workshopTheme,
  },
  {
    key: "gala-vip",
    nameKey: "prebuiltTemplates.galaVip",
    descriptionKey: "prebuiltTemplates.galaVipDesc",
    accentColor: "#92400e",
    previewGradient: "linear-gradient(135deg, #fefce8 0%, #fde68a 100%)",
    icon: "GlassWater",
    category: "gala",
    fields: galaFields,
    theme: galaTheme,
  },
];
