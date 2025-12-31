import React from "react";
import QRCode from "react-qr-code";
import UserAvatar from "./useAvatar";
import {
  CardFooter,
  CardFooter2,
  CardHeader,
  CardHeader2,
} from "@/pages/Home/ExpressEvent/Badges/Badges";

interface BadgeTemplateProps {
  template: any; // Badge template from API
  event: any;
  user?: any; // User data for displaying name, organization, photo, QR
}

// Helper to extract colors from template or event
const getBadgeColors = (template: any, event: any) => {
  const templateData = template?.attributes?.template_data || {};
  const eventColors = event?.attributes || {};
  const templateName = template?.attributes?.name || "";
  const templateType = templateData.type || "";

  // Fix red background colors
  const fixRedBackground = (bgColor: string | null | undefined): string => {
    if (!bgColor) return "#ffffff";
    const color = bgColor.toLowerCase().trim();
    if (
      color === "#ff0000" ||
      color === "#f00" ||
      color === "red" ||
      color === "rgb(255, 0, 0)" ||
      color === "rgba(255, 0, 0, 1)" ||
      (color.startsWith("#ff") && (color.includes("0000") || color === "#ff0000" || color === "#ff00"))
    ) {
      return "#ffffff";
    }
    return bgColor;
  };

  // For ready-made templates (Template 1 or Template 2), ALWAYS use event colors from main data
  // This ensures consistency between badge screen and print badge
  const isReadyMadeTemplate = templateName === "Template 1" || templateName === "Template 2" || templateType === "existing";
  
  let finalBgColor: string;
  if (isReadyMadeTemplate) {
    // For ready-made templates, ALWAYS use event's secondary_color from main data
    // This is the color set by the user in the main event settings
    finalBgColor = fixRedBackground(eventColors.secondary_color) || "white";
  } else {
    // For custom templates, use template bgColor if available, otherwise use event color
    const bgColor = templateData.bgColor;
    finalBgColor = fixRedBackground(bgColor) || fixRedBackground(eventColors.secondary_color) || "white";
  }
  
  // Get header/footer color - ALWAYS use event primary color from main data
  const headerFooterColor = eventColors.primary_color || "#4D4D4D";

  return {
    headerColor: headerFooterColor,
    footerColor: headerFooterColor,
    backgroundColor: finalBgColor,
  };
};

// Helper to check if template is existing (Template 1 or Template 2)
const isExistingTemplate = (template: any) => {
  const name = template?.attributes?.name || "";
  const type = template?.attributes?.template_data?.type || "";
  return ["Template 1", "Template 2"].includes(name) || type === "existing";
};

