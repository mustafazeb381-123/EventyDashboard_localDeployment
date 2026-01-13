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
  template: any;
  event: any;
  user?: any;
}

const getBadgeColors = (template: any, event: any) => {
  const templateData = template?.attributes?.template_data || {};
  const eventColors = event?.attributes || {};
  const templateName = template?.attributes?.name || "";
  const templateType = templateData.type || "";

  const fixRedBackground = (bgColor: string | null | undefined): string => {
    if (!bgColor) return "#ffffff";
    const color = bgColor.toLowerCase().trim();
    if (["#ff0000", "#f00", "red", "rgb(255, 0, 0)"].includes(color))
      return "#ffffff";
    return bgColor;
  };

  const isReadyMadeTemplate =
    templateName === "Template 1" ||
    templateName === "Template 2" ||
    templateType === "existing";

  let finalBgColor: string;
  if (isReadyMadeTemplate) {
    finalBgColor = fixRedBackground(eventColors.secondary_color) || "white";
  } else {
    finalBgColor =
      fixRedBackground(templateData.bgColor) ||
      fixRedBackground(eventColors.secondary_color) ||
      "white";
  }

  return {
    headerColor: eventColors.primary_color || "#4D4D4D",
    footerColor: eventColors.primary_color || "#4D4D4D",
    backgroundColor: finalBgColor,
  };
};

