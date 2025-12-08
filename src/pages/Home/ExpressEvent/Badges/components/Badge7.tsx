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

interface Badge7Props {
  badge: Badge;
  event: any;
  onClose: () => void;
  CardHeader: React.FC<{ color?: string }>;
  CardFooter: React.FC<{ color?: string }>;
}

const Badge7: React.FC<Badge7Props> = ({
  badge,
  event,
  onClose,
  CardHeader,
  CardFooter,
}) => {
  const primaryColor = event?.attributes?.primary_color || "#000000";
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
          {/* Card Front - Premium Black Design */}
          <div
            className="flex flex-col h-[100vh] w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-900"
            style={{
              background:
                "linear-gradient(180deg, #000000 0%, #1a1a1a 50%, #000000 100%)",
            }}
          >
            {/* Top Header - Enhanced */}
            <div
              className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
              style={{
                height: "24vh",
                background:
                  "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
              }}
            >
              <div className="absolute inset-0 opacity-90">
                <CardHeader color={primaryColor} />
              </div>
              {/* Subtle texture */}
              <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
              <div className="relative z-10 text-center">
                {logoUrl && (
                  <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-white p-3 shadow-2xl ring-4 ring-gray-700/50">
                    <img
                      src={logoUrl}
                      className="w-full h-full rounded-xl object-cover"
                      alt="Logo"
                    />
                  </div>
                )}
                <h6 className="font-black text-white text-3xl tracking-tight drop-shadow-2xl">
                  {event?.attributes?.name || "Event Name"}
                </h6>
              </div>
            </div>

            {/* Center - Enhanced */}
            <div className="flex flex-1 flex-col justify-center items-center p-8 bg-black">
              {/* Photo with premium black styling */}
              <div className="relative mb-8">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-gray-800 via-gray-900 to-black border-4 border-gray-700 shadow-2xl flex items-center justify-center overflow-hidden ring-4 ring-gray-800/50">
                  {badge.userImg ? (
                    <img
                      src={badge.userImg}
                      className="w-full h-full object-cover"
                      alt="User"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-black" />
                  )}
                </div>
                {/* Outer glow */}
                <div className="absolute -inset-4 rounded-full bg-gray-700 opacity-30 blur-2xl"></div>
              </div>

              {/* Enhanced typography */}
              <h2 className="text-4xl font-black text-white mb-3 tracking-tight drop-shadow-2xl">
                John Doe
              </h2>
              <div className="h-1.5 w-24 bg-gradient-to-r from-gray-600 to-gray-400 rounded-full mb-4"></div>
              <p className="text-gray-200 text-xl font-bold mb-2">
                Software Engineer
              </p>
              <p className="text-gray-400 text-base font-semibold">
                Tech Corporation
              </p>
            </div>

            {/* Bottom Footer - Enhanced */}
            <div
              className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
              style={{
                height: "20vh",
                background:
                  "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
              }}
            >
              <div className="absolute inset-0">
                <CardFooter color={primaryColor} />
              </div>
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-36 h-36 bg-white rounded-2xl p-3 shadow-2xl ring-4 ring-gray-700/50">
                  <img
                    src={badge.qrImg}
                    className="w-full h-full"
                    alt="QR Code"
                  />
                </div>
                <p className="text-white text-xs font-bold tracking-widest uppercase">
                  Scan QR
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Badge7;