// Custom Badge Template - Renders with user data
export const CustomBadgeTemplate: React.FC<BadgeTemplateProps> = ({
  template,
  event,
  user,
}) => {
  const templateData = template?.attributes?.template_data || {};
  const badgeColors = getBadgeColors(template, event);
  
  // Convert pixels to inches if needed
  let width = templateData.width || 3.5;
  let height = templateData.height || 5.5;
  
  if (width > 50) width = width / 96;
  if (height > 50) height = height / 96;
  
  const widthPx = width * 96;
  const heightPx = height * 96;
  
  // Scaling factor for positioning (based on 200px base unit)
  const scale = 0.4;

  // Get background image - check both attributes.background_image (URL) and template_data.bgImage (base64)
  const backgroundImageUrl = 
    template?.attributes?.background_image || 
    templateData.bgImage || 
    null;

  // Determine background color - use template bgColor if available, otherwise use event color
  const finalBackgroundColor = templateData.bgColor 
    ? badgeColors.backgroundColor 
    : (templateData.hasBackground ? badgeColors.backgroundColor : "#ffffff");

  return (
    <div
      className="flex flex-col w-full rounded-xl overflow-hidden relative"
      style={{
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        backgroundColor: finalBackgroundColor,
        backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        border: "none",
        outline: "none",
        boxShadow: "none",
      }}
    >
      {/* Photo if enabled */}
      {templateData.hasPersonalPhoto && templateData.photoSize && (
        <div
          className="absolute rounded-full border-4 border-white flex items-center justify-center overflow-hidden"
          style={{
            width: `${(templateData.photoSize.width || 200) * scale}px`,
            height: `${(templateData.photoSize.height || 200) * scale}px`,
            left:
              templateData.photoAlignment === "left"
                ? `${(templateData.photoPosition?.x || 200) * scale}px`
                : templateData.photoAlignment === "right"
                  ? "auto"
                  : "50%",
            right:
              templateData.photoAlignment === "right"
                ? `${(templateData.photoPosition?.x || 200) * scale}px`
                : "auto",
            transform:
              templateData.photoAlignment === "center"
                ? "translateX(-50%)"
                : "none",
            top: `${(templateData.photoPosition?.y || 60) * scale}px`,
          }}
        >
          {user ? (
            <UserAvatar user={user} size="lg" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
          )}
        </div>
      )}

      {/* Name if enabled */}
      {templateData.hasName && templateData.nameText && (
        <div
          className="absolute"
          style={{
            top: `${(templateData.nameText.position?.y || 280) * scale}px`,
            left: "0",
            width: "100%",
            transform: "none",
            textAlign: templateData.nameText.alignment || "center",
          }}
        >
          <div
            className="font-bold px-4 whitespace-nowrap"
            style={{
              fontSize: `${(templateData.nameText.size || 24) * scale}px`,
              color: templateData.nameText.color || "#000000",
            }}
          >
            {user?.attributes?.name || "Name Placeholder"}
          </div>
        </div>
      )}

      {/* Company if enabled */}
      {templateData.hasCompany && templateData.companyText && (
        <div
          className="absolute"
          style={{
            top: `${(templateData.companyText.position?.y || 315) * scale}px`,
            left: "0",
            width: "100%",
            transform: "none",
            textAlign: templateData.companyText.alignment || "center",
          }}
        >
          <div
            className="px-4 whitespace-nowrap"
            style={{
              fontSize: `${(templateData.companyText.size || 18) * scale}px`,
              color: templateData.companyText.color || "#666666",
            }}
          >
            {user?.attributes?.organization || "Company Placeholder"}
          </div>
        </div>
      )}

      {/* Title if enabled */}
      {templateData.hasTitle && templateData.titleText && (
        <div
          className="absolute"
          style={{
            top: `${(templateData.titleText.position?.y || 350) * scale}px`,
            left: "0",
            width: "100%",
            transform: "none",
            textAlign: templateData.titleText.alignment || "center",
          }}
        >
          <div
            className="px-4 whitespace-nowrap"
            style={{
              fontSize: `${(templateData.titleText.size || 16) * scale}px`,
              color: templateData.titleText.color || "#999999",
            }}
          >
            {user?.attributes?.user_type || "Title Placeholder"}
          </div>
        </div>
      )}

      {/* QR Code if enabled */}
      {templateData.hasQrCode && templateData.qrCodeSize && (
        <div
          className="absolute bg-white border-4 border-gray-400 flex items-center justify-center overflow-hidden rounded-lg p-2"
          style={{
            width: `${(templateData.qrCodeSize.width || 120) * scale}px`,
            height: `${(templateData.qrCodeSize.height || 120) * scale}px`,
            left:
              templateData.qrCodeAlignment === "left"
                ? `${(templateData.qrCodePosition?.x || 200) * scale}px`
                : templateData.qrCodeAlignment === "right"
                  ? "auto"
                  : "50%",
            right:
              templateData.qrCodeAlignment === "right"
                ? `${(templateData.qrCodePosition?.x || 200) * scale}px`
                : "auto",
            transform:
              templateData.qrCodeAlignment === "center"
                ? "translateX(-50%)"
                : "none",
            top: `${(templateData.qrCodePosition?.y || 400) * scale}px`,
          }}
        >
          {user?.attributes?.token ? (
            <QRCode
              value={user.attributes.token}
              size={(templateData.qrCodeSize.width || 120) * scale - 8}
              level="H"
              fgColor="#1f2937"
              bgColor="#ffffff"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300" />
          )}
        </div>
      )}
    </div>
  );
};

