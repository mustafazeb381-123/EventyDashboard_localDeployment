import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import GateOnboarding from "./GateOnboarding";
import { ArrowRight, Clipboard, Plus } from "lucide-react";
import {
  getSessionAreaApi,
  createSessionAreaApi,
  getBadgeType,
} from "@/apis/apiHelpers";

type BadgeOption = {
  id: string;
  attributes: { name: string; default?: boolean };
};

function Onboarding() {
  const [showGateOnboarding, setShowGateOnboarding] = useState(false);
  const [selectedArea, setSelectedArea] = useState<any | null>(null);
  const [areasData, setAreasData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);

  // Add Area modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newArea, setNewArea] = useState({
    name: "",
    location: "",
    type: "",
    guestNumbers: "",
  });
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    location: "",
    type: "",
    guestNumbers: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [badges, setBadges] = useState<BadgeOption[]>([]);
  const [badgeLoading, setBadgeLoading] = useState(false);

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
  const fetchAreas = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const response = await getSessionAreaApi(eventId);
      setAreasData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching areas:", err);
      showNotification("Failed to fetch areas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, [eventId]);

  // Fetch badges for Add Area form (User Type dropdown)
  useEffect(() => {
    const fetchBadges = async () => {
      if (!eventId) {
        setBadges([]);
        return;
      }
      setBadgeLoading(true);
      try {
        const response = await getBadgeType(eventId);
        if (response?.data?.data && Array.isArray(response.data.data)) {
          setBadges(response.data.data);
        } else {
          setBadges([]);
        }
      } catch (err) {
        console.error("Error fetching badges:", err);
        setBadges([]);
      } finally {
        setBadgeLoading(false);
      }
    };
    fetchBadges();
  }, [eventId]);

  const openAddModal = () => {
    setNewArea({ name: "", location: "", type: "", guestNumbers: "" });
    setValidationErrors({ name: "", location: "", type: "", guestNumbers: "" });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewArea({ name: "", location: "", type: "", guestNumbers: "" });
    setValidationErrors({ name: "", location: "", type: "", guestNumbers: "" });
  };

  const handleAddArea = async () => {
    const errors = {
      name: newArea.name ? "" : "Name is required",
      location: newArea.location ? "" : "Location is required",
      type: newArea.type ? "" : "Type is required",
      guestNumbers: newArea.guestNumbers ? "" : "Guest numbers are required",
    };
    setValidationErrors(errors);
    if (Object.values(errors).some((err) => err !== "")) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    if (!eventId) {
      showNotification("Event ID not found", "error");
      return;
    }

    setAddLoading(true);
    try {
      const payload = {
        session_area: {
          name: newArea.name,
          location: newArea.location,
          user_type: newArea.type,
          guest_number: newArea.guestNumbers,
          event_id: eventId,
        },
      };
      await createSessionAreaApi(payload, eventId);
      showNotification("Area added successfully!", "success");
      closeAddModal();
      await fetchAreas();
    } catch (err) {
      console.error("Error adding area:", err);
      showNotification("Failed to add area", "error");
    } finally {
      setAddLoading(false);
    }
  };

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
              Check-In/out
            </h1>
            <p className="text-gray-600 mt-1">
              Areas: {areasData.length}
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            disabled={!eventId}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Area
          </button>
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

      {/* Add Area Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
          onClick={closeAddModal}
        >
          <div
            className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Area
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter area name"
                  value={newArea.name}
                  onChange={(e) =>
                    setNewArea((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter area location"
                  value={newArea.location}
                  onChange={(e) =>
                    setNewArea((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.location
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {validationErrors.location && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.location}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={newArea.type}
                  onChange={(e) =>
                    setNewArea((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                    validationErrors.type ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select User Type</option>
                  <option value="any">Any</option>
                  {badgeLoading ? (
                    <option value="" disabled>
                      Loading...
                    </option>
                  ) : (
                    badges.map((badge) => (
                      <option
                        key={badge.id}
                        value={badge.attributes.name}
                      >
                        {badge.attributes.name}
                      </option>
                    ))
                  )}
                </select>
                {validationErrors.type && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.type}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guest numbers <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Type number"
                  value={newArea.guestNumbers}
                  onChange={(e) =>
                    setNewArea((prev) => ({
                      ...prev,
                      guestNumbers: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.guestNumbers
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {validationErrors.guestNumbers && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.guestNumbers}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                type="button"
                onClick={closeAddModal}
                disabled={addLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddArea}
                disabled={addLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addLoading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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