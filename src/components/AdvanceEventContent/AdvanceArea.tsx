import { useEffect, useState } from "react";
import {
  Trash2,
  Plus,
  ChevronLeft,
  Check,
  Edit2,
  X,
  Loader2,
} from "lucide-react";
import {
  createSessionAreaApi,
  getSessionAreaApi,
  deleteSessionAreaApi,
  updateSessionAreaApi,
  getBadgeType,
} from "@/apis/apiHelpers";
import Pagination from "../Pagination";

interface AdvanceAreaProps {
  onNext?: (eventId?: string | number) => void;
  onPrevious?: () => void;
  onStepChange?: (step: number) => void;
  currentStep?: number;
  totalSteps?: number;
  eventId?: string | number;
}

export type Area = {
  id: string;
  title: string;
  location: string;
  type: string;
  travelNumber: number;
};

export type Badge = {
  id: string;
  attributes: {
    name: string;
    default?: boolean;
  };
};

function AdvanceArea({
  onNext,
  onPrevious,
  onStepChange,
  currentStep = 4,
  totalSteps = 5,
  eventId,
}: AdvanceAreaProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [newSession, setNewSession] = useState({
    title: "",
    location: "",
    travelNumber: "",
    type: "",
  });
  const [sessions, setSessions] = useState<Area[]>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editData, setEditData] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState<string | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Server-side pagination items per page
  const [pagination, setPagination] = useState<any>(null);

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);

  const currentEventId = eventId || localStorage.getItem("create_eventId");

  // Fetch badges for user type dropdown
  const fetchBadgeApi = async () => {
    if (!currentEventId) return;

    setBadgeLoading(true);
    try {
      console.log("Fetching badges for event ID:", currentEventId);

      const response = await getBadgeType(currentEventId);

      console.log("Badges API Response in AdvanceArea", response);

      const result = response.data;
      console.log("✅ Raw badges fetched:", result?.data);

      // Store ALL badges (both default and non-default)
      if (result?.data && Array.isArray(result.data)) {
        // Deduplicate badges by name to avoid showing duplicates
        const uniqueBadges = result.data.filter(
          (badge: Badge, index: number, self: Badge[]) =>
            index ===
            self.findIndex(
              (b: Badge) =>
                b.attributes.name === badge.attributes.name
            )
        );
        setBadges(uniqueBadges);
        console.log("✅ Unique badges stored:", uniqueBadges);
      } else {
        setBadges([]);
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);
      setBadges([]);
    } finally {
      setBadgeLoading(false);
    }
  };

  // Fetch session areas
  const fetchSessionAreas = async (id: string, page: number = 1) => {
    setLoading(true);

    try {
      const response = await getSessionAreaApi(id, {
        page,
        per_page: itemsPerPage,
      });
      console.log("GET API Response:", response);

      const responseData = response?.data?.data || response?.data;
      const areasData = Array.isArray(responseData)
        ? responseData
        : responseData?.data || [];

      if (areasData.length > 0 || response?.data?.data) {
        // Transform API response to match our Area type
        const areas: Area[] = areasData.map((item: any) => ({
          id: item.id,
          title: item.attributes.name,
          location: item.attributes.location,
          type: item.attributes.user_type,
          travelNumber: item.attributes.guest_number,
        }));

        setSessions(areas);

        // Set pagination metadata
        const paginationMeta =
          response.data?.meta?.pagination || response.data?.pagination;
        if (paginationMeta) {
          setPagination(paginationMeta);
        }
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error("Error fetching session areas:", error);
      showNotification("Failed to fetch session areas", "error");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentEventId) {
      fetchBadgeApi();
    }
  }, [currentEventId]);

  // Fetch session areas when eventId or currentPage changes
  useEffect(() => {
    if (currentEventId && currentPage > 0) {
      fetchSessionAreas(currentEventId as string, currentPage);
    }
  }, [currentEventId, currentPage]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
  };

  const handleSelectAll = (e: any) => {
    if (e.target.checked) {
      setSelectedUsers(sessions.map((s) => s.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSession = async (session: Area) => {
    setAreaToDelete(session);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!areaToDelete || !currentEventId) return;

    try {
      setDeleteLoading(areaToDelete.id);
      const response = await deleteSessionAreaApi(
        currentEventId as string,
        areaToDelete.id
      );

      if (response.status === 200 || response.status === 204) {
        showNotification("Session deleted successfully!", "success");
        setIsDeleteModalOpen(false);
        setAreaToDelete(null);
        // Refresh current page to show updated data
        fetchSessionAreas(currentEventId as string, currentPage);
      } else {
        throw new Error(`Delete failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      showNotification("Failed to delete session", "error");
      await fetchSessionAreas(currentEventId as string, currentPage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleAddSession = async () => {
    if (!currentEventId) {
      showNotification("Event ID not found", "error");
      return;
    }

    try {
      // Convert guest_number to number
      const guestNumber = parseInt(newSession.travelNumber || "0", 10) || 0;

      const AreaData = {
        session_area: {
          name: newSession.title || "",
          location: newSession.location || "",
          user_type: newSession.type || "",
          guest_number: guestNumber,
          event_id: currentEventId as string,
        },
      };

      const response = await createSessionAreaApi(
        AreaData,
        currentEventId as string
      );

      if (response?.data?.data) {
        // Transform the new area data to match our Area type
        const newAreaData: Area = {
          id: response.data.data.id,
          title: response.data.data.attributes.name,
          location: response.data.data.attributes.location,
          type: response.data.data.attributes.user_type,
          travelNumber: response.data.data.attributes.guest_number,
        };

        setNewSession({
          title: "",
          location: "",
          travelNumber: "",
          type: "",
        });
        setAddModalOpen(false);
        showNotification("Session added successfully!", "success");
        // Refresh current page to show updated data
        fetchSessionAreas(currentEventId as string, currentPage);
      } else {
        showNotification("Failed to add session: Invalid response", "error");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add session";
      showNotification(errorMessage, "error");
      await fetchSessionAreas(currentEventId as string, currentPage);
    }
  };

  const handleEdit = (session: Area) => {
    setEditingRow(session.id);
    setEditData({ ...session });
  };

  const handleSaveEdit = async () => {
    if (!editData || !currentEventId) {
      showNotification("Edit data or Event ID not found", "error");
      return;
    }

    try {
      setSaveLoading(editData.id);

      // Prepare data for UPDATE API
      const updateData = {
        session_area: {
          name: editData.title,
          location: editData.location,
          user_type: editData.type,
          guest_number: editData.travelNumber,
          event_id: currentEventId,
        },
      };

      const response = await updateSessionAreaApi(
        currentEventId as string,
        editData.id,
        updateData
      );

      if (response?.data?.data) {
        // Use the response data to ensure consistency
        const updatedArea: Area = {
          id: response.data.data.id,
          title: response.data.data.attributes.name,
          location: response.data.data.attributes.location,
          type: response.data.data.attributes.user_type,
          travelNumber: response.data.data.attributes.guest_number,
        };

        setEditingRow(null);
        setEditData(null);
        showNotification("Session updated successfully!", "success");
        // Refresh current page to show updated data
        fetchSessionAreas(currentEventId as string, currentPage);
      } else {
        throw new Error("Update response format is invalid");
      }
    } catch (error) {
      console.error("Error updating session:", error);
      showNotification("Failed to update session", "error");
      await fetchSessionAreas(currentEventId as string, currentPage);
    } finally {
      setSaveLoading(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditData(null);
  };

  const handleNext = () => {
    if (onNext) {
      onNext(eventId);
    }
  };

  const handleBack = () => {
    if (onPrevious) {
      onPrevious();
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ChevronLeft className="text-gray-500" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">Area</h2>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, step) => (
            <div key={step} className="flex items-center">
              <button
                type="button"
                onClick={() => onStepChange?.(step)}
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 cursor-pointer transition-colors ${
                  step === currentStep
                    ? "border-pink-500 bg-white text-pink-500"
                    : step < currentStep
                    ? "bg-pink-500 border-pink-500 text-white"
                    : "border-gray-300 bg-white text-gray-400 hover:border-gray-400"
                }`}
              >
                {step < currentStep ? (
                  <Check size={16} />
                ) : (
                  <span className="text-sm font-medium">
                    {String(step + 1).padStart(2, "0")}
                  </span>
                )}
              </button>
              {step < totalSteps - 1 && (
                <div
                  className={`w-8 h-0.5 mx-1 ${
                    step < currentStep ? "bg-pink-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium text-gray-900">Area</h1>
            <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-md text-xs font-medium">
              {sessions.length} Session
            </span>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Sessions
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      sessions.length > 0 &&
                      selectedUsers.length === sessions.length
                    }
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest number
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3">
                        <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-300 rounded w-32"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-300 rounded w-24"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-6 bg-gray-300 rounded-full w-20"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-300 rounded w-16"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                          <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : sessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No sessions found. Add your first session above.
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(session.id)}
                        onChange={() => handleSelectUser(session.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-900">
                      {editingRow === session.id ? (
                        <input
                          type="text"
                          value={editData?.title || ""}
                          onChange={(e) =>
                            setEditData((prev) =>
                              prev ? { ...prev, title: e.target.value } : null
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        session.title
                      )}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {editingRow === session.id ? (
                        <input
                          type="text"
                          value={editData?.location || ""}
                          onChange={(e) =>
                            setEditData((prev) =>
                              prev
                                ? { ...prev, location: e.target.value }
                                : null
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        session.location
                      )}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {editingRow === session.id ? (
                        <select
                          value={editData?.type || ""}
                          onChange={(e) =>
                            setEditData((prev) =>
                              prev ? { ...prev, type: e.target.value } : null
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {badges.map((badge) => (
                            <option
                              key={badge.id}
                              value={badge.attributes.name}
                            >
                              {badge.attributes.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        badges.find(
                          (b) => b.attributes.name === session.type
                        )?.attributes.name || session.type
                      )}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {editingRow === session.id ? (
                        <input
                          type="number"
                          value={editData?.travelNumber || ""}
                          onChange={(e) =>
                            setEditData((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    travelNumber: parseInt(e.target.value) || 0,
                                  }
                                : null
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        session.travelNumber
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {editingRow === session.id ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              disabled={saveLoading === session.id}
                              className="p-1.5 text-green-500 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {saveLoading === session.id ? (
                                <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={saveLoading === session.id}
                              className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleDeleteSession(session)}
                              disabled={deleteLoading === session.id}
                              className="p-1.5 text-pink-500 hover:bg-pink-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deleteLoading === session.id ? (
                                <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(session)}
                              className="p-1.5 text-yellow-500 hover:bg-yellow-50 rounded-md transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-200/60">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, pagination.total_count)}
              </span>{" "}
              of <span className="font-medium">{pagination.total_count}</span> sessions
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.total_pages || 1}
              onPageChange={(page) => {
                setCurrentPage(page);
                // Scroll to top when page changes
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className=""
            />
          </div>
        )}

        {/* Add Session Modal */}
        {addModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setAddModalOpen(false)}
          >
            <div
              className="bg-white p-8 rounded-2xl w-3/4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Add Sessions
                </h2>
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Click here"
                    value={newSession.title}
                    onChange={(e) =>
                      setNewSession({ ...newSession, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Location here"
                    value={newSession.location}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        location: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Guest number
                  </label>
                  <input
                    type="number"
                    placeholder="Number"
                    value={newSession.travelNumber || ""}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        travelNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    User Type
                  </label>
                  <select
                    value={newSession.type}
                    onChange={(e) =>
                      setNewSession({ ...newSession, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="" disabled>
                      Select User Type
                    </option>
                    {badgeLoading ? (
                      <option value="" disabled>
                        Loading badges...
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
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddSession();
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mt-4"
              >
                <Plus className="w-4 h-4" /> Add Sessions
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-6 mt-6">
        <button
          onClick={handleBack}
          className="cursor-pointer px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
        >
          ← Previous
        </button>

        <button
          onClick={handleNext}
          className="cursor-pointer px-6 py-2 rounded-lg text-white transition-colors font-medium bg-gray-900 hover:bg-gray-800 text-sm"
        >
          Next →
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          onClick={() => {
            if (deleteLoading === null) {
              setIsDeleteModalOpen(false);
              setAreaToDelete(null);
            }
          }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full transform animate-in zoom-in-95 duration-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Delete Area
                </h3>
                <button
                  onClick={() => {
                    if (deleteLoading === null) {
                      setIsDeleteModalOpen(false);
                      setAreaToDelete(null);
                    }
                  }}
                  disabled={deleteLoading !== null}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete this area?
                </p>
                {areaToDelete && (
                  <div className="bg-gray-50 p-3 rounded-lg mt-3">
                    <p className="font-medium text-gray-900">
                      {areaToDelete.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {areaToDelete.location}
                    </p>
                  </div>
                )}
                <p className="text-sm text-red-600 mt-3">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setAreaToDelete(null);
                  }}
                  disabled={deleteLoading !== null}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteLoading !== null}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {deleteLoading !== null ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
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
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default AdvanceArea;
