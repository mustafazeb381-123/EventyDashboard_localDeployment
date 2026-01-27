/**
 * Default label and placeholder translations for common registration fields.
 * Used to pre-fill the Translation page when primary language is en or ar.
 */
export type LangCode = "en" | "ar";

export interface FieldTranslation {
  label: string;
  placeholder: string;
}

export const DEFAULT_FIELD_TRANSLATIONS: Record<
  LangCode,
  Record<string, FieldTranslation>
> = {
  en: {
    firstname: { label: "First name", placeholder: "Enter first name" },
    first_name: { label: "First name", placeholder: "Enter first name" },
    lastname: { label: "Last name", placeholder: "Enter last name" },
    last_name: { label: "Last name", placeholder: "Enter last name" },
    email: { label: "Email", placeholder: "Enter your email" },
    email_address: { label: "Email address", placeholder: "Enter email address" },
    organization: { label: "Organization", placeholder: "Enter organization" },
    phone: { label: "Phone Number", placeholder: "Enter your phone number" },
    phone_number: { label: "Phone Number", placeholder: "Enter your phone number" },
    position: { label: "Position", placeholder: "Enter your position" },
    about: { label: "About", placeholder: "Enter description" },
    country: { label: "Country / Region", placeholder: "Enter country name" },
    city: { label: "City", placeholder: "Enter city" },
    state: { label: "State / Province", placeholder: "Enter state / province" },
    street_address: { label: "Street address", placeholder: "Enter street address" },
    street: { label: "Street address", placeholder: "Enter street address" },
    zip: { label: "ZIP / Postal", placeholder: "Enter ZIP / Postal" },
    website: { label: "Website", placeholder: "Enter website" },
    company: { label: "Company", placeholder: "Enter your company" },
    photo: { label: "Photo", placeholder: "Upload photo" },
    image: { label: "Image", placeholder: "Upload image" },
    choose_image: { label: "Choose image", placeholder: "Choose image" },
    choose_file: { label: "Choose file", placeholder: "Choose file" },
  },
  ar: {
    firstname: { label: "الاسم الأول", placeholder: "أدخل الاسم الأول" },
    first_name: { label: "الاسم الأول", placeholder: "أدخل الاسم الأول" },
    lastname: { label: "اسم العائلة", placeholder: "أدخل اسم العائلة" },
    last_name: { label: "اسم العائلة", placeholder: "أدخل اسم العائلة" },
    email: { label: "البريد الإلكتروني", placeholder: "أدخل بريدك الإلكتروني" },
    email_address: { label: "عنوان البريد الإلكتروني", placeholder: "أدخل عنوان البريد الإلكتروني" },
    organization: { label: "المنظمة", placeholder: "أدخل المنظمة" },
    phone: { label: "رقم الهاتف", placeholder: "أدخل رقم هاتفك" },
    phone_number: { label: "رقم الهاتف", placeholder: "أدخل رقم هاتفك" },
    position: { label: "المنصب", placeholder: "أدخل منصبك" },
    about: { label: "حول", placeholder: "أدخل الوصف" },
    country: { label: "البلد / المنطقة", placeholder: "أدخل اسم البلد" },
    city: { label: "المدينة", placeholder: "أدخل المدينة" },
    state: { label: "الولاية / المقاطعة", placeholder: "أدخل الولاية / المقاطعة" },
    street_address: { label: "عنوان الشارع", placeholder: "أدخل عنوان الشارع" },
    street: { label: "عنوان الشارع", placeholder: "أدخل عنوان الشارع" },
    zip: { label: "الرمز البريدي", placeholder: "أدخل الرمز البريدي" },
    website: { label: "الموقع الإلكتروني", placeholder: "أدخل الموقع الإلكتروني" },
    company: { label: "الشركة", placeholder: "أدخل شركتك" },
    photo: { label: "الصورة", placeholder: "رفع صورة" },
    image: { label: "الصورة", placeholder: "رفع صورة" },
    choose_image: { label: "اختر صورة", placeholder: "اختر صورة" },
    choose_file: { label: "اختر ملف", placeholder: "اختر ملف" },
  },
};

export function getDefaultTranslation(
  fieldName: string,
  lang: LangCode
): FieldTranslation | undefined {
  const normalized = (fieldName || "").toLowerCase().replace(/\s+/g, "_");
  return (
    DEFAULT_FIELD_TRANSLATIONS[lang]?.[normalized] ??
    DEFAULT_FIELD_TRANSLATIONS[lang]?.[fieldName]
  );
}

/** Default button text translations (Register, Submit, Save, etc.) */
export const DEFAULT_BUTTON_TEXT: Record<LangCode, Record<string, string>> = {
  en: {
    register: "Register",
    submit: "Submit",
    save: "Save",
    send: "Send",
    next: "Next",
    back: "Back",
    cancel: "Cancel",
    button: "Button",
  },
  ar: {
    register: "تسجيل",
    submit: "إرسال",
    save: "حفظ",
    send: "إرسال",
    next: "التالي",
    back: "رجوع",
    cancel: "إلغاء",
    button: "زر",
  },
};

export function getDefaultButtonText(
  buttonTextOrName: string,
  lang: LangCode
): string | undefined {
  const key = (buttonTextOrName || "button").toLowerCase().replace(/\s+/g, "_");
  return (
    DEFAULT_BUTTON_TEXT[lang]?.[key] ??
    DEFAULT_BUTTON_TEXT[lang]?.[(buttonTextOrName || "").toLowerCase()]
  );
}
