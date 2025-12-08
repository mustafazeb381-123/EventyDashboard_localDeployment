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

interface Badge9Props {
  badge: Badge;
  event: any;
  onClose: () => void;
  CardHeader: React.FC<{ color?: string }>;
  CardFooter: React.FC<{ color?: string }>;
}

const Badge9: React.FC<Badge9Props> = ({
  badge,
  event,
  onClose,
  CardHeader,
  CardFooter,
}) => {
  const primaryColor = event?.attributes?.primary_color || "#1e293b";
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
          {/* Card Front - Professional Slate Design */}
          <div className="flex flex-col h-[100vh] w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-200 bg-white">
            {/* Top Header - Enhanced */}
            <div
              className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
              style={{
                height: "24vh",
                background:
                  "linear-gradient(135deg, #1e293b 0%, #334155 30%, #475569 50%, #334155 70%, #1e293b 100%)",
              }}
            >
              <div className="absolute inset-0 opacity-95">
                <CardHeader color={primaryColor} />
              </div>
              {/* Subtle pattern */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[length:25px_25px]"></div>
              <div className="relative z-10 text-center">
                {logoUrl && (
                  <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-white p-2.5 shadow-2xl ring-4 ring-slate-300/40">
                    <img
                      src={logoUrl}
                      className="w-full h-full rounded-lg object-cover"
                      alt="Logo"
                    />
                  </div>
                )}
                <h6 className="font-black text-white text-2xl tracking-tight drop-shadow-lg">
                  {event?.attributes?.name || "Event Name"}
                </h6>
              </div>
            </div>

            {/* Center - Enhanced with better contrast */}
            <div className="flex flex-1 flex-col justify-center items-center p-10 bg-gradient-to-b from-slate-50 via-white to-white">
              {/* Photo with professional styling */}
              <div className="relative mb-8">
                <div className="w-44 h-44 rounded-3xl bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 border-4 border-slate-500 shadow-2xl flex items-center justify-center overflow-hidden ring-4 ring-slate-200/50">
                  {badge.userImg ? (
                    <img
                      src={badge.userImg}
                      className="w-full h-full object-cover"
                      alt="User"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-500 to-slate-700" />
                  )}
                </div>
                {/* Soft shadow glow */}
                <div className="absolute -inset-4 rounded-3xl bg-slate-400 opacity-20 blur-2xl"></div>
              </div>

              {/* Enhanced typography */}
              <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
                John Doe
              </h2>
              <div className="h-1.5 w-20 bg-gradient-to-r from-slate-500 to-slate-400 rounded-full mb-4"></div>
              <p className="text-slate-700 text-xl font-bold mb-2">
                Software Engineer
              </p>
              <p className="text-slate-500 text-base font-semibold">
                Tech Corporation
              </p>
            </div>

            {/* Bottom Footer - Enhanced */}
            <div
              className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
              style={{
                height: "22vh",
                background:
                  "linear-gradient(135deg, #1e293b 0%, #334155 30%, #475569 50%, #334155 70%, #1e293b 100%)",
              }}
            >
              <div className="absolute inset-0">
                <CardFooter color={primaryColor} />
              </div>
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-36 h-36 bg-white rounded-2xl p-3 shadow-2xl ring-4 ring-slate-300/40">
                  <img
                    src={badge.qrImg}
                    className="w-full h-full"
                    alt="QR Code"
                  />
                </div>
                <p className="text-white text-xs font-bold tracking-wider uppercase">
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

export default Badge9;

