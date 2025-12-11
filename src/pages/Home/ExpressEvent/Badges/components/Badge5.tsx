import React from "react";
import { X } from "lucide-react";

interface Badge {
  id: number;
  name: string;
  frontImg: string;
  backImg: string;
  userImg?: string;
  qrImg: string;
  cardHeader: string;
  cardFooter: string;
}

interface Badge5Props {
  badge: Badge;
  event: any;
  onClose: () => void;
  CardHeader: React.FC<{ color?: string }>;
  CardFooter: React.FC<{ color?: string }>;
}

const Badge5: React.FC<Badge5Props> = ({
  badge,
  event,
  onClose,
  CardHeader,
  CardFooter,
}) => {
  const primaryColor = event?.attributes?.primary_color || "#2563eb";
  const logoUrl = event?.attributes?.logo_url;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 h-[95vh] overflow-y-auto w-full md:w-3/4">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-poppins font-semibold">{badge.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800 bg-gray-200 rounded p-1"
          >
            <X />
          </button>
        </div>

        <div className="flex flex-col justify-center items-center">
          {/* Card Front */}
          <div className="flex flex-col h-[100vh] w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
            {/* Top Header - Enhanced Gradient */}
            <div
              className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
              style={{
                height: "28vh",
                background: `linear-gradient(135deg, ${primaryColor} 0%, #1e40af 50%, #1e3a8a 100%)`,
              }}
            >
              <div className="absolute inset-0 opacity-90">
                <CardHeader color={primaryColor} />
              </div>
              {/* Decorative Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-3">
                {logoUrl && (
                  <div className="w-20 h-20 rounded-full bg-white p-2 shadow-xl ring-4 ring-white/30">
                    <img
                      src={logoUrl}
                      className="w-full h-full rounded-full object-cover"
                      alt="Logo"
                    />
                  </div>
                )}
                <h6 className="font-bold text-white text-xl tracking-wide drop-shadow-lg">
                  {event?.attributes?.name || "Event Name"}
                </h6>
              </div>
            </div>

            {/* Center - Enhanced with better spacing */}
            <div className="flex flex-1 flex-col justify-center items-center bg-gradient-to-b from-blue-50 via-white to-white p-8">
              {/* Photo with enhanced styling */}
              <div className="relative mb-6">
                <div className="w-44 h-44 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden ring-4 ring-blue-100">
                  {badge.userImg ? (
                    <img
                      src={badge.userImg}
                      className="w-full h-full object-cover"
                      alt="User"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-300 to-blue-500" />
                  )}
                </div>
                {/* Decorative ring */}
                <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 opacity-30 blur-xl"></div>
              </div>

              {/* Name with better typography */}
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                John Doe
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mb-3"></div>
              <p className="text-gray-700 text-lg font-semibold mb-1">
                Software Engineer
              </p>
              <p className="text-gray-500 text-sm font-medium">
                Tech Corporation
              </p>
            </div>

            {/* Bottom Footer - Enhanced QR Code */}
            <div
              className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
              style={{
                height: "18vh",
                background: `linear-gradient(135deg, ${primaryColor} 0%, #1e40af 50%, #1e3a8a 100%)`,
              }}
            >
              <div className="absolute inset-0">
                <CardFooter color={primaryColor} />
              </div>
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-28 h-28 bg-white rounded-xl p-2.5 shadow-2xl ring-4 ring-white/50">
                  <img
                    src={badge.qrImg}
                    className="w-full h-full"
                    alt="QR Code"
                  />
                </div>
                <p className="text-white text-xs font-semibold tracking-wide uppercase">
                  Scan QR Code
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Badge5;
