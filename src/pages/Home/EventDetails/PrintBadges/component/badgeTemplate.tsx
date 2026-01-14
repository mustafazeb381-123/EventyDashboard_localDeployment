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

  // Use 96 DPI for consistency (standard web DPI)
  const DPI = 96;
  let width = templateData.width || 3.5;
  let height = templateData.height || 5.5;
  if (width > 50) width = width / DPI;
  if (height > 50) height = height / DPI;

  const widthPx = width * DPI;
  const heightPx = height * DPI;
  
  // Positions are stored in pixels relative to a 400px wide canvas
  const canvasWidth = 400;
  const scaleX = widthPx / canvasWidth;
  const scaleY = heightPx / (canvasWidth * (height / width));

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
            width: `${(templateData.photoSize?.width || 200) * scaleX}px`,
            height: `${(templateData.photoSize?.height || 200) * scaleY}px`,
            top: `${(templateData.photoPosition?.y || 60) * scaleY}px`,
            left:
              templateData.photoAlignment === "center"
                ? "50%"
                : templateData.photoAlignment === "left"
                ? `${(templateData.photoPosition?.x || 200) * scaleX}px`
                : "auto",
            right:
              templateData.photoAlignment === "right"
                ? `${(templateData.photoPosition?.x || 200) * scaleX}px`
                : "auto",
            transform:
              templateData.photoAlignment === "center"
                ? "translateX(-50%)"
                : "none",
          }}
        >
          {user ? (
            (() => {
              const imageUrl = user?.attributes?.avatar || user?.attributes?.image;
              const userName = user?.attributes?.name || "User";
              const photoWidth = (templateData.photoSize?.width || 200) * scaleX;
              const photoHeight = (templateData.photoSize?.height || 200) * scaleY;
              
              if (imageUrl) {
                return (
                  <img
                    src={imageUrl}
                    alt={userName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      border: "none",
                      outline: "none",
                      boxShadow: "none",
                    }}
                    onError={(e) => {
                      // Fallback to initials if image fails
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector(".avatar-initials")) {
                        const initialsDiv = document.createElement("div");
                        initialsDiv.className = "avatar-initials";
                        initialsDiv.style.cssText = `
                          width: 100%;
                          height: 100%;
                          background-color: #4f46e5;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          color: white;
                          font-weight: 600;
                          font-size: ${Math.min(photoWidth, photoHeight) * 0.4}px;
                        `;
                        const initials = (userName || "U")
                          .trim()
                          .split(" ")
                          .filter(Boolean)
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "U";
                        initialsDiv.textContent = initials;
                        parent.appendChild(initialsDiv);
                      }
                    }}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                  />
                );
              }
              
              // Fallback to initials if no image
              const initials = (userName || "U")
                .trim()
                .split(" ")
                .filter(Boolean)
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "U";
              
              return (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 600,
                    fontSize: `${Math.min(photoWidth, photoHeight) * 0.4}px`,
                  }}
                >
                  {initials}
                </div>
              );
            })()
          ) : (
            <div style={{ width: "100%", height: "100%", backgroundColor: "#e5e7eb" }} />
          )}
        </div>
      )}

      {templateData.hasName && (
        <div
          style={{
            position: "absolute",
            width: "100%",
            top: `${(templateData.nameText?.position?.y || 280) * scaleY}px`,
            textAlign: templateData.nameText?.alignment || "center",
            fontSize: `${(templateData.nameText?.size || 24) * scaleY}px`,
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
            top: `${(templateData.companyText?.position?.y || 315) * scaleY}px`,
            textAlign: templateData.companyText?.alignment || "center",
            fontSize: `${(templateData.companyText?.size || 18) * scaleY}px`,
            color: templateData.companyText?.color || "#666666",
          }}
        >
          {user?.attributes?.organization || "Company Placeholder"}
        </div>
      )}

      {templateData.hasTitle && (
        <div
          style={{
            position: "absolute",
            width: "100%",
            top: `${(templateData.titleText?.position?.y || 350) * scaleY}px`,
            textAlign: templateData.titleText?.alignment || "center",
            fontSize: `${(templateData.titleText?.size || 16) * scaleY}px`,
            color: templateData.titleText?.color || "#999999",
          }}
        >
          {user?.attributes?.user_type || "Title Placeholder"}
        </div>
      )}

      {templateData.hasQrCode && (
        <div
          style={{
            position: "absolute",
            backgroundColor: "white",
            padding: "4px",
            borderRadius: "4px",
            width: `${(templateData.qrCodeSize?.width || 120) * scaleX}px`,
            height: `${(templateData.qrCodeSize?.height || 120) * scaleY}px`,
            top: `${(templateData.qrCodePosition?.y || 400) * scaleY}px`,
            left:
              templateData.qrCodeAlignment === "center"
                ? "50%"
                : templateData.qrCodeAlignment === "left"
                ? `${(templateData.qrCodePosition?.x || 200) * scaleX}px`
                : "auto",
            right:
              templateData.qrCodeAlignment === "right"
                ? `${(templateData.qrCodePosition?.x || 200) * scaleX}px`
                : "auto",
            transform:
              templateData.qrCodeAlignment === "center"
                ? "translateX(-50%)"
                : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {user?.attributes?.token ? (
            <QRCode
              value={user.attributes.token}
              size={Math.min(
                (templateData.qrCodeSize?.width || 120) * scaleX - 8,
                (templateData.qrCodeSize?.height || 120) * scaleY - 8
              )}
              style={{
                width: "100%",
                height: "100%",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
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
