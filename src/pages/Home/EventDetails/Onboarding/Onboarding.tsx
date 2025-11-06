import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import GateOnboarding from "./GateOnboarding";
import { ArrowRight, Clipboard } from "lucide-react";
import { getSessionAreaApi } from "@/apis/apiHelpers";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Onboarding() {
  const [showGateOnboarding, setShowGateOnboarding] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [areasData, setAreasData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);

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
        toast.error("Failed to fetch areas");
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
    if (!eventId) return toast.error("Event ID not found");

    const link = `${window.location.origin}/gate-onboarding?eventId=${eventId}&areaId=${area.id}`;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(link)
        .then(() => toast.success("Link copied to clipboard!"))
        .catch(() => toast.error("Failed to copy link"));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("Link copied (fallback)!");
      } catch (err) {
        toast.error("Failed to copy link");
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
            <div className="text-center py-8 text-gray-500">Loading Areas...</div>
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
    </div>
  );
}

export default Onboarding;