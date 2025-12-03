import { useEffect, useState } from "react";
import { Trash2, Plus, ChevronLeft, Check, Edit2 } from "lucide-react";
import { createPartnerApi, deletePartnerApi, getPartnerApi, updatePartnerApi } from "@/apis/apiHelpers";
import Pagination from "../Pagination";

interface AdvancePartnersProps {
  onNext?: (eventId?: string | number) => void;
  onPrevious?: () => void;
  currentStep?: number;
  totalSteps?: number;
  eventId?: string | number;
}

interface Partner {
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

function AdvancePartners({
  onNext,
  onPrevious,
  currentStep = 1,
  totalSteps = 5,
  eventId,
}: AdvancePartnersProps) {
  console.log('-------event id---------------', eventId)
  const [eventUsers, setEventUsers] = useState<Partner[]>([]);
  console.log('event partners-------', eventUsers)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [newPartner, setNewPartner] = useState({
    name: "",
    image: "",
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editPartnerData, setEditPartnerData] = useState({
    name: "",
    image: "",
  });
  const [editSelectedImageFile, setEditSelectedImageFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(eventUsers.length / itemsPerPage);

  // Compute partners for current page
  const currentPartners = eventUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetchPartners = async () => {
      if (!eventId) return;

      try {
        setIsLoading(true);
        const response = await getPartnerApi(eventId);

        if (response.status === 200) {
          const partnersData = response.data.data.map((item: any) => ({
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
          console.log('partner data-------', partnersData)

          setEventUsers(partnersData);
        } else {
          showNotification("Failed to fetch partners", "error");
        }
      } catch (error: any) {
        console.log("💥 GET partners error:", error);
        showNotification("Network error: Cannot fetch partners", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartners();
  }, [eventId]);

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

  const handleDeleteUser = async (user: Partner) => {
    if (!window.confirm("Are you sure you want to delete this partner?")) return;

    try {
      setIsLoading(true);

      const response = await deletePartnerApi(eventId!, user.id);

      if (response.status === 200 || response.status === 204) {
        setEventUsers(prev => prev.filter(u => u.id !== user.id));
        showNotification("Partner deleted successfully!", "success");
      } else {
        showNotification("Failed to delete partner", "error");
      }
    } catch (error: any) {
      console.error("Delete partner error:", error);
      showNotification(
        error.response?.data?.message || "Network error: Cannot delete partner",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: Partner) => {
    setEditingPartner(user);
    setEditPartnerData({
      name: user.attributes.name,
      image: user.attributes.image_url || "",
    });
    setEditSelectedImageFile(null);
    setEditModalOpen(true);
  };

  const handleAddPartner = async () => {
    console.log("🚀 START: handleAddPartner");

    if (!newPartner.name) {
      showNotification("Please fill the partner name!", "error");
      return;
    }

    console.log("✅ Validation passed");

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("partner[name]", newPartner.name);

      if (selectedImageFile) {
        formData.append("partner[image]", selectedImageFile);
      }

      console.log("📤 Sending formData:", {
        name: newPartner.name,
        image: selectedImageFile?.name,
      });

      const response = await createPartnerApi(eventId, formData);

      console.log("📨 Axios response:", response);

      if (response.status === 201 || response.status === 200) {
        const result = response.data;

        const newPartnerData: Partner = {
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

        setEventUsers((prev) => [...prev, newPartnerData]);
        showNotification("Partner added successfully!", "success");

        setNewPartner({
          name: "",
          image: "",
        });
        setSelectedImageFile(null);
        setAddModalOpen(false);
      }
    } catch (error: any) {
      console.log("💥 Axios error", error);

      if (error.response) {
        showNotification(
          error.response.data?.message || "Failed to add partner",
          "error"
        );
      } else {
        showNotification("Network error: Cannot connect to server.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePartner = async () => {
    if (!editingPartner) return;

    if (!editPartnerData.name) {
      showNotification("Please fill the partner name!", "error");
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("partner[name]", editPartnerData.name);

      if (editSelectedImageFile) {
        formData.append("partner[image]", editSelectedImageFile);
      }

      const response = await updatePartnerApi(eventId!, editingPartner.id, formData);

      if (response.status === 200) {
        const updated = response.data.data;
        setEventUsers(prev =>
          prev.map(u =>
            u.id === editingPartner.id
              ? {
                  ...u,
                  attributes: {
                    ...u.attributes,
                    name: updated.attributes.name,
                    image: updated.attributes.image_url,
                    image_url: updated.attributes.image_url,
                  },
                }
              : u
          )
        );

        showNotification("Partner updated successfully!", "success");
        setEditModalOpen(false);
        setEditingPartner(null);
      }
    } catch (error: any) {
      console.error("Update partner error:", error);
      showNotification(
        error.response?.data?.message || "Network error: Cannot update partner",
        "error"
      );
    } finally {
      setIsLoading(false);
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

  const UserAvatar = ({ user }: { user: Partner }) => (
    <img
      src={user.attributes.image || user.attributes.image_url || "https://i.pravatar.cc/100?img=10"}
      alt={user.attributes.name}
      className="w-10 h-10 rounded-full object-cover"
    />
  );

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
            Advance Partners
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
            <h1 className="text-2xl font-semibold text-gray-900">Partners</h1>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
              {eventUsers.length} Partners
            </span>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {isLoading ? "Loading..." : "Add Partner"}
          </button>
        </div>

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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentPartners.map((user, index) => (
                <tr key={user.id} className={index % 2 ? "bg-gray-50" : "bg-white"}>
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
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

        {/* Add Partner Modal */}
        {addModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => !isLoading && setAddModalOpen(false)}
          >
            <div
              className="bg-white p-6 rounded-xl w-[80%] max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Add Partner
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter partner name"
                    value={newPartner.name}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, name: e.target.value })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Upload Pic (max 800KB)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          if (file.size > 800 * 1024) {
                            showNotification("Image must be less than 800KB", "error");
                            return;
                          }
                          setSelectedImageFile(file);
                        }
                      }}
                      className="w-full p-2.5 border border-gray-300 rounded-md text-sm text-gray-600 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {selectedImageFile && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {selectedImageFile.name} ({(selectedImageFile.size / 1024).toFixed(0)} KB)
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setAddModalOpen(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPartner}
                  disabled={isLoading}
                  className="flex-1 bg-blue-900 hover:bg-blue-950 text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  {isLoading ? "Adding Partner..." : "Add Partner"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Partner Modal */}
        {editModalOpen && editingPartner && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => !isLoading && setEditModalOpen(false)}
          >
            <div
              className="bg-white p-6 rounded-xl w-[80%] max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Edit Partner
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter partner name"
                    value={editPartnerData.name}
                    onChange={(e) => setEditPartnerData({ ...editPartnerData, name: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Upload Pic (max 800KB)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (file.size > 800 * 1024) {
                          showNotification("Image must be less than 800KB", "error");
                          return;
                        }
                        setEditSelectedImageFile(file);
                      }
                    }}
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm text-gray-600 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {editSelectedImageFile && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {editSelectedImageFile.name} ({(editSelectedImageFile.size / 1024).toFixed(0)} KB)
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setEditModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg">
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePartner}
                  className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-lg"
                >
                  {isLoading ? "Updating..." : "Update Partner"}
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
          className="cursor-pointer px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          ← Previous
        </button>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          className="mt-4"
        />

        <button
          onClick={handleNext}
          className="cursor-pointer px-6 py-2 rounded-lg text-white transition-colors font-medium bg-slate-800 hover:bg-slate-900"
        >
          Next →
        </button>
      </div>

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

export default AdvancePartners;