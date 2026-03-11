import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { ChevronLeft, Check, Plus, Edit, Trash2, Loader2, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import TemplateOne from "./RegistrationTemplates/TemplateOne/TemplateOne";
import TemplateTwo from "./RegistrationTemplates/TemplateTwo/TemplateTwo";
import Assets from "@/utils/Assets";
import TemplateThree from "./RegistrationTemplates/TemplateThree/TemplateThree";
import TemplateFour from "./RegistrationTemplates/TemplateFour/TemplateFour";
import TemplateFive from "./RegistrationTemplates/TemplateFive/TemplateFive";
import TemplateSix from "./RegistrationTemplates/TemplateSix/TemplateSix";
import TemplateSeven from "./RegistrationTemplates/TemplateSeven/TemplateSeven";
import ConfirmationDetails from "./ConfirmationDetails/ConfirmationDetails";
import CustomFormBuilder from "@/components/AdvanceEventComponent/CustomFormBuilder";
import {
  FormBuilderTemplateForm,
} from "@/components/AdvanceEventComponent/AdvanceRegistration";
import type {
  CustomFormField,
  FormTheme,
  FormLanguageConfig,
} from "@/components/AdvanceEventComponent/CustomFormBuilder/types";
import TemplateFormOne from "./RegistrationTemplates/TemplateOne/TemplateForm";
import TemplateFormTwo from "./RegistrationTemplates/TemplateTwo/TemplateForm";
import TemplateFormThree from "./RegistrationTemplates/TemplateThree/TemplateForm";
import TemplateFormFour from "./RegistrationTemplates/TemplateFour/TemplateForm";
import TemplateFormFive from "./RegistrationTemplates/TemplateFive/TemplateForm";
import TemplateFormSix from "./RegistrationTemplates/TemplateSix/TemplateForm";
import TemplateFormSeven from "./RegistrationTemplates/TemplateSeven/TemplateForm";
import { PREBUILT_TEMPLATES, type PrebuiltTemplate } from "./prebuiltTemplates";
import PrebuiltTemplateCard from "./PrebuiltTemplateCard";
import {
  createTemplatePostApi,
  getRegistrationFieldApi,
  getRegistrationTemplateData,
  postRegistrationTemplateFieldApi,
  updateEventById,
  getEventbyId,
  getRegistrationFormTemplates,
  createRegistrationFormTemplate,
  updateRegistrationFormTemplate,
  updateRegistrationFormTemplateImages,
  deleteRegistrationFormTemplate,
  setRegistrationFormTemplateAsDefault,
} from "@/apis/apiHelpers";
// import AdvacedTicket from "@/components/AdvanceTicket/AdvanceTickt";
import AdvanceEvent from "../component/AdvanceEvent";

type ToggleStates = {
  confirmationMsg: boolean;
  userQRCode: boolean;
  location: boolean;
  eventDetails: boolean;
};

/** Custom form builder template (same shape as in AdvanceRegistration) */
interface CustomFormTemplate {
  id: string;
  title: string;
  data: Array<{ id: string; type: string; label: string; required?: boolean; [key: string]: any }>;
  formBuilderData?: any;
  bannerImage?: File | string | null;
  theme?: FormTheme;
  createdAt: string;
  updatedAt?: string;
  isCustom?: boolean;
}

type ModalProps = {
  selectedTemplate: string | null;
  onClose: () => void;
  onUseTemplate: (id: string) => void;
  formData: any;
  isLoading: boolean;
  isLoadingFormData: boolean;
  eventId?: string;
  plan?: string;
};

// Modal Component
const Modal = ({
  selectedTemplate,
  onClose,
  onUseTemplate,
  formData,
  isLoading,
  isLoadingFormData,
  eventId,
  plan,
}: ModalProps) => {
  if (!selectedTemplate) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-[80%] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`text-gray-400 hover:text-gray-800 bg-gray-200 rounded p-1 ${
              isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            <X />
          </button>
        </div>

        {/* Render correct template with skeleton loader */}
        {isLoadingFormData || !formData || formData.length === 0 ? (
          <div className="space-y-6 py-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-12 w-1/3" />
            </div>
          </div>
        ) : (
          <>
            {selectedTemplate === "template-one" && (
              <TemplateOne
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
            {selectedTemplate === "template-two" && (
              <TemplateTwo
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
            {selectedTemplate === "template-three" && (
              <TemplateThree
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
            {selectedTemplate === "template-four" && (
              <TemplateFour
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
            {selectedTemplate === "template-five" && (
              <TemplateFive
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
            {selectedTemplate === "template-six" && (
              <TemplateSix
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
            {selectedTemplate === "template-seven" && (
              <TemplateSeven
                data={formData}
                eventId={eventId}
                isLoading={isLoading || isLoadingFormData}
                onUseTemplate={(tid: string) => onUseTemplate(tid)}
              />
            )}
          </>
        )}

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => selectedTemplate && onUseTemplate(selectedTemplate)}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-slate-800 hover:bg-slate-900"
            }`}
          >
            {isLoading ? t("expressEvent.applying") : t("expressEvent.useThisTemplate")}
          </button>
        </div>
      </div>
    </div>
  );
};

type RegistrationFormProps = {
  onNext: (eventId?: string | number, plan?: string) => void;
  onPrevious: () => void;
  currentStep: any;
  totalSteps: any;
  eventId?: string;
  plan?: string;
  toggleStates?: ToggleStates;
  setToggleStates?: React.Dispatch<React.SetStateAction<ToggleStates>>;
};

