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
  createExhibitorApi,
  deleteExhibitorApi,
  getExhibitorsApi,
  updateExhibitorApi,
} from "@/apis/apiHelpers";
import Pagination from "../Pagination";

interface AdvanceExhibitorsProps {
  onNext?: (eventId?: string | number) => void;
  onPrevious?: () => void;
  currentStep?: number;
  totalSteps?: number;
  eventId?: string | number;
}

interface Exhibitor {
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
  };
  _imageVersion?: number; // Cache-busting version for image updates
}

function AdvanceExhibitors({
  onNext,
  onPrevious,
  currentStep = 1,
  totalSteps = 4,
  eventId,
}: AdvanceExhibitorsProps) {
  // currentStep is passed from parent (0-3 for 4 steps)
  const [eventUsers, setEventUsers] = useState<Exhibitor[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [newExhibitor, setNewExhibitor] = useState({
    name: "",
    description: "",
    organization: "",
    image: "",
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Loading states
  const [isFetchingExhibitors, setIsFetchingExhibitors] = useState(false);
  const [isAddingExhibitor, setIsAddingExhibitor] = useState(false);
  const [isUpdatingExhibitor, setIsUpdatingExhibitor] = useState(false);
  const [isDeletingExhibitor, setIsDeletingExhibitor] = useState<string | null>(
    null
  );

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingExhibitor, setEditingExhibitor] = useState<Exhibitor | null>(
    null
  );
  const [editExhibitorData, setEditExhibitorData] = useState({
    name: "",
    description: "",
    organization: "",
    image: "",
  });
  const [editSelectedImageFile, setEditSelectedImageFile] =
    useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Server-side pagination items per page
  const [pagination, setPagination] = useState<any>(null);

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [exhibitorToDelete, setExhibitorToDelete] = useState<Exhibitor | null>(
    null
  );

  // Fetch exhibitors when eventId or currentPage changes
  useEffect(() => {
    if (eventId && currentPage > 0) {
      fetchExhibitors(eventId, currentPage);
    }
  }, [eventId, currentPage]);

  const fetchExhibitors = async (id: string | number, page: number = 1) => {
    setIsFetchingExhibitors(true);
    try {
      const response = await getExhibitorsApi(id, {
        page,
        per_page: itemsPerPage,
      });

      if (response.status === 200) {
        const responseData = response.data?.data || response.data;
        const exhibitors = Array.isArray(responseData)
          ? responseData
          : responseData?.data || [];

        const exhibitorsData = exhibitors.map(
          (item: any, index: number) => ({
            id: item.id,
            attributes: {
              name: item.attributes.name,
              description: item.attributes.description,
              organization: item.attributes.organization,
              // Handle both image_url and image fields from API
              image: item.attributes.image_url || item.attributes.image || "",
              image_url:
                item.attributes.image_url || item.attributes.image || "",
              created_at: item.attributes.created_at,
              updated_at: item.attributes.updated_at,
              event_id: item.attributes.event_id,
            },
            // Use unique timestamp + index to ensure each exhibitor gets a different version
            _imageVersion: Date.now() + index,
          })
        );

        setEventUsers(exhibitorsData);

        // Set pagination metadata
        const paginationMeta =
          response.data?.meta?.pagination || response.data?.pagination;
        if (paginationMeta) {
          setPagination(paginationMeta);
        }
      } else {
        showNotification("Failed to fetch exhibitors", "error");
      }
    } catch (error: any) {
      console.log("💥 GET exhibitors error:", error);
      showNotification("Network error: Cannot fetch exhibitors", "error");
    } finally {
      setIsFetchingExhibitors(false);
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

  const handleDeleteUser = async (user: Exhibitor) => {
    setExhibitorToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!exhibitorToDelete) return;

    setIsDeletingExhibitor(exhibitorToDelete.id);
    try {
      const response = await deleteExhibitorApi(eventId!, exhibitorToDelete.id);

      // Backend returns 200 or 204 on successful deletion
      if (response.status === 200 || response.status === 204) {
        showNotification("Exhibitor deleted successfully!", "success");
        setIsDeleteModalOpen(false);
        setExhibitorToDelete(null);
        // Refresh current page to show updated data
        fetchExhibitors(eventId!, currentPage);
      } else {
        showNotification("Failed to delete exhibitor", "error");
      }
    } catch (error: any) {
      console.error("Delete exhibitor error:", error);
      showNotification(
        error.response?.data?.message ||
          "Network error: Cannot delete exhibitor",
        "error"
      );
    } finally {
      setIsDeletingExhibitor(null);
    }
  };

  const handleEditUser = (user: Exhibitor) => {
    setEditingExhibitor(user);
    setEditExhibitorData({
      name: user.attributes.name,
      description: user.attributes.description,
      organization: user.attributes.organization,
      image: user.attributes.image_url || "",
    });
    setEditSelectedImageFile(null);
    setEditImagePreview(null);
    setEditModalOpen(true);
  };

  const handleAddExhibitor = async () => {
    if (!newExhibitor.name || !newExhibitor.organization) {
      showNotification("Please fill all required fields!", "error");
      return;
    }

    setIsAddingExhibitor(true);
    try {
      // Create form data
      const formData = new FormData();
      formData.append("exhibitor[name]", newExhibitor.name);
      formData.append("exhibitor[description]", newExhibitor.description);
      formData.append("exhibitor[organization]", newExhibitor.organization);

      if (selectedImageFile) {
        formData.append("exhibitor[image]", selectedImageFile);
      }

      if (!eventId) {
        showNotification("Event ID is required!", "error");
        setIsAddingExhibitor(false);
        return;
      }

      const response = await createExhibitorApi(eventId, formData);

      if (response.status === 201 || response.status === 200) {
        const result = response.data;
        console.log("✅ Create API response:", JSON.stringify(result, null, 2));
        console.log("📸 Image attributes:", {
          image: result.data?.attributes?.image,
          image_url: result.data?.attributes?.image_url,
          all_attributes: Object.keys(result.data?.attributes || {}),
        });

        // API might return 'image' or 'image_url' - handle both
        const imageUrl =
          result.data.attributes.image_url ||
          result.data.attributes.image ||
          null;
        console.log("🖼️ Extracted image URL:", imageUrl);

        const newExhibitorData: Exhibitor = {
          id: result.data.id.toString(),
          attributes: {
            name: result.data.attributes.name,
            description: result.data.attributes.description,
            organization: result.data.attributes.organization,
            image: imageUrl || "",
            image_url: imageUrl || "",
            created_at: result.data.attributes.created_at,
            updated_at: result.data.attributes.updated_at,
            event_id: result.data.attributes.event_id,
          },
          _imageVersion: Date.now(),
        };

        showNotification("Exhibitor added successfully!", "success");

        // Reset UI
        setNewExhibitor({
          name: "",
          description: "",
          organization: "",
          image: "",
        });
        setSelectedImageFile(null);
        setImagePreview(null);
        setAddModalOpen(false);

        // Refresh current page to show updated data
        fetchExhibitors(eventId, currentPage);
      }
    } catch (error: any) {
      console.log("💥 Axios error", error);

      if (error.response) {
        showNotification(
          error.response.data?.message || "Failed to add exhibitor",
          "error"
        );
      } else {
        showNotification("Network error: Cannot connect to server.", "error");
      }
    } finally {
      setIsAddingExhibitor(false);
    }
  };

  const handleUpdateExhibitor = async () => {
    if (!editingExhibitor) return;

    if (!editExhibitorData.name || !editExhibitorData.organization) {
      showNotification("Please fill all required fields!", "error");
      return;
    }

    setIsUpdatingExhibitor(true);
    try {
      const formData = new FormData();
      formData.append("exhibitor[name]", editExhibitorData.name);
      formData.append("exhibitor[description]", editExhibitorData.description);
      formData.append(
        "exhibitor[organization]",
        editExhibitorData.organization
      );

      if (editSelectedImageFile) {
        formData.append("exhibitor[image]", editSelectedImageFile);
      }

      const response = await updateExhibitorApi(
        eventId!,
        editingExhibitor.id,
        formData
      );

      if (response.status === 200) {
        const updated = response.data.data;
        console.log("Update API response:", updated);
        console.log("New image_url:", updated.attributes.image_url);

        showNotification("Exhibitor updated successfully!", "success");
        setEditModalOpen(false);
        setEditingExhibitor(null);
        setEditSelectedImageFile(null);
        setEditImagePreview(null);

        // Refresh current page to show updated data
        fetchExhibitors(eventId!, currentPage);
      }
    } catch (error: any) {
      console.error("Update exhibitor error:", error);
      showNotification(
        error.response?.data?.message ||
          "Network error: Cannot update exhibitor",
        "error"
      );
    } finally {
      setIsUpdatingExhibitor(false);
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

  const UserAvatar = ({ user }: { user: Exhibitor }) => {
    const imageUrl = user.attributes.image_url || user.attributes.image;
    // Use image version for cache-busting - this changes when image is updated
    const imageVersion = user._imageVersion || 0;

    // Debug logging
    if (!imageUrl) {
      console.log(
        `Exhibitor ${user.id} (${user.attributes.name}) has no image URL`
      );
    }

    const imageSrc =
      imageUrl && imageUrl.trim() !== ""
        ? `${imageUrl}${
            imageUrl.includes("?") ? "&" : "?"
          }v=${imageVersion}&t=${Date.now()}`
        : `https://i.pravatar.cc/100?img=${user.id.charCodeAt(0) % 70}`; // Different placeholder per exhibitor

    return (
      <img
        key={`${user.id}-${imageVersion}-${imageUrl || "no-image"}`} // Force re-render when version or URL changes
        src={imageSrc}
        alt={user.attributes.name}
        className="w-10 h-10 rounded-full object-cover"
        onError={(e) => {
          // Fallback to placeholder if image fails to load
          const fallbackSrc = `https://i.pravatar.cc/100?img=${
            user.id.charCodeAt(0) % 70
          }`;
          if (e.currentTarget.src !== fallbackSrc) {
            console.log(
              `Image failed to load for exhibitor ${user.id}, using fallback`
            );
            e.currentTarget.src = fallbackSrc;
          }
        }}
        onLoad={() => {
          console.log(
            `Image loaded successfully for exhibitor ${user.id}: ${imageUrl}`
          );
        }}
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
            Advance Exhibitors
          </h2>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step === currentStep
                    ? "border-pink-500 bg-white text-pink-500"
                    : step < currentStep
                    ? "bg-pink-500 border-pink-500 text-white"
                    : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {step < currentStep ? (
                  <Check size={16} />
                ) : (
                  <span className="text-sm font-medium">{step + 1}</span>
                )}
              </div>
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
            <h1 className="text-2xl font-semibold text-gray-900">Exhibitors</h1>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
              {isFetchingExhibitors ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading...
                </span>
              ) : (
                `${eventUsers.length} Exhibitors`
              )}
            </span>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            disabled={isFetchingExhibitors}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {isFetchingExhibitors ? "Loading..." : "Add Exhibitor"}
          </button>
        </div>

        {/* Loading State for Exhibitors Table */}
        {isFetchingExhibitors ? (
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
            <p className="text-gray-500 mb-4">No exhibitors found</p>
            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Exhibitor
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
                            disabled={isDeletingExhibitor === user.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDeletingExhibitor === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            disabled={isDeletingExhibitor === user.id}
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
            {!isFetchingExhibitors && pagination && pagination.total_pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-200/60">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, pagination.total_count)}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total_count}</span> exhibitors
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.total_pages || 1}
                  onPageChange={(page: number) => {
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

        {/* Add Exhibitor Modal */}
        {addModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => !isAddingExhibitor && setAddModalOpen(false)}
          >
            <div
              className="bg-white p-6 rounded-xl w-[80%] max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Add Exhibitor
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter exhibitor name"
                    value={newExhibitor.name}
                    onChange={(e) =>
                      setNewExhibitor({ ...newExhibitor, name: e.target.value })
                    }
                    disabled={isAddingExhibitor}
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
                          // Create preview URL
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImagePreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      disabled={isAddingExhibitor}
                      className="w-full p-2.5 border border-gray-300 rounded-md text-sm text-gray-600 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  {selectedImageFile && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">
                        Selected: {selectedImageFile.name} (
                        {(selectedImageFile.size / 1024).toFixed(0)} KB)
                      </p>
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter exhibitor description"
                    value={newExhibitor.description}
                    onChange={(e) =>
                      setNewExhibitor({
                        ...newExhibitor,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    disabled={isAddingExhibitor}
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
                    value={newExhibitor.organization}
                    onChange={(e) =>
                      setNewExhibitor({
                        ...newExhibitor,
                        organization: e.target.value,
                      })
                    }
                    disabled={isAddingExhibitor}
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setAddModalOpen(false)}
                  disabled={isAddingExhibitor}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddExhibitor}
                  disabled={isAddingExhibitor}
                  className="flex-1 bg-blue-900 hover:bg-blue-950 text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingExhibitor ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding Exhibitor...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Exhibitor
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Exhibitor Modal */}
        {editModalOpen && editingExhibitor && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => !isUpdatingExhibitor && setEditModalOpen(false)}
          >
            <div
              className="bg-white p-6 rounded-xl w-[80%] max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Edit Exhibitor
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter exhibitor name"
                    value={editExhibitorData.name}
                    onChange={(e) =>
                      setEditExhibitorData({
                        ...editExhibitorData,
                        name: e.target.value,
                      })
                    }
                    disabled={isUpdatingExhibitor}
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Organization *
                  </label>
                  <input
                    type="text"
                    placeholder="Organization"
                    value={editExhibitorData.organization}
                    onChange={(e) =>
                      setEditExhibitorData({
                        ...editExhibitorData,
                        organization: e.target.value,
                      })
                    }
                    disabled={isUpdatingExhibitor}
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Description"
                    value={editExhibitorData.description}
                    onChange={(e) =>
                      setEditExhibitorData({
                        ...editExhibitorData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    disabled={isUpdatingExhibitor}
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
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
                        // Create preview URL
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    disabled={isUpdatingExhibitor}
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm text-gray-600 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {/* Show current image or new preview */}
                  <div className="mt-3">
                    {editImagePreview ? (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">
                          New: {editSelectedImageFile?.name} (
                          {editSelectedImageFile
                            ? (editSelectedImageFile.size / 1024).toFixed(0)
                            : 0}{" "}
                          KB)
                        </p>
                        <img
                          src={editImagePreview}
                          alt="New preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    ) : editingExhibitor?.attributes?.image_url ? (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">
                          Current image:
                        </p>
                        <img
                          src={editingExhibitor.attributes.image_url}
                          alt="Current"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditModalOpen(false)}
                  disabled={isUpdatingExhibitor}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateExhibitor}
                  disabled={isUpdatingExhibitor}
                  className="flex-1 bg-blue-900 hover:bg-blue-950 text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingExhibitor ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Exhibitor"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6">
        <button
          onClick={handleBack}
          disabled={isFetchingExhibitors}
          className="cursor-pointer px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>


        <button
          onClick={handleNext}
          disabled={isFetchingExhibitors}
          className="cursor-pointer px-6 py-2 rounded-lg text-white transition-colors font-medium bg-slate-800 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          onClick={() => {
            if (isDeletingExhibitor === null) {
              setIsDeleteModalOpen(false);
              setExhibitorToDelete(null);
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
                  Delete Exhibitor
                </h3>
                <button
                  onClick={() => {
                    if (isDeletingExhibitor === null) {
                      setIsDeleteModalOpen(false);
                      setExhibitorToDelete(null);
                    }
                  }}
                  disabled={isDeletingExhibitor !== null}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete this exhibitor?
                </p>
                {exhibitorToDelete && (
                  <div className="bg-gray-50 p-3 rounded-lg mt-3">
                    <p className="font-medium text-gray-900">
                      {exhibitorToDelete.attributes.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {exhibitorToDelete.attributes.organization}
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
                    setExhibitorToDelete(null);
                  }}
                  disabled={isDeletingExhibitor !== null}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeletingExhibitor !== null}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeletingExhibitor !== null ? (
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

export default AdvanceExhibitors;
