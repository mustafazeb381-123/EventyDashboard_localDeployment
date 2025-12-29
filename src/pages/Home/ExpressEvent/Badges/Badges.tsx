import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Check,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  QrCode,
} from "lucide-react";
import Assets from "@/utils/Assets";
import { toast, ToastContainer } from "react-toastify";
import { getEventbyId, postBadgesApi } from "@/apis/apiHelpers";
import type { ToggleStates } from "../ExpressEvent";
import CustomBadgeModal from "./components/CustomBadgeModal";

// -------------------- TYPES --------------------
interface BadgeTemplate {
  id: string;
  name: string;
  type: "existing" | "custom";
  width: number;
  height: number;
  hasBackground: boolean;
  bgColor: string;
  bgImage: string | null;
  hasPersonalPhoto: boolean;
  photoSize: { width: number; height: number };
  photoAlignment: "left" | "center" | "right";
  photoPosition: { x: number; y: number };
  hasName: boolean;
  nameText: {
    size: number;
    color: string;
    alignment: "left" | "center" | "right";
    position: { x: number; y: number };
  };
  hasCompany: boolean;
  companyText: {
    size: number;
    color: string;
    alignment: "left" | "center" | "right";
    position: { x: number; y: number };
  };
  hasTitle: boolean;
  titleText: {
    size: number;
    color: string;
    alignment: "left" | "center" | "right";
    position: { x: number; y: number };
  };
  hasQrCode: boolean;
  qrCodeSize: { width: number; height: number };
  qrCodePosition: { x: number; y: number };
  qrCodeAlignment?: "left" | "center" | "right";
}

interface Badge {
  id: number;
  name: string;
  frontImg: string;
  backImg: string;
  userImg?: string;
  squareUserImg?: string;
  qrImg: string;
  cardHeader: string;
  cardFooter: string;
}

interface BadgesProps {
  toggleStates: ToggleStates;
  onNext: (eventId?: string | number, plan?: string) => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps?: number;
  eventId?: string;
  plan?: string;
}

// -------------------- SVG COMPONENTS --------------------
export const CardHeader: React.FC<{ color?: string }> = ({
  color = "#4D4D4D",
}) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 204 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path
      d="M111.273 56.0935C64.6585 45.6916 29.5725 53.1215 0 66V0H204V47.6729C172.322 62.3346 125.307 59.2252 111.273 56.0935Z"
      fill={color}
    />
    <path
      d="M106 64.6191C56.4 55.4191 14.6667 74.7858 0 85.6191V89.6191C40 63.6191 87.3333 62.1191 106 64.6191Z"
      fill={color}
    />
    <path
      d="M107 61.6188C60.5 51.1189 17.3333 65.9522 0 74.6188V80.1187C39.5 55.1189 89.5 58.7806 107 61.6188Z"
      fill={color}
    />
    <path
      d="M119.5 62.5C165.5 68 189 60.5 204 54.5V58.5C170.5 68.5 133.5 66 119.5 62.5Z"
      fill={color}
    />
    <path
      d="M119 65.5C157 73.5 191.5 67.5 204 62.5V67.5C164 76 130 68.5 119 65.5Z"
      fill={color}
    />
  </svg>
);

export const CardHeader2: React.FC<{ color?: string }> = ({
  color = "#4D4D4D",
}) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 204 106"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path d="M204 26V13L154.5 38.5L162.5 46L204 26Z" fill={color} />
    <path d="M0 106V0H204L0 106Z" fill={color} />
  </svg>
);

export const CardFooter: React.FC<{ color?: string }> = ({
  color = "#4D4D4D",
}) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 204 41"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path
      d="M129 22.6273C166.5 23.0083 194.5 8.33636 204 0V8.33636C166.5 27.5 150.5 25.5 129 22.6273Z"
      fill={color}
    />
    <path
      d="M0 20.4307V28C51.5 4.56204 91.5 17.1777 98 18.4392C57.6 1.28214 16 14.6544 0 20.4307Z"
      fill={color}
    />
    <path
      d="M0 33.6364V41H204V14C172.078 29.7091 147.138 29.953 126.688 26.2717C59.8521 14.2401 35.912 15.2273 0 33.6364Z"
      fill={color}
    />
  </svg>
);

export const CardFooter2: React.FC<{ color?: string }> = ({
  color = "#4D4D4D",
}) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 204 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path d="M89.4059 9L0 54H54.5792L105 28.7802L89.4059 9Z" fill={color} />
    <path d="M204 0L106 54H204V0Z" fill={color} />
  </svg>
);

