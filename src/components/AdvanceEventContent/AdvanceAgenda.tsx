import { useEffect, useState } from "react";
import { Trash2, Plus, ChevronLeft, Check, Edit2, X } from "lucide-react";
import { createAgendaApi, getAgendaApi, updateAgendaApi, deleteAgendaApi } from "@/apis/apiHelpers";

interface AdvanceAgendaProps {
  onNext?: (eventId?: string | number) => void;
  onPrevious?: () => void;
  currentStep?: number;
  totalSteps?: number;
  eventId?: string | number;
}

function AdvanceAgenda({
  onNext,
  onPrevious,
  currentStep = 1,
  totalSteps = 5,
  eventId,
}: AdvanceAgendaProps) {
  const [eventUsers, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [newSession, setNewSession] = useState({
    title: "",
    date: "",
    timeFrom: "",
    timeTo: "",
    location: "",
    display: true, // This controls visibility on normal screen
    requiredEnrolment: false,
    paid: false,
    price: "",
    onlinePayment: false,
    cashPayment: false,
  });
  const [selectedSpeakers, setSelectedSpeakers] = useState<string[]>([]);
  console.log('selected speaker-----', selectedSpeakers)
  const [availableSpeakers, setAvailableSpeakers] = useState<any[]>([]);

  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await getAgendaApi(eventId);
        const agendas = response.data.data.map((item: any) => ({
          id: item.id,
          title: item.attributes.title,
          startTime: item.attributes.formatted_time.start_time,
          endTime: item.attributes.formatted_time.end_time,
          location: item.attributes.location,
          type: item.attributes.agenda_type,
          sponsors: item.attributes.speakers || [],
          display: item.attributes.display !== false, // Default to true if not specified
          require_enroll: item.attributes.require_enroll || false,
          pay_by: item.attributes.pay_by || "free",
          price: item.attributes.price || "",
          currency: item.attributes.currency || "USD",
          start_date: item.attributes.formatted_time.start_date,
          end_date: item.attributes.formatted_time.end_date,
          speaker_ids: item.attributes.speaker_ids || []
        }));
        setSessions(agendas);

        // Extract all unique speakers from sessions for the modal
        const allSpeakers: any[] = [];
        agendas.forEach((agenda: any) => {
          agenda.sponsors.forEach((speaker: any) => {
            if (!allSpeakers.find(s => s.id === speaker.id)) {
              allSpeakers.push(speaker);
            }
          });
        });
        setAvailableSpeakers(allSpeakers);
        
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    if (eventId) {
      fetchEventData();
    }
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

  const handleDeleteSession = async (session: any) => {
    if (!window.confirm("Are you sure you want to delete this session?"))
      return;
    
    try {
      // Call the delete API
      const response = await deleteAgendaApi(eventId, session.id);
      
      // Check if the delete was successful (204 No Content)
      if (response.status === 204) {
        // Remove from local state
        setSessions((prev) => prev.filter((s) => s.id !== session.id));
        // Also remove from selected users if it was selected
        setSelectedUsers((prev) => prev.filter((id) => id !== session.id));
        showNotification("Session deleted successfully!", "success");
      } else {
        showNotification("Failed to delete session!", "error");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      showNotification("Error deleting session!", "error");
    }
  };

  const handleEditSession = (session: any) => {
    setEditingSession(session);
    
    // Format date from the session data
    const startDate = session.start_date || session.startTime.split(' ')[0];
    
    setNewSession({
      title: session.title,
      date: startDate,
      timeFrom: session.startTime.split(' ')[1]?.substring(0, 5) || "",
      timeTo: session.endTime.split(' ')[1]?.substring(0, 5) || "",
      location: session.location,
      display: session.display, // Set the current display status
      requiredEnrolment: session.require_enroll,
      paid: session.pay_by !== "free",
      price: session.price || "",
      onlinePayment: session.pay_by === "online",
      cashPayment: session.pay_by === "cash",
    });
    
    // Set selected speakers from the session
    setSelectedSpeakers(session.speaker_ids?.map((id: number) => id.toString()) || []);
    setEditModalOpen(true);
  };

  const handleUpdateSession = async () => {
    if (!editingSession) return;

    // Prepare payload without display field if API doesn't support it
    const payload: any = {
      agenda: {
        title: newSession.title,
        agenda_type: "presentation",
        location: newSession.location,
        start_time: `${newSession.date} ${newSession.timeFrom}:00`,
        end_time: `${newSession.date} ${newSession.timeTo}:00`,
        auto_accept_users_questions: true,
        require_enroll: newSession.requiredEnrolment,
        pay_by: newSession.paid ? (newSession.onlinePayment ? "online" : "cash") : "free",
        price: newSession.paid ? newSession.price : "0",
        currency: "USD",
        speaker_ids: selectedSpeakers.map(id => parseInt(id))
      }
    };

    // Only include display field if API supports it
    // If API doesn't support display field, we'll handle it locally
    // payload.agenda.display = newSession.display;

    try {
      const response = await updateAgendaApi(eventId, editingSession.id, payload);
      console.log('Update response:', response.data);
      
      // Update local state - we handle display locally if API doesn't support it
      setSessions(prev => prev.map(session => 
        session.id === editingSession.id 
          ? {
              ...session,
              title: newSession.title,
              location: newSession.location,
              startTime: `${newSession.date} ${newSession.timeFrom}:00 +0300`,
              endTime: `${newSession.date} ${newSession.timeTo}:00 +0300`,
              display: newSession.display, // Update display status locally
              require_enroll: newSession.requiredEnrolment,
              pay_by: newSession.paid ? (newSession.onlinePayment ? "online" : "cash") : "free",
              price: newSession.price,
              sponsors: availableSpeakers.filter(speaker => selectedSpeakers.includes(speaker.id.toString())),
              speaker_ids: selectedSpeakers.map(id => parseInt(id))
            }
          : session
      ));
      
      showNotification("Session updated successfully!", "success");
      setEditModalOpen(false);
      setEditingSession(null);
      resetForm();
    } catch (error) {
      console.error("Error updating session:", error);
      showNotification("Error updating session!", "error");
    }
  };

  const handleAddSession = async () => {
    if (!newSession.title || !newSession.date || !newSession.timeFrom || !newSession.timeTo) {
      showNotification("Please fill all required fields!", "error");
      return;
    }

    const payload: any = {
      agenda: {
        title: newSession.title,
        agenda_type: "presentation",
        location: newSession.location,
        start_time: `${newSession.date} ${newSession.timeFrom}:00`,
        end_time: `${newSession.date} ${newSession.timeTo}:00`,
        auto_accept_users_questions: true,
        require_enroll: newSession.requiredEnrolment,
        pay_by: newSession.paid ? (newSession.onlinePayment ? "online" : "cash") : "free",
        price: newSession.paid ? newSession.price : "0",
        currency: "USD",
        speaker_ids: selectedSpeakers.map(id => parseInt(id))
      }
    };

    // Only include display field if API supports it
    // payload.agenda.display = newSession.display;

    try {
      const response = await createAgendaApi(eventId, payload);
      console.log('Create response:', response.data);

      // Add to local state
      const newSessionData = {
        id: response.data.data.id,
        title: newSession.title,
        startTime: `${newSession.date} ${newSession.timeFrom}:00 +0300`,
        endTime: `${newSession.date} ${newSession.timeTo}:00 +0300`,
        location: newSession.location,
        type: "presentation",
        sponsors: availableSpeakers.filter(speaker => selectedSpeakers.includes(speaker.id.toString())),
        display: newSession.display, // Set display status
        require_enroll: newSession.requiredEnrolment,
        pay_by: newSession.paid ? (newSession.onlinePayment ? "online" : "cash") : "free",
        price: newSession.price,
        speaker_ids: selectedSpeakers.map(id => parseInt(id))
      };

      setSessions(prev => [...prev, newSessionData]);
      showNotification("Session added successfully!", "success");
      resetForm();
      setAddModalOpen(false);
    } catch (error) {
      console.error("Error creating session:", error);
      showNotification("Error creating session!", "error");
    }
  };

  const resetForm = () => {
    setNewSession({
      title: "",
      date: "",
      timeFrom: "",
      timeTo: "",
      location: "",
      display: true,
      requiredEnrolment: false,
      paid: false,
      price: "",
      onlinePayment: false,
      cashPayment: false,
    });
    setSelectedSpeakers([]);
  };

  const toggleSpeakerSelection = (id: string) => {
    setSelectedSpeakers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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

  const closeModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setEditingSession(null);
    resetForm();
  };

  // Filter sessions based on display status for the table
  const displayedSessions = sessions.filter(session => session.display);

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${notification.type === "success"
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
          <h2 className="text-xl font-semibold text-gray-900">Agenda</h2>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === currentStep
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
                  className={`w-8 h-0.5 mx-1 ${step < currentStep ? "bg-pink-500" : "bg-gray-300"
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
            <h1 className="text-2xl font-semibold text-gray-900">Sessions</h1>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
              {displayedSessions.length} of {sessions.length} sessions visible
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
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      sessions.length > 0 &&
                      selectedUsers.length === sessions.length
                    }
                    className="w-4 h-4"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Start time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  End time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Speakers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Display
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessions.map((session, index) => (
                <tr
                  key={session.id}
                  className={index % 2 ? "bg-gray-50" : "bg-white"}
                  style={{ 
                    opacity: session.display ? 1 : 0.6,
                    backgroundColor: session.display ? '' : '#f9fafb'
                  }}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(session.id)}
                      onChange={() => handleSelectUser(session.id)}
                      className="w-4 h-4"
                    />
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {session.title}
                    {!session.display && (
                      <span className="ml-2 text-xs text-gray-500">(Hidden)</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {session.startTime}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {session.endTime}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {session.location}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {session.type || "-"}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      {session.sponsors.slice(0, 5).map((sponsor: any) => (
                        <img
                          key={sponsor.id}
                          src={sponsor.image_url || "https://i.pravatar.cc/100"}
                          alt={sponsor.name}
                          className="w-8 h-8 rounded-full border-2 border-white object-cover"
                          title={sponsor.name}
                        />
                      ))}
                      {session.sponsors.length > 5 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium">
                          +{session.sponsors.length - 5}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${session.display ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {session.display ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteSession(session)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditSession(session)}
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

        {/* Add/Edit Session Modal */}
        {(addModalOpen || editModalOpen) && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeModals}
          >
            <div
              className="bg-slate-50 p-8 rounded-3xl w-[80%] max-h-[90vh] overflow-y-auto shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editModalOpen ? "Edit Session" : "Add Sessions"}
                </h2>
                <X 
                  onClick={closeModals} 
                  size={24} 
                  color="#000" 
                  className="cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Left Side - Input Fields */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1.5">
                      Title *
                    </label>
                    <input
                      type="text"
                      placeholder="Text here"
                      value={newSession.title}
                      onChange={(e) =>
                        setNewSession({ ...newSession, title: e.target.value })
                      }
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1.5">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newSession.date}
                      onChange={(e) =>
                        setNewSession({ ...newSession, date: e.target.value })
                      }
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-1.5">
                        Time from *
                      </label>
                      <input
                        type="time"
                        value={newSession.timeFrom}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            timeFrom: e.target.value,
                          })
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-1.5">
                        To *
                      </label>
                      <input
                        type="time"
                        value={newSession.timeTo}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            timeTo: e.target.value,
                          })
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Text here"
                      value={newSession.location}
                      onChange={(e) =>
                        setNewSession({
                          ...newSession,
                          location: e.target.value,
                        })
                      }
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Speaker Selection */}
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-3">
                      Speakers
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {availableSpeakers.length > 0 ? (
                        availableSpeakers.map((speaker) => (
                          <div
                            key={speaker.id}
                            onClick={() => toggleSpeakerSelection(speaker.id.toString())}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedSpeakers.includes(speaker.id.toString())
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                              }`}
                          >
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={selectedSpeakers.includes(speaker.id.toString())}
                              onChange={() => toggleSpeakerSelection(speaker.id.toString())}
                              className="w-4 h-4"
                              onClick={(e) => e.stopPropagation()}
                            />

                            {/* Profile + Name */}
                            <img
                              src={speaker.image_url || "https://i.pravatar.cc/100"}
                              alt={speaker.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {speaker.name}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-sm">
                          No speakers available. Add speakers first.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side - Toggle Buttons */}
                <div className="space-y-6">
                  {/* Display Toggle - Controls visibility on normal screen */}
                  <div className="flex items-center justify-between">
                    <label className="text-base font-medium text-gray-700">
                      Show on Normal Screen
                    </label>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={newSession.display}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            display: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${newSession.display ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-base font-medium text-gray-700">
                      Required Enrolment
                    </label>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={newSession.requiredEnrolment}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            requiredEnrolment: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${newSession.requiredEnrolment ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-base font-medium text-gray-700">
                      Paid Session
                    </label>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={newSession.paid}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            paid: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${newSession.paid ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    </div>
                  </div>

                  {/* Price and Payment Options */}
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1.5">
                      Price
                    </label>
                    <input
                      type="text"
                      placeholder="Price here"
                      value={newSession.price}
                      onChange={(e) =>
                        setNewSession({ ...newSession, price: e.target.value })
                      }
                      disabled={!newSession.paid}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                    {/* Payment Options */}
                    {newSession.paid && (
                      <div className="mt-3 flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={newSession.onlinePayment}
                            onChange={(e) =>
                              setNewSession({
                                ...newSession,
                                onlinePayment: true,
                                cashPayment: false,
                              })
                            }
                            className="text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            Online payment
                          </span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={newSession.cashPayment}
                            onChange={(e) =>
                              setNewSession({
                                ...newSession,
                                cashPayment: true,
                                onlinePayment: false,
                              })
                            }
                            className="text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            Cash payment
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={editModalOpen ? handleUpdateSession : handleAddSession}
                className="mt-6 w-full bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
              >
                <Plus className="w-4 h-4" /> 
                {editModalOpen ? "Update Session" : "Add Sessions"}
              </button>

              <div className="mt-4 text-sm text-gray-600">
                <p><strong>Note:</strong> "Show on Normal Screen" controls whether this session appears on the public event agenda. Uncheck to hide from attendees.</p>
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

export default AdvanceAgenda;



// import { useEffect, useState } from "react";
// import { Trash2, Plus, ChevronLeft, Check, Edit2 } from "lucide-react";
// import { createAgendaApi } from "@/apis/apiHelpers";

// interface AdvanceAgendaProps {
//   onNext?: (eventId?: string | number) => void;
//   onPrevious?: () => void;
//   currentStep?: number;
//   totalSteps?: number;
//   eventId?: string | number;
// }

// function AdvanceAgenda({
//   onNext,
//   onPrevious,
//   currentStep = 1,
//   totalSteps = 5,
//   eventId,
// }: AdvanceAgendaProps) {
//   const [eventUsers, setUsers] = useState<any[]>([]);
//   console.log('event user--------', eventUsers)
//   const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
//   const [addModalOpen, setAddModalOpen] = useState(false);
//   const [notification, setNotification] = useState<{
//     message: string;
//     type: "success" | "error";
//   } | null>(null);
//   const [newSession, setNewSession] = useState({
//     title: "",
//     date: "",
//     timeFrom: "",
//     timeTo: "",
//     location: "",
//     display: true,
//     requiredEnrolment: false,
//     paid: false,
//     price: "",
//   });
//   const [selectedSpeakers, setSelectedSpeakers] = useState<string[]>([]);

//   const staticUsers = [
//     {
//       id: "1",
//       attributes: {
//         name: "Ethan Carter",
//         organization: "Scc",
//         image: "https://i.pravatar.cc/100?img=1",
//       },
//     },
//     {
//       id: "2",
//       attributes: {
//         name: "Luca Thompson",
//         organization: "Mothmerat",
//         image: "https://i.pravatar.cc/100?img=2",
//       },
//     },
//     {
//       id: "3",
//       attributes: {
//         name: "Liam Anderson",
//         organization: "Sodic",
//         image: "https://i.pravatar.cc/100?img=3",
//       },
//     },
//   ];

//   const staticSessions = [
//     {
//       id: "1",
//       title: "Title One",
//       startTime: "2025-06-22 08:00:00 +0300",
//       endTime: "2025-06-22 10:00:00 +0300",
//       location: "Location Name",
//       type: "Type ID",
//       sponsors: ["1", "2", "3"],
//     },
//     {
//       id: "2",
//       title: "Title Two",
//       startTime: "2025-06-22 08:00:00 +0300",
//       endTime: "2025-06-22 10:00:00 +0300",
//       location: "Location Name",
//       type: "Type ID",
//       sponsors: ["1", "2", "3"],
//     },
//     {
//       id: "3",
//       title: "Title Three",
//       startTime: "2025-06-22 08:00:00 +0300",
//       endTime: "2025-06-22 10:00:00 +0300",
//       location: "Location Name",
//       type: "Type III",
//       sponsors: [],
//     },
//     {
//       id: "4",
//       title: "Title Four",
//       startTime: "2025-06-22 08:00:00 +0300",
//       endTime: "2025-06-22 10:00:00 +0300",
//       location: "Location Name",
//       type: "",
//       sponsors: ["1"],
//     },
//     {
//       id: "5",
//       title: "Title Five",
//       startTime: "2025-06-22 08:00:00 +0300",
//       endTime: "2025-06-22 10:00:00 +0300",
//       location: "Location Name",
//       type: "",
//       sponsors: [],
//     },
//   ];

//   const [sessions, setSessions] = useState<any[]>(staticSessions);

//   useEffect(() => {
//     setUsers(staticUsers);
//     setSessions(staticSessions);
//   }, []);

//   useEffect(() => {
//     if (notification) {
//       const timer = setTimeout(() => {
//         setNotification(null);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [notification]);

//   const showNotification = (message: string, type: "success" | "error") => {
//     setNotification({ message, type });
//   };

//   const handleSelectAll = (e: any) => {
//     if (e.target.checked) {
//       setSelectedUsers(sessions.map((s) => s.id));
//     } else {
//       setSelectedUsers([]);
//     }
//   };

//   const handleSelectUser = (id: string) => {
//     setSelectedUsers((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   const handleDeleteSession = (session: any) => {
//     if (!window.confirm("Are you sure you want to delete this session?"))
//       return;
//     setSessions((prev) => prev.filter((s) => s.id !== session.id));
//     showNotification("Session deleted successfully!", "success");
//   };

//   const handleAddSession = async () => {
//     // if (
//     //   !newSession.title ||
//     //   !newSession.date ||
//     //   !newSession.timeFrom ||
//     //   !newSession.timeTo
//     // ) {
//     //   showNotification("Please fill all required fields!", "error");
//     //   return;
//     // }

//   const payload = {
//   agenda: {
//     title: newSession.title,
//     agenda_type: "presentation",
//     location: newSession.location,
//     start_time: newSession.timeFrom,
//     end_time: newSession.timeTo,
//     auto_accept_users_questions: true,
//     require_enroll: false,
//     pay_by: newSession.paid,
//     price:newSession.price,
//     currency: "USD",
//     speaker_ids: [20, 21]
//   }
// };

// console.log('payload data----', payload)


// try {

//   const response = await createAgendaApi(eventId, payload)
//   console.log('respone of the post api', response.data)
  
// } catch (error) {
  
// }


//     // const session = {
//     //   id: Date.now().toString(),
//     //   title: newSession.title,
//     //   startTime: `${newSession.date} ${newSession.timeFrom}:00 +0300`,
//     //   endTime: `${newSession.date} ${newSession.timeTo}:00 +0300`,
//     //   location: newSession.location,
//     //   type: "",
//     //   sponsors: selectedSpeakers,
//     // };
//     // setSessions((prev) => [...prev, session]);
//     // showNotification("Session added successfully!", "success");
//     // setNewSession({
//     //   title: "",
//     //   date: "",
//     //   timeFrom: "",
//     //   timeTo: "",
//     //   location: "",
//     //   display: true,
//     //   requiredEnrolment: false,
//     //   paid: false,
//     //   price: "",
//     // });
//     // setSelectedSpeakers([]);
//     // setAddModalOpen(false);
//   };

//   const toggleSpeakerSelection = (id: string) => {
//     setSelectedSpeakers((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   const handleNext = () => {
//     if (onNext) {
//       onNext(eventId);
//     }
//   };

//   const handleBack = () => {
//     if (onPrevious) {
//       onPrevious();
//     }
//   };

//   return (
//     <div className="w-full bg-white p-6 rounded-2xl shadow-sm">
//       {/* Notification Toast */}
//       {notification && (
//         <div className="fixed top-4 right-4 z-[100] animate-slide-in">
//           <div
//             className={`px-6 py-3 rounded-lg shadow-lg ${
//               notification.type === "success"
//                 ? "bg-green-500 text-white"
//                 : "bg-red-500 text-white"
//             }`}
//           >
//             {notification.message}
//           </div>
//         </div>
//       )}

//       {/* Progress Stepper */}
//       <div className="flex items-center justify-between mb-8">
//         <div className="flex items-center gap-2">
//           <ChevronLeft className="text-gray-500" size={20} />
//           <h2 className="text-xl font-semibold text-gray-900">Agenda</h2>
//         </div>

//         {/* Progress Steps */}
//         <div className="flex items-center gap-2">
//           {Array.from({ length: totalSteps }).map((_, step) => (
//             <div key={step} className="flex items-center">
//               <div
//                 className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
//                   step === currentStep
//                     ? "border-pink-500 bg-white text-pink-500"
//                     : step < currentStep
//                     ? "bg-pink-500 border-pink-500 text-white"
//                     : "border-gray-300 bg-white text-gray-400"
//                 }`}
//               >
//                 {step < currentStep ? (
//                   <Check size={16} />
//                 ) : (
//                   <span className="text-sm font-medium">{step + 1}</span>
//                 )}
//               </div>
//               {step < totalSteps - 1 && (
//                 <div
//                   className={`w-8 h-0.5 mx-1 ${
//                     step < currentStep ? "bg-pink-500" : "bg-gray-300"
//                   }`}
//                 />
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="mx-auto">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-2">
//             <h1 className="text-2xl font-semibold text-gray-900">Sessions</h1>
//             <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
//               {sessions.length} sessions
//             </span>
//           </div>

//           <button
//             onClick={() => setAddModalOpen(true)}
//             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
//           >
//             <Plus className="w-4 h-4" />
//             Add Sessions
//           </button>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
//           <table className="min-w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="w-12 px-6 py-3 text-left">
//                   <input
//                     type="checkbox"
//                     onChange={handleSelectAll}
//                     checked={
//                       sessions.length > 0 &&
//                       selectedUsers.length === sessions.length
//                     }
//                     className="w-4 h-4"
//                   />
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Title
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Start time
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   End time
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Location
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Type
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Sponsors
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {sessions.map((session, index) => (
//                 <tr
//                   key={session.id}
//                   className={index % 2 ? "bg-gray-50" : "bg-white"}
//                 >
//                   <td className="px-6 py-4">
//                     <input
//                       type="checkbox"
//                       checked={selectedUsers.includes(session.id)}
//                       onChange={() => handleSelectUser(session.id)}
//                       className="w-4 h-4"
//                     />
//                   </td>

//                   <td className="px-6 py-4 text-sm font-medium text-gray-900">
//                     {session.title}
//                   </td>

//                   <td className="px-6 py-4 text-sm text-gray-600">
//                     {session.startTime}
//                   </td>

//                   <td className="px-6 py-4 text-sm text-gray-600">
//                     {session.endTime}
//                   </td>

//                   <td className="px-6 py-4 text-sm text-gray-600">
//                     {session.location}
//                   </td>

//                   <td className="px-6 py-4 text-sm text-gray-600">
//                     {session.type || "-"}
//                   </td>

//                   <td className="px-6 py-4">
//                     <div className="flex -space-x-2">
//                       {session.sponsors.slice(0, 5).map((sponsorId: string) => {
//                         const sponsor = eventUsers.find(
//                           (u) => u.id === sponsorId
//                         );
//                         return sponsor ? (
//                           <img
//                             key={sponsorId}
//                             src={sponsor.attributes.image}
//                             alt={sponsor.attributes.name}
//                             className="w-8 h-8 rounded-full border-2 border-white object-cover"
//                           />
//                         ) : null;
//                       })}
//                     </div>
//                   </td>

//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => handleDeleteSession(session)}
//                         className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                       <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg">
//                         <Edit2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Add Session Modal */}
//         {addModalOpen && (
//           <div
//             className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
//             onClick={() => setAddModalOpen(false)}
//           >
//             <div
//               className="bg-slate-50 p-8 rounded-3xl w-[80%] shadow-lg"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <h2 className="text-xl font-semibold mb-6 text-gray-800">
//                 Add Sessions
//               </h2>

//               <div className="grid grid-cols-2 gap-8">
//                 {/* Left Side - Input Fields */}
//                 <div className="space-y-6">
//                   <div>
//                     <label className="block text-base font-medium text-gray-700 mb-1.5">
//                       Title
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Text here"
//                       value={newSession.title}
//                       onChange={(e) =>
//                         setNewSession({ ...newSession, title: e.target.value })
//                       }
//                       className="w-full p-2.5 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-base font-medium text-gray-700 mb-1.5">
//                       Date
//                     </label>
//                     <input
//                       type="date"
//                       value={newSession.date}
//                       onChange={(e) =>
//                         setNewSession({ ...newSession, date: e.target.value })
//                       }
//                       className="w-full p-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-base font-medium text-gray-700 mb-1.5">
//                         Time from
//                       </label>
//                       <input
//                         type="time"
//                         value={newSession.timeFrom}
//                         onChange={(e) =>
//                           setNewSession({
//                             ...newSession,
//                             timeFrom: e.target.value,
//                           })
//                         }
//                         className="w-full p-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-base font-medium text-gray-700 mb-1.5">
//                         To
//                       </label>
//                       <input
//                         type="time"
//                         value={newSession.timeTo}
//                         onChange={(e) =>
//                           setNewSession({
//                             ...newSession,
//                             timeTo: e.target.value,
//                           })
//                         }
//                         className="w-full p-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-base font-medium text-gray-700 mb-1.5">
//                       Location
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Text here"
//                       value={newSession.location}
//                       onChange={(e) =>
//                         setNewSession({
//                           ...newSession,
//                           location: e.target.value,
//                         })
//                       }
//                       className="w-full p-2.5 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>
//                   {/* Speaker Selection */}
// <div>
//   <label className="block text-base font-medium text-gray-700 mb-3">
//     Speakers
//   </label>
//   <div className="flex gap-3">
//     {eventUsers.map((user) => (
//       <div
//         key={user.id}
//         onClick={() => toggleSpeakerSelection(user.id)}
//         className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
//           selectedSpeakers.includes(user.id)
//             ? "border-blue-500 bg-blue-50"
//             : "border-gray-200 hover:border-gray-300"
//         }`}
//       >
//         {/* Checkbox */}
//         <input
//           type="checkbox"
//           checked={selectedSpeakers.includes(user.id)}
//           onChange={() => toggleSpeakerSelection(user.id)}
//           className="w-4 h-4"
//           onClick={(e) => e.stopPropagation()} // Prevent div click
//         />

//         {/* Profile + Name */}
//         <img
//           src={user.attributes.image}
//           alt={user.attributes.name}
//           className="w-10 h-10 rounded-full object-cover"
//         />
//         <span className="text-sm font-medium text-gray-700">
//           {user.attributes.name}
//         </span>
//       </div>
//     ))}
//   </div>
// </div>

//                 </div>

//                 {/* Right Side - Toggle Buttons and Speaker Selection */}
//                 <div className="space-y-6">
//                   {/* Toggle Buttons */}
//                   <div className="flex items-center justify-between">
//                     <label className="text-base font-medium text-gray-700">
//                       Display
//                     </label>
//                     <div className="relative">
//                       <input
//                         type="checkbox"
//                         checked={newSession.display}
//                         onChange={(e) =>
//                           setNewSession({
//                             ...newSession,
//                             display: e.target.checked,
//                           })
//                         }
//                         className="sr-only peer"
//                       />
//                       <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <label className="text-base font-medium text-gray-700">
//                       Required Enrolment
//                     </label>
//                     <div className="relative">
//                       <input
//                         type="checkbox"
//                         checked={newSession.requiredEnrolment}
//                         onChange={(e) =>
//                           setNewSession({
//                             ...newSession,
//                             requiredEnrolment: e.target.checked,
//                           })
//                         }
//                         className="sr-only peer"
//                       />
//                       <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <label className="text-base font-medium text-gray-700">
//                       Paid
//                     </label>
//                     <div className="relative">
//                       <input
//                         type="checkbox"
//                         checked={newSession.paid}
//                         onChange={(e) =>
//                           setNewSession({
//                             ...newSession,
//                             paid: e.target.checked,
//                           })
//                         }
//                         className="sr-only peer"
//                       />
//                       <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//                     </div>
//                   </div>

//                   {/* Price and Payment Options */}
//                   <div>
//                     <label className="block text-base font-medium text-gray-700 mb-1.5">
//                       Price
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Price here"
//                       value={newSession.price}
//                       onChange={(e) =>
//                         setNewSession({ ...newSession, price: e.target.value })
//                       }
//                       // disabled={!newSession.paid}
//                       className="w-full p-2.5 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
//                     />
//                     {/* Payment Options */}
//                     <div className="mt-3 flex items-center gap-4">
//                       <label className="flex items-center gap-2">
//                         <input
//                           type="checkbox"
//                           checked={newSession.onlinePayment}
//                           onChange={(e) =>
//                             setNewSession({
//                               ...newSession,
//                               onlinePayment: e.target.checked,
//                             })
//                           }
//                           className="text-blue-500 focus:ring-blue-500 rounded"
//                         />
//                         <span className="text-sm text-gray-700">
//                           Online payment
//                         </span>
//                       </label>

//                       <label className="flex items-center gap-2">
//                         <input
//                           type="checkbox"
//                           checked={newSession.cashPayment}
//                           onChange={(e) =>
//                             setNewSession({
//                               ...newSession,
//                               cashPayment: e.target.checked,
//                             })
//                           }
//                           className="text-blue-500 focus:ring-blue-500 rounded"
//                         />
//                         <span className="text-sm text-gray-700">
//                           Cash payment
//                         </span>
//                       </label>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <button
//                 onClick={handleAddSession}
//                 className="mt-6 w-full bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
//               >
//                 <Plus className="w-4 h-4" /> Add Sessions
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Navigation Footer */}
//       <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6">
//         <button
//           onClick={handleBack}
//           className="cursor-pointer px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
//         >
//           ← Previous
//         </button>

//         <span className="text-sm text-gray-500">
//           Step {currentStep + 1} of {totalSteps}
//         </span>

//         <button
//           onClick={handleNext}
//           className="cursor-pointer px-6 py-2 rounded-lg text-white transition-colors font-medium bg-slate-800 hover:bg-slate-900"
//         >
//           Next →
//         </button>
//       </div>

//       <style>{`
//         @keyframes slide-in {
//           from {
//             transform: translateX(100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateX(0);
//             opacity: 1;
//           }
//         }
//         .animate-slide-in {
//           animation: slide-in 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }

// export default AdvanceAgenda;
