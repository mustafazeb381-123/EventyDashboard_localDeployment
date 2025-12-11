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

interface Badge8Props {
  badge: Badge;
  event: any;
  onClose: () => void;
  CardHeader: React.FC<{ color?: string }>;
  CardFooter: React.FC<{ color?: string }>;
}

const Badge8: React.FC<Badge8Props> = ({
  badge,
  event,
  onClose,
  CardHeader,
  CardFooter,
}) => {
  const primaryColor = event?.attributes?.primary_color || "#4f46e5";
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
          {/* Card Front - Modern Gradient Design */}
          <div className="flex flex-col h-[100vh] w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
            {/* Top Header - Enhanced Gradient */}
            <div
              className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
              style={{
                height: "28vh",
                background:
                  "linear-gradient(135deg, #4f46e5 0%, #6366f1 25%, #818cf8 50%, #6366f1 75%, #4f46e5 100%)",
              }}
            >
              <div className="absolute inset-0 opacity-90">
                <CardHeader color={primaryColor} />
              </div>
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
              <div className="relative z-10 text-center">
                {logoUrl && (
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white p-2.5 shadow-2xl ring-4 ring-white/40">
                    <img
                      src={logoUrl}
                      className="w-full h-full rounded-full object-cover"
                      alt="Logo"
                    />
                  </div>
                )}
                <h6 className="font-extrabold text-white text-2xl tracking-tight drop-shadow-lg">
                  {event?.attributes?.name || "Event Name"}
                </h6>
              </div>
            </div>

            {/* Center - Clean White Design */}
            <div className="flex flex-1 flex-col justify-center items-center p-8 bg-gradient-to-b from-indigo-50/30 via-white to-white">
              {/* Photo with modern styling */}
              <div className="relative mb-6">
                <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-indigo-100 via-blue-100 to-indigo-200 border-4 border-indigo-200 shadow-xl flex items-center justify-center overflow-hidden ring-4 ring-indigo-100/50">
                  {badge.userImg ? (
                    <img
                      src={badge.userImg}
                      className="w-full h-full object-cover"
                      alt="User"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-200 to-blue-200" />
                  )}
                </div>
                {/* Soft glow */}
                <div className="absolute -inset-3 rounded-3xl bg-indigo-200 opacity-30 blur-xl"></div>
              </div>

              {/* Enhanced typography */}
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                John Doe
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full mb-3"></div>
              <p className="text-gray-700 text-lg font-bold mb-1">
                Software Engineer
              </p>
              <p className="text-gray-500 text-sm font-semibold">
                Tech Corporation
              </p>
            </div>

            {/* Bottom Footer - Enhanced */}
            <div
              className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
              style={{
                height: "20vh",
                background:
                  "linear-gradient(135deg, #4f46e5 0%, #6366f1 25%, #818cf8 50%, #6366f1 75%, #4f46e5 100%)",
              }}
            >
              <div className="absolute inset-0">
                <CardFooter color={primaryColor} />
              </div>
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-32 h-32 bg-white rounded-2xl p-3 shadow-2xl ring-4 ring-white/40">
                  <img
                    src={badge.qrImg}
                    className="w-full h-full"
                    alt="QR Code"
                  />
                </div>
                <p className="text-white text-xs font-bold tracking-wide uppercase">
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

export default Badge8;
