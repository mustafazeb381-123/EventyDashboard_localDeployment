import { useEffect, useState } from "react";
import { Trash2, Plus, ChevronLeft, Check, Edit2 } from "lucide-react";
import { createSpeakerApi } from "@/apis/apiHelpers";

interface AdvanceSpeakerProps {
  onNext?: (eventId?: string | number) => void;
  onPrevious?: () => void;
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
  currentStep = 1,
  totalSteps = 5,
  eventId,
}: AdvanceSpeakerProps) {
  const [eventUsers, setUsers] = useState<Speaker[]>([]);
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
  const [isLoading, setIsLoading] = useState(false);

  // API Configuration - FIXED URL (removed /en/ and corrected domain)
  const API_BASE_URL = "https://scceventy.dev/en/api_dashboard/v1";
  
  const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjozNiwiZXhwIjoxNzYzNTQyNDk0LCJpYXQiOjE3NjM0NTYwOTR9.zn0LTnoJSikmEPk-9ydHHGVrnJ2YrF813zT2vkbGpSY";
  const EVENT_ID = 100;

  // Use static data for now - REMOVED API CALLS FOR GET, UPDATE, DELETE
  const staticUsers = [
    {
      id: "1",
      attributes: {
        name: "Ethan Carter",
        description: "Discover a hidden gem in this lively city...",
        organization: "Scc",
        image: "https://i.pravatar.cc/100?img=1",
      },
    },
    {
      id: "2",
      attributes: {
        name: "Luca Thompson",
        description: "Nestled in the heart of the city, this place is perfect...",
        organization: "Mothmerat",
        image: "https://i.pravatar.cc/100?img=2",
      },
    },
  ];

  useEffect(() => {
    setUsers(staticUsers);
  }, []);

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

  const handleDeleteUser = (user: Speaker) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    // Local deletion only - no API call
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    showNotification("User deleted successfully!", "success");
  };

  const handleEditUser = (user: Speaker) => {
    // Local edit only - no API call for now
    const updatedName = prompt("Enter new name:", user.attributes.name);
    if (updatedName) {
      setUsers(prev => prev.map(u => 
        u.id === user.id 
          ? { ...u, attributes: { ...u.attributes, name: updatedName } }
          : u
      ));
      showNotification("Speaker updated successfully!", "success");
    }
  };

  // ONLY CREATE API IS CALLED - FIXED VERSION
const handleAddSpeaker = async () => {
  console.log("🚀 START: handleAddSpeaker");

  if (!newSpeaker.name || !newSpeaker.organization) {
    showNotification("Please fill all required fields!", "error");
    return;
  }

  console.log("✅ Validation passed");

  try {
    setIsLoading(true);

    // ✅ CREATE FORM DATA HERE (this was missing)
    const formData = new FormData();
    formData.append("speaker[name]", newSpeaker.name);
    formData.append("speaker[description]", newSpeaker.description);
    formData.append("speaker[organization]", newSpeaker.organization);

    if (selectedImageFile) {
      formData.append("speaker[image]", selectedImageFile);
    }

    console.log("📤 Sending formData:", {
      name: newSpeaker.name,
      description: newSpeaker.description,
      organization: newSpeaker.organization,
      image: selectedImageFile?.name,
    });

    // ✅ CALL API HELPER (correct usage)
    const response = await createSpeakerApi(EVENT_ID, formData);

    console.log("📨 Axios response:", response);

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

      setUsers((prev) => [...prev, newSpeakerData]);
      showNotification("Speaker added successfully!", "success");

      // Reset UI
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

  const UserAvatar = ({ user }: { user: Speaker }) => (
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
            Advance Speaker
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
            <h1 className="text-2xl font-semibold text-gray-900">Speakers</h1>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
              {eventUsers.length} Speakers
            </span>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {isLoading ? "Loading..." : "Add Speaker"}
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

        {/* Add Speaker Modal */}
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
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                  onClick={handleAddSpeaker}
                  disabled={isLoading}
                  className="flex-1 bg-blue-900 hover:bg-blue-950 text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  {isLoading ? "Adding Speaker..." : "Add Speaker"}
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

        <span className="text-sm text-gray-500">
          Step {currentStep + 1} of {totalSteps}
        </span>

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

export default AdvanceSpeaker;