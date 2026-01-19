import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import GateOnboarding from "./GateOnboarding";
import { ArrowRight, Clipboard } from "lucide-react";
import { getSessionAreaApi } from "@/apis/apiHelpers";

function Onboarding() {
  const [showGateOnboarding, setShowGateOnboarding] = useState(false);
  const [selectedArea, setSelectedArea] = useState<any | null>(null);
  const [areasData, setAreasData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: "success" | "error" | "warning" | "info") => {
    setNotification({ message, type });
  };

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("eventId");
    if (id) setEventId(id);
  }, [location]);

  // Fetch Areas
  useEffect(() => {
    const fetchAreas = async () => {
      if (!eventId) return;
      setLoading(true);
      try {
        const response = await getSessionAreaApi(eventId);
        console.log("Areas response:", response.data.data);
        setAreasData(response.data.data);
      } catch (err) {
        console.error("Error fetching areas:", err);
        showNotification("Failed to fetch areas", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAreas();
  }, [eventId]);

  const handleOpenGateOnboarding = (area: any) => {
    console.log("Selected area details:", area);
    console.log("Event ID:", eventId);

    // Create a gate-like object with the necessary structure
    const gateObject = {
      id: area.id,
      attributes: {
        ...area.attributes,
        event_id: eventId, // Pass the event ID
        type: area.attributes?.name || "Area", // Use area name as type
      }
    };

    console.log("Gate object being passed:", gateObject);
    setSelectedArea(gateObject);
    setShowGateOnboarding(true);
  };

  const handleCopyLink = (area: any) => {
    if (!eventId) {
      showNotification("Event ID not found", "error");
      return;
    }

    const link = `${window.location.origin}/gate-onboarding?eventId=${eventId}&areaId=${area.id}`;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(link)
        .then(() => showNotification("Link copied to clipboard!", "success"))
        .catch(() => showNotification("Failed to copy link", "error"));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        showNotification("Link copied (fallback)!", "success");
      } catch (err) {
        showNotification("Failed to copy link", "error");
      }
      document.body.removeChild(textArea);
    }
  };




  if (showGateOnboarding) {
    return selectedArea ? (
      <GateOnboarding
        gate={selectedArea}
        onBack={() => {
          setShowGateOnboarding(false);
          setSelectedArea(null);
        }}
      />
    ) : null;
  }

  return (
    <div className="min-h-screen from-slate-50 to-slate-100">
      <div className="p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              On Boarding
            </h1>
            <p className="text-gray-600 mt-1">
              Areas: {areasData.length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-200/60">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Area Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {[1, 2, 3, 4, 5, 6].map((index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : areasData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No areas found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-200/60">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Area Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {areasData.map((area) => (
                    <tr key={area.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {area.id}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleOpenGateOnboarding(area)}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition text-left"
                        >
                          {area.attributes?.name || "Unnamed Area"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenGateOnboarding(area)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Open Gate Onboarding"
                          >
                            <ArrowRight size={16} />
                          </button>
                          {/* Copy Link Button */}
                          <button
                            onClick={() => handleCopyLink(area)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                            title="Copy Onboarding Link"
                          >
                            <Clipboard size={16} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "error"
                ? "bg-red-500 text-white"
                : notification.type === "warning"
                ? "bg-yellow-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Onboarding;