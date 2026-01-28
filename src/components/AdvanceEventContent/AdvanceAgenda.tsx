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
  createAgendaApi,
  getAgendaApi,
  updateAgendaApi,
  deleteAgendaApi,
  getSpeakersApi,
} from "@/apis/apiHelpers";

interface AdvanceAgendaProps {
  onNext?: (eventId?: string | number) => void;
  onPrevious?: () => void;
  onStepChange?: (step: number) => void;
  currentStep?: number;
  totalSteps?: number;
  eventId?: string | number;
}

function AdvanceAgenda({
  onNext,
  onPrevious,
  onStepChange,
  currentStep = 3,
  totalSteps = 5,
  eventId,
}: AdvanceAgendaProps) {
  const getInitial = (fullName?: string) => {
    if (!fullName || typeof fullName !== "string") return "?";
    const first = fullName.trim().split(/\s+/)[0] || "";
    return (first.charAt(0) || "?").toUpperCase();
  };

  const SpeakerAvatar = ({
    name,
    imageUrl,
    size = 40,
    className = "",
    textClassName = "",
    withBorder = false,
    title,
  }: {
    name?: string;
    imageUrl?: string;
    size?: number;
    className?: string;
    textClassName?: string;
    withBorder?: boolean;
    title?: string;
  }) => {
    const [errored, setErrored] = useState(false);
    const initials = getInitial(name);
    const baseClasses = `rounded-full overflow-hidden flex items-center justify-center bg-blue-100 text-blue-700 font-semibold ${
      withBorder ? "border-2 border-white" : ""
    }`;
    const style = { width: size, height: size } as React.CSSProperties;

    return (
      <div
        className={`${baseClasses} ${className}`}
        style={style}
        title={title || name}
      >
        {imageUrl && !errored ? (
          <img
            src={imageUrl}
            alt={name || "Speaker"}
            className="w-full h-full object-cover"
            onError={() => setErrored(true)}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
        ) : (
          <span
            className={`select-none ${textClassName}`}
            style={{ fontSize: Math.max(10, Math.floor(size / 2.5)) }}
          >
            {initials}
          </span>
        )}
      </div>
    );
  };
  // currentStep is passed from parent (0-3 for 4 steps)
  // When currentStep is 3 (4th step), clicking Next will redirect via onComplete
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
    display: true,
    requiredEnrolment: true,
  });
  const [selectedSpeakers, setSelectedSpeakers] = useState<string[]>([]);
  const [availableSpeakers, setAvailableSpeakers] = useState<any[]>([]);

  const [sessions, setSessions] = useState<any[]>([]);

  // Loading states
  const [isFetchingAgendas, setIsFetchingAgendas] = useState(false);
  const [isFetchingSpeakers, setIsFetchingSpeakers] = useState(false);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [isUpdatingSession, setIsUpdatingSession] = useState(false);
  const [isDeletingSession, setIsDeletingSession] = useState<string | null>(
    null
  );

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<any>(null);

  // Fetch speakers from API
  useEffect(() => {
    const fetchSpeakers = async () => {
      if (!eventId) {
        setIsFetchingSpeakers(false);
        return;
      }

      setIsFetchingSpeakers(true);
      try {
        const response = await getSpeakersApi(eventId!);
        if (response.status === 200) {
          const speakersData = response.data.data.map((item: any) => ({
            id: parseInt(item.id),
            name: item.attributes.name,
            organization: item.attributes.organization,
            image_url: item.attributes.image_url,
            description: item.attributes.description,
          }));
          setAvailableSpeakers(speakersData);
        }
      } catch (error) {
        console.error("Error fetching speakers:", error);
      } finally {
        setIsFetchingSpeakers(false);
      }
    };

    fetchSpeakers();
  }, [eventId]);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) {
        setIsFetchingAgendas(false);
        return;
      }

      setIsFetchingAgendas(true);
      try {
        const response = await getAgendaApi(eventId);
        console.log("response of get agenda api-------", response.data.data);
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
          speaker_ids: item.attributes.speaker_ids || [],
        }));
        setSessions(agendas);
      } catch (error) {
        console.error("Error fetching event data:", error);
        showNotification("Network error: Cannot fetch agendas", "error");
      } finally {
        setIsFetchingAgendas(false);
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
    setSessionToDelete(session);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;

    setIsDeletingSession(sessionToDelete.id);
    try {
      // Call the delete API
      const response = await deleteAgendaApi(eventId!, sessionToDelete.id);

      // Check if the delete was successful (204 No Content)
      if (response.status === 204) {
        // Remove from local state
        setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete.id));
        // Also remove from selected users if it was selected
        setSelectedUsers((prev) =>
          prev.filter((id) => id !== sessionToDelete.id)
        );
        showNotification("Session deleted successfully!", "success");
        setIsDeleteModalOpen(false);
        setSessionToDelete(null);
      } else {
        showNotification("Failed to delete session!", "error");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      showNotification("Error deleting session!", "error");
    } finally {
      setIsDeletingSession(null);
    }
  };

  const handleEditSession = (session: any) => {
    setEditingSession(session);

    // Extract date - try multiple formats
    let startDate = "";
    if (session.start_date) {
      // If start_date exists, use it directly
      startDate = session.start_date;
    } else if (session.startTime) {
      // Try to extract date from startTime (format: "2024-01-01 10:00:00 +0300" or "2024-01-01 10:00")
      const dateMatch = session.startTime.match(/^(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        startDate = dateMatch[1];
      } else {
        // Fallback: split by space and take first part
        startDate = session.startTime.split(" ")[0];
      }
    }

    // Extract time from startTime - handle different formats
    let timeFrom = "";
    if (session.startTime) {
      // Try to match time pattern (HH:MM or HH:MM:SS)
      const timeMatch = session.startTime.match(/(\d{2}:\d{2})(?::\d{2})?/);
      if (timeMatch) {
        timeFrom = timeMatch[1]; // Get HH:MM format
      } else {
        // Fallback: split and get second part, then take first 5 chars
        const parts = session.startTime.split(" ");
        if (parts.length > 1) {
          timeFrom = parts[1].substring(0, 5);
        }
      }
    }

    // Extract time from endTime - handle different formats
    let timeTo = "";
    if (session.endTime) {
      // Try to match time pattern (HH:MM or HH:MM:SS)
      const timeMatch = session.endTime.match(/(\d{2}:\d{2})(?::\d{2})?/);
      if (timeMatch) {
        timeTo = timeMatch[1]; // Get HH:MM format
      } else {
        // Fallback: split and get second part, then take first 5 chars
        const parts = session.endTime.split(" ");
        if (parts.length > 1) {
          timeTo = parts[1].substring(0, 5);
        }
      }
    }

    console.log("Editing session:", {
      session,
      startDate,
      timeFrom,
      timeTo,
      speaker_ids: session.speaker_ids,
    });

    setNewSession({
      title: session.title || "",
      date: startDate,
      timeFrom: timeFrom,
      timeTo: timeTo,
      location: session.location || "",
      display: session.display !== false, // Default to true if not specified
      requiredEnrolment: session.require_enroll || false,
    });

    // Set selected speakers from the session - ensure they're strings
    const speakerIds = session.speaker_ids || [];
    setSelectedSpeakers(speakerIds.map((id: any) => String(id)));
    setEditModalOpen(true);
  };

  const handleUpdateSession = async () => {
    if (!editingSession) return;

    // Validate required fields
    if (!newSession.title || !newSession.title.trim()) {
      showNotification("Please enter a title!", "error");
      return;
    }

    if (!newSession.date) {
      showNotification("Please select a date!", "error");
      return;
    }

    // Validate time fields
    if (!newSession.timeFrom || !newSession.timeFrom.trim()) {
      showNotification("Please enter a start time!", "error");
      return;
    }

    if (!newSession.timeTo || !newSession.timeTo.trim()) {
      showNotification("Please enter an end time!", "error");
      return;
    }

    // Validate time format (HH:MM)
    const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeFormatRegex.test(newSession.timeFrom)) {
      showNotification(
        "Please enter a valid start time format (HH:MM)!",
        "error"
      );
      return;
    }

    if (!timeFormatRegex.test(newSession.timeTo)) {
      showNotification(
        "Please enter a valid end time format (HH:MM)!",
        "error"
      );
      return;
    }

    // Validate that end time is after start time
    const [startHours, startMinutes] = newSession.timeFrom
      .split(":")
      .map(Number);
    const [endHours, endMinutes] = newSession.timeTo.split(":").map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = endHours * 60 + endMinutes;

    if (endTimeInMinutes <= startTimeInMinutes) {
      showNotification("End time must be after start time!", "error");
      return;
    }

    // Prepare payload
    const payload: any = {
      agenda: {
        title: newSession.title,
        agenda_type: "presentation",
        location: newSession.location,
        start_time: `${newSession.date} ${newSession.timeFrom}:00`,
        end_time: `${newSession.date} ${newSession.timeTo}:00`,
        auto_accept_users_questions: true,
        require_enroll: newSession.requiredEnrolment,
        speaker_ids: selectedSpeakers.map((id) => parseInt(id)),
        display: newSession.display, // Include display field in API call if supported
      },
    };

    setIsUpdatingSession(true);
    try {
      const response = await updateAgendaApi(
        eventId!,
        editingSession.id,
        payload
      );
      console.log("Update response:", response.data);

      // Check if the API response includes the updated agenda with formatted times
      const updatedAgenda = response.data?.data;
      if (updatedAgenda && updatedAgenda.attributes?.formatted_time) {
        // Use the API response format directly
        setSessions((prev) =>
          prev.map((session) =>
            session.id === editingSession.id
              ? {
                  ...session,
                  title: newSession.title,
                  location: newSession.location,
                  startTime: updatedAgenda.attributes.formatted_time.start_time,
                  endTime: updatedAgenda.attributes.formatted_time.end_time,
                  start_date:
                    updatedAgenda.attributes.formatted_time.start_date,
                  end_date: updatedAgenda.attributes.formatted_time.end_date,
                  display: newSession.display,
                  require_enroll: newSession.requiredEnrolment,
                  pay_by: "free",
                  price: "",
                  currency: "USD",
                  sponsors: availableSpeakers.filter((speaker) =>
                    selectedSpeakers.includes(speaker.id.toString())
                  ),
                  speaker_ids: selectedSpeakers.map((id) => parseInt(id)),
                }
              : session
          )
        );
      } else {
        // Fallback: Update local state with proper format
        setSessions((prev) =>
          prev.map((session) =>
            session.id === editingSession.id
              ? {
                  ...session,
                  title: newSession.title,
                  location: newSession.location,
                  startTime: `${newSession.date} ${newSession.timeFrom}:00 +0300`,
                  endTime: `${newSession.date} ${newSession.timeTo}:00 +0300`,
                  start_date: newSession.date,
                  end_date: newSession.date,
                  display: newSession.display,
                  require_enroll: newSession.requiredEnrolment,
                  pay_by: "free",
                  price: "",
                  currency: "USD",
                  sponsors: availableSpeakers.filter((speaker) =>
                    selectedSpeakers.includes(speaker.id.toString())
                  ),
                  speaker_ids: selectedSpeakers.map((id) => parseInt(id)),
                }
              : session
          )
        );
      }

      showNotification("Session updated successfully!", "success");
      setEditModalOpen(false);
      setEditingSession(null);
      resetForm();

      // Always refetch agendas to ensure we have the latest data from server
      // This ensures dates and times are in the correct format for next edit
      try {
        const refreshResponse = await getAgendaApi(eventId!);
        if (refreshResponse.status === 200) {
          const refreshedAgendas = refreshResponse.data.data.map(
            (item: any) => ({
              id: item.id,
              title: item.attributes.title,
              startTime: item.attributes.formatted_time.start_time,
              endTime: item.attributes.formatted_time.end_time,
              location: item.attributes.location,
              type: item.attributes.agenda_type,
              sponsors: item.attributes.speakers || [],
              display: item.attributes.display !== false,
              require_enroll: item.attributes.require_enroll || false,
              pay_by: item.attributes.pay_by || "free",
              price: item.attributes.price || "",
              currency: item.attributes.currency || "USD",
              start_date: item.attributes.formatted_time.start_date,
              end_date: item.attributes.formatted_time.end_date,
              speaker_ids: item.attributes.speaker_ids || [],
            })
          );
          setSessions(refreshedAgendas);
        }
      } catch (refreshError) {
        console.error("Error refreshing agendas:", refreshError);
        // Don't show error to user since the update was successful
      }
    } catch (error) {
      console.error("Error updating session:", error);
      showNotification("Error updating session!", "error");
    } finally {
      setIsUpdatingSession(false);
    }
  };

  const handleAddSession = async () => {
    // Validate required fields
    if (!newSession.title || !newSession.title.trim()) {
      showNotification("Please enter a title!", "error");
      return;
    }

    if (!newSession.date) {
      showNotification("Please select a date!", "error");
      return;
    }

    // Validate time fields
    if (!newSession.timeFrom || !newSession.timeFrom.trim()) {
      showNotification("Please enter a start time!", "error");
      return;
    }

    if (!newSession.timeTo || !newSession.timeTo.trim()) {
      showNotification("Please enter an end time!", "error");
      return;
    }

    // Validate time format (HH:MM)
    const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeFormatRegex.test(newSession.timeFrom)) {
      showNotification(
        "Please enter a valid start time format (HH:MM)!",
        "error"
      );
      return;
    }

    if (!timeFormatRegex.test(newSession.timeTo)) {
      showNotification(
        "Please enter a valid end time format (HH:MM)!",
        "error"
      );
      return;
    }

    // Validate that end time is after start time
    const [startHours, startMinutes] = newSession.timeFrom
      .split(":")
      .map(Number);
    const [endHours, endMinutes] = newSession.timeTo.split(":").map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = endHours * 60 + endMinutes;

    if (endTimeInMinutes <= startTimeInMinutes) {
      showNotification("End time must be after start time!", "error");
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
        speaker_ids: selectedSpeakers.map((id) => parseInt(id)),
        display: newSession.display, // Include display field in API call if supported
      },
    };

    setIsAddingSession(true);
    try {
      const response = await createAgendaApi(eventId!, payload);
      console.log("Create response:", response.data);

      // Add to local state - include dates for proper editing later
      const newSessionData = {
        id: response.data.data.id,
        title: newSession.title,
        startTime: `${newSession.date} ${newSession.timeFrom}:00 +0300`,
        endTime: `${newSession.date} ${newSession.timeTo}:00 +0300`,
        start_date: newSession.date, // Preserve for editing
        end_date: newSession.date, // Preserve for editing
        location: newSession.location,
        type: "presentation",
        sponsors: availableSpeakers.filter((speaker) =>
          selectedSpeakers.includes(speaker.id.toString())
        ),
        display: newSession.display, // Set display status
        require_enroll: newSession.requiredEnrolment,
        pay_by: "free",
        price: "",
        currency: "USD",
        speaker_ids: selectedSpeakers.map((id) => parseInt(id)),
      };

      setSessions((prev) => [...prev, newSessionData]);
      showNotification("Session added successfully!", "success");
      resetForm();
      setAddModalOpen(false);
    } catch (error) {
      console.error("Error creating session:", error);
      showNotification("Error creating session!", "error");
    } finally {
      setIsAddingSession(false);
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

  // Format date and time for display - shows both date and time clearly
  const formatDateTime = (dateTimeString: string, sessionDate?: string) => {
    if (!dateTimeString) return "-";

    try {
      // Handle different formats: "2025-06-22 18:49:00 +0300", "2025-06-22 18:49:00", or just "19:32"
      let datePart = "";
      let timePart = "";

      // Check if it's a full datetime string
      if (dateTimeString.includes(" ") || dateTimeString.includes("-")) {
        const dateTime = dateTimeString.replace(/\s+\+\d{4}$/, ""); // Remove timezone offset
        const parts = dateTime.split(" ");
        datePart = parts[0] || "";
        timePart = parts[1] || "";
      } else {
        // If it's just time (like "19:32"), use session date if available
        timePart = dateTimeString;
        if (sessionDate) {
          datePart = sessionDate;
        }
      }

      // If we still don't have a date part, try to extract from the original string
      if (!datePart && dateTimeString.includes("-")) {
        const match = dateTimeString.match(/(\d{4}-\d{2}-\d{2})/);
        if (match) {
          datePart = match[1];
        }
      }

      // If we have both date and time, format them
      if (datePart && timePart) {
        // Format date: "2025-06-22" -> "2025-06-22" (keep readable format)
        const [year, month, day] = datePart.split("-");
        const formattedDate = `${year}-${month}-${day}`;

        // Format time: "18:49:00" or "19:32" -> "06:49 PM" (12-hour format)
        const [hours, minutes] = timePart.split(":");
        const hour24 = parseInt(hours);
        const hour12 = hour24 > 12 ? hour24 - 12 : hour24 === 0 ? 12 : hour24;
        const ampm = hour24 >= 12 ? "PM" : "AM";
        const formattedTime = `${hour12
          .toString()
          .padStart(2, "0")}:${minutes} ${ampm}`;

        // Return both date and time in a clear format
        return (
          <div className="flex flex-col">
            <span className="text-gray-900 font-medium">{formattedDate}</span>
            <span className="text-gray-600 text-xs mt-0.5">
              {formattedTime}
            </span>
          </div>
        );
      } else if (timePart) {
        // If we only have time, show it but indicate date is missing
        const [hours, minutes] = timePart.split(":");
        const hour24 = parseInt(hours);
        const hour12 = hour24 > 12 ? hour24 - 12 : hour24 === 0 ? 12 : hour24;
        const ampm = hour24 >= 12 ? "PM" : "AM";
        const formattedTime = `${hour12
          .toString()
          .padStart(2, "0")}:${minutes} ${ampm}`;
        return <span className="text-gray-600">{formattedTime}</span>;
      }

      // Fallback: return original string
      return <span>{dateTimeString}</span>;
    } catch (error) {
      // If parsing fails, return original string
      return <span>{dateTimeString}</span>;
    }
  };

  const closeModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setEditingSession(null);
    setSelectedSpeakers([]);
    resetForm();
  };

  // Filter sessions based on display status for the table
  const displayedSessions = sessions.filter((session) => session.display);

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
          <h2 className="text-xl font-semibold text-gray-900">Agenda</h2>
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
            <h1 className="text-2xl font-semibold text-gray-900">Sessions</h1>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
              {isFetchingAgendas ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading...
                </span>
              ) : (
                `${displayedSessions.length} of ${sessions.length} sessions visible`
              )}
            </span>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            disabled={isFetchingAgendas}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {isFetchingAgendas ? "Loading..." : "Add Sessions"}
          </button>
        </div>

        {/* Loading State for Sessions Table */}
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
                    Display
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
                      <div className="h-6 bg-gray-300 rounded-full w-16"></div>
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
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Session
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
                          sessions.length > 0 &&
                          selectedUsers.length === sessions.length
                        }
                        disabled={isFetchingAgendas}
                        className="w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        backgroundColor: session.display ? "" : "#f9fafb",
                      }}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(session.id)}
                          onChange={() => handleSelectUser(session.id)}
                          disabled={isDeletingSession === session.id}
                          className="w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {session.title}
                        {!session.display && (
                          <span className="ml-2 text-xs text-gray-500">
                            (Hidden)
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDateTime(session.startTime, session.start_date)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDateTime(session.endTime, session.end_date)}
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
                            <SpeakerAvatar
                              key={sponsor.id}
                              name={sponsor.name}
                              imageUrl={sponsor.image_url}
                              size={32}
                              withBorder
                              className=""
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
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              session.display
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {session.display ? "Visible" : "Hidden"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteSession(session)}
                            disabled={isDeletingSession === session.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
          </>
        )}

        {/* Add/Edit Session Modal */}
        {(addModalOpen || editModalOpen) && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() =>
              !isAddingSession && !isUpdatingSession && closeModals()
            }
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
                  onClick={() =>
                    !isAddingSession && !isUpdatingSession && closeModals()
                  }
                  size={24}
                  color="#000"
                  className={`cursor-pointer ${
                    isAddingSession || isUpdatingSession
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Left Side - Input Fields */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1.5">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Text here"
                      value={newSession.title}
                      onChange={(e) =>
                        setNewSession({ ...newSession, title: e.target.value })
                      }
                      required
                      disabled={isAddingSession || isUpdatingSession}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1.5">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={newSession.date}
                      onChange={(e) =>
                        setNewSession({ ...newSession, date: e.target.value })
                      }
                      required
                      disabled={isAddingSession || isUpdatingSession}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-1.5">
                        Time from <span className="text-red-500">*</span>
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
                        required
                        disabled={isAddingSession || isUpdatingSession}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-1.5">
                        To <span className="text-red-500">*</span>
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
                        required
                        disabled={isAddingSession || isUpdatingSession}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
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
                      disabled={isAddingSession || isUpdatingSession}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Speaker Selection */}
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-3">
                      Speakers
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {isFetchingSpeakers ? (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading speakers...
                        </div>
                      ) : availableSpeakers.length > 0 ? (
                        availableSpeakers.map((speaker) => (
                          <div
                            key={speaker.id}
                            onClick={() =>
                              !isAddingSession &&
                              !isUpdatingSession &&
                              toggleSpeakerSelection(speaker.id.toString())
                            }
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                              selectedSpeakers.includes(speaker.id.toString())
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            } ${
                              isAddingSession || isUpdatingSession
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={selectedSpeakers.includes(
                                speaker.id.toString()
                              )}
                              onChange={() =>
                                toggleSpeakerSelection(speaker.id.toString())
                              }
                              disabled={isAddingSession || isUpdatingSession}
                              className="w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={(e) => e.stopPropagation()}
                            />

                            {/* Profile + Name */}
                            <SpeakerAvatar
                              name={speaker.name}
                              imageUrl={speaker.image_url}
                              size={40}
                              className=""
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
                  {/* Display Toggle - Fixed Switch */}
                  <div className="flex items-center justify-between">
                    <label className="text-base font-medium text-gray-700">
                      Show on Normal Screen
                    </label>
                    <button
                      type="button"
                      disabled={isAddingSession || isUpdatingSession}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        newSession.display ? "bg-blue-600" : "bg-gray-300"
                      } ${
                        isAddingSession || isUpdatingSession
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      onClick={() =>
                        setNewSession({
                          ...newSession,
                          display: !newSession.display,
                        })
                      }
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          newSession.display ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Required Enrolment Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="text-base font-medium text-gray-700">
                      Required Enrolment
                    </label>
                    <button
                      type="button"
                      disabled={isAddingSession || isUpdatingSession}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        newSession.requiredEnrolment
                          ? "bg-blue-600"
                          : "bg-gray-300"
                      } ${
                        isAddingSession || isUpdatingSession
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      onClick={() =>
                        setNewSession({
                          ...newSession,
                          requiredEnrolment: !newSession.requiredEnrolment,
                        })
                      }
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          newSession.requiredEnrolment
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={editModalOpen ? handleUpdateSession : handleAddSession}
                disabled={isAddingSession || isUpdatingSession}
                className="mt-6 w-full bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingSession || isUpdatingSession ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {editModalOpen
                      ? "Updating Session..."
                      : "Adding Session..."}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {editModalOpen ? "Update Session" : "Add Sessions"}
                  </>
                )}
              </button>

              <div className="mt-4 text-sm text-gray-600">
                <p>
                  <strong>Note:</strong> "Show on Normal Screen" controls
                  whether this session appears on the public event agenda.
                  Uncheck to hide from attendees.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6">
        <button
          onClick={handleBack}
          disabled={isFetchingAgendas}
          className="cursor-pointer px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <button
          onClick={handleNext}
          disabled={isFetchingAgendas}
          className="cursor-pointer px-6 py-2 rounded-lg text-white transition-colors font-medium bg-slate-800 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          onClick={() => {
            if (isDeletingSession === null) {
              setIsDeleteModalOpen(false);
              setSessionToDelete(null);
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
                  Delete Session
                </h3>
                <button
                  onClick={() => {
                    if (isDeletingSession === null) {
                      setIsDeleteModalOpen(false);
                      setSessionToDelete(null);
                    }
                  }}
                  disabled={isDeletingSession !== null}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete this session?
                </p>
                {sessionToDelete && (
                  <div className="bg-gray-50 p-3 rounded-lg mt-3">
                    <p className="font-medium text-gray-900">
                      {sessionToDelete.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {sessionToDelete.location}
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
                    setSessionToDelete(null);
                  }}
                  disabled={isDeletingSession !== null}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeletingSession !== null}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeletingSession !== null ? (
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

export default AdvanceAgenda;
