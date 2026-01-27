import { useEffect, useState } from "react";
import {
  Trash2,
  Plus,
  ChevronLeft,
  Check,
  Edit2,
  Loader2,
  X,
} from "lucide-react";
import {
  createSpeakerApi,
  deleteSpeakerApi,
  getSpeakersApi,
  updateSpeakerApi,
} from "@/apis/apiHelpers";
import Pagination from "../Pagination";

interface AdvanceSpeakerProps {
  onNext?: (eventId?: string | number) => void;
  onPrevious?: () => void;
  onStepChange?: (step: number) => void;
  currentStep?: number;
  totalSteps?: number;
  eventId?: string | number;
}

interface Speaker {
  id: string;
  attributes: {
    name: string;
    description: string;
    organization: string;
    image: string;
    image_url?: string;
    created_at?: string;
    updated_at?: string;
    event_id?: number;
    agenda_ids?: any[];
  };
}

function AdvanceSpeaker({
  onNext,
  onPrevious,
  onStepChange,
  currentStep = 0,
  totalSteps = 5,
  eventId,
}: AdvanceSpeakerProps) {
  // currentStep is passed from parent (0-3 for 4 steps)
  console.log("-------event id---------------", eventId);

  const [eventUsers, setEventUsers] = useState<Speaker[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [newSpeaker, setNewSpeaker] = useState({
    name: "",
    description: "",
    organization: "",
    image: "",
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Loading states
  const [isFetchingSpeakers, setIsFetchingSpeakers] = useState(false);
  const [isAddingSpeaker, setIsAddingSpeaker] = useState(false);
  const [isUpdatingSpeaker, setIsUpdatingSpeaker] = useState(false);
  const [isDeletingSpeaker, setIsDeletingSpeaker] = useState<string | null>(
    null
  );

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [editSpeakerData, setEditSpeakerData] = useState({
    name: "",
    description: "",
    organization: "",
    image: "",
  });

  const [editSelectedImageFile, setEditSelectedImageFile] =
    useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Server-side pagination items per page
  const [pagination, setPagination] = useState<any>(null);

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [speakerToDelete, setSpeakerToDelete] = useState<Speaker | null>(null);

  // Fetch speakers when eventId or currentPage changes
  useEffect(() => {
    if (eventId && currentPage > 0) {
      fetchSpeakers(eventId, currentPage);
    }
  }, [eventId, currentPage]);

  const fetchSpeakers = async (id: string | number, page: number = 1) => {
    setIsFetchingSpeakers(true);
    try {
      const response = await getSpeakersApi(id, {
        page,
        per_page: itemsPerPage,
      });

      if (response.status === 200) {
        const responseData = response.data?.data || response.data;
        const speakers = Array.isArray(responseData)
          ? responseData
          : responseData?.data || [];

        const speakersData = speakers.map((item: any) => ({
          id: item.id,
          attributes: {
            name: item.attributes.name,
            description: item.attributes.description,
            organization: item.attributes.organization,
            image: item.attributes.image_url,
            image_url: item.attributes.image_url,
            created_at: item.attributes.created_at,
            updated_at: item.attributes.updated_at,
            event_id: item.attributes.event_id,
            agenda_ids: item.attributes.agenda_ids,
          },
        }));

        setEventUsers(speakersData);

        // Set pagination metadata
        const paginationMeta =
          response.data?.meta?.pagination || response.data?.pagination;
        if (paginationMeta) {
          setPagination(paginationMeta);
        }
      } else {
        showNotification("Failed to fetch speakers", "error");
      }
    } catch (error: any) {
      console.log("💥 GET speakers error:", error);
      showNotification("Network error: Cannot fetch speakers", "error");
    } finally {
      setIsFetchingSpeakers(false);
    }
  };

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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(eventUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteUser = async (user: Speaker) => {
    setSpeakerToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!speakerToDelete) return;

    setIsDeletingSpeaker(speakerToDelete.id);
    try {
      const response = await deleteSpeakerApi(eventId!, speakerToDelete.id);

      if (response.status === 200 || response.status === 204) {
        showNotification("Speaker deleted successfully!", "success");
        setIsDeleteModalOpen(false);
        setSpeakerToDelete(null);
        // Refresh current page to show updated data
        fetchSpeakers(eventId!, currentPage);
      } else {
        showNotification("Failed to delete speaker", "error");
      }
    } catch (error: any) {
      console.error("Delete speaker error:", error);
      showNotification(
        error.response?.data?.message || "Network error: Cannot delete speaker",
        "error"
      );
    } finally {
      setIsDeletingSpeaker(null);
    }
  };

  const handleEditUser = (user: Speaker) => {
    setEditingSpeaker(user);
    setEditSpeakerData({
      name: user.attributes.name,
      description: user.attributes.description,
      organization: user.attributes.organization,
      image: user.attributes.image_url || "",
    });
    setEditSelectedImageFile(null);
    setEditModalOpen(true);
  };

  const handleAddSpeaker = async () => {
    if (!newSpeaker.name || !newSpeaker.organization) {
      showNotification("Please fill all required fields!", "error");
      return;
    }

    setIsAddingSpeaker(true);
    try {
      const formData = new FormData();
      formData.append("speaker[name]", newSpeaker.name);
      formData.append("speaker[description]", newSpeaker.description);
      formData.append("speaker[organization]", newSpeaker.organization);

      if (selectedImageFile) {
        formData.append("speaker[image]", selectedImageFile);
      }

      if (!eventId) {
        showNotification("Event ID is required!", "error");
        setIsAddingSpeaker(false);
        return;
      }

      const response = await createSpeakerApi(eventId, formData);

      if (response.status === 201 || response.status === 200) {
        const result = response.data;

        const newSpeakerData: Speaker = {
          id: result.data.id.toString(),
          attributes: {
            name: result.data.attributes.name,
            description: result.data.attributes.description,
            organization: result.data.attributes.organization,
            image: result.data.attributes.image_url,
            image_url: result.data.attributes.image_url,
            created_at: result.data.attributes.created_at,
            updated_at: result.data.attributes.updated_at,
            event_id: result.data.attributes.event_id,
            agenda_ids: result.data.attributes.agenda_ids,
          },
        };

        showNotification("Speaker added successfully!", "success");
        // Refresh current page to show updated data
        fetchSpeakers(eventId, currentPage);

        // Reset form
        setNewSpeaker({
          name: "",
          description: "",
          organization: "",
          image: "",
        });
        setSelectedImageFile(null);
        setAddModalOpen(false);
      }
    } catch (error: any) {
      console.log("💥 Axios error", error);

      if (error.response) {
        showNotification(
          error.response.data?.message || "Failed to add speaker",
          "error"
        );
      } else {
        showNotification("Network error: Cannot connect to server.", "error");
      }
    } finally {
      setIsAddingSpeaker(false);
    }
  };

  const handleUpdateSpeaker = async () => {
    if (!editingSpeaker) return;

    if (!editSpeakerData.name || !editSpeakerData.organization) {
      showNotification("Please fill all required fields!", "error");
      return;
    }

    setIsUpdatingSpeaker(true);
    try {
      const formData = new FormData();
      formData.append("speaker[name]", editSpeakerData.name);
      formData.append("speaker[description]", editSpeakerData.description);
      formData.append("speaker[organization]", editSpeakerData.organization);

      if (editSelectedImageFile) {
        formData.append("speaker[image]", editSelectedImageFile);
      }

      const response = await updateSpeakerApi(
        eventId!,
        editingSpeaker.id,
        formData
      );

      if (response.status === 200) {
        const updated = response.data.data;
        showNotification("Speaker updated successfully!", "success");
        setEditModalOpen(false);
        setEditingSpeaker(null);
        // Refresh current page to show updated data
        fetchSpeakers(eventId!, currentPage);
      }
    } catch (error: any) {
      console.error("Update speaker error:", error);
      showNotification(
        error.response?.data?.message || "Network error: Cannot update speaker",
        "error"
      );
    } finally {
      setIsUpdatingSpeaker(false);
    }
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

  const UserAvatar = ({ user }: { user: Speaker }) => {
    const src = user.attributes.image || user.attributes.image_url || "";
    if (!src) return null; // only show actual images
    return (
      <img
        src={src}
        alt={user.attributes.name}
        className="w-10 h-10 rounded-full object-cover"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
      />
    );
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
          <h2 className="text-xl font-semibold text-gray-900">
            Advance Speaker
          </h2>
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
            <h1 className="text-2xl font-semibold text-gray-900">Speakers</h1>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
              {isFetchingSpeakers ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading...
                </span>
              ) : (
                `${eventUsers.length} Speakers`
              )}
            </span>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            disabled={isFetchingSpeakers}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {isFetchingSpeakers ? "Loading..." : "Add Speaker"}
          </button>
        </div>

        {/* Loading State for Speakers Table */}
        {isFetchingSpeakers ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-pulse">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-6 py-3 text-left">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <div className="h-4 bg-gray-300 rounded w-32"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded w-48"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-300 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                        <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : eventUsers.length === 0 ? (
          <div className="text-center py-12 border border-gray-200 rounded-lg">
            <p className="text-gray-500 mb-4">No speakers found</p>
            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Speaker
            </button>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          eventUsers.length > 0 &&
                          selectedUsers.length === eventUsers.length
                        }
                        disabled={isFetchingSpeakers}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {eventUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={index % 2 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          disabled={isDeletingSpeaker === user.id}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} />
                          <span className="text-sm font-medium text-gray-900">
                            {user.attributes.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">
                        {user.attributes.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.attributes.organization}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={isDeletingSpeaker === user.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDeletingSpeaker === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            disabled={isDeletingSpeaker === user.id}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!isFetchingSpeakers && pagination && pagination.total_pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-200/60">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, pagination.total_count)}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total_count}</span> speakers
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
          </>
        )}
      </div>

      {/* Add Speaker Modal */}
      {addModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => !isAddingSpeaker && setAddModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-xl w-[80%] max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Add Speaker
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter speaker name"
                  value={newSpeaker.name}
                  onChange={(e) =>
                    setNewSpeaker({ ...newSpeaker, name: e.target.value })
                  }
                  disabled={isAddingSpeaker}
                  className="w-full p-2.5 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Upload Profile Picture
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setSelectedImageFile(file);
                      }
                    }}
                    disabled={isAddingSpeaker}
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm text-gray-600 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                {selectedImageFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {selectedImageFile.name} (
                    {(selectedImageFile.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Enter speaker description"
                  value={newSpeaker.description}
                  onChange={(e) =>
                    setNewSpeaker({
                      ...newSpeaker,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  disabled={isAddingSpeaker}
                  className="w-full p-2.5 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Organization *
                </label>
                <input
                  type="text"
                  placeholder="Enter organization name"
                  value={newSpeaker.organization}
                  onChange={(e) =>
                    setNewSpeaker({
                      ...newSpeaker,
                      organization: e.target.value,
                    })
                  }
                  disabled={isAddingSpeaker}
                  className="w-full p-2.5 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setAddModalOpen(false)}
                disabled={isAddingSpeaker}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSpeaker}
                disabled={isAddingSpeaker}
                className="flex-1 bg-blue-900 hover:bg-blue-950 text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingSpeaker ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding Speaker...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Speaker
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Speaker Modal */}
      {editModalOpen && editingSpeaker && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => !isUpdatingSpeaker && setEditModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-xl w-[80%] max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Edit Speaker
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter speaker name"
                  value={editSpeakerData.name}
                  onChange={(e) =>
                    setEditSpeakerData({
                      ...editSpeakerData,
                      name: e.target.value,
                    })
                  }
                  disabled={isUpdatingSpeaker}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Organization *
                </label>
                <input
                  type="text"
                  placeholder="Organization"
                  value={editSpeakerData.organization}
                  onChange={(e) =>
                    setEditSpeakerData({
                      ...editSpeakerData,
                      organization: e.target.value,
                    })
                  }
                  disabled={isUpdatingSpeaker}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Description"
                  value={editSpeakerData.description}
                  onChange={(e) =>
                    setEditSpeakerData({
                      ...editSpeakerData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  disabled={isUpdatingSpeaker}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Upload New Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setEditSelectedImageFile(file);
                    }
                  }}
                  disabled={isUpdatingSpeaker}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {editSelectedImageFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {editSelectedImageFile.name} (
                    {(editSelectedImageFile.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditModalOpen(false)}
                disabled={isUpdatingSpeaker}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSpeaker}
                disabled={isUpdatingSpeaker}
                className="flex-1 bg-blue-900 hover:bg-blue-950 text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingSpeaker ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Speaker"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6">
        <button
          onClick={handleBack}
          disabled={isFetchingSpeakers}
          className="cursor-pointer px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <button
          onClick={handleNext}
          disabled={isFetchingSpeakers}
          className="cursor-pointer px-6 py-2 rounded-lg text-white transition-colors font-medium bg-slate-800 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          onClick={() => {
            if (isDeletingSpeaker === null) {
              setIsDeleteModalOpen(false);
              setSpeakerToDelete(null);
            }
          }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full transform animate-in zoom-in-95 duration-200"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Delete Speaker
                </h3>
                <button
                  onClick={() => {
                    if (isDeletingSpeaker === null) {
                      setIsDeleteModalOpen(false);
                      setSpeakerToDelete(null);
                    }
                  }}
                  disabled={isDeletingSpeaker !== null}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete this speaker?
                </p>
                {speakerToDelete && (
                  <div className="bg-gray-50 p-3 rounded-lg mt-3">
                    <p className="font-medium text-gray-900">
                      {speakerToDelete.attributes.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {speakerToDelete.attributes.organization}
                    </p>
                  </div>
                )}
                <p className="text-sm text-red-600 mt-3">
                  This action cannot be undone.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSpeakerToDelete(null);
                  }}
                  disabled={isDeletingSpeaker !== null}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeletingSpeaker !== null}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeletingSpeaker !== null ? (
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
      `}</style>
    </div>
  );
}

export default AdvanceSpeaker;
