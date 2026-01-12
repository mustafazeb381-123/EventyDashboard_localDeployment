import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  Plus,
  Trash2,
  Edit,
  X,
  MapPin,
  CreditCard,
  DollarSign,
  Loader2,
} from "lucide-react";
import {
  createAgendaApi,
  getAgendaApi,
  updateAgendaApi,
  deleteAgendaApi,
  getSpeakersApi,
} from "@/apis/apiHelpers";

type Speaker = {
  id: number;
  name: string;
  avatar: string | null;
};

type Session = {
  id: number | string;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  type: string;
  speakers: Speaker[];
  additionalSpeakers?: number;
  speakerName?: string;
  display?: boolean;
  require_enroll?: boolean;
  pay_by?: string;
  price?: string;
  currency?: string;
  speaker_ids?: number[];
  start_date?: string;
  end_date?: string;
};

type FormState = {
  title: string;
  date: Date | undefined;
  timeFrom: string; // HH:mm
  timeTo: string; // HH:mm
  location: string;
  speakers: number[];
  display: boolean;
  requiredEnrollment: boolean;
  paid: boolean;
  price: string;
  currency: string;
  onlinePayment: boolean;
  cashPayment: boolean;
};

function Agenda() {
  const location = useLocation();
  const params = useParams();
  
  // Get eventId from URL params or query string
  const urlParams = new URLSearchParams(location.search);
  const eventIdFromQuery = urlParams.get("eventId");
  const eventId = params.id || eventIdFromQuery || null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<(number | string)[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [availableSpeakers, setAvailableSpeakers] = useState<Speaker[]>([]);
  const [selectedSpeakers, setSelectedSpeakers] = useState<number[]>([]);
  
  // Loading states
  const [isFetchingAgendas, setIsFetchingAgendas] = useState(false);
  const [isFetchingSpeakers, setIsFetchingSpeakers] = useState(false);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [isUpdatingSession, setIsUpdatingSession] = useState(false);
  const [isDeletingSession, setIsDeletingSession] = useState<string | number | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [formData, setFormData] = useState<FormState>({
    title: "",
    date: undefined as Date | undefined,
    timeFrom: "09:00",
    timeTo: "17:00",
    location: "",
    speakers: [],
    display: true,
    requiredEnrollment: true,
    paid: false,
    price: "",
    currency: "USD",
    onlinePayment: false,
    cashPayment: false,
  });

  // Fetch speakers
  useEffect(() => {
    const fetchSpeakers = async () => {
      if (!eventId) return;

      setIsFetchingSpeakers(true);
      try {
        const response = await getSpeakersApi(eventId);
        if (response.status === 200) {
          const speakersData = response.data.data.map((item: any) => ({
            id: parseInt(item.id),
            name: item.attributes.name,
            avatar: item.attributes.image_url || null,
          }));
          setAvailableSpeakers(speakersData);
        }
      } catch (error) {
        console.error("Error fetching speakers:", error);
      } finally {
        setIsFetchingSpeakers(false);
      }
    };

    if (eventId) {
      fetchSpeakers();
    }
  }, [eventId]);

  // Fetch agendas
  useEffect(() => {
    const fetchAgendas = async () => {
      if (!eventId) return;

      setIsFetchingAgendas(true);
      try {
        const response = await getAgendaApi(eventId);
        console.log('response of get api-------', response);
        if (response.status === 200) {
          const agendas = response.data.data.map((item: any) => {
            const speakers = (item.attributes.speakers || []).map((speaker: any) => ({
              id: speaker.id || speaker.attributes?.id,
              name: speaker.attributes?.name || speaker.name,
              avatar: speaker.attributes?.image_url || speaker.image_url || null,
            }));

            return {
              id: item.id,
              title: item.attributes.title,
              startTime: item.attributes.formatted_time?.start_time || item.attributes.start_time,
              endTime: item.attributes.formatted_time?.end_time || item.attributes.end_time,
              location: item.attributes.location,
              type: item.attributes.agenda_type || "presentation",
              speakers: speakers,
              additionalSpeakers: speakers.length > 5 ? speakers.length - 5 : undefined,
              speakerName: speakers.length === 1 ? speakers[0].name : undefined,
              display: item.attributes.display !== false,
              require_enroll: item.attributes.require_enroll || false,
              pay_by: item.attributes.pay_by || "free",
              price: item.attributes.price || "",
              currency: item.attributes.currency || "USD",
              speaker_ids: item.attributes.speaker_ids || [],
              start_date: item.attributes.formatted_time?.start_date,
              end_date: item.attributes.formatted_time?.end_date,
            };
          });
          setSessions(agendas);
        }
      } catch (error) {
        console.error("Error fetching agendas:", error);
        showNotification("Failed to fetch sessions", "error");
      } finally {
        setIsFetchingAgendas(false);
      }
    };

    if (eventId) {
      fetchAgendas();
    }
  }, [eventId]);

  // Auto-hide notification
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
      setSelectedSessions(sessions.map((session) => session.id));
    } else {
      setSelectedSessions([]);
    }
  };

  const handleSelectSession = (sessionId: number | string) => {
    setSelectedSessions((prev) =>
      prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleSpeakerToggle = (speakerId: number) => {
    setSelectedSpeakers((prev: number[]) =>
      prev.includes(speakerId)
        ? prev.filter((id) => id !== speakerId)
        : [...prev, speakerId]
    );
  };

  const handleInputChange = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      date: undefined,
      timeFrom: "09:00",
      timeTo: "17:00",
      location: "",
      speakers: [],
      display: true,
      requiredEnrollment: true,
      paid: false,
      price: "",
      currency: "USD",
      onlinePayment: false,
      cashPayment: false,
    });
    setSelectedSpeakers([]);
    setIsEditMode(false);
    setEditingSession(null);
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setIsEditMode(true);
    
    // Parse date from startTime
    const startDate = session.start_date || (session.startTime ? session.startTime.split(' ')[0] : '');
    const timeFrom = session.startTime ? session.startTime.split(' ')[1]?.substring(0, 5) || "09:00" : "09:00";
    const timeTo = session.endTime ? session.endTime.split(' ')[1]?.substring(0, 5) || "17:00" : "17:00";
    
    // Determine payment settings
    const isPaid = session.pay_by !== "free";
    const onlinePayment = session.pay_by === "online";
    const cashPayment = session.pay_by === "cash";
    
    setFormData({
      title: session.title,
      date: startDate ? new Date(startDate) : undefined,
      timeFrom: timeFrom,
      timeTo: timeTo,
      location: session.location,
      speakers: session.speaker_ids || [],
      display: session.display !== false,
      requiredEnrollment: session.require_enroll || false,
      paid: isPaid,
      price: session.price || "",
      currency: session.currency || "USD",
      onlinePayment: onlinePayment,
      cashPayment: cashPayment,
    });
    
    setSelectedSpeakers(session.speaker_ids || []);
    setIsModalOpen(true);
  };

  const handleDeleteSession = async (session: Session) => {
    if (!eventId) {
      showNotification("Event ID is missing", "error");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this session?")) {
      return;
    }

    setIsDeletingSession(session.id);
    try {
      const response = await deleteAgendaApi(eventId, session.id);
      if (response.status === 204 || response.status === 200) {
        setSessions((prev) => prev.filter((s) => s.id !== session.id));
        setSelectedSessions((prev) => prev.filter((id) => id !== session.id));
        showNotification("Session deleted successfully!", "success");
      } else {
        showNotification("Failed to delete session", "error");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      showNotification("Error deleting session", "error");
    } finally {
      setIsDeletingSession(null);
    }
  };

  const handleSubmit = async () => {
    if (!eventId) {
      showNotification("Event ID is missing", "error");
      return;
    }

    // Validation
    if (!formData.title || !formData.date || !formData.timeFrom || !formData.timeTo) {
      showNotification("Please fill all required fields!", "error");
      return;
    }

    // Validation for paid sessions
    if (formData.paid) {
      if (!formData.onlinePayment && !formData.cashPayment) {
        showNotification("Please select a payment method for paid sessions!", "error");
        return;
      }
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        showNotification("Price must be greater than 0 for paid sessions!", "error");
        return;
      }
      if (formData.currency !== "USD" && formData.currency !== "SAR") {
        showNotification("Currency must be either USD or SAR!", "error");
        return;
      }
    }

    const dateStr = formData.date!.toISOString().split("T")[0];
    const payload: any = {
      agenda: {
        title: formData.title,
        agenda_type: "presentation",
        location: formData.location,
        start_time: `${dateStr} ${formData.timeFrom}:00`,
        end_time: `${dateStr} ${formData.timeTo}:00`,
        auto_accept_users_questions: true,
        require_enroll: formData.requiredEnrollment,
        pay_by: formData.paid ? (formData.onlinePayment ? "online" : "cash") : "free",
        price: formData.paid ? formData.price : "0",
        currency: formData.currency || "USD",
        speaker_ids: selectedSpeakers,
        display: formData.display,
      },
    };

    if (isEditMode && editingSession) {
      // Update existing session
      setIsUpdatingSession(true);
      try {
        const response = await updateAgendaApi(eventId, editingSession.id, payload);
        if (response.status === 200) {
          // Refresh sessions
          const refreshResponse = await getAgendaApi(eventId);
          if (refreshResponse.status === 200) {
            const agendas = refreshResponse.data.data.map((item: any) => {
              const speakers = (item.attributes.speakers || []).map((speaker: any) => ({
                id: speaker.id || speaker.attributes?.id,
                name: speaker.attributes?.name || speaker.name,
                avatar: speaker.attributes?.image_url || speaker.image_url || null,
              }));

              return {
                id: item.id,
                title: item.attributes.title,
                startTime: item.attributes.formatted_time?.start_time || item.attributes.start_time,
                endTime: item.attributes.formatted_time?.end_time || item.attributes.end_time,
                location: item.attributes.location,
                type: item.attributes.agenda_type || "presentation",
                speakers: speakers,
                additionalSpeakers: speakers.length > 5 ? speakers.length - 5 : undefined,
                speakerName: speakers.length === 1 ? speakers[0].name : undefined,
                display: item.attributes.display !== false,
                require_enroll: item.attributes.require_enroll || false,
                pay_by: item.attributes.pay_by || "free",
                price: item.attributes.price || "",
                currency: item.attributes.currency || "USD",
                speaker_ids: item.attributes.speaker_ids || [],
                start_date: item.attributes.formatted_time?.start_date,
                end_date: item.attributes.formatted_time?.end_date,
              };
            });
            setSessions(agendas);
          }
          showNotification("Session updated successfully!", "success");
    setIsModalOpen(false);
          resetForm();
        } else {
          showNotification("Failed to update session", "error");
        }
      } catch (error) {
        console.error("Error updating session:", error);
        showNotification("Error updating session", "error");
      } finally {
        setIsUpdatingSession(false);
      }
    } else {
      // Create new session
      setIsAddingSession(true);
      try {
        const response = await createAgendaApi(eventId, payload);
        if (response.status === 200 || response.status === 201) {
          // Refresh sessions
          const refreshResponse = await getAgendaApi(eventId);
          if (refreshResponse.status === 200) {
            const agendas = refreshResponse.data.data.map((item: any) => {
              const speakers = (item.attributes.speakers || []).map((speaker: any) => ({
                id: speaker.id || speaker.attributes?.id,
                name: speaker.attributes?.name || speaker.name,
                avatar: speaker.attributes?.image_url || speaker.image_url || null,
              }));

              return {
                id: item.id,
                title: item.attributes.title,
                startTime: item.attributes.formatted_time?.start_time || item.attributes.start_time,
                endTime: item.attributes.formatted_time?.end_time || item.attributes.end_time,
                location: item.attributes.location,
                type: item.attributes.agenda_type || "presentation",
                speakers: speakers,
                additionalSpeakers: speakers.length > 5 ? speakers.length - 5 : undefined,
                speakerName: speakers.length === 1 ? speakers[0].name : undefined,
                display: item.attributes.display !== false,
                require_enroll: item.attributes.require_enroll || false,
                pay_by: item.attributes.pay_by || "free",
                price: item.attributes.price || "",
                currency: item.attributes.currency || "USD",
                speaker_ids: item.attributes.speaker_ids || [],
                start_date: item.attributes.formatted_time?.start_date,
                end_date: item.attributes.formatted_time?.end_date,
              };
            });
            setSessions(agendas);
          }
          showNotification("Session added successfully!", "success");
          setIsModalOpen(false);
          resetForm();
        } else {
          showNotification("Failed to add session", "error");
        }
      } catch (error) {
        console.error("Error creating session:", error);
        showNotification("Error creating session", "error");
      } finally {
        setIsAddingSession(false);
      }
    }
  };

  const SpeakerAvatar = ({
    speaker,
    size = "w-8 h-8",
  }: {
    speaker: Speaker;
    size?: string;
  }) => {
    if (speaker.avatar) {
      return (
        <img
          src={speaker.avatar}
          alt={speaker.name}
          className={`${size} rounded-full object-cover`}
        />
      );
    }

    return (
      <div
        className={`${size} rounded-full bg-blue-100 flex items-center justify-center`}
      >
        <svg
          className="w-4 h-4 text-blue-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  };

  const SpeakersDisplay = ({ session }: { session: Session }) => {
    if (session.speakers.length > 5) {
      const visibleSpeakers = session.speakers.slice(0, 5);
      return (
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {visibleSpeakers.map((speaker, index) => (
              <SpeakerAvatar key={index} speaker={speaker} />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            +{session.additionalSpeakers}
          </span>
        </div>
      );
    } else if (session.speakerName) {
      return (
        <div className="flex items-center gap-3">
          <SpeakerAvatar speaker={session.speakers[0]} size="w-10 h-10" />
          <span className="text-sm font-medium text-gray-900">
            {session.speakerName}
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {session.speakers.map((speaker, index) => (
              <SpeakerAvatar key={index} speaker={speaker} />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            +{session.additionalSpeakers}
          </span>
        </div>
      );
    }
  };

  // Format time display
  const formatTimeDisplay = (timeString: string) => {
    if (!timeString) return { date: "", time: "" };
    const parts = timeString.split(" ");
    if (parts.length >= 2) {
      return { date: parts[0], time: parts[1] };
    }
    return { date: timeString, time: "" };
  };

  return (
    <>
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

      <div className="bg-white min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">Sessions</h1>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                {isFetchingAgendas ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  `${sessions.length} Sessions`
                )}
              </span>
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              disabled={isFetchingAgendas || !eventId}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Sessions
            </button>
          </div>

          {/* Loading State */}
          {isFetchingAgendas ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-pulse">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-6 py-3 text-left">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Speakers
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
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="h-3 bg-gray-300 rounded w-20"></div>
                          <div className="h-3 bg-gray-300 rounded w-16"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="h-3 bg-gray-300 rounded w-20"></div>
                          <div className="h-3 bg-gray-300 rounded w-16"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-300 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-300 rounded-full w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map((avatar) => (
                              <div
                                key={avatar}
                                className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white"
                              ></div>
                            ))}
                          </div>
                        </div>
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
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 border border-gray-200 rounded-lg">
              <p className="text-gray-500 mb-4">No sessions found</p>
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                disabled={!eventId}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add Your First Session
              </button>
            </div>
          ) : (
            /* Table */
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      onChange={handleSelectAll}
                        checked={sessions.length > 0 && selectedSessions.length === sessions.length}
                        disabled={isFetchingAgendas}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Speakers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                  {sessions.map((session, index) => {
                    const startTime = formatTimeDisplay(session.startTime);
                    const endTime = formatTimeDisplay(session.endTime);
                    return (
                  <tr
                    key={session.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        checked={selectedSessions.includes(session.id)}
                        onChange={() => handleSelectSession(session.id)}
                            disabled={isDeletingSession === session.id}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {session.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                          <div>{startTime.date}</div>
                          <div>{startTime.time}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                          <div>{endTime.date}</div>
                          <div>{endTime.time}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {session.location}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {session.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <SpeakersDisplay session={session} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteSession(session)}
                              disabled={isDeletingSession === session.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isDeletingSession === session.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                          <Trash2 className="w-4 h-4" />
                              )}
                        </button>
                            <button
                              onClick={() => handleEditSession(session)}
                              disabled={isDeletingSession === session.id}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          onClick={() => {
            if (!isAddingSession && !isUpdatingSession) {
              setIsModalOpen(false);
              resetForm();
            }
          }}
          className="fixed inset-0 bg-black/50 shadow-xl  backdrop-blur-sm flex overflow-y-autoitems-center justify-center p-4 z-50 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform animate-in zoom-in-95 duration-200"
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {isEditMode ? "Edit Session" : "Add Sessions"}
                </h2>
                <button
                  onClick={() => {
                    if (!isAddingSession && !isUpdatingSession) {
                      setIsModalOpen(false);
                      resetForm();
                    }
                  }}
                  disabled={isAddingSession || isUpdatingSession}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="text here"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      disabled={isAddingSession || isUpdatingSession}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={
                        formData.date
                          ? formData.date.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "date",
                          e.target.value ? new Date(e.target.value) : undefined
                        )
                      }
                      disabled={isAddingSession || isUpdatingSession}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time From
                      </label>
                      <input
                        type="time"
                        value={formData.timeFrom}
                        onChange={(e) =>
                          handleInputChange("timeFrom", e.target.value)
                        }
                        disabled={isAddingSession || isUpdatingSession}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To
                      </label>
                      <input
                        type="time"
                        value={formData.timeTo}
                        onChange={(e) =>
                          handleInputChange("timeTo", e.target.value)
                        }
                        disabled={isAddingSession || isUpdatingSession}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="location here"
                        value={formData.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        disabled={isAddingSession || isUpdatingSession}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:bg-gray-100"
                      />
                      <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Speakers */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Speakers
                      </label>
                      <span className="text-sm text-gray-500">
                        {selectedSpeakers.length} Added
                      </span>
                    </div>
                    <div className="space-y-3">
                      {isFetchingSpeakers ? (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading speakers...
                        </div>
                      ) : availableSpeakers.length > 0 ? (
                        availableSpeakers.map((speaker) => (
                        <div
                          key={speaker.id}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSpeakers.includes(speaker.id)}
                            onChange={() => handleSpeakerToggle(speaker.id)}
                              disabled={isAddingSession || isUpdatingSession}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                          />
                          <SpeakerAvatar speaker={speaker} size="w-10 h-10" />
                          <span className="text-sm font-medium text-gray-900">
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

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Toggle Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          Display
                        </span>
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.display}
                          onChange={(e) =>
                            handleInputChange("display", e.target.checked)
                          }
                          disabled={isAddingSession || isUpdatingSession}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${isAddingSession || isUpdatingSession ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          Required Enrollment
                        </span>
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.requiredEnrollment}
                          onChange={(e) =>
                            handleInputChange(
                              "requiredEnrollment",
                              e.target.checked
                            )
                          }
                          disabled={isAddingSession || isUpdatingSession}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${isAddingSession || isUpdatingSession ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          Paid
                        </span>
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.paid}
                          onChange={(e) => {
                            const updatedPaid = e.target.checked;
                            handleInputChange("paid", updatedPaid);
                            if (!updatedPaid) {
                              handleInputChange("onlinePayment", false);
                              handleInputChange("cashPayment", false);
                              handleInputChange("price", "");
                            }
                          }}
                          disabled={isAddingSession || isUpdatingSession}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${isAddingSession || isUpdatingSession ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                      </label>
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price {formData.paid && <span className="text-red-500">*</span>}
                    </label>
                    <div className="flex gap-2">
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                      placeholder="Price here"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                        disabled={!formData.paid || isAddingSession || isUpdatingSession}
                        className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                          !formData.paid || isAddingSession || isUpdatingSession
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                      />
                      <select
                        value={formData.currency}
                        onChange={(e) =>
                          handleInputChange("currency", e.target.value)
                        }
                        disabled={!formData.paid || isAddingSession || isUpdatingSession}
                        className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                          !formData.paid || isAddingSession || isUpdatingSession
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <option value="USD">USD</option>
                        <option value="SAR">SAR</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  {formData.paid && (
                  <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Payment Method:</p>
                    <div className="flex items-center gap-3">
                      <input
                          type="radio"
                          name="paymentMethod"
                        checked={formData.onlinePayment}
                          onChange={() => {
                            handleInputChange("onlinePayment", true);
                            handleInputChange("cashPayment", false);
                          }}
                          disabled={isAddingSession || isUpdatingSession}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <CreditCard className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        Online payment
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                          type="radio"
                          name="paymentMethod"
                        checked={formData.cashPayment}
                          onChange={() => {
                            handleInputChange("cashPayment", true);
                            handleInputChange("onlinePayment", false);
                          }}
                          disabled={isAddingSession || isUpdatingSession}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <DollarSign className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        Cash payment
                      </span>
                    </div>
                  </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  onClick={handleSubmit}
                  disabled={isAddingSession || isUpdatingSession}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingSession || isUpdatingSession ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isEditMode ? "Updating Session..." : "Adding Session..."}
                    </>
                  ) : (
                    <>
                  <Plus className="w-5 h-5" />
                      {isEditMode ? "Update Session" : "Add Sessions"}
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
    </>
  );
}

export default Agenda;