const RegistrationForm = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  eventId,
  plan,
}: RegistrationFormProps) => {
  const { t } = useTranslation("dashboard");
  const { id: routeId } = useParams();
  const effectiveEventId =
    (routeId as string | undefined) || (eventId as string | undefined);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [confirmedTemplate, setConfirmedTemplate] = useState<string | null>(
    null,
  );
  const [selectedTemplateData, setSelectedTemplateData] = useState<any | null>(
    null,
  );
  const [internalStep, setInternalStep] = useState<number>(0);
  const [formData, setFormData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);
  const [confirmationToggleStates, setConfirmationToggleStates] =
    useState<ToggleStates>({
      confirmationMsg: true,
      userQRCode: false,
      location: false,
      eventDetails: false,
    });

  const [getTemplatesData, setGetTemplatesData] = useState<any[]>([]);
  const [selectedTemplateName, setSelectedTemplateName] = useState<
    string | null
  >(null);
  const [eventData, setEventData] = useState<any>(null);
  const [isLoadingEventData, setIsLoadingEventData] = useState(false);

  // Custom form builder state (express: same as advance)
  const [formBuilderTemplates, setFormBuilderTemplates] = useState<CustomFormTemplate[]>([]);
  const [isCustomFormBuilderOpen, setIsCustomFormBuilderOpen] = useState(false);
  const [editingFormBuilderTemplate, setEditingFormBuilderTemplate] = useState<CustomFormTemplate | null>(null);
  const [isEditFormBuilderMode, setIsEditFormBuilderMode] = useState(false);
  const [deleteFormBuilderCandidate, setDeleteFormBuilderCandidate] = useState<CustomFormTemplate | null>(null);
  const [isDeleteFormBuilderModalOpen, setIsDeleteFormBuilderModalOpen] = useState(false);
  const [isDeletingFormBuilder, setIsDeletingFormBuilder] = useState(false);
  const [isFormBuilderPreviewModalOpen, setIsFormBuilderPreviewModalOpen] = useState(false);
  const [previewFormBuilderTemplate, setPreviewFormBuilderTemplate] = useState<CustomFormTemplate | null>(null);
  const [lastSelectedSystem, setLastSelectedSystem] = useState<"default" | "custom" | null>(null);

  // Prebuilt template state
  const [prebuiltPreviewTemplate, setPrebuiltPreviewTemplate] = useState<PrebuiltTemplate | null>(null);
  const [isPrebuiltPreviewOpen, setIsPrebuiltPreviewOpen] = useState(false);
  const [isSavingPrebuilt, setIsSavingPrebuilt] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning" | "info",
  ) => {
    setNotification({ message, type });
  };

  // Fetch event data once and cache it - memoized to prevent unnecessary calls
  const fetchEventData = useCallback(async () => {
    if (!effectiveEventId) return;

    const cacheKey = `event_meta_${effectiveEventId}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setEventData(parsed);
        setIsLoadingEventData(false);
        return;
      } catch (err) {
        // Cache corrupted, fetch fresh data
      }
    }

    setIsLoadingEventData(true);
    try {
      const response = await getEventbyId(effectiveEventId);
      const data = response.data.data;
      setEventData(data);
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      setEventData(null);
    } finally {
      setIsLoadingEventData(false);
    }
  }, [effectiveEventId]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  // Memoize API call function (old/default template system)
  const getCreateTemplateApiData = useCallback(async () => {
    try {
      if (!effectiveEventId) {
        return;
      }

      const tenantUuid =
        typeof window !== "undefined"
          ? localStorage.getItem("tenant_uuid")
          : null;
      const result = await getRegistrationTemplateData(
        effectiveEventId,
        tenantUuid,
      );
      const responseData = result?.data?.data;

      if (!responseData) {
        setGetTemplatesData([]);
        return;
      }

      const registrationFields =
        responseData.attributes?.event_registration_fields?.data || [];
      const templateData = registrationFields.map((item: any) => ({
        id: item.id,
        type: item.type,
        attributes: item.attributes,
      }));

      const nameOfTemplate = responseData.attributes?.name;
      setSelectedTemplateName(nameOfTemplate);
      // Do NOT set confirmedTemplate here – let checkAndSetDefaultTemplate
      // decide based on the API's `default` flags across both systems.
      setGetTemplatesData(templateData);
    } catch (error) {
      showNotification(t("expressEvent.failedFetchTemplateData"), "error");
      setGetTemplatesData([]);
    }
  }, [effectiveEventId]);

  // -------------------- Custom form builder helpers (express: same as advance) --------------------
  const mapFormBuilderTypeForValidation = (fbType: string): string => {
    const typeMap: Record<string, string> = {
      text: "text", email: "email", number: "number", select: "select",
      textarea: "textarea", checkbox: "checkbox", radio: "radio",
      header: "header", paragraph: "paragraph", date: "date", file: "file",
    };
    return typeMap[fbType] || "text";
  };

  const convertFormBuilderToFieldsForValidation = (jsonData: any): CustomFormTemplate["data"] => {
    if (!jsonData) return [];
    const formDataArray = jsonData.formData && Array.isArray(jsonData.formData)
      ? jsonData.formData
      : Array.isArray(jsonData) ? jsonData : [];
    if (formDataArray.length === 0) return [];
    return formDataArray.map((item: any, index: number) => ({
      id: item.id || `field-${Date.now()}-${index}`,
      type: mapFormBuilderTypeForValidation(item.type || item.fieldType),
      label: item.label || item.name || "Field",
      required: item.required || false,
      ...item,
    }));
  };

  const transformApiTemplateToComponent = useCallback((apiTemplate: any): CustomFormTemplate => {
    const attrs = apiTemplate.attributes || {};
    const formData = attrs.form_template_data || {};
    const fields =
      formData.formBuilderData?.formData ||
      formData.fields ||
      (Array.isArray(formData.formData) ? formData.formData : []) ||
      [];
    const bannerImage = attrs.banner_image || null;
    const themeFromFormData = formData.theme || formData.formBuilderData?.theme || {};
    const theme: FormTheme = {
      ...themeFromFormData,
      formBackgroundImage: attrs.form_background_image ?? themeFromFormData.formBackgroundImage ?? null,
      footerBannerImage: attrs.footer_image ?? attrs.footer_banner_image ?? themeFromFormData.footerBannerImage ?? null,
    };
    const formBuilderData = {
      formData: fields,
      bannerImage,
      theme,
      languageMode: formData.formBuilderData?.languageMode ?? "single",
      primaryLanguage: formData.formBuilderData?.primaryLanguage,
    };
    return {
      id: String(apiTemplate.id),
      title: attrs.name || t("expressEvent.untitledTemplate"),
      data: fields.length > 0 ? convertFormBuilderToFieldsForValidation({ formData: fields }) : [],
      formBuilderData,
      bannerImage,
      theme,
      createdAt: attrs.created_at || new Date().toISOString(),
      updatedAt: attrs.updated_at || new Date().toISOString(),
      isCustom: true,
    };
  }, []);

  const checkAndSetDefaultTemplate = useCallback(async () => {
    if (!effectiveEventId) return;
    try {
      const tenantUuid = typeof window !== "undefined" ? localStorage.getItem("tenant_uuid") : null;
      const [customRes, oldRes] = await Promise.allSettled([
        getRegistrationFormTemplates(effectiveEventId),
        getRegistrationTemplateData(effectiveEventId, tenantUuid),
      ]);
      let defaultCustom = null;
      if (customRes.status === "fulfilled") {
        const list = customRes.value?.data?.data || [];
        defaultCustom = list.find((t: any) => t.attributes?.default === true);
      }
      let defaultOld = null;
      if (oldRes.status === "fulfilled") {
        const data = oldRes.value?.data?.data;
        if (data?.attributes?.default === true) defaultOld = data;
      }
      if (defaultOld && defaultCustom) {
        const useCustom = lastSelectedSystem === "custom" || (
          defaultCustom.attributes?.updated_at && defaultOld.attributes?.updated_at &&
          new Date(defaultCustom.attributes.updated_at) > new Date(defaultOld.attributes.updated_at)
        );
        setConfirmedTemplate(useCustom ? String(defaultCustom.id) : (defaultOld.attributes?.name ?? null));
      } else if (defaultOld) {
        setConfirmedTemplate(defaultOld.attributes?.name ?? null);
      } else if (defaultCustom) {
        setConfirmedTemplate(String(defaultCustom.id));
      } else {
        setConfirmedTemplate(null);
      }
    } catch (_e) {
      // ignore
    }
  }, [effectiveEventId, lastSelectedSystem]);

  const loadFormBuilderTemplates = useCallback(async () => {
    if (!effectiveEventId) return;
    try {
      setIsLoadingFormData(true);
      const response = await getRegistrationFormTemplates(effectiveEventId);
      const list = response?.data?.data || [];
      const transformed = list.map((t: any) => transformApiTemplateToComponent(t));
      setFormBuilderTemplates(transformed);
      await checkAndSetDefaultTemplate();
    } catch (err) {
      showNotification(t("expressEvent.failedLoadCustomFormTemplates"), "error");
      setFormBuilderTemplates([]);
    } finally {
      setIsLoadingFormData(false);
    }
  }, [effectiveEventId, transformApiTemplateToComponent, checkAndSetDefaultTemplate]);

  useEffect(() => {
    const init = async () => {
      await getCreateTemplateApiData();
      if (plan !== "advance") await loadFormBuilderTemplates();
    };
    if (effectiveEventId) init();
  }, [effectiveEventId, plan]);

  // -------------------- Custom form builder handlers (express) --------------------
  const handleOpenCustomFormBuilder = useCallback((template?: CustomFormTemplate) => {
    if (!effectiveEventId) {
      showNotification(t("expressEvent.eventIdNotFoundFormBuilder"), "error");
      return;
    }
    if (template) {
      setEditingFormBuilderTemplate(template);
      setIsEditFormBuilderMode(true);
    } else {
      setEditingFormBuilderTemplate(null);
      setIsEditFormBuilderMode(false);
    }
    setIsCustomFormBuilderOpen(true);
  }, [effectiveEventId]);

  const handleSaveFormBuilderTemplate = useCallback(async (template: CustomFormTemplate) => {
    if (!effectiveEventId) return;

    const blobToDataUrl = (blob: Blob) =>
      new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onloadend = () => resolve(r.result as string);
        r.onerror = () => reject(new Error("Failed to read image"));
        r.readAsDataURL(blob);
      });

    const normalizeImageValue = async (value: unknown): Promise<string | null | undefined> => {
      if (typeof value === "string") return value;
      if (value instanceof File || value instanceof Blob) return await blobToDataUrl(value);
      if (value == null) return null;
      return null;
    };

    const fields = Array.isArray(template.formBuilderData?.formData)
      ? template.formBuilderData.formData
      : [];

    const normalizedBannerImage =
      typeof template.bannerImage === "string"
        ? template.bannerImage
        : template.bannerImage instanceof File
          ? await blobToDataUrl(template.bannerImage as File)
          : null;

    const normalizedTheme: FormTheme | undefined = template.theme
      ? {
          ...template.theme,
          formBackgroundImage: await normalizeImageValue(template.theme.formBackgroundImage),
          footerBannerImage: await normalizeImageValue(template.theme.footerBannerImage),
        }
      : undefined;

    // On update: do not send image URLs in theme (backend would overwrite stored attachments). Only send base64 data URLs.
    const isBase64DataUrl = (s: string | undefined) =>
      typeof s === "string" && s.trim() !== "" && s.startsWith("data:");

    const cleanTheme: any = {
      formBackgroundColor: "#ffffff",
      formPadding: "24px",
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981",
    };
    if (normalizedTheme) {
      if (
        normalizedTheme.formBackgroundImage &&
        typeof normalizedTheme.formBackgroundImage === "string" &&
        isBase64DataUrl(normalizedTheme.formBackgroundImage)
      ) {
        cleanTheme.formBackgroundImage = normalizedTheme.formBackgroundImage;
      }
      if (
        normalizedTheme.footerBannerImage &&
        typeof normalizedTheme.footerBannerImage === "string" &&
        isBase64DataUrl(normalizedTheme.footerBannerImage)
      ) {
        cleanTheme.footerBannerImage = normalizedTheme.footerBannerImage;
        cleanTheme.footerImage = normalizedTheme.footerBannerImage;
      }
      cleanTheme.primaryColor = normalizedTheme.buttonBackgroundColor || "#3B82F6";
      cleanTheme.secondaryColor = normalizedTheme.buttonHoverBackgroundColor || "#10B981";
      const imageThemeKeys = ["formBackgroundImage", "footerBannerImage", "footerImage"];
      Object.keys(normalizedTheme).forEach((key) => {
        if (imageThemeKeys.includes(key)) return;
        const value = (normalizedTheme as any)[key];
        if (value != null && !(value instanceof File) && !(value instanceof Blob)) {
          if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            if (typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"))) return;
            cleanTheme[key] = value;
          }
        }
      });
    }

    // When editing: only include bannerImage in payload if we're updating it; omit when unchanged so backend keeps existing
    const shouldUpdateBanner = (template as any)._shouldUpdateBannerImage !== false;
    const bannerForPayload =
      isEditFormBuilderMode && !shouldUpdateBanner
        ? undefined
        : (normalizedBannerImage ?? null);

    const payload = {
      registration_form_template: {
        name: template.title.trim() || "Custom Form",
        default: !isEditFormBuilderMode && confirmedTemplate === template.id,
        form_template_data: {
          fields,
          formBuilderData: {
            formData: fields,
            ...(bannerForPayload !== undefined ? { bannerImage: bannerForPayload } : {}),
            theme: cleanTheme,
            languageMode: template.formBuilderData?.languageMode ?? "single",
            primaryLanguage: template.formBuilderData?.primaryLanguage,
          },
          ...(bannerForPayload !== undefined ? { bannerImage: bannerForPayload } : {}),
          theme: cleanTheme,
        },
      },
    };

    if (isEditFormBuilderMode && editingFormBuilderTemplate?.id) {
      await updateRegistrationFormTemplate(effectiveEventId, editingFormBuilderTemplate.id, payload);

      const imagesToUpdate: Array<{ image_name: "banner_image" | "form_background_image" | "footer_image"; base64_data: string }> = [];
      if (shouldUpdateBanner && normalizedBannerImage && typeof normalizedBannerImage === "string" && isBase64DataUrl(normalizedBannerImage)) {
        imagesToUpdate.push({ image_name: "banner_image", base64_data: normalizedBannerImage });
      }
      if (cleanTheme.formBackgroundImage && typeof cleanTheme.formBackgroundImage === "string" && cleanTheme.formBackgroundImage.trim() !== "") {
        imagesToUpdate.push({ image_name: "form_background_image", base64_data: cleanTheme.formBackgroundImage });
      }
      if ((cleanTheme.footerImage || cleanTheme.footerBannerImage) && typeof (cleanTheme.footerImage || cleanTheme.footerBannerImage) === "string" && (cleanTheme.footerImage || cleanTheme.footerBannerImage).trim() !== "") {
        imagesToUpdate.push({
          image_name: "footer_image",
          base64_data: (cleanTheme.footerImage || cleanTheme.footerBannerImage) as string,
        });
      }
      if (imagesToUpdate.length > 0) {
        try {
          await updateRegistrationFormTemplateImages(effectiveEventId, editingFormBuilderTemplate.id, imagesToUpdate);
        } catch (imageError: any) {
          console.error("Error updating template images:", imageError);
          showNotification("Template saved, but one or more image updates failed. You can try updating images again.", "warning");
        }
      }
    } else {
      const createRes = await createRegistrationFormTemplate(effectiveEventId, payload);
      const newId = createRes?.data?.data?.id ?? createRes?.data?.id;
      if (newId != null) {
        setLastSelectedSystem("custom");
        setConfirmedTemplate(String(newId));
      }
    }
    await loadFormBuilderTemplates();
    showNotification(t("expressEvent.templateSavedSuccess"), "success");
  }, [effectiveEventId, isEditFormBuilderMode, editingFormBuilderTemplate, confirmedTemplate, loadFormBuilderTemplates]);

  const handleSaveCustomForm = useCallback(
    async (
      customFields: CustomFormField[],
      bannerImage?: File | string | null,
      theme?: FormTheme,
      templateName?: string,
      languageConfig?: FormLanguageConfig,
    ) => {
      if (!effectiveEventId) return;

      // When editing: if banner is unchanged (still the original URL), don't send to API so backend keeps existing image
      const originalBannerImage =
        isEditFormBuilderMode && editingFormBuilderTemplate
          ? editingFormBuilderTemplate.bannerImage ?? editingFormBuilderTemplate.formBuilderData?.bannerImage
          : null;
      const isBannerUnchanged =
        isEditFormBuilderMode &&
        !!originalBannerImage &&
        bannerImage === originalBannerImage;

      let normalizedBanner: string | null = null;
      let shouldUpdateBannerImage = true;

      if (isBannerUnchanged) {
        // Preserve existing banner – don't convert or send; backend keeps stored image
        normalizedBanner = typeof originalBannerImage === "string" ? originalBannerImage : null;
        shouldUpdateBannerImage = false;
      } else if (bannerImage instanceof File) {
        normalizedBanner = await new Promise<string>((res, rej) => {
          const r = new FileReader();
          r.onloadend = () => res(r.result as string);
          r.onerror = () => rej(new Error("Failed to read image"));
          r.readAsDataURL(bannerImage);
        });
      } else if (typeof bannerImage === "string" && bannerImage.trim() !== "") {
        normalizedBanner = bannerImage;
      }

      const formBuilderData = {
        formData: customFields,
        bannerImage: normalizedBanner,
        theme: theme || undefined,
        languageMode: languageConfig?.languageMode ?? "single",
        primaryLanguage: languageConfig?.primaryLanguage,
      };
      const templateData: CustomFormTemplate = {
        id: editingFormBuilderTemplate?.id || `custom-form-${Date.now()}`,
        title: templateName?.trim() || editingFormBuilderTemplate?.title || "Custom Form",
        data: convertFormBuilderToFieldsForValidation({ formData: customFields }),
        formBuilderData,
        bannerImage: normalizedBanner,
        theme: theme,
        createdAt: editingFormBuilderTemplate?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCustom: true,
      };
      (templateData as any)._shouldUpdateBannerImage = shouldUpdateBannerImage;
      await handleSaveFormBuilderTemplate(templateData);
      setIsCustomFormBuilderOpen(false);
      setEditingFormBuilderTemplate(null);
      setIsEditFormBuilderMode(false);
    },
    [effectiveEventId, editingFormBuilderTemplate, isEditFormBuilderMode, handleSaveFormBuilderTemplate, convertFormBuilderToFieldsForValidation]
  );

  const handleEditFormBuilderTemplate = useCallback((template: CustomFormTemplate) => {
    if (template.formBuilderData?.formData && Array.isArray(template.formBuilderData.formData)) {
      handleOpenCustomFormBuilder(template);
    } else {
      showNotification(t("expressEvent.templateCannotEditFormBuilder"), "info");
    }
  }, [handleOpenCustomFormBuilder]);

  const handleSelectFormBuilderTemplate = useCallback((templateId: string) => {
    const template = formBuilderTemplates.find((t) => t.id === templateId);
    if (template) {
      setPreviewFormBuilderTemplate(template);
      setIsFormBuilderPreviewModalOpen(true);
    }
  }, [formBuilderTemplates]);

  const handleUseFormBuilderTemplate = useCallback(async (templateId: string) => {
    if (!effectiveEventId) return;
    const template = formBuilderTemplates.find((t) => t.id === templateId);
    if (!template) return;
    setIsLoading(true);
    try {
      setLastSelectedSystem("custom");
      await setRegistrationFormTemplateAsDefault(effectiveEventId, templateId);
      setConfirmedTemplate(templateId);
      setSelectedTemplateData(template.formBuilderData || { name: template.title });
      showNotification(t("expressEvent.templateAppliedSuccess"), "success");
      setIsFormBuilderPreviewModalOpen(false);
      setPreviewFormBuilderTemplate(null);
      await loadFormBuilderTemplates();
    } catch (err: any) {
      showNotification(err?.message || t("expressEvent.failedApplyTemplate"), "error");
    } finally {
      setIsLoading(false);
    }
  }, [effectiveEventId, formBuilderTemplates, loadFormBuilderTemplates]);

  const handleDeleteFormBuilderTemplate = useCallback((templateId: string) => {
    const template = formBuilderTemplates.find((t) => t.id === templateId) ?? null;
    setDeleteFormBuilderCandidate(template);
    setIsDeleteFormBuilderModalOpen(true);
  }, [formBuilderTemplates]);

  const cancelDeleteFormBuilderTemplate = useCallback(() => {
    setIsDeleteFormBuilderModalOpen(false);
    setDeleteFormBuilderCandidate(null);
  }, []);

  const confirmDeleteFormBuilderTemplate = useCallback(async () => {
    if (!deleteFormBuilderCandidate || !effectiveEventId) {
      cancelDeleteFormBuilderTemplate();
      return;
    }
    const { id } = deleteFormBuilderCandidate;
    setIsDeletingFormBuilder(true);
    try {
      await deleteRegistrationFormTemplate(effectiveEventId, id);
      setFormBuilderTemplates((prev) => prev.filter((t) => t.id !== id));
      if (confirmedTemplate === id) setConfirmedTemplate(null);
      await loadFormBuilderTemplates();
      showNotification(t("expressEvent.templateDeletedSuccess"), "success");
    } catch (err: any) {
      showNotification(err?.message || t("expressEvent.failedDeleteTemplate"), "error");
    } finally {
      setIsDeletingFormBuilder(false);
      cancelDeleteFormBuilderTemplate();
    }
  }, [deleteFormBuilderCandidate, effectiveEventId, confirmedTemplate, loadFormBuilderTemplates, cancelDeleteFormBuilderTemplate]);

  // -------------------- Prebuilt template handlers --------------------
  const handlePrebuiltPreview = useCallback((key: string) => {
    const tpl = PREBUILT_TEMPLATES.find((t) => t.key === key);
    if (tpl) {
      setPrebuiltPreviewTemplate(tpl);
      setIsPrebuiltPreviewOpen(true);
    }
  }, []);

  const handleUsePrebuiltTemplate = useCallback(async (key: string) => {
    if (!effectiveEventId) return;
    const tpl = PREBUILT_TEMPLATES.find((t) => t.key === key);
    if (!tpl) return;

    setIsSavingPrebuilt(true);
    try {
      // Build the payload in the same shape as handleSaveFormBuilderTemplate
      const cleanTheme: any = {
        formBackgroundColor: "#ffffff",
        formPadding: "24px",
        ...Object.fromEntries(
          Object.entries(tpl.theme).filter(
            ([_, v]) => v != null && typeof v !== "object" && !(v instanceof File)
          )
        ),
      };

      const payload = {
        registration_form_template: {
          name: t(tpl.nameKey),
          default: true,
          form_template_data: {
            fields: tpl.fields,
            formBuilderData: {
              formData: tpl.fields,
              theme: cleanTheme,
              languageMode: "single" as const,
            },
            theme: cleanTheme,
          },
        },
      };

      const createRes = await createRegistrationFormTemplate(effectiveEventId, payload);
      const newId = createRes?.data?.data?.id ?? createRes?.data?.id;

      if (newId != null) {
        // Set as default
        await setRegistrationFormTemplateAsDefault(effectiveEventId, String(newId));
        setLastSelectedSystem("custom");
        setConfirmedTemplate(String(newId));
        showNotification(t("prebuiltTemplates.templateApplied"), "success");
      }

      // Reload templates
      await loadFormBuilderTemplates();

      // Close preview if open
      setIsPrebuiltPreviewOpen(false);
      setPrebuiltPreviewTemplate(null);

      // Advance to confirmation step
      setTimeout(() => setInternalStep(1), 600);
    } catch (err: any) {
      showNotification(err?.message || t("expressEvent.failedApplyTemplate"), "error");
    } finally {
      setIsSavingPrebuilt(false);
    }
  }, [effectiveEventId, loadFormBuilderTemplates, t]);

  // Memoize getFieldAPi function
  const getFieldAPi = useCallback(async (id: string) => {
    setIsLoadingFormData(true);
    try {
      const tenantUuid = typeof window !== "undefined" ? localStorage.getItem("tenant_uuid") : null;
      const response = await getRegistrationFieldApi(id, tenantUuid);
      setFormData(response.data.data);
    } catch (error) {
      showNotification(t("expressEvent.failedLoadFormData"), "error");
    } finally {
      setIsLoadingFormData(false);
    }
  }, []);

  useEffect(() => {
    if (effectiveEventId) {
      getFieldAPi(effectiveEventId);
    }
  }, [effectiveEventId, getFieldAPi]);

  // Memoize getTemplateData to prevent unnecessary recalculations
  // Always return formData (registration fields) - templates will fetch their own data if needed
  const getTemplateData = useCallback(
    (templateId: string) => {
      // Return formData which contains registration fields from getRegistrationFieldApi
      // Templates can use this as initial data and fetch fresh data themselves if needed
      return formData;
    },
    [formData],
  );

  // Memoize skeleton component - created once with animated shimmer
  const skeletonComponent = useMemo(
    () => (
      <div className="space-y-4 py-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-12 w-1/3" />
      </div>
    ),
    [],
  );

  // Memoize template component factory
  const getTemplateComponent = useCallback(
    (templateId: string, isPreview: boolean = true) => {
      // Show skeleton only while data is loading
      if (isLoadingFormData) {
        return skeletonComponent;
      }

      const templateData = getTemplateData(templateId);

      // Render actual template component
      switch (templateId) {
        case "template-one":
          return (
            <TemplateFormOne
              data={templateData}
              eventId={effectiveEventId}
              eventData={eventData}
            />
          );
        case "template-two":
          return (
            <TemplateFormTwo
              data={templateData}
              eventId={effectiveEventId}
              eventData={eventData}
            />
          );
        case "template-three":
          return (
            <TemplateFormThree
              data={templateData}
              eventId={effectiveEventId}
              eventData={eventData}
            />
          );
        case "template-four":
          return (
            <TemplateFormFour
              data={templateData}
              eventId={effectiveEventId}
              eventData={eventData}
            />
          );
        case "template-five":
          return (
            <TemplateFormFive
              data={templateData}
              eventId={effectiveEventId}
              eventData={eventData}
            />
          );
        case "template-six":
          return (
            <TemplateFormSix
              data={templateData}
              eventId={effectiveEventId}
              eventData={eventData}
            />
          );
        case "template-seven":
          return (
            <TemplateFormSeven
              data={templateData}
              eventId={effectiveEventId}
              eventData={eventData}
            />
          );
        default:
          return skeletonComponent;
      }
    },
    [
      isLoadingFormData,
      getTemplateData,
      eventData,
      effectiveEventId,
      skeletonComponent,
    ],
  );

  // Memoize templates array to prevent recreation on every render
  const templates = useMemo(
    () => [
      {
        id: "template-one",
        component: getTemplateComponent("template-one", true),
      },
      {
        id: "template-two",
        component: getTemplateComponent("template-two", true),
      },
      {
        id: "template-three",
        component: getTemplateComponent("template-three", true),
      },
      {
        id: "template-four",
        component: getTemplateComponent("template-four", true),
      },
      {
        id: "template-five",
        component: getTemplateComponent("template-five", true),
      },
      {
        id: "template-six",
        component: getTemplateComponent("template-six", true),
      },
      {
        id: "template-seven",
        component: getTemplateComponent("template-seven", true),
      },
    ],
    [getTemplateComponent],
  );

  // Memoize handlers to prevent unnecessary re-renders
  const handleOpenModal = useCallback((id: string) => {
    setSelectedTemplate(id);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (!isLoading) {
      setSelectedTemplate(null);
      setIsModalOpen(false);
    }
  }, [isLoading]);

  // Memoize handleUseTemplate to mirror AdvanceRegistration flow (old template system)
  const handleUseTemplate = useCallback(
    async (templateId: string) => {
      setIsLoading(true);
      try {
        const savedEventId = effectiveEventId;
        if (!savedEventId) {
          throw new Error("Event ID not found");
        }

        let templateData: any = {};
        switch (templateId) {
          case "template-one":
            templateData = {
              name: "Event Registration Form",
              description:
                "A new guest's registration form designed to streamline the process of collecting personal and contact information from new guests.",
              fields: formData || [],
              templateComponent: "TemplateFormOne",
            };
            break;
          case "template-two":
            templateData = {
              name: "Template Two",
              description: "Template Two description",
              fields: [],
              templateComponent: "TemplateFormTwo",
            };
            break;
          default:
            templateData = {
              name: `Template ${templateId}`,
              description: `Description for ${templateId}`,
              fields: formData || [],
              templateComponent: templateId,
            };
        }

        const payload = {
          registration_template: {
            name: templateId,
            content: JSON.stringify(templateData),
            event_registration_fields_ids: formData
              .filter((item) => item.attributes?.active === true)
              .map((item) => item.id),
            default: true,
          },
        };

        // Track that we just selected a default (old system) template
        setLastSelectedSystem("default");

        // Set default template via API - this sets old template system as default
        const response = await createTemplatePostApi(
          payload,
          savedEventId as string,
        );

        // After setting a default in the old system, explicitly unset any
        // custom form-builder templates that might still have default: true
        try {
          const customTemplatesResponse = await getRegistrationFormTemplates(
            savedEventId as string,
          );
          const customTemplates = customTemplatesResponse?.data?.data || [];
          const defaultCustomTemplates = customTemplates.filter(
            (t: any) => t.attributes?.default === true,
          );

          for (const customTemplate of defaultCustomTemplates) {
            try {
              await updateRegistrationFormTemplate(
                savedEventId as string,
                customTemplate.id,
                {
                  registration_form_template: {
                    name: customTemplate.attributes?.name,
                    default: false,
                    form_template_data:
                      customTemplate.attributes?.form_template_data || {},
                  },
                },
              );
            } catch (err) {
              console.error(
                `Failed to unset default for custom template ${customTemplate.id}:`,
                err,
              );
            }
          }
        } catch (err) {
          console.error("Error unsetting custom templates:", err);
        }

        // Optimistically mark this template as selected in the UI
        setSelectedTemplateData(templateData);
        setConfirmedTemplate(templateId);
        showNotification(t("expressEvent.eventTemplateAddedSuccess"), "success");

        // Close modal and advance internal step after a short delay
        setTimeout(() => {
          setInternalStep(1);
          handleCloseModal();
        }, 1000);

        // Reload both systems to ensure state is in sync
        await Promise.all([
          loadFormBuilderTemplates(), // will call checkAndSetDefaultTemplate
          getCreateTemplateApiData(),
        ]);

        // Final safeguard: ensure confirmedTemplate reflects API `default` flags
        await checkAndSetDefaultTemplate();
      } catch (error: any) {
        console.error("Error creating template:", error);
        if (error.response?.status === 400) {
          showNotification(t("expressEvent.invalidTemplateData"), "error");
        } else if (error.response?.status === 401) {
          showNotification(
            "Authentication failed. Please login again.",
            "error",
          );
        } else if (error.response?.status === 500) {
          showNotification(t("expressEvent.serverError"), "error");
        } else {
          showNotification(
            error.message || "Error adding template. Please try again.",
            "error",
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      effectiveEventId,
      formData,
      handleCloseModal,
      loadFormBuilderTemplates,
      getCreateTemplateApiData,
      checkAndSetDefaultTemplate,
    ],
  );

  // Memoize toggle handler
  const handleToggleStatesChange = useCallback((toggleStates: ToggleStates) => {
    setConfirmationToggleStates(toggleStates);
  }, []);

  // Memoize update confirmation details - must be defined before handleConfirmationNext
  const updateTheconfirmationDetails = useCallback(async () => {
    const formData = new FormData();
    const id = effectiveEventId;

    if (!id) {
      showNotification(t("expressEvent.eventIdNotFound"), "error");
      throw new Error("Event ID not found");
    }

    formData.append(
      `event[print_qr]`,
      String(confirmationToggleStates.userQRCode),
    );
    formData.append(
      `event[display_confirmation]`,
      String(confirmationToggleStates.confirmationMsg),
    );
    formData.append(
      `event[display_event_details]`,
      String(confirmationToggleStates.eventDetails),
    );
    formData.append(
      `event[display_location]`,
      String(confirmationToggleStates.location),
    );

    try {
      const response = await updateEventById(id, formData);
      showNotification(t("expressEvent.confirmationDetailsUpdatedSuccess"), "success");
    } catch (error) {
      console.log("Error in confirmation details:", error);
      showNotification(t("expressEvent.errorInConfirmationData"), "error");
      throw error;
    }
  }, [effectiveEventId, confirmationToggleStates]);

  // Memoize confirmation next handler
  const handleConfirmationNext = useCallback(async () => {
    try {
      setIsLoading(true);
      await updateTheconfirmationDetails();

      // Pass the eventId to parent
      if (effectiveEventId && onNext) {
        onNext(effectiveEventId, plan);
      } else {
        showNotification(t("expressEvent.cannotProceedWithoutEventId"), "error");
      }
    } catch (error) {
      console.error("Failed to update confirmation details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveEventId, plan, onNext, updateTheconfirmationDetails]);

  const handleConfirmationPrevious = useCallback(() => {
    setInternalStep(0);
    setConfirmedTemplate(null);
    setSelectedTemplateData(null);
  }, []);

  const handlePreviousClick = useCallback(() => {
    if (internalStep === 1) {
      setInternalStep(0);
      setConfirmedTemplate(null);
      setSelectedTemplateData(null);
    }
    if (onPrevious) onPrevious();
  }, [internalStep, onPrevious]);

  // In RegistrationForm.tsx - UPDATE the handleNextClick function:

  const handleNextClick = useCallback(() => {
    if (internalStep === 0) {
      if (!confirmedTemplate) {
        showNotification(
          t("expressEvent.pleaseSelectTemplate"),
          "warning",
        );
        return;
      } else {
        setInternalStep(1);
      }
    } else {
      if (onNext) onNext(effectiveEventId, plan);
    }
  }, [confirmedTemplate, effectiveEventId, plan, onNext]);

  const isStep1Active = internalStep === 0;
  const isStep1Completed = internalStep > 0;
  const isStep2Active = internalStep === 1;

  return (
    <>
      {plan === "advance" ? (
        <AdvanceEvent
          onComplete={(eventId) => {
            console.log(
              "🔄 Advanced flow completed, moving to main Badge step",
            );
            if (onNext) {
              onNext(eventId, plan);
            }
          }}
          onPrevious={onPrevious}
          eventId={effectiveEventId}
        />
      ) : (
        <div className="w-full mx-5 bg-white p-5 rounded-2xl">
          {/* Header with Step Indicator */}
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row gap-2 items-center">
              <ChevronLeft
                size={20}
                className="cursor-pointer text-gray-500 hover:text-gray-700"
                onClick={handlePreviousClick}
              />
              <p className="text-neutral-900 text-md font-poppins font-normal">
                {internalStep === 0
                  ? t("expressEvent.chooseRegistrationFormTemplate")
                  : t("expressEvent.confirmationDetails")}
              </p>
            </div>

            {/* Steps */}
            <div className="flex items-center gap-1">
              {[
                { step: 0, label: t("expressEvent.registrationTemplate") },
                { step: 1, label: t("expressEvent.confirmationDetails") },
              ].map(({ step, label }, idx) => {
                const isActive = (step === 0 && isStep1Active) || (step === 1 && isStep2Active);
                const done = step === 0 ? isStep1Completed : internalStep > 1;
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setInternalStep(step)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 cursor-pointer transition-colors ${
                          done
                            ? "bg-[#ff0080] border-[#ff0080] hover:opacity-90 text-white"
                            : isActive
                              ? "border-[#ff0080] bg-white text-[#ff0080]"
                              : "border-gray-300 hover:border-[#ff0080] text-gray-400"
                        }`}
                        aria-label={`Go to step ${step + 1}: ${label}`}
                      >
                        {done ? (
                          <Check size={16} className="text-white" />
                        ) : (
                          <span className="text-sm font-medium">
                            {String(step + 1).padStart(2, "0")}
                          </span>
                        )}
                      </button>
                      <span
                        className={`text-xs mt-1 font-medium text-center whitespace-nowrap ${
                          done
                            ? "text-gray-700"
                            : isActive
                              ? "text-[#ff0080]"
                              : "text-gray-400"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {idx < 1 && (
                      <div
                        className={`w-12 h-0.5 self-start mt-4 flex-shrink-0 ${
                          isStep1Completed ? "bg-[#ff0080]" : "bg-gray-300"
                        }`}
                        aria-hidden
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          {internalStep === 0 ? (
            <>
              {/* Loading State for Form Data with Skeleton */}
              {isLoadingFormData ? (
                <div className="mt-16 space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7].map((index) => (
                      <div
                        key={index}
                        className="border-2 rounded-3xl p-4 border-gray-200"
                      >
                        <div className="w-full h-48 overflow-hidden rounded-xl bg-gray-50 space-y-3 p-4">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                          <Skeleton className="h-8 w-1/2 mt-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Template Grid: Custom Form Builder + custom templates + default templates */
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {/* Custom Form Builder card (same as advance) */}
                  <div
                    onClick={() => handleOpenCustomFormBuilder()}
                    className="relative border-2 border-dashed border-pink-300 rounded-3xl p-4 cursor-pointer transition-all duration-200 hover:border-pink-500 hover:bg-pink-50 flex flex-col items-center justify-center h-[240px]"
                  >
                    <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full hidden sm:block">
                      {t("expressEvent.new")}
                    </div>
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-2">
                      <Plus className="text-pink-600" size={28} />
                    </div>
                    <h3 className="text-base font-medium mb-1 text-center text-pink-600">
                      {t("expressEvent.customFormBuilder")}
                    </h3>
                    <p className="text-xs text-gray-500 text-center line-clamp-2">
                      {t("expressEvent.customFormBuilderDescription")}
                    </p>
                  </div>

                  {/* Custom form builder templates (preview aligned with AdvanceRegistration) */}
                  {formBuilderTemplates.map((template) => {
                    const FormBuilderComponent = () => (
                      <FormBuilderTemplateForm
                        data={template.data}
                        eventId={effectiveEventId}
                        formBuilderData={template.formBuilderData}
                        bannerImage={template.bannerImage}
                        theme={template.theme}
                      />
                    );
                    const templateIdStr = String(template.id);
                    const isSelected = confirmedTemplate === templateIdStr;
                    return (
                      <div
                        key={template.id}
                        className={`border-2 rounded-3xl p-4 cursor-pointer transition-colors aspect-square flex flex-col relative overflow-hidden ${
                          isSelected ? "border-pink-500 bg-pink-50" : "border-gray-200 hover:border-pink-500"
                        }`}
                      >
                        <div className="absolute top-2 right-2 flex gap-1 z-10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditFormBuilderTemplate(template);
                            }}
                            className="p-1.5 bg-white rounded-lg shadow-sm text-pink-500 hover:bg-pink-50"
                            title="Edit Template"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFormBuilderTemplate(template.id);
                            }}
                            className="p-1.5 bg-white rounded-lg shadow-sm text-red-500 hover:bg-red-50"
                            title="Delete Template"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div
                          onClick={() => !isLoadingFormData && handleUseFormBuilderTemplate(template.id)}
                          className="w-full h-48 overflow-hidden rounded-xl flex items-center justify-center bg-gray-50 relative cursor-pointer"
                        >
                          {isLoadingFormData && (
                            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-20">
                              <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
                            </div>
                          )}
                          {/* Always show the full form preview (banner + fields) - same as AdvanceRegistration */}
                          <div
                            style={{ scale: 0.25 }}
                            className="transform pointer-events-none"
                          >
                            <div className="w-[1200px]">
                              <FormBuilderComponent />
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-center shrink-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{template.title}</h4>
                          <span className="text-xs text-gray-500">{template.data?.length ?? template.formBuilderData?.formData?.length ?? 0} fields</span>
                        </div>
                        {isSelected && (
                          <div className="mt-2 flex items-center justify-center shrink-0">
                            <Check size={16} className="text-pink-500 mr-1" />
                            <span className="text-sm text-pink-500 font-medium">{t("expressEvent.selected")}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* ── Pre-built Templates Section ─────────────────── */}
                  <div className="col-span-full mt-4 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gray-200" />
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {t("prebuiltTemplates.sectionTitle")}
                      </span>
                      <div className="h-px flex-1 bg-gray-200" />
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-1">
                      {t("prebuiltTemplates.sectionSubtitle")}
                    </p>
                  </div>
                  {PREBUILT_TEMPLATES.map((tpl) => (
                    <PrebuiltTemplateCard
                      key={tpl.key}
                      template={tpl}
                      isSelected={false}
                      isLoading={isSavingPrebuilt}
                      onUse={handleUsePrebuiltTemplate}
                      onPreview={handlePrebuiltPreview}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Confirmation Step */
            <div className="mt-8">
              <ConfirmationDetails
                selectedTemplateData={selectedTemplateData}
                onNext={handleConfirmationNext}
                onPrevious={handleConfirmationPrevious}
                onToggleStatesChange={handleToggleStatesChange}
                eventId={effectiveEventId}
              />
            </div>
          )}

          {/* Modal - Only show when not in confirmation step */}
          {isModalOpen && internalStep === 0 && (
            <Modal
              formData={formData}
              selectedTemplate={selectedTemplate}
              onClose={handleCloseModal}
              onUseTemplate={handleUseTemplate}
              isLoading={isLoading}
              isLoadingFormData={isLoadingFormData}
              eventId={effectiveEventId}
            />
          )}

          {/* Custom Form Builder modal (express) */}
          {isCustomFormBuilderOpen && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white w-full h-full max-w-[95vw] max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden">
                <CustomFormBuilder
                  initialFields={
                    editingFormBuilderTemplate?.formBuilderData?.formData &&
                    Array.isArray(editingFormBuilderTemplate.formBuilderData.formData)
                      ? (editingFormBuilderTemplate.formBuilderData.formData as CustomFormField[])
                      : []
                  }
                  initialBannerImage={editingFormBuilderTemplate?.bannerImage ?? null}
                  initialTheme={editingFormBuilderTemplate?.theme ?? undefined}
                  initialTemplateName={
                    editingFormBuilderTemplate?.title ||
                    `Custom Form ${formBuilderTemplates.length + 1}`
                  }
                  initialLanguageConfig={
                    editingFormBuilderTemplate?.formBuilderData?.languageMode
                      ? {
                          languageMode: editingFormBuilderTemplate.formBuilderData.languageMode,
                          primaryLanguage: editingFormBuilderTemplate.formBuilderData.primaryLanguage,
                        }
                      : undefined
                  }
                  onSave={handleSaveCustomForm}
                  onClose={() => {
                    setIsCustomFormBuilderOpen(false);
                    setEditingFormBuilderTemplate(null);
                    setIsEditFormBuilderMode(false);
                  }}
                />
              </div>
            </div>
          )}

          {/* Custom form preview modal (express) */}
          {isFormBuilderPreviewModalOpen && previewFormBuilderTemplate && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-40">
              <div className="bg-white rounded-3xl p-6 md:p-8 w-[80%] max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {previewFormBuilderTemplate.title}
                  </h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUseFormBuilderTemplate(previewFormBuilderTemplate.id)}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        isLoading
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-pink-500 hover:bg-pink-600 text-white"
                      }`}
                    >
                      {isLoading ? t("expressEvent.applying") : t("expressEvent.useThisTemplate")}
                    </button>
                    <button
                      onClick={() => {
                        setIsFormBuilderPreviewModalOpen(false);
                        setPreviewFormBuilderTemplate(null);
                      }}
                      disabled={isLoading}
                      className="text-gray-400 hover:text-gray-800 bg-gray-200 rounded p-1 disabled:opacity-50"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <FormBuilderTemplateForm
                  data={previewFormBuilderTemplate.data}
                  eventId={effectiveEventId}
                  formBuilderData={previewFormBuilderTemplate.formBuilderData}
                  bannerImage={previewFormBuilderTemplate.bannerImage}
                  theme={previewFormBuilderTemplate.theme}
                />
              </div>
            </div>
          )}

          {/* Prebuilt template full-preview modal */}
          {isPrebuiltPreviewOpen && prebuiltPreviewTemplate && (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {t(prebuiltPreviewTemplate.nameKey)}
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {t(prebuiltPreviewTemplate.descriptionKey)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUsePrebuiltTemplate(prebuiltPreviewTemplate.key)}
                      disabled={isSavingPrebuilt}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isSavingPrebuilt
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-pink-500 hover:bg-pink-600 text-white"
                      }`}
                    >
                      {isSavingPrebuilt ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      {isSavingPrebuilt ? t("expressEvent.applying") : t("prebuiltTemplates.useTemplate")}
                    </button>
                    <button
                      onClick={() => {
                        setIsPrebuiltPreviewOpen(false);
                        setPrebuiltPreviewTemplate(null);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Preview body */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  <div className="mx-auto" style={{ maxWidth: prebuiltPreviewTemplate.theme.formMaxWidth || "600px" }}>
                    <FormBuilderTemplateForm
                      data={prebuiltPreviewTemplate.fields.map((f, i) => ({
                        id: f.id,
                        type: f.type,
                        label: f.label,
                        required: f.required,
                        ...f,
                      }))}
                      eventId={effectiveEventId}
                      formBuilderData={{
                        formData: prebuiltPreviewTemplate.fields,
                        theme: prebuiltPreviewTemplate.theme,
                        languageMode: "single",
                      }}
                      theme={prebuiltPreviewTemplate.theme}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete custom form template confirmation (express) */}
          {isDeleteFormBuilderModalOpen && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) cancelDeleteFormBuilderTemplate();
              }}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{t("expressEvent.deleteTemplate")}</h3>
                  <button
                    onClick={cancelDeleteFormBuilderTemplate}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-700">
                    {t("expressEvent.areYouSureDelete")}{" "}
                    <span className="font-semibold">{deleteFormBuilderCandidate?.title ?? t("expressEvent.thisTemplate")}</span>?
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{t("expressEvent.actionCannotBeUndone")}</p>
                </div>
                <div className="p-4 border-t flex items-center justify-end gap-3">
                  <button
                    onClick={cancelDeleteFormBuilderTemplate}
                    disabled={isDeletingFormBuilder}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t("expressEvent.cancel")}
                  </button>
                  <button
                    onClick={confirmDeleteFormBuilderTemplate}
                    disabled={isDeletingFormBuilder}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {isDeletingFormBuilder ? t("expressEvent.deleting") : t("expressEvent.delete")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
            <button
              onClick={onPrevious}
              disabled={isLoading || isLoadingFormData}
              className={`cursor-pointer w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors border text-slate-800 border-gray-300 hover:bg-gray-50 ${
                isLoading || isLoadingFormData
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              {t("expressEvent.previous")}
            </button>

            <button
              onClick={
                internalStep === 1 ? handleConfirmationNext : handleNextClick
              }
              disabled={!confirmedTemplate || isLoading || isLoadingFormData}
              className={`cursor-pointer w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center
                ${
                  !confirmedTemplate || isLoading || isLoadingFormData
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "bg-slate-800 hover:bg-slate-900 text-white"
                }`}
            >
              {isLoading || isLoadingFormData ? (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ) : confirmedTemplate ? (
                t("expressEvent.next")
              ) : (
                t("expressEvent.configureTemplate")
              )}
            </button>
          </div>

          {notification && (
            <div className="fixed top-4 right-4 z-[100] animate-slide-in">
              <div
                className={`px-6 py-3 rounded-lg shadow-lg ${
                  notification.type === "success"
                    ? "bg-green-500 text-white"
                    : notification.type === "error"
                      ? "bg-red-500 text-white"
                      : notification.type === "warning"
                        ? "bg-yellow-500 text-white"
                        : "bg-blue-500 text-white"
                }`}
              >
                {notification.message}
              </div>
            </div>
          )}
          <style>{`
            @keyframes slide-in {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            .animate-slide-in {
              animation: slide-in 0.3s ease-out;
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default RegistrationForm;
