import { useEffect, useState } from "react";
import { Trash2, Plus, ChevronLeft, Check, Edit2 } from "lucide-react";

interface AdvanceSpeakerProps {
  onNext?: () => void;
  onPrevious?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

function AdvanceSpeaker({
  onNext,
  onPrevious,
  currentStep = 1,
  totalSteps = 4,
}: AdvanceSpeakerProps) {
  const [eventUsers, setUsers] = useState<any[]>([]);
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
        description:
          "Nestled in the heart of the city, this place is perfect...",
        organization: "Mothmerat",
        image: "https://i.pravatar.cc/100?img=2",
      },
    },
    {
      id: "3",
      attributes: {
        name: "Liam Anderson",
        description:
          "This charming location offers a perfect blend of comfort...",
        organization: "Sodic",
        image: "https://i.pravatar.cc/100?img=3",
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

  const handleSelectAll = (e: any) => {
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

  const handleDeleteUser = (user: any) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    showNotification("User deleted successfully!", "success");
  };

  const handleAddSpeaker = () => {
    if (!newSpeaker.name || !newSpeaker.organization) {
      showNotification("Please fill all required fields!", "error");
      return;
    }
    const newUser = {
      id: Date.now().toString(),
      attributes: {
        ...newSpeaker,
        image: selectedImageFile
          ? URL.createObjectURL(selectedImageFile)
          : "https://i.pravatar.cc/100?img=10",
      },
    };
    setUsers((prev) => [...prev, newUser]);
    showNotification("Speaker added successfully!", "success");
    setNewSpeaker({ name: "", description: "", organization: "", image: "" });
    setSelectedImageFile(null);
    setAddModalOpen(false);
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    }
  };

  const handleBack = () => {
    if (onPrevious) {
      onPrevious();
    }
  };

  const UserAvatar = ({ user }: { user: any }) => (
    <img
      src={user.attributes.image}
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
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Speaker
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
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 text-yellow-600 hover:bg-red-50 rounded-lg"
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
            onClick={() => setAddModalOpen(false)}
          >
            <div
              className="bg-white p-6 rounded-xl w-[80%] max-w-7xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Add Speaker
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Text here"
                    value={newSpeaker.name}
                    onChange={(e) =>
                      setNewSpeaker({ ...newSpeaker, name: e.target.value })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Upload Pic
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files &&
                        setSelectedImageFile(e.target.files[0])
                      }
                      className="w-full p-2.5 border border-gray-300 rounded-md text-sm text-gray-600 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
                      PNG / JPEG / JPG (max 800 kb 500 x 500 px)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Text here"
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
                    Organization
                  </label>
                  <input
                    type="text"
                    placeholder="Text here"
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

              <button
                onClick={handleAddSpeaker}
                className="mt-5 w-full bg-blue-900 hover:bg-blue-950 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Speaker
              </button>
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
