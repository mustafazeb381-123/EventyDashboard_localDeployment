import { useEffect, useState } from "react";
import { Trash2, Plus, ChevronLeft, Check, Edit2 } from "lucide-react";

interface AdvanceAreaProps {
  onNext?: (eventId?: string | number) => void;
  onPrevious?: () => void;
  currentStep?: number;
  totalSteps?: number;
  eventId?: string | number;
}

function AdvanceArea({
  onNext,
  onPrevious,
  currentStep = 1,
  totalSteps = 5,
  eventId,
}: AdvanceAreaProps) {
  const [eventUsers, setUsers] = useState<any[]>([]);
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
    selectedTypes: [] as string[],
  });

  const staticUsers = [
    {
      id: "1",
      attributes: {
        name: "Ethan Carter",
        organization: "Scc",
        image: "https://i.pravatar.cc/100?img=1",
      },
    },
    {
      id: "2",
      attributes: {
        name: "Luca Thompson",
        organization: "Mothmerat",
        image: "https://i.pravatar.cc/100?img=2",
      },
    },
    {
      id: "3",
      attributes: {
        name: "Liam Anderson",
        organization: "Sodic",
        image: "https://i.pravatar.cc/100?img=3",
      },
    },
  ];

  const staticSessions = [
    {
      id: "1",
      title: "Name One",
      location: "Location Name",
      type: "Type-Id",
      travelNumber: "20",
    },
    {
      id: "2",
      title: "Name Two",
      location: "Location Name",
      type: "Type-Id",
      travelNumber: "40",
    },
    {
      id: "3",
      title: "Name Three",
      location: "Location Name",
      type: "Type-Id",
      travelNumber: "20",
    },
    {
      id: "4",
      title: "Name Four",
      location: "Location Name",
      type: "Type-Id",
      travelNumber: "60",
    },
    {
      id: "5",
      title: "Name Five",
      location: "Location Name",
      type: "Type-Id",
      travelNumber: "20",
    },
  ];

  const [sessions, setSessions] = useState<any[]>(staticSessions);

  useEffect(() => {
    setUsers(staticUsers);
    setSessions(staticSessions);
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

  const handleDeleteSession = (session: any) => {
    if (!window.confirm("Are you sure you want to delete this session?"))
      return;
    setSessions((prev) => prev.filter((s) => s.id !== session.id));
    showNotification("Session deleted successfully!", "success");
  };

  const handleAddSession = () => {
    if (!newSession.title || !newSession.location || !newSession.travelNumber) {
      showNotification("Please fill all required fields!", "error");
      return;
    }
    const session = {
      id: Date.now().toString(),
      title: newSession.title,
      location: newSession.location,
      type: "Type-Id",
      travelNumber: newSession.travelNumber,
    };
    setSessions((prev) => [...prev, session]);
    showNotification("Session added successfully!", "success");
    setNewSession({
      title: "",
      location: "",
      travelNumber: "",
      selectedTypes: [],
    });
    setAddModalOpen(false);
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
            <h1 className="text-xl font-medium text-gray-900">Area</h1>
            <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-md text-xs font-medium">
              {sessions.length} Session
            </span>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 text-pink-500 hover:text-pink-600 px-3 py-1.5 text-sm font-medium transition-colors"
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
                  Travel number
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((session) => (
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
                    {session.title}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600">
                    {session.location}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600">
                    {session.type || "Type-Id"}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600">
                    {session.travelNumber || "20"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDeleteSession(session)}
                        className="p-1.5 text-pink-500 hover:bg-pink-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-yellow-500 hover:bg-yellow-50 rounded-md transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Session Modal */}
        {addModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setAddModalOpen(false)}
          >
            <div
              className="bg-white p-8 rounded-2xl max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-6 text-gray-900">
                Add Sessions
              </h2>

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
                    Travel number
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User type:
                  </label>
                  <div className="flex gap-3">
                    {[
                      { id: "1", label: "Type 01" },
                      { id: "2", label: "Type 02" },
                      { id: "3", label: "Type 03" },
                      { id: "4", label: "Type 04" },
                      { id: "5", label: "Type 05" },
                    ].map((type) => (
                      <label
                        key={type.id}
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            newSession.selectedTypes?.includes(type.id) || false
                          }
                          onChange={(e) => {
                            const types = newSession.selectedTypes || [];
                            setNewSession({
                              ...newSession,
                              selectedTypes: e.target.checked
                                ? [...types, type.id]
                                : types.filter((t) => t !== type.id),
                            });
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                        />
                        <span className="text-xs text-gray-700">
                          {type.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddSession}
                className="mt-6 w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors text-sm"
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

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((page) => (
            <button
              key={page}
              className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                page === 1
                  ? "bg-pink-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}
          <span className="text-gray-400 px-2">...</span>
          <button className="w-8 h-8 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">
            10
          </button>
        </div>

        <button
          onClick={handleNext}
          className="cursor-pointer px-6 py-2 rounded-lg text-white transition-colors font-medium bg-gray-900 hover:bg-gray-800 text-sm"
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

export default AdvanceArea;
