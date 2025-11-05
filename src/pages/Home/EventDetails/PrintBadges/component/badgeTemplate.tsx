import React from "react";
import QRCode from "react-qr-code";
import {
  CardFooter,
  CardFooter2,
  CardHeader,
  CardHeader2,
} from "@/pages/Home/ExpressEvent/Badges/Badges";
import UserAvatar from "./useAvatar";

interface BadgeTemplateProps {
  user: any;
  event: any;
  badgeType: number;
  badgeColors: {
    headerColor: string;
    footerColor: string;
    backgroundColor: string;
  };
  qrImage?: string;
}

// ✅ Badge Template 1
export const BadgeTemplate1: React.FC<BadgeTemplateProps> = ({
  user,
  event,
  badgeColors,
}) => (
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
        <UserAvatar user={user} size="sm" />
      </div>
      <h2 className="text-xs font-bold text-gray-900 mt-1">
        {user?.attributes?.name || "User Name"}
      </h2>
      <p className="text-gray-600 text-xs">
        {user?.attributes?.user_type || "User Title"}
      </p>
    </div>

    {/* QR Code (Moved to bottom) */}
    <div className="flex justify-center mb-2">
      <QRCode
        value={user?.attributes?.token || "user-token"}
        size={80}
        level="H"
        fgColor="#1f2937"
        bgColor="#ffffff"
        margin={0}
      />
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

// ✅ Badge Template 2
export const BadgeTemplate2: React.FC<BadgeTemplateProps> = ({
  user,
  event,
  badgeColors,
}) => (
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
    </div>

    {/* Center */}
    <div className="flex flex-1 flex-col justify-evenly items-center">
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm mb-2 mx-auto overflow-hidden"
          style={{ border: "none", outline: "none", boxShadow: "none" }}
        >
          <UserAvatar user={user} size="md" />
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

    {/* QR Code (Moved to bottom) */}
    <div className="flex justify-center mb-2">
      <QRCode
        value={user?.attributes?.token || "user-token"}
        size={80}
        level="H"
        fgColor="#1f2937"
        bgColor="#ffffff"
        margin={0}
      />
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

// ✅ Badge Template 3
export const BadgeTemplate3: React.FC<BadgeTemplateProps> = ({
  user,
  event,
  badgeColors,
}) => (
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
    <div
      style={{ marginBottom: 30, marginTop: -10 }}
      className="flex flex-col items-center"
    >
      <div
        className="rounded-full w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg mb-2 mt-4 overflow-hidden"
        style={{ border: "none", outline: "none", boxShadow: "none" }}
      >
        <UserAvatar user={user} size="lg" />
      </div>
      <h2 className="text-xs font-bold text-gray-900 mt-1">
        {user?.attributes?.name || "User Name"}
      </h2>
      <p className="text-gray-600 text-xs">
        {user?.attributes?.organization || "User Title"}
      </p>
    </div>

    {/* QR Code (Moved to bottom) */}
    <div className="flex justify-center mb-2">
      <QRCode
        value={user?.attributes?.token || "user-token"}
        size={80}
        level="H"
        fgColor="#1f2937"
        bgColor="#ffffff"
        margin={0}
      />
    </div>

    {/* Footer */}
    <div
      className="relative flex flex-col justify-center items-center gap-1 w-full rounded-b-xl py-2 overflow-hidden"
      style={{ minHeight: "75px" }}
    >
      <div className="absolute inset-0">
        <CardHeader2 color={badgeColors.footerColor} />
      </div>
    </div>
  </div>
);

// ✅ Badge Template 4
export const BadgeTemplate4: React.FC<BadgeTemplateProps> = ({
  user,
  event,
  badgeColors,
}) => (
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
          <UserAvatar user={user} size="md" />
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

    {/* QR Code (Moved to bottom) */}
    <div className="flex justify-center mb-2">
      <QRCode
        value={user?.attributes?.token || "user-token"}
        size={80}
        level="H"
        fgColor="#1f2937"
        bgColor="#ffffff"
        margin={0}
      />
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

// ✅ Template Selector
export const renderBadgeTemplate = (
  badgeType: number,
  user: any,
  eventData: any,
  badgeColors: BadgeTemplateProps["badgeColors"],
  qrImage: string
) => {
  const commonProps = {
    user,
    event: eventData,
    badgeType,
    badgeColors,
    qrImage,
  };
  switch (badgeType) {
    case 1:
      return <BadgeTemplate1 {...commonProps} />;
    case 2:
      return <BadgeTemplate2 {...commonProps} />;
    case 3:
      return <BadgeTemplate3 {...commonProps} />;
    case 4:
      return <BadgeTemplate4 {...commonProps} />;
    default:
      return <BadgeTemplate1 {...commonProps} />;
  }
};
