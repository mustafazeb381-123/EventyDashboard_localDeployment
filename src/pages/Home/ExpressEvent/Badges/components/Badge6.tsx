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

interface Badge6Props {
  badge: Badge;
  event: any;
  onClose: () => void;
  CardHeader: React.FC<{ color?: string }>;
  CardFooter: React.FC<{ color?: string }>;
}

const Badge6: React.FC<Badge6Props> = ({
  badge,
  event,
  onClose,
  CardHeader,
  CardFooter,
}) => {
  const primaryColor = event?.attributes?.primary_color || "#0f172a";
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
          {/* Card Front - Premium Dark Design */}
          <div
            className="flex flex-col h-[100vh] w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800"
            style={{
              background:
                "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
            }}
          >
            {/* Top Header - Enhanced */}
            <div
              className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
              style={{
                height: "22vh",
                background:
                  "linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)",
              }}
            >
              <div className="absolute inset-0 opacity-80">
                <CardHeader color={primaryColor} />
              </div>
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[length:30px_30px]"></div>
              <div className="relative z-10 text-center">
                <h6 className="font-extrabold text-white text-2xl mb-3 tracking-tight drop-shadow-lg">
                  {event?.attributes?.name || "Event Name"}
                </h6>
                {logoUrl && (
                  <div className="w-20 h-20 mx-auto rounded-xl bg-white p-2 shadow-2xl ring-2 ring-slate-400/30">
                    <img
                      src={logoUrl}
                      className="w-full h-full rounded-lg object-cover"
                      alt="Logo"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Center - Enhanced with better contrast */}
            <div className="flex flex-1 flex-col justify-center items-center p-10 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
              {/* Photo with premium styling */}
              <div className="relative mb-8">
                <div className="w-52 h-52 rounded-3xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border-4 border-slate-600 shadow-2xl flex items-center justify-center overflow-hidden ring-4 ring-slate-700/50">
                  {badge.userImg ? (
                    <img
                      src={badge.userImg}
                      className="w-full h-full object-cover"
                      alt="User"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800" />
                  )}
                </div>
                {/* Glow effect */}
                <div className="absolute -inset-4 rounded-3xl bg-slate-600 opacity-20 blur-2xl"></div>
              </div>

              {/* Enhanced typography */}
              <h2 className="text-4xl font-black text-white mb-3 tracking-tight drop-shadow-lg">
                John Doe
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-slate-400 to-slate-600 rounded-full mb-4"></div>
              <p className="text-slate-200 text-xl font-bold mb-2">
                Software Engineer
              </p>
              <p className="text-slate-400 text-base font-medium">
                Tech Corporation
              </p>
            </div>

            {/* Bottom Footer - Enhanced QR */}
            <div
              className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
              style={{
                height: "22vh",
                background:
                  "linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)",
              }}
            >
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-32 h-32 bg-white rounded-2xl p-3 shadow-2xl ring-4 ring-white/30">
                  <img
                    src={badge.qrImg}
                    className="w-full h-full"
                    alt="QR Code"
                  />
                </div>
                <p className="text-white text-xs font-bold tracking-wider uppercase">
                  Scan for Details
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Badge6;