// -------------------- PREVIEW MODAL COMPONENTS --------------------
interface BadgePreviewProps {
  badge: Badge;
  event: any;
  CardHeader: React.FC<{ color?: string }>;
  CardFooter: React.FC<{ color?: string }>;
}

const Template1Preview: React.FC<BadgePreviewProps> = ({
  badge,
  event,
  CardHeader,
  CardFooter,
}) => {
  const primaryColor = event?.attributes?.primary_color || "#4D4D4D";
  const secondaryColor = event?.attributes?.secondary_color || "white";
  const logoUrl = event?.attributes?.logo_url;

  return (
    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
      <div className="p-8">
        <div className="flex justify-center">
          <div
            className="flex flex-col h-[500px] w-full rounded-xl border-4 border-gray-300 overflow-hidden shadow-lg"
            style={{
              backgroundColor: secondaryColor,
              maxWidth: "350px",
            }}
          >
            {/* Header Section - Fixed height container */}
            <div
              className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
              style={{ height: "90px" }}
            >
              <div className="absolute inset-0 h-full w-full">
                <CardHeader color={primaryColor} />
              </div>
              {/* <div className="relative z-10 flex items-center gap-2">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-8 h-8 mb-3 rounded-full bg-white p-1"
                  />
                )}
                <h6 className="font-semibold mb-3 text-white text-lg">
                  Company Name
                </h6>
              </div> */}
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col justify-center items-center p-6">
              <img
                src={badge.userImg}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                alt="User"
              />
              <h2 className="text-2xl font-bold text-gray-900 mt-4">
                John Doe
              </h2>
              <p className="text-gray-600 text-lg mt-1">
                Software Engineer
              </p>

              {/* QR Code on front side */}
              <div className="mt-6 bg-white p-3 rounded-lg shadow-md">
                <img
                  src={badge.qrImg}
                  alt="QR Code"
                  className="w-24 h-24"
                />
                {/* <p className="text-center text-gray-500 text-xs mt-2">
                  Scan for details
                </p> */}
              </div>
            </div>

            {/* Footer Section - Fixed height container */}
            <div
              className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
              style={{ height: "41px" }}
            >
              <div className="absolute inset-0 h-full w-full">
                <CardFooter color={primaryColor} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Template2Preview: React.FC<BadgePreviewProps> = ({
  badge,
  event,
  CardHeader,
  CardFooter,
}) => {
  const primaryColor = event?.attributes?.primary_color || "#4D4D4D";
  const secondaryColor = event?.attributes?.secondary_color || "white";

  return (
    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
      <div className="p-8">
        <div className="flex justify-center">
          <div
            className="flex flex-col h-[500px] w-full rounded-xl border-4 border-gray-300 overflow-hidden shadow-lg"
            style={{
              backgroundColor: secondaryColor,
              maxWidth: "350px",
            }}
          >
            {/* Header Section - Fixed height container */}
            <div
              className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
              style={{ height: "106px" }}
            >
              <div className="absolute inset-0 h-full w-full">
                <CardHeader color={primaryColor} />
              </div>
              {/* <div className="relative z-10">
                <h6 className="font-semibold text-white text-xl">
                  Conference 2024
                </h6>
              </div> */}
            </div>

            <div className="flex flex-1 flex-col justify-center items-center p-6">
              <img
                src={badge.squareUserImg}
                className="w-32 h-32 object-cover rounded-lg border-4 border-white shadow-lg"
                alt="User"
              />
              <h2 className="text-2xl font-bold text-gray-900 mt-4">
                John Doe
              </h2>
              <p className="text-gray-600 text-lg mt-1">
                Software Engineer
              </p>

              {/* QR Code on front side */}
              <div className="mt-6 bg-white p-3 rounded-lg shadow-md">
                <img
                  src={badge.qrImg}
                  alt="QR Code"
                  className="w-24 h-24"
                />
                {/* <p className="text-center text-gray-500 text-xs mt-2">
                  Scan for details
                </p> */}
              </div>
            </div>

            {/* Footer Section - Fixed height container */}
            <div
              className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
              style={{ height: "54px" }}
            >
              <div className="absolute inset-0 h-full w-full">
                <CardFooter color={primaryColor} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Badge Preview Modal
interface CustomBadgePreviewProps {
  template: BadgeTemplate;
}

const CustomBadgePreview: React.FC<CustomBadgePreviewProps> = ({
  template,
}) => {
  const previewWidth = template.width * 100;

  // Scaling ratio for positioning elements (100px per inch vs base units if any)
  // The positioning in the template seems to be based on some unit.
  // In previous code (modal), it was * 0.4 for preview.
  // Positions (x, y) seem to be in pixels based on a 200x? canvas or similar?
  // Let's look at the previous render helper in CustomBadgeModal. 
  // It used `* 0.4` for a preview of `width * 80`.
  // Wait, `previewWidth` was `template.width * 80`.
  // The text positions were `(template.nameText.position?.x || 200) * 0.4`.
  // If I change `previewWidth` to `template.width * 100`, I should probably adjust the internal multiplier to `0.5`?
  // 80 * X = 0.4 -> X = 0.4/80 = 0.005
  // So for 100, multiplier should be 100 * 0.005 = 0.5.

  const multiplier = 0.5;

  return (
    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
      <div className="p-8">
        <div className="flex justify-center">
          <div className="flex justify-center">
            <div
              className="relative rounded-2xl shadow-xl overflow-hidden border-4 border-gray-300"
              style={{
                width: `${previewWidth}px`,
                height: `${template.height * 100}px`,
                backgroundColor: template.hasBackground
                  ? template.bgColor
                  : "transparent",
                backgroundImage:
                  template.hasBackground && template.bgImage
                    ? `url(${template.bgImage})`
                    : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {template.hasPersonalPhoto && template.photoSize && (
                <div
                  className="absolute rounded-full bg-gray-300 border-4 border-white flex items-center justify-center overflow-hidden"
                  style={{
                    width: `${(template.photoSize.width || 200) * multiplier}px`,
                    height: `${(template.photoSize.height || 200) * multiplier}px`,
                    left:
                      template.photoAlignment === "left"
                        ? `${(template.photoPosition?.x || 200) * multiplier}px`
                        : template.photoAlignment === "right"
                          ? "auto"
                          : "50%",
                    right:
                      template.photoAlignment === "right"
                        ? `${(template.photoPosition?.x || 200) * multiplier}px`
                        : "auto",
                    transform:
                      template.photoAlignment === "center"
                        ? "translateX(-50%)"
                        : "none",
                    top: `${(template.photoPosition?.y || 60) * multiplier}px`,
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                    <span className="text-gray-500">Photo</span>
                  </div>
                </div>
              )}

              {template.hasName && template.nameText && (
                <div
                  className="absolute"
                  style={{
                    top: `${(template.nameText.position?.y || 280) * multiplier}px`,
                    left: "0",
                    width: "100%",
                    transform: "none",
                    textAlign: template.nameText.alignment || "center",
                  }}
                >
                  <div
                    className="font-bold px-4 whitespace-nowrap"
                    style={{
                      fontSize: `${(template.nameText.size || 24) * multiplier}px`,
                      color: template.nameText.color || "#ffffff",
                    }}
                  >
                    John Doe
                  </div>
                </div>
              )}

              {template.hasCompany && template.companyText && (
                <div
                  className="absolute"
                  style={{
                    top: `${(template.companyText.position?.y || 315) * multiplier
                      }px`,
                    left: "0",
                    width: "100%",
                    transform: "none",
                    textAlign: template.companyText.alignment || "center",
                  }}
                >
                  <div
                    className="px-4 whitespace-nowrap"
                    style={{
                      fontSize: `${(template.companyText.size || 18) * multiplier}px`,
                      color: template.companyText.color || "#cccccc",
                    }}
                  >
                    Tech Company
                  </div>
                </div>
              )}

              {template.hasTitle && template.titleText && (
                <div
                  className="absolute"
                  style={{
                    top: `${(template.titleText.position?.y || 350) * multiplier}px`,
                    left: "0",
                    width: "100%",
                    transform: "none",
                    textAlign: template.titleText.alignment || "center",
                  }}
                >
                  <div
                    className="px-4 whitespace-nowrap"
                    style={{
                      fontSize: `${(template.titleText.size || 16) * multiplier}px`,
                      color: template.titleText.color || "#999999",
                    }}
                  >
                    Software Engineer
                  </div>
                </div>
              )}

              {template.hasQrCode && template.qrCodeSize && (
                <div
                  className="absolute bg-white border-4 border-gray-400 flex items-center justify-center overflow-hidden rounded-lg"
                  style={{
                    width: `${(template.qrCodeSize.width || 120) * multiplier}px`,
                    height: `${(template.qrCodeSize.height || 120) * multiplier
                      }px`,
                    left: `${(template.qrCodePosition?.x || 200) * multiplier}px`,
                    top: `${(template.qrCodePosition?.y || 400) * multiplier}px`,
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
                    <QrCode
                      size={(template.qrCodeSize.width || 120) * (multiplier * 0.5)}
                      className="text-gray-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------- MAIN BADGES COMPONENT --------------------
const Badges: React.FC<BadgesProps> = ({
  toggleStates,
  onNext,
  onPrevious,
  currentStep,
  eventId,
  plan,
}) => {
  console.log(plan, currentStep, eventId);

  // State for custom templates
  const [customTemplates, setCustomTemplates] = useState<BadgeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<BadgeTemplate | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [editingCustomTemplate, setEditingCustomTemplate] =
    useState<BadgeTemplate | null>(null);
  const [isEditCustomMode, setIsEditCustomMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<any>(null);

  // Preview state
  const [previewBadge, setPreviewBadge] = useState<Badge | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<BadgeTemplate | null>(
    null
  );

  // Original badge state
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [activeBadgeId, setActiveBadgeId] = useState<number | null>(null);

  const effectiveEventId = eventId || localStorage.getItem("create_eventId");

  console.log("Badges - Received eventId:", eventId);
  console.log("Badges - Effective eventId:", effectiveEventId);

  // Updated badges array with only Template 1 and Template 2 (with profile photos)
  const badges: Badge[] = [
    {
      id: 1,
      name: "Template 1",
      frontImg: Assets.images.b1_front,
      backImg: Assets.images.b1_back,
      userImg: Assets.images.user_img,
      qrImg: Assets.images.qr_img,
      cardHeader: Assets.images.card_header,
      cardFooter: Assets.images.card_footer,
    },
    {
      id: 3,
      name: "Template 2",
      frontImg: Assets.images.b3_front,
      backImg: Assets.images.b3_back,
      squareUserImg: Assets.images.square_user_img,
      qrImg: Assets.images.qr_img,
      cardHeader: Assets.images.card_header2,
      cardFooter: Assets.images.card_footer2,
    },
  ];

  // Existing badge templates (Only Template 1 and 2 as BadgeTemplate objects)
  const existingBadges: BadgeTemplate[] = [
    {
      id: "existing-1",
      name: "Template 1",
      type: "existing",
      width: 3.5,
      height: 5.5,
      hasBackground: true,
      bgColor: "#2563eb",
      bgImage: null,
      hasPersonalPhoto: true,
      photoSize: { width: 120, height: 120 },
      photoAlignment: "center",
      photoPosition: { x: 200, y: 100 },
      hasName: true,
      nameText: {
        size: 18,
        color: "#000000",
        alignment: "center",
        position: { x: 200, y: 240 },
      },
      hasCompany: true,
      companyText: {
        size: 14,
        color: "#666666",
        alignment: "center",
        position: { x: 200, y: 270 },
      },
      hasTitle: true,
      titleText: {
        size: 12,
        color: "#999999",
        alignment: "center",
        position: { x: 200, y: 295 },
      },
      hasQrCode: true,
      qrCodeSize: { width: 120, height: 120 },
      qrCodePosition: { x: 200, y: 380 },
    },
    {
      id: "existing-3",
      name: "Template 2",
      type: "existing",
      width: 3.5,
      height: 5.5,
      hasBackground: true,
      bgColor: "#FFFFFF",
      bgImage: null,
      hasPersonalPhoto: true,
      photoSize: { width: 100, height: 100 },
      photoAlignment: "center",
      photoPosition: { x: 200, y: 120 },
      hasName: true,
      nameText: {
        size: 18,
        color: "#000000",
        alignment: "center",
        position: { x: 200, y: 240 },
      },
      hasCompany: false,
      companyText: {
        size: 14,
        color: "#666666",
        alignment: "center",
        position: { x: 200, y: 270 },
      },
      hasTitle: true,
      titleText: {
        size: 12,
        color: "#666666",
        alignment: "center",
        position: { x: 200, y: 270 },
      },
      hasQrCode: true,
      qrCodeSize: { width: 120, height: 120 },
      qrCodePosition: { x: 200, y: 380 },
    },
  ];

  // Load custom templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("customBadgeTemplates");
    if (saved) {
      try {
        setCustomTemplates(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading templates:", error);
      }
    }

    // Load event data
    if (effectiveEventId) {
      getEventbyId(effectiveEventId)
        .then((response) => {
          const eventData = response?.data?.data;
          console.log("response of get badge api", eventData);
          setEvent(eventData);

          const activeBadge =
            eventData?.attributes?.active_badge_id ||
            parseInt(localStorage.getItem("active_badge_id") || "0", 10);

          if (activeBadge) {
            setActiveBadgeId(activeBadge);
            // Try to find if it's an existing badge
            const foundBadge = badges.find((b) => b.id === activeBadge);
            if (foundBadge) {
              setSelectedBadge(foundBadge);
            } else {
              // Check if it's a custom template
              const foundTemplate = customTemplates.find(
                (t) => t.id === `custom-${activeBadge}`
              );
              if (foundTemplate) {
                setSelectedTemplate(foundTemplate);
              }
            }
          }
        })
        .catch((error) => {
          console.error("Failed to fetch event data:", error);
        });
    }
  }, [effectiveEventId]);

  // Save templates to localStorage
  const saveTemplates = (newTemplates: BadgeTemplate[]) => {
    localStorage.setItem("customBadgeTemplates", JSON.stringify(newTemplates));
    setCustomTemplates(newTemplates);
  };

  // -------------------- CUSTOM TEMPLATE FUNCTIONS --------------------
  const handleCreateNewTemplate = () => {
    setEditingCustomTemplate(null);
    setIsEditCustomMode(false);
    setIsCustomModalOpen(true);
  };

  const handleEditCustomTemplate = (template: BadgeTemplate) => {
    setEditingCustomTemplate(template);
    setIsEditCustomMode(true);
    setIsCustomModalOpen(true);
  };

  const handleSaveCustomTemplate = (template: BadgeTemplate) => {
    let updatedTemplates: BadgeTemplate[];

    if (isEditCustomMode && editingCustomTemplate) {
      // Update existing template
      updatedTemplates = customTemplates.map((t) =>
        t.id === editingCustomTemplate.id
          ? { ...template, updatedAt: new Date().toISOString() }
          : t
      );
    } else {
      // Create new template
      updatedTemplates = [...customTemplates, template];
    }

    saveTemplates(updatedTemplates);
    toast.success(
      `Template ${isEditCustomMode ? "updated" : "created"} successfully!`
    );
  };

  const handleDeleteCustomTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      const updatedTemplates = customTemplates.filter(
        (template) => template.id !== templateId
      );
      saveTemplates(updatedTemplates);

      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
      }
      toast.success("Template deleted successfully!");
    }
  };

  const handleSelectTemplate = (template: BadgeTemplate) => {
    // If clicking the same template that's already selected, deselect it
    if (selectedTemplate?.id === template.id) {
      setSelectedTemplate(null);
      toast.success("Template deselected!");
    } else {
      // Select new template and deselect any existing badge
      setSelectedTemplate(template);
      setSelectedBadge(null);
      toast.success("Template selected!");
    }
  };

  const handlePreviewBadge = (badge: Badge) => {
    setPreviewBadge(badge);
    setPreviewTemplate(null);
  };

  const handlePreviewTemplate = (template: BadgeTemplate) => {
    setPreviewTemplate(template);
    setPreviewBadge(null);
  };

  const closePreview = () => {
    setPreviewBadge(null);
    setPreviewTemplate(null);
  };

  // -------------------- EXISTING BADGE FUNCTIONS --------------------
  const handleSelectExistingBadge = (badge: Badge) => {
    // If clicking the same badge that's already selected, deselect it
    if (selectedBadge?.id === badge.id) {
      setSelectedBadge(null);
    } else {
      // Select new badge and deselect any custom template
      setSelectedBadge(badge);
      setSelectedTemplate(null);
    }
  };

  // -------------------- RENDER FUNCTIONS --------------------
  const renderExistingBadgePreview = (badge: Badge) => {
    const primaryColor = event?.attributes?.primary_color || "#2563eb";
    const secondaryColor = event?.attributes?.secondary_color || "white";
    const logoUrl = event?.attributes?.logo_url;

    return (
      <div
        className="flex flex-col h-full w-48 rounded-xl border overflow-hidden"
        style={{ backgroundColor: secondaryColor }}
      >
        {/* Header Section */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: "90px" }}
        >
          <div className="absolute inset-0 h-full w-full">
            {badge.id === 1 ? (
              <CardHeader color={primaryColor} />
            ) : (
              <CardHeader2 color={primaryColor} />
            )}
          </div>

          {/* Header content for different badges */}
          {/* {badge.id === 1 && (
            <div className="relative z-10 flex items-center justify-center gap-2 h-full">
              {logoUrl && <img src={logoUrl} alt="Logo" className="w-4 h-4" />}
              <h6 className="font-semibold text-white text-xs">Company Name</h6>
            </div>
          )}
          {badge.id === 3 && (
            <div className="relative z-10 flex items-center justify-center h-full">
              <h6 className="font-semibold text-white text-xs">
                Conference 2024
              </h6>
            </div>
          )} */}
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col justify-center items-center p-4">
          {/* Photo - both badges have profile photos */}
          <div
            className={`${badge.id === 3 ? "w-12 h-12 rounded-full" : "w-12 h-12 rounded-full"
              } bg-gray-300 mb-2 flex items-center justify-center overflow-hidden`}
          >
            {badge.id === 1 ? (
              <img
                src={badge.userImg}
                className="w-full h-full object-cover"
                alt="User"
              />
            ) : (
              <img
                src={badge.squareUserImg}
                className="w-full h-full object-cover"
                alt="User"
              />
            )}
          </div>

          {/* Name */}
          <h2
            className={`text-xs font-bold ${badge.id === 3 ? "text-gray-900" : "text-gray-900"
              } mb-1`}
          >
            John Doe
          </h2>

          {/* Title */}
          <p className="text-xs text-gray-600 mb-2">
            Software Engineer
          </p>

          {/* QR Code on front side */}
          <div className="w-10 h-10 bg-white rounded border border-gray-300 flex items-center justify-center">
            <QrCode size={20} className="text-gray-600" />
          </div>
        </div>

        {/* Footer Section */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: badge.id === 1 ? "41px" : "54px" }}
        >
          <div className="absolute inset-0 h-full w-full">
            {badge.id === 1 ? (
              <CardFooter color={primaryColor} />
            ) : (
              <CardFooter2 color={primaryColor} />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCustomBadgePreview = (template: BadgeTemplate) => {
    const previewScale = 55;
    const internalScale = 0.275;
    const previewWidth = template.width * previewScale;

    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div
          className="relative rounded-xl shadow-md overflow-hidden border border-gray-200"
          style={{
            width: `${previewWidth}px`,
            height: `${template.height * previewScale}px`,
            backgroundColor: template.hasBackground
              ? template.bgColor
              : "transparent",
            backgroundImage:
              template.hasBackground && template.bgImage
                ? `url(${template.bgImage})`
                : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {template.hasPersonalPhoto && template.photoSize && (
            <div
              className="absolute rounded-full bg-gray-300 border-2 border-white flex items-center justify-center overflow-hidden"
              style={{
                width: `${(template.photoSize.width || 200) * internalScale}px`,
                height: `${(template.photoSize.height || 200) * internalScale}px`,
                left:
                  template.photoAlignment === "left"
                    ? `${(template.photoPosition?.x || 200) * internalScale}px`
                    : template.photoAlignment === "right"
                      ? "auto"
                      : "50%",
                right:
                  template.photoAlignment === "right"
                    ? `${(template.photoPosition?.x || 200) * internalScale}px`
                    : "auto",
                transform:
                  template.photoAlignment === "center"
                    ? "translateX(-50%)"
                    : "none",
                top: `${(template.photoPosition?.y || 60) * internalScale}px`,
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
            </div>
          )}

          {template.hasName && template.nameText && (
            <div
              className="absolute"
              style={{
                top: `${(template.nameText.position?.y || 280) * internalScale}px`,
                left: "0",
                width: "100%",
                transform: "none",
                textAlign: template.nameText.alignment || "center",
              }}
            >
              <div
                className="font-bold px-2 whitespace-nowrap"
                style={{
                  fontSize: `${(template.nameText.size || 24) * internalScale}px`,
                  color: template.nameText.color || "#ffffff",
                }}
              >
                Name
              </div>
            </div>
          )}

          {template.hasCompany && template.companyText && (
            <div
              className="absolute"
              style={{
                top: `${(template.companyText.position?.y || 315) * internalScale}px`,
                left: "0",
                width: "100%",
                transform: "none",
                textAlign: template.companyText.alignment || "center",
              }}
            >
              <div
                className="px-2 whitespace-nowrap"
                style={{
                  fontSize: `${(template.companyText.size || 18) * internalScale}px`,
                  color: template.companyText.color || "#cccccc",
                }}
              >
                Company
              </div>
            </div>
          )}

          {template.hasTitle && template.titleText && (
            <div
              className="absolute"
              style={{
                top: `${(template.titleText.position?.y || 350) * internalScale}px`,
                left: "0",
                width: "100%",
                transform: "none",
                textAlign: template.titleText.alignment || "center",
              }}
            >
              <div
                className="px-2 whitespace-nowrap"
                style={{
                  fontSize: `${(template.titleText.size || 16) * internalScale}px`,
                  color: template.titleText.color || "#999999",
                }}
              >
                Title
              </div>
            </div>
          )}

          {template.hasQrCode && template.qrCodeSize && (
            <div
              className="absolute bg-white border-2 border-gray-300 flex items-center justify-center overflow-hidden"
              style={{
                width: `${(template.qrCodeSize.width || 120) * internalScale}px`,
                height: `${(template.qrCodeSize.height || 120) * internalScale}px`,
                left:
                  template.qrCodeAlignment === "left"
                    ? `${(template.qrCodePosition?.x || 200) * internalScale}px`
                    : template.qrCodeAlignment === "right"
                      ? "auto"
                      : "50%",
                right:
                  template.qrCodeAlignment === "right"
                    ? `${(template.qrCodePosition?.x || 200) * internalScale}px`
                    : "auto",
                transform:
                  template.qrCodeAlignment === "center"
                    ? "translateX(-50%)"
                    : "none",
                top: `${(template.qrCodePosition?.y || 400) * internalScale}px`,
              }}
            >
              <QrCode
                size={(template.qrCodeSize.width || 120) * internalScale * 0.5}
                className="text-gray-400"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // -------------------- API INTEGRATION --------------------
  const handleBadgeApiSelection = async (
    badgeId: number,
    badgeName: string
  ) => {
    if (!effectiveEventId) {
      throw new Error("Event ID not found");
    }

    const data = {
      badge_template: {
        name: badgeName,
        event_id: effectiveEventId,
        default: true,
      },
    };

    const response = await postBadgesApi(data, parseInt(effectiveEventId, 10));
    console.log("Response of post badge api:", response.data);
    return response;
  };

  const handleCustomBadgeApiSelection = async (template: BadgeTemplate) => {
    if (!effectiveEventId) {
      throw new Error("Event ID not found");
    }

    const data = {
      badge_template: {
        name: template.name,
        event_id: effectiveEventId,
        default: true,
        template_data: template, // Include the full template data
      },
    };

    const response = await postBadgesApi(data, parseInt(effectiveEventId, 10));
    return response;
  };

  const selectBadgeAndContinue = async () => {
    if (!selectedBadge && !selectedTemplate) {
      toast.error("Please select a badge template first!");
      return;
    }

    setLoading(true);
    try {
      if (selectedBadge) {
        // Existing badge selected
        const response = await handleBadgeApiSelection(
          selectedBadge.id,
          selectedBadge.name
        );
        toast.success("Template selected!");
        setActiveBadgeId(selectedBadge.id);

        // Save only required data for PrintBadges
        localStorage.setItem("active_badge_id", selectedBadge.id.toString());
        localStorage.setItem("badge_qr_image", selectedBadge.qrImg);
        localStorage.setItem(
          "badge_header_color",
          event?.attributes?.primary_color || "#4D4D4D"
        );
        localStorage.setItem(
          "badge_footer_color",
          event?.attributes?.primary_color || "#4D4D4D"
        );
        localStorage.setItem(
          "badge_background_color",
          event?.attributes?.secondary_color || "white"
        );
      } else if (selectedTemplate) {
        // Custom template selected
        await handleCustomBadgeApiSelection(selectedTemplate);
        toast.success("Custom template selected!");

        // Save template data for PrintBadges
        localStorage.setItem(
          "active_badge_template",
          JSON.stringify(selectedTemplate)
        );
        localStorage.setItem("active_badge_id", selectedTemplate.id);
      }

      setTimeout(() => {
        if (effectiveEventId && onNext) {
          onNext(effectiveEventId, plan);
        } else {
          onNext();
        }
      }, 1000);
    } catch (error) {
      toast.error("Failed to select template.");
      console.error("Template selection error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-5 bg-white p-5 rounded-2xl">
      {/* Header */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          <ChevronLeft />
          <p className="text-neutral-900 text-md font-poppins font-normal">
            Choose a Badge Template
          </p>
        </div>
      </div>

      {/* Badge Templates Grid */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Custom Badge Creation Card (First Position) */}
        <div
          onClick={handleCreateNewTemplate}
          className="border-2 border-dashed border-gray-300 rounded-3xl p-6 cursor-pointer transition-all duration-200 hover:border-pink-400 hover:bg-pink-50 flex flex-col items-center justify-center min-h-[350px]"
        >
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="text-pink-500" size={32} />
          </div>
          <h3 className="text-lg font-medium mb-2 text-center text-pink-500">
            Create Custom Badge
          </h3>
          <p className="text-sm text-gray-500 text-center">
            Design a custom badge template from scratch
          </p>
        </div>

        {/* Custom Templates */}
        {customTemplates.map((template) => {
          const isSelected = selectedTemplate?.id === template.id;
          return (
            <div
              key={template.id}
              className={`border-2 rounded-3xl p-4 transition-colors flex flex-col min-h-[350px] ${isSelected
                ? "border-pink-500 bg-pink-50"
                : "border-gray-200 hover:border-pink-500"
                }`}
            >
              <div
                className="flex-1 cursor-pointer"
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="flex items-center justify-center">
                  {renderCustomBadgePreview(template)}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm text-gray-900">
                    {template.name}
                  </span>
                  <div className="flex gap-2">
                    {isSelected && (
                      <div className="flex items-center">
                        <Check size={16} className="text-pink-500 mr-1" />
                        <span className="text-sm text-pink-500 font-medium">
                          Selected
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-1">
                    {template.hasPersonalPhoto && (
                      <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
                        Photo
                      </span>
                    )}
                    {template.hasQrCode && (
                      <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs">
                        QR
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewTemplate(template);
                      }}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Eye size={14} />
                      Preview
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCustomTemplate(template);
                      }}
                      className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomTemplate(template.id);
                      }}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Default Templates (Only Template 1 and Template 2) */}
        {badges.map((badge) => {
          const isActive = selectedBadge?.id === badge.id;

          return (
            <div
              key={badge.id}
              className={`relative border-2 rounded-3xl p-4 transition-colors cursor-pointer flex flex-col min-h-[350px] ${isActive
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-blue-500"
                }`}
              onClick={() => handleSelectExistingBadge(badge)}
            >
              <div className="flex-1 h-48 flex items-center justify-center">
                {renderExistingBadgePreview(badge)}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm text-gray-900">
                    {badge.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <div className="flex items-center">
                        <Check size={16} className="text-green-500 mr-1" />
                        <span className="text-sm text-green-500 font-medium">
                          Selected
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-1">
                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
                      Photo
                    </span>
                    <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs">
                      QR
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewBadge(badge);
                    }}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Badge Builder Modal */}
      <CustomBadgeModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSave={handleSaveCustomTemplate}
        template={editingCustomTemplate}
        isEditMode={isEditCustomMode}
      />

      {/* Preview Modals */}
      {previewBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
            {/* Modal Header with close button */}
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {previewBadge.name} Preview
              </h2>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            {/* Badge Preview Content */}
            {previewBadge.id === 1 ? (
              <Template1Preview
                badge={previewBadge}
                event={event}
                CardHeader={CardHeader}
                CardFooter={CardFooter}
              />
            ) : (
              <Template2Preview
                badge={previewBadge}
                event={event}
                CardHeader={CardHeader2}
                CardFooter={CardFooter2}
              />
            )}

            {/* Modal Footer */}
            {/* <div className="p-6 border-t flex justify-end">
              <button
                onClick={closePreview}
                className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
              >
                Close
              </button>
            </div> */}
          </div>
        </div>
      )}

      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
            {/* Modal Header with close button */}
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {previewTemplate.name} Preview
              </h2>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            {/* Custom Badge Preview Content */}
            <CustomBadgePreview template={previewTemplate} />

            {/* Modal Footer */}
            {/* <div className="p-6 border-t flex justify-end">
              <button
                onClick={closePreview}
                className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
              >
                Close
              </button>
            </div> */}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className="cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded-lg border text-slate-800 hover:bg-gray-50"
        >
          ← Previous
        </button>

        <button
          onClick={selectBadgeAndContinue}
          disabled={(!selectedBadge && !selectedTemplate) || loading}
          className={`cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded-lg flex items-center justify-center ${(selectedBadge || selectedTemplate) && !loading
            ? "bg-slate-800 hover:bg-slate-900 text-white"
            : "bg-gray-400 cursor-not-allowed text-white"
            }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Loading...
            </span>
          ) : (
            "Use Template →"
          )}
        </button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Badges;