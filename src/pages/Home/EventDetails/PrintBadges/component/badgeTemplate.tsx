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
            left: `${((templateData.photoPosition?.x || 200) * scaleX)}px`,
            transform: "none",
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
            left: `${((templateData.qrCodePosition?.x || 200) * scaleX)}px`,
            transform: "none",
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
  const primaryColor = event?.attributes?.primary_color || "#4D4D4D";
  const secondaryColor = badgeColors.backgroundColor || "white";
  
  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden shadow-lg"
      style={{
        backgroundColor: secondaryColor,
        width: "350px",
        height: "550px",
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
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col justify-center items-center p-6">
        {/* Profile Picture */}
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 flex items-center justify-center">
          {user ? (
            (() => {
              const imageUrl = user?.attributes?.avatar || user?.attributes?.image;
              const userName = user?.attributes?.name || "User";
              
              if (imageUrl) {
                return (
                  <img
                    src={imageUrl}
                    alt={userName}
                    className="w-full h-full object-cover"
                    style={{ border: "none", outline: "none", boxShadow: "none" }}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={(e) => {
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
                          font-size: 32px;
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
                  />
                );
              }
              
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
                    fontSize: "32px",
                  }}
                >
                  {initials}
                </div>
              );
            })()
          ) : (
            <div className="w-full h-full bg-gray-300" />
          )}
        </div>
        
        {/* Name */}
        <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-1">
          {user?.attributes?.name || "Name"}
        </h2>
        
        {/* Title */}
        <p className="text-gray-600 text-lg mt-1 mb-4">
          {user?.attributes?.user_type || "Title"}
        </p>

        {/* QR Code on front side */}
        <div className="mt-2 bg-white p-3 rounded-lg shadow-md">
          {user?.attributes?.token ? (
            <QRCode
              value={user.attributes.token}
              size={96}
              style={{ width: "96px", height: "96px" }}
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200" />
          )}
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
  );
};

export const ExistingBadgeTemplate2: React.FC<BadgeTemplateProps> = ({
  template,
  event,
  user,
}) => {
  const badgeColors = getBadgeColors(template, event);
  const primaryColor = event?.attributes?.primary_color || "#4D4D4D";
  const secondaryColor = badgeColors.backgroundColor || "white";
  
  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden shadow-lg"
      style={{
        backgroundColor: secondaryColor,
        width: "350px",
        height: "550px",
      }}
    >
      {/* Header Section - Fixed height container */}
      <div
        className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
        style={{ height: "106px" }}
      >
        <div className="absolute inset-0 h-full w-full">
          <CardHeader2 color={primaryColor} />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col justify-center items-center p-6">
        {/* Profile Picture - Circular for Template 2 */}
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 flex items-center justify-center">
          {user ? (
            (() => {
              const imageUrl = user?.attributes?.avatar || user?.attributes?.image;
              const userName = user?.attributes?.name || "User";
              
              if (imageUrl) {
                return (
                  <img
                    src={imageUrl}
                    alt={userName}
                    className="w-full h-full object-cover"
                    style={{ border: "none", outline: "none", boxShadow: "none" }}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={(e) => {
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
                          font-size: 32px;
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
                  />
                );
              }
              
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
                    fontSize: "32px",
                  }}
                >
                  {initials}
                </div>
              );
            })()
          ) : (
            <div className="w-full h-full bg-gray-300" />
          )}
        </div>
        
        {/* Name */}
        <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-1">
          {user?.attributes?.name || "Name"}
        </h2>
        
        {/* Title */}
        <p className="text-gray-600 text-lg mt-1 mb-4">
          {user?.attributes?.user_type || "Title"}
        </p>

        {/* QR Code on front side */}
        <div className="mt-2 bg-white p-3 rounded-lg shadow-md">
          {user?.attributes?.token ? (
            <QRCode
              value={user.attributes.token}
              size={96}
              style={{ width: "96px", height: "96px" }}
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200" />
          )}
        </div>
      </div>

      {/* Footer Section - Fixed height container */}
      <div
        className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
        style={{ height: "54px" }}
      >
        <div className="absolute inset-0 h-full w-full">
          <CardFooter2 color={primaryColor} />
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