// Existing Template 1 - With user data
export const ExistingBadgeTemplate1: React.FC<BadgeTemplateProps> = ({
  template,
  event,
  user,
}) => {
  const badgeColors = getBadgeColors(template, event);

  return (
    <div
      className="flex flex-col w-full rounded-xl overflow-hidden"
      style={{
        backgroundColor: badgeColors.backgroundColor,
        border: "none",
        outline: "none",
        boxShadow: "none",
      }}
    >
      {/* Header */}
      <div
        className="relative flex justify-center items-center gap-2 w-full rounded-t-xl overflow-hidden"
        style={{ minHeight: "165px" }}
      >
        <div className="absolute inset-0">
          <CardHeader color={badgeColors.headerColor} />
        </div>
        <div className="relative z-10 flex items-center gap-2">
          {event?.attributes?.logo_url && (
            <img
              src={event.attributes.logo_url}
              alt="Logo"
              className="w-4 h-4 mb-3"
              style={{ border: "none", outline: "none", boxShadow: "none" }}
            />
          )}
          <h6 className="font-semibold mb-3 text-white text-xs">
            {event?.attributes?.name || "Company Name"}
          </h6>
        </div>
      </div>

      {/* Center */}
      <div className="flex flex-1 flex-col justify-center items-center">
        <div
          className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg mb-2 mt-4 overflow-hidden"
          style={{ border: "none", outline: "none", boxShadow: "none" }}
        >
          {user ? <UserAvatar user={user} size="sm" /> : null}
        </div>
        <h2 className="text-xs font-bold text-gray-900 mt-1">
          {user?.attributes?.name || "User Name"}
        </h2>
        <p className="text-gray-600 text-xs">
          {user?.attributes?.user_type || "User Title"}
        </p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-2">
        {user?.attributes?.token ? (
          <QRCode
            value={user.attributes.token}
            size={80}
            level="H"
            fgColor="#1f2937"
            bgColor="#ffffff"
          />
        ) : null}
      </div>

      {/* Footer */}
      <div
        className="relative flex flex-col justify-center items-center gap-1 w-full rounded-b-xl py-2 overflow-hidden"
        style={{ minHeight: "75px" }}
      >
        <div className="absolute inset-0">
          <CardFooter color={badgeColors.footerColor} />
        </div>
      </div>
    </div>
  );
};

// Existing Template 2 - With user data
export const ExistingBadgeTemplate2: React.FC<BadgeTemplateProps> = ({
  template,
  event,
  user,
}) => {
  const badgeColors = getBadgeColors(template, event);

  return (
    <div
      className="flex flex-col w-full rounded-xl overflow-hidden"
      style={{
        backgroundColor: badgeColors.backgroundColor,
        border: "none",
        outline: "none",
        boxShadow: "none",
      }}
    >
      {/* Header */}
      <div
        className="relative flex justify-center items-center gap-2 w-full rounded-t-xl overflow-hidden"
        style={{ minHeight: "165px" }}
      >
        <div className="absolute inset-0">
          <CardHeader2 color={badgeColors.headerColor} />
        </div>
      </div>

      {/* Center */}
      <div className="flex flex-1 flex-col justify-evenly items-center">
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm mb-2 mx-auto overflow-hidden"
            style={{ border: "none", outline: "none", boxShadow: "none" }}
          >
            {user ? <UserAvatar user={user} size="md" /> : null}
          </div>
          <h2 className="text-xs font-bold text-gray-900">
            {user?.attributes?.name || "User Name"}
          </h2>
          <p className="text-gray-600 text-xs">
            {user?.attributes?.user_type || "User Title"}
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          {event?.attributes?.logo_url && (
            <img
              src={event.attributes.logo_url}
              alt="Logo"
              className="w-4 h-4 mb-3"
              style={{ border: "none", outline: "none", boxShadow: "none" }}
            />
          )}
          <h6 className="font-semibold mb-3 text-black text-xs">
            {event?.attributes?.name || "Company Name"}
          </h6>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-2">
        {user?.attributes?.token ? (
          <QRCode
            value={user.attributes.token}
            size={80}
            level="H"
            fgColor="#1f2937"
            bgColor="#ffffff"
          />
        ) : null}
      </div>

      {/* Footer */}
      <div
        className="relative flex flex-col justify-center items-center gap-1 w-full rounded-b-xl py-2 overflow-hidden"
        style={{ minHeight: "75px" }}
      >
        <div className="absolute inset-0">
          <CardFooter2 color={badgeColors.footerColor} />
        </div>
      </div>
    </div>
  );
};

// ✅ Template Selector - Renders with user data
export const renderBadgeTemplate = (
  template: any,
  eventData: any,
  user?: any
) => {
  if (!template) {
    return <div>No badge template selected</div>;
  }

  const templateName = template?.attributes?.name || "";
  const templateType = template?.attributes?.template_data?.type || "";

  // Check if it's an existing template (Template 1 or Template 2)
  if (templateName === "Template 1" || (templateType === "existing" && templateName.includes("Template 1"))) {
    return <ExistingBadgeTemplate1 template={template} event={eventData} user={user} />;
  }

  if (templateName === "Template 2" || (templateType === "existing" && templateName.includes("Template 2"))) {
    return <ExistingBadgeTemplate2 template={template} event={eventData} user={user} />;
  }

  // Custom template
  return <CustomBadgeTemplate template={template} event={eventData} user={user} />;
};