export const CustomBadgeTemplate: React.FC<BadgeTemplateProps> = ({
  template,
  event,
  user,
}) => {
  const templateData = template?.attributes?.template_data || {};
  const badgeColors = getBadgeColors(template, event);

  let width = templateData.width || 3.5;
  let height = templateData.height || 5.5;
  if (width > 50) width = width / 96;
  if (height > 50) height = height / 96;

  const widthPx = width * 96;
  const heightPx = height * 96;
  const scale = 0.4;

  const backgroundImageUrl =
    template?.attributes?.background_image || templateData.bgImage || null;
  const finalBackgroundColor = templateData.bgColor
    ? badgeColors.backgroundColor
    : templateData.hasBackground
    ? badgeColors.backgroundColor
    : "#ffffff";

  return (
    <div
      className="custom-badge-root"
      style={{
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        backgroundColor: finalBackgroundColor,
        backgroundImage: backgroundImageUrl
          ? `url(${backgroundImageUrl})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {templateData.hasPersonalPhoto && (
        <div
          style={{
            position: "absolute",
            borderRadius: "50%",
            border: "4px solid white",
            overflow: "hidden",
            width: `${(templateData.photoSize?.width || 200) * scale}px`,
            height: `${(templateData.photoSize?.height || 200) * scale}px`,
            top: `${(templateData.photoPosition?.y || 60) * scale}px`,
            left:
              templateData.photoAlignment === "center"
                ? "50%"
                : templateData.photoAlignment === "left"
                ? `${(templateData.photoPosition?.x || 200) * scale}px`
                : "auto",
            right:
              templateData.photoAlignment === "right"
                ? `${(templateData.photoPosition?.x || 200) * scale}px`
                : "auto",
            transform:
              templateData.photoAlignment === "center"
                ? "translateX(-50%)"
                : "none",
          }}
        >
          {user ? (
            <UserAvatar user={user} size="lg" />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
      )}

      {templateData.hasName && (
        <div
          style={{
            position: "absolute",
            width: "100%",
            top: `${(templateData.nameText?.position?.y || 280) * scale}px`,
            textAlign: templateData.nameText?.alignment || "center",
            fontSize: `${(templateData.nameText?.size || 24) * scale}px`,
            color: templateData.nameText?.color || "#000000",
            fontWeight: "bold",
            padding: "0 10px",
          }}
        >
          {user?.attributes?.name || "Name Placeholder"}
        </div>
      )}

      {templateData.hasCompany && (
        <div
          style={{
            position: "absolute",
            width: "100%",
            top: `${(templateData.companyText?.position?.y || 315) * scale}px`,
            textAlign: templateData.companyText?.alignment || "center",
            fontSize: `${(templateData.companyText?.size || 18) * scale}px`,
            color: templateData.companyText?.color || "#666666",
          }}
        >
          {user?.attributes?.organization || "Company Placeholder"}
        </div>
      )}

      {templateData.hasQrCode && (
        <div
          style={{
            position: "absolute",
            backgroundColor: "white",
            padding: "4px",
            borderRadius: "4px",
            width: `${(templateData.qrCodeSize?.width || 120) * scale}px`,
            height: `${(templateData.qrCodeSize?.height || 120) * scale}px`,
            top: `${(templateData.qrCodePosition?.y || 400) * scale}px`,
            left:
              templateData.qrCodeAlignment === "center"
                ? "50%"
                : templateData.qrCodeAlignment === "left"
                ? `${(templateData.qrCodePosition?.x || 200) * scale}px`
                : "auto",
            right:
              templateData.qrCodeAlignment === "right"
                ? `${(templateData.qrCodePosition?.x || 200) * scale}px`
                : "auto",
            transform:
              templateData.qrCodeAlignment === "center"
                ? "translateX(-50%)"
                : "none",
          }}
        >
          {user?.attributes?.token ? (
            <QRCode
              value={user.attributes.token}
              size={(templateData.qrCodeSize?.width || 120) * scale - 8}
            />
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
        </div>
      )}
    </div>
  );
};

export const ExistingBadgeTemplate1: React.FC<BadgeTemplateProps> = ({
  template,
  event,
  user,
}) => {
  const badgeColors = getBadgeColors(template, event);
  return (
    <div
      className="flex flex-col w-64 h-96 rounded-xl overflow-hidden"
      style={{ backgroundColor: badgeColors.backgroundColor }}
    >
      <div className="relative flex justify-center items-center w-full min-h-[120px]">
        <div className="absolute inset-0">
          <CardHeader color={badgeColors.headerColor} />
        </div>
        <div className="relative z-10 flex items-center gap-2 mb-4">
          {event?.attributes?.logo_url && (
            <img
              src={event.attributes.logo_url}
              alt="Logo"
              className="w-4 h-4"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
          )}
          <h6 className="font-semibold text-white text-[10px]">
            {event?.attributes?.name}
          </h6>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center -mt-8">
        <div className="w-16 h-16 rounded-full mb-2">
          {user && <UserAvatar user={user} size="sm" />}
        </div>
        <h2 className="text-xs font-bold">{user?.attributes?.name}</h2>
        <p className="text-[10px] text-gray-600">
          {user?.attributes?.user_type}
        </p>
      </div>
      <div className="flex justify-center mb-2">
        {user?.attributes?.token && (
          <QRCode value={user.attributes.token} size={60} />
        )}
      </div>
      <div className="relative w-full h-16">
        <div className="absolute inset-0">
          <CardFooter color={badgeColors.footerColor} />
        </div>
      </div>
    </div>
  );
};

export const ExistingBadgeTemplate2: React.FC<BadgeTemplateProps> = ({
  template,
  event,
  user,
}) => {
  const badgeColors = getBadgeColors(template, event);
  return (
    <div
      className="flex flex-col w-64 h-96 rounded-xl overflow-hidden"
      style={{ backgroundColor: badgeColors.backgroundColor }}
    >
      <div className="relative w-full min-h-[120px]">
        <div className="absolute inset-0">
          <CardHeader2 color={badgeColors.headerColor} />
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-evenly py-2">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-1">
            {user && <UserAvatar user={user} size="sm" />}
          </div>
          <h2 className="text-xs font-bold">{user?.attributes?.name}</h2>
          <p className="text-[10px] text-gray-600">
            {user?.attributes?.user_type}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {event?.attributes?.logo_url && (
            <img
              src={event.attributes.logo_url}
              alt="Logo"
              className="w-3 h-3"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
          )}
          <h6 className="font-semibold text-[9px]">
            {event?.attributes?.name}
          </h6>
        </div>
      </div>
      <div className="flex justify-center mb-2">
        {user?.attributes?.token && (
          <QRCode value={user.attributes.token} size={60} />
        )}
      </div>
      <div className="relative w-full h-16">
        <div className="absolute inset-0">
          <CardFooter2 color={badgeColors.footerColor} />
        </div>
      </div>
    </div>
  );
};

export const renderBadgeTemplate = (
  template: any,
  eventData: any,
  user?: any
) => {
  if (!template) return <div>No badge selected</div>;
  const name = template?.attributes?.name || "";
  const type = template?.attributes?.template_data?.type || "";
  if (
    name === "Template 1" ||
    (type === "existing" && name.includes("Template 1"))
  ) {
    return (
      <ExistingBadgeTemplate1
        template={template}
        event={eventData}
        user={user}
      />
    );
  }
  if (
    name === "Template 2" ||
    (type === "existing" && name.includes("Template 2"))
  ) {
    return (
      <ExistingBadgeTemplate2
        template={template}
        event={eventData}
        user={user}
      />
    );
  }
  return (
    <CustomBadgeTemplate template={template} event={eventData} user={user} />
  );
};
