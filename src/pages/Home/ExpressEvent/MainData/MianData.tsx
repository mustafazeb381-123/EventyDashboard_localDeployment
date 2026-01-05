import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  MapPin,
  Plus,
  Trash2,
  Info,
  XCircle,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import {
  eventPostAPi,
  getShowEventData,
  updateEventById,
  deleteBadgeType,
  addGuestType,
} from "../../../../apis/apiHelpers";
import CustomizeColorPicker from "@/components/CustomizeColor/CustomizeColor";
import axios from "axios";

// Try using a simpler approach without react-cropper
// Since we have issues with dependencies, let's implement basic cropping manually

type MainDataProps = {
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps: number;
  plan: any;
  eventData?: any;
  isEditing?: boolean;
  eventAttributes?: any;
  eventId?: string | number;
  stats?: any[];
  chartData?: any[];
  onTimeRangeChange?: (range: string) => void;
  lastEdit?: string;
  onEventCreated?: (id: string) => void;
};

type MainFormData = {
  eventName: string;
  description: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  timeFrom: string; // HH:MM
  timeTo: string; // HH:MM
  location: string;
  requireApproval: boolean;
  duplicateRegistration: boolean;
  guestTypes: string[];
  eventLogo: File | null;
  existingLogoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
};

type Badge = {
  id: string;
  type: string;
  attributes: {
    name: string;
    default: boolean;
    // Add other badge attributes as needed
  };
};

const MainData = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  plan,
  eventData,
  isEditing,
  eventAttributes,
  eventId,
  stats,
  chartData,
  onTimeRangeChange,
  lastEdit,
  onEventCreated,
}: MainDataProps) => {
  const [newGuestType, setNewGuestType] = useState<string>("");
  console.log("new guest type----", newGuestType);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showEventData, setShowEventData] = useState<boolean>(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoadingBadges, setIsLoadingBadges] = useState<boolean>(false);
  const [ticket, setTicket] = useState(true);
  const [eventguesttype, setEventguesttype] = useState<string>("");

  // Image cropping states
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [originalImageSrc, setOriginalImageSrc] = useState<string>("");
  const [cropArea, setCropArea] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [formData, setFormData] = useState<MainFormData>({
    eventName: "",
    description: "",
    dateFrom: undefined,
    dateTo: undefined,
    timeFrom: "09:00",
    timeTo: "17:00",
    location: "",
    requireApproval: false,
    duplicateRegistration: false,
    guestTypes: [], // ✅ Empty array - no default "Guest"
    eventLogo: null,
    existingLogoUrl: null,
    primaryColor: "#00A7B5",
    secondaryColor: "#202242",
  });

  const [logoError, setLogoError] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = <K extends keyof MainFormData>(
    field: K,
    value: MainFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[String(field)]) {
      setValidationErrors((prev) => ({
        ...prev,
        [String(field)]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.eventName.trim()) {
      errors.eventName = "Event name is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.dateFrom) {
      errors.dateFrom = "Start date is required";
    }

    if (!formData.dateTo) {
      errors.dateTo = "End date is required";
    }

    if (
      formData.dateFrom &&
      formData.dateTo &&
      formData.dateFrom > formData.dateTo
    ) {
      errors.dateTo = "End date must be after start date";
    }

    if (!formData.location.trim()) {
      errors.location = "Location is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle crop completion
  const handleCropComplete = async () => {
    if (imgRef.current && canvasRef.current) {
      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const img = imgRef.current;

        if (!ctx || !img) {
          throw new Error("Failed to get canvas context or image");
        }

        // Calculate scale between displayed image and original
        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;

        // Set canvas size to crop area
        canvas.width = 400;
        canvas.height = 400;

        // Draw cropped image
        ctx.drawImage(
          img,
          cropArea.x * scaleX,
          cropArea.y * scaleY,
          cropArea.width * scaleX,
          cropArea.height * scaleY,
          0,
          0,
          400,
          400
        );

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              toast.error("Failed to crop image. Please try again.");
              return;
            }

            // Convert blob to File
            const croppedFile = new File([blob], "cropped-logo.jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            // Update form data with cropped image
            setFormData((prev) => ({
              ...prev,
              eventLogo: croppedFile,
              existingLogoUrl: null,
            }));

            // Close cropping mode
            setIsCropping(false);
            setOriginalImageSrc("");

            toast.success("Image cropped and uploaded successfully!");
          },
          "image/jpeg",
          0.95 // Quality
        );
      } catch (error) {
        console.error("Error cropping image:", error);
        toast.error("Failed to crop image. Please try again.");
      }
    }
  };

  // Cancel cropping
  const cancelCrop = () => {
    setIsCropping(false);
    setOriginalImageSrc("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle image load for cropping
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({
      width: img.width,
      height: img.height,
    });

    // Initialize crop area to center square
    const size = Math.min(img.width, img.height) * 0.8;
    setCropArea({
      x: (img.width - size) / 2,
      y: (img.height - size) / 2,
      width: size,
      height: size,
    });
  };

  // Handle mouse/touch events for cropping
  const handleCropStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    setDragStart({
      x: clientX - rect.left - cropArea.x,
      y: clientY - rect.top - cropArea.y,
    });
  };

  const handleCropMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !imageDimensions.width || !imageDimensions.height)
      return;
    e.preventDefault();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const newX = clientX - rect.left - dragStart.x;
    const newY = clientY - rect.top - dragStart.y;

    // Constrain crop area within image bounds
    setCropArea((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(newX, imageDimensions.width - prev.width)),
      y: Math.max(0, Math.min(newY, imageDimensions.height - prev.height)),
    }));
  };

  const handleCropEnd = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const file = files && files[0];
    if (file) {
      setLogoError("");

      // For all image types, open crop interface
      const objectUrl = URL.createObjectURL(file);
      setOriginalImageSrc(objectUrl);
      setIsCropping(true);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      setLogoError("");

      // For all image types, open crop interface
      const objectUrl = URL.createObjectURL(file);
      setOriginalImageSrc(objectUrl);
      setIsCropping(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      eventLogo: null,
      existingLogoUrl: null,
    }));
    setLogoError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addGuestTypeLun = () => {
    if (!newGuestType.trim()) return;

    // Check if the guest type already exists (in both local and API badges)
    const trimmedType = newGuestType.trim();
    const allGuestTypes = [
      ...formData.guestTypes,
      ...badges.map((badge) => badge.attributes.name),
    ];

    if (
      allGuestTypes.some(
        (type) => type.toLowerCase() === trimmedType.toLowerCase()
      )
    ) {
      toast.error("This guest type already exists");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      guestTypes: [...prev.guestTypes, trimmedType],
    }));
    setNewGuestType("");

    // Clear validation error when guest type is added
    if (validationErrors.guestTypes) {
      setValidationErrors((prev) => ({
        ...prev,
        guestTypes: "",
      }));
    }
  };

  const removeGuestType = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      guestTypes: prev.guestTypes.filter((_, i) => i !== index),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addGuestType();
    }
  };

  // Function to manually populate form with event data
  const populateFormWithEventData = () => {
    console.log("Populating form with event data. Event ID:", eventId);

    if (isEditing && (eventData || eventAttributes)) {
      const attributes = eventAttributes || eventData?.attributes;

      // Format time from ISO string to HH:MM format
      const formatTimeFromISO = (isoString: string) => {
        if (!isoString) return "09:00";
        const date = new Date(isoString);
        return date.toTimeString().slice(0, 5);
      };

      setFormData({
        eventName: attributes.name || "",
        description: attributes.about || "",
        dateFrom: attributes.event_date_from
          ? new Date(attributes.event_date_from)
          : undefined,
        dateTo: attributes.event_date_to
          ? new Date(attributes.event_date_to)
          : undefined,
        timeFrom: formatTimeFromISO(attributes.event_time_from) || "09:00",
        timeTo: formatTimeFromISO(attributes.event_time_to) || "17:00",
        location: attributes.location || "",
        requireApproval: attributes.require_approval || false,
        duplicateRegistration: attributes.duplicate_registration || false,
        guestTypes:
          attributes.badges && attributes.badges.length > 0
            ? attributes.badges
                .map((badge: any) => badge.name || badge.attributes?.name)
                .filter(Boolean)
            : [], // ✅ Empty array instead of ["Guest"]
        eventLogo: null, // You might need to handle existing logo
        existingLogoUrl: attributes.logo_url || null,
        primaryColor: attributes.primary_color || "#00A7B5",
        secondaryColor: attributes.secondary_color || "#202242",
      });

      setShowEventData(true);

      console.log(
        "Form manually populated with event data. Event ID:",
        eventId
      );
    }
  };

  const handleNext = async () => {
    console.log("Next button clicked. Current Event ID:", eventId);

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      // Call the API to save the data for the current step
      const response = await handleEventPostApiCall();

      // If editing, use eventId from props. If creating, use the new ID from response.
      let nextEventId = eventId;
      if (!eventId && response?.data?.data?.id) {
        nextEventId = response.data.data.id;
      }

      // Pass the correct event ID to the next screen
      onNext(nextEventId);
    } catch (error) {
      // ...existing error handling...
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventPostApiCall = async () => {
    console.log("Making API call with Event ID:", eventId);

    const fd = new FormData();

    // Basic event info
    fd.append("event[name]", formData.eventName);
    fd.append("event[about]", formData.description);
    fd.append("event[location]", formData.location);
    fd.append("event[require_approval]", String(formData.requireApproval));
    fd.append(
      "event[duplicate_registration]",
      String(formData.duplicateRegistration)
    );
    fd.append("event[primary_color]", formData.primaryColor);
    fd.append("event[secondary_color]", formData.secondaryColor);
    fd.append("event[event_type]", plan);

    // 👇 UPDATED: Always include "Guest" as default when no guest types exist
    let guestTypesToUse = [];

    if (eventId) {
      // Editing existing event: use badges from API
      guestTypesToUse = badges.map((badge) => badge.attributes.name);
    } else {
      // Creating new event: use formData.guestTypes
      guestTypesToUse = formData.guestTypes.filter(
        (type) => type.trim() !== ""
      );
    }

    // ✅ If no guest types exist, use "Guest" as default
    if (guestTypesToUse.length === 0) {
      guestTypesToUse = ["Guest"];
    }

    // Remove duplicates from the selected array
    const uniqueGuestTypes = [...new Set(guestTypesToUse)];

    // ✅ Append badges - always include at least one type
    uniqueGuestTypes.forEach((type, index) => {
      fd.append("event[badges_attributes][][name]", type.trim());
      fd.append(
        "event[badges_attributes][][default]",
        index === 0 ? "true" : "false"
      );
    });

    // Rest of your code remains the same...
    if (formData.dateFrom) {
      fd.append(
        "event[event_date_from]",
        formData.dateFrom.toISOString().split("T")[0]
      );
    }
    if (formData.dateTo) {
      fd.append(
        "event[event_date_to]",
        formData.dateTo.toISOString().split("T")[0]
      );
    }
    fd.append(
      "event[event_time_from]",
      formData.timeFrom ? `${formData.timeFrom}:00` : "09:00:00"
    );
    fd.append(
      "event[event_time_to]",
      formData.timeTo ? `${formData.timeTo}:00` : "17:00:00"
    );
    fd.append("event[registration_page_banner]", "");

    if (formData.eventLogo) {
      fd.append("event[logo]", formData.eventLogo);
    }

    fd.append("event[registration_template]", "form");
    fd.append("locale", "en");

    // Debug log
    console.log("Guest types being sent:", uniqueGuestTypes);
    console.log("=== FORM DATA ===");
    for (let [key, value] of fd.entries()) {
      console.log(key, value);
    }

    try {
      let response;

      if (eventId) {
        console.log("Updating existing event with ID:", eventId);
        response = await updateEventById(eventId, fd);
        console.log("Event updated successfully:", response.data);
        toast.success("Event updated successfully");
      } else {
        console.log("Creating new event");
        response = await eventPostAPi(fd);
        console.log("API Response:", response.data);

        if (response?.data?.data?.id) {
          localStorage.setItem("create_eventId", response.data.data.id);
          if (onEventCreated) {
            onEventCreated(String(response.data.data.id));
          }
        }
        toast.success("Event created successfully");
      }

      return response;
    } catch (error: any) {
      console.error("API Error:", error);
      toast.error(error?.response?.data?.message || "Error saving event data");
      throw error;
    }
  };

  const fetchBadgeApi = async () => {
    if (!eventId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      setIsLoadingBadges(true);
      console.log("Fetching badges for event ID:", eventId);

      const response = await fetch(
        `https://scceventy.dev/en/api_dashboard/v1/events/${eventId}/badges`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Badges API Response:", response);

      if (!response.ok) {
        console.error("API Error:", response);
        const errorText = await response.text();
        console.log("Error response:", errorText);
        return;
      }

      const result = await response.json();
      console.log("✅ Raw badges fetched:", result?.data);

      // 👇 REMOVE DUPLICATES FROM API RESPONSE
      if (result?.data && Array.isArray(result.data)) {
        const uniqueBadges = removeDuplicateBadges(result.data);
        console.log("✅ Unique badges after deduplication:", uniqueBadges);
        setBadges(uniqueBadges);
      } else {
        setBadges([]);
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);
    } finally {
      setIsLoadingBadges(false);
    }
  };

  // 👇 NEW FUNCTION: Remove duplicate badges by name
  const removeDuplicateBadges = (badges: Badge[]) => {
    const seen = new Set();
    return badges.filter((badge) => {
      const name = badge.attributes.name;
      if (seen.has(name)) {
        console.log(`Removing duplicate badge: ${name}`);
        return false;
      }
      seen.add(name);
      return true;
    });
  };

  // 👇 DIRECT DELETE API CALL FUNCTION
  const handleDeleteBadgeTypeDirect = async (
    badgeId: string | number,
    index: number
  ) => {
    console.log("=== DIRECT DELETE BADGE ===");
    console.log("Badge ID to delete:", badgeId);
    console.log("Event ID:", eventId);

    if (!eventId) {
      toast.error("Event ID is missing");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token not found");
      return;
    }

    try {
      // Direct DELETE API call based on your screenshot
      const response = await fetch(
        `https://scceventy.dev/en/api_dashboard/v1/events/${eventId}/badges/${badgeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("DELETE Response status:", response.status);

      if (response.status === 204) {
        toast.success("Badge type deleted successfully!");

        // Remove from local state
        setBadges((prev) => prev.filter((_, i) => i !== index));

        // Also remove from formData.guestTypes if it exists there
        const badgeToDelete = badges[index];
        if (badgeToDelete) {
          const badgeName = badgeToDelete.attributes.name;
          setFormData((prev) => ({
            ...prev,
            guestTypes: prev.guestTypes.filter((type) => type !== badgeName),
          }));
        }
      } else if (response.status === 401) {
        toast.error("Unauthorized - Please check your token");
      } else if (response.status === 404) {
        toast.error("Badge not found");
      } else {
        const errorText = await response.text();
        console.error("DELETE Error:", errorText);
        toast.error(`Failed to delete badge: ${response.statusText}`);
      }
    } catch (error) {
      console.error("DELETE Network Error:", error);
      toast.error("Network error while deleting badge");
    }
  };

  // Populate form with existing event data when editing
  useEffect(() => {
    if (isEditing && (eventData || eventAttributes)) {
      console.log("Editing mode detected. Event ID:", eventId);

      const attributes = eventAttributes || eventData?.attributes;

      // Format time from ISO string to HH:MM format
      const formatTimeFromISO = (isoString: string) => {
        if (!isoString) return "09:00";
        const date = new Date(isoString);
        return date.toTimeString().slice(0, 5);
      };

      // Set flag to show event data
      setShowEventData(true);

      setFormData({
        eventName: attributes.name || "",
        description: attributes.about || "",
        dateFrom: attributes.event_date_from
          ? new Date(attributes.event_date_from)
          : undefined,
        dateTo: attributes.event_date_to
          ? new Date(attributes.event_date_to)
          : undefined,
        timeFrom: formatTimeFromISO(attributes.event_time_from) || "09:00",
        timeTo: formatTimeFromISO(attributes.event_time_to) || "17:00",
        location: attributes.location || "",
        requireApproval: attributes.require_approval || false,
        guestTypes:
          attributes.badges && attributes.badges.length > 0
            ? attributes.badges
                .map((badge: any) => badge.name || badge.attributes?.name)
                .filter(Boolean)
            : [], // ✅ Empty array instead of ["Guest"]
        eventLogo: null,
        existingLogoUrl: attributes.logo_url || null,
        primaryColor: attributes.primary_color || "#00A7B5",
        secondaryColor: attributes.secondary_color || "#202242",
      });

      console.log("Form populated with event data. Event ID:", eventId);
    } else {
      // If not editing, don't show event data
      setShowEventData(false);
    }
  }, [isEditing, eventData, eventAttributes, eventId]);

  useEffect(() => {
    if (eventId) {
      console.log("Fetching event data for Event ID:", eventId);

      const fetchGetShowEventApi = async () => {
        try {
          setIsLoading(true);
          const response = await getShowEventData(eventId);
          console.log("Show event data:", response);

          // Populate form with API response data
          if (response.data && response.data.data) {
            const eventData = response.data.data;
            const attributes = eventData.attributes;

            // Format time from ISO string to HH:MM format
            const formatTimeFromISO = (isoString: string) => {
              if (!isoString) return "09:00";
              const date = new Date(isoString);
              return date.toTimeString().slice(0, 5);
            };

            setFormData({
              eventName: attributes.name || "",
              description: attributes.about || "",
              dateFrom: attributes.event_date_from
                ? new Date(attributes.event_date_from)
                : undefined,
              dateTo: attributes.event_date_to
                ? new Date(attributes.event_date_to)
                : undefined,
              timeFrom:
                formatTimeFromISO(attributes.event_time_from) || "09:00",
              timeTo: formatTimeFromISO(attributes.event_time_to) || "17:00",
              location: attributes.location || "",
              requireApproval: attributes.require_approval || false,
              guestTypes:
                attributes.badges && attributes.badges.length > 0
                  ? attributes.badges
                      .map((badge: any) => badge.name || badge.attributes?.name)
                      .filter(Boolean)
                  : [], // ✅ Empty array instead of ["Guest"]
              eventLogo: null, // You might need to handle existing logo
              existingLogoUrl: attributes.logo_url || null,
              primaryColor: attributes.primary_color || "#00A7B5",
              secondaryColor: attributes.secondary_color || "#202242",
            });

            setShowEventData(true);
            console.log("Form populated with API data. Event ID:", eventId);
          }
        } catch (error) {
          console.error(
            "Error fetching event data for Event ID:",
            eventId,
            error
          );
          toast.error("Failed to load event data");
        } finally {
          setIsLoading(false);
        }
      };

      fetchGetShowEventApi();
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchBadgeApi();
    }
  }, [eventId]);

  // Handle Previous button click
  const handlePreviousClick = () => {
    console.log("Previous button clicked. Current Event ID:", eventId);
    onPrevious();
  };

  const handleEventType = () => {
    if (!eventguesttype.trim()) {
      toast.error("Guest type name required");
      return;
    }

    // Check if the guest type already exists (case-insensitive)
    const trimmedType = eventguesttype.trim();
    const isDuplicate = formData.guestTypes.some(
      (type) => type.toLowerCase() === trimmedType.toLowerCase()
    );

    if (isDuplicate) {
      toast.error("This guest type already exists!");
      return;
    }

    // Add to local guest types for new event creation
    setFormData((prev) => ({
      ...prev,
      guestTypes: [...prev.guestTypes, trimmedType],
    }));

    setEventguesttype("");

    // Clear validation error when guest type is added
    if (validationErrors.guestTypes) {
      setValidationErrors((prev) => ({
        ...prev,
        guestTypes: "",
      }));
    }

    toast.success("Guest type added!");
  };

  const handleAddUserType = async () => {
    if (!eventId) {
      toast.error("Event ID is missing");
      return;
    }

    if (!newGuestType) {
      toast.error("Guest type name required");
      return;
    }

    // Normalize spaces and lowercase for comparison
    const normalize = (str: string) =>
      str.trim().replace(/\s+/g, " ").toLowerCase();

    const normalizedNewType = normalize(newGuestType);

    const allGuestTypes = [
      ...formData.guestTypes,
      ...badges.map((badge) => badge.attributes.name),
    ];

    const isDuplicate = allGuestTypes.some(
      (type) => normalize(type) === normalizedNewType
    );

    if (isDuplicate) {
      toast.error("This guest type already exists!");
      return;
    }

    try {
      const response = await addGuestType(eventId, newGuestType.trim());
      console.log("Guest type added:", response);
      toast.success("Guest type added successfully!");
      setNewGuestType("");
      await fetchBadgeApi();
    } catch (error: any) {
      console.error("=== ADD ERROR ===", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to add guest type.";
      toast.error(errorMessage);
    }
  };

  const removeBadgeType = (index: number) => {
    setBadges((prev) => prev.filter((_, i) => i !== index));
  };

  // Handler for API badges only - NOW USING DIRECT API CALL
  const handleDeleteBadgeType = async (
    badgeId: number | string,
    index: number
  ) => {
    // Call the direct DELETE function
    await handleDeleteBadgeTypeDirect(badgeId, index);
  };

  // Handle Show Event Data button click
  const handleShowEventDataClick = () => {
    console.log("Show Event Data button clicked. Event ID:", eventId);
    populateFormWithEventData();
  };

  // Handle Hide Event Data button click
  const handleHideEventDataClick = () => {
    console.log("Hide Event Data button clicked. Event ID:", eventId);
    setShowEventData(false);
  };

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-normal mb-4 sm:mb-6 lg:mb-8 text-neutral-900"></h2>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-teal-500" />
          <span className="ml-2 text-gray-600">Loading event data...</span>
        </div>
      )}

      {/* Image Cropping Modal - Simple Implementation */}
      {isCropping && originalImageSrc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Crop Image (Drag to adjust)
              </h3>
              <button
                onClick={cancelCrop}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="mb-6">
              <div
                className="relative mx-auto border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                style={{ maxWidth: "600px", maxHeight: "400px" }}
                onMouseDown={handleCropStart}
                onMouseMove={handleCropMove}
                onMouseUp={handleCropEnd}
                onMouseLeave={handleCropEnd}
                onTouchStart={handleCropStart}
                onTouchMove={handleCropMove}
                onTouchEnd={handleCropEnd}
              >
                <img
                  ref={imgRef}
                  src={originalImageSrc}
                  alt="Crop preview"
                  className="max-w-full max-h-[300px] object-contain cursor-move"
                  onLoad={handleImageLoad}
                  draggable={false}
                />
                {imageDimensions.width > 0 && (
                  <>
                    {/* Crop overlay - darken outside area */}
                    <div
                      className="absolute inset-0 bg-black bg-opacity-40"
                      style={{
                        clipPath: `polygon(
                          0% 0%, 
                          0% 100%, 
                          ${cropArea.x}px 100%, 
                          ${cropArea.x}px ${cropArea.y}px, 
                          ${cropArea.x + cropArea.width}px ${cropArea.y}px, 
                          ${cropArea.x + cropArea.width}px ${
                          cropArea.y + cropArea.height
                        }px, 
                          ${cropArea.x}px ${cropArea.y + cropArea.height}px, 
                          ${cropArea.x}px 100%, 
                          100% 100%, 
                          100% 0%
                        )`,
                      }}
                    />

                    {/* Crop area border */}
                    <div
                      className="absolute border-2 border-white border-dashed"
                      style={{
                        left: `${cropArea.x}px`,
                        top: `${cropArea.y}px`,
                        width: `${cropArea.width}px`,
                        height: `${cropArea.height}px`,
                        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                      }}
                    >
                      {/* Resize handles */}
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full border border-gray-400" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border border-gray-400" />
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full border border-gray-400" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border border-gray-400" />
                    </div>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Drag the square to adjust cropping. The image will be cropped to
                a square.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelCrop}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCropComplete}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg text-white transition-colors"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Event Data Flag Indicator */}
      {showEventData && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm font-medium text-blue-800">
                Editing Existing Event (ID: {eventId})
              </p>
            </div>
            <button
              onClick={handleHideEventDataClick}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Hide Event Data
            </button>
          </div>
          <p className="text-xs text-blue-600">
            Event data has been loaded from the database. You can modify the
            fields below.
          </p>
        </div>
      )}

      {/* Show Event Data Button (when hidden) */}
      {!showEventData && isEditing && (eventData || eventAttributes) && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <p className="text-sm font-medium text-gray-700">
                Event Data Available (ID: {eventId})
              </p>
            </div>
            <button
              onClick={handleShowEventDataClick}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Show Event Data
            </button>
          </div>
          <p className="text-xs text-gray-600">
            Click to load existing event data into the form fields.
          </p>
        </div>
      )}

      {/* Mobile-First Responsive Grid */}
      <div className="w-full space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6 xl:gap-8">
        {/* Event Logo Section */}
        <div className="w-full border rounded-2xl border-gray-200 p-4 sm:p-5">
          <label className="block text-xs font-normal text-neutral-700 mb-2">
            Event Logo
          </label>
          <div
            className={`
              border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors cursor-pointer min-h-[200px] flex flex-col justify-center
              ${
                logoError
                  ? "border-red-500"
                  : "border-gray-300 hover:border-gray-400"
              }
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => {
              console.log("Upload area clicked. Event ID:", eventId);
              fileInputRef.current?.click();
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*" // Accept all image types
            />
            {formData.eventLogo || formData.existingLogoUrl ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="relative">
                  <img
                    src={
                      formData.eventLogo
                        ? URL.createObjectURL(formData.eventLogo)
                        : formData.existingLogoUrl!
                    }
                    alt="Event Logo Preview"
                    className="max-h-24 sm:max-h-32 lg:max-h-36 max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Remove image clicked. Event ID:", eventId);
                      removeImage();
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md text-red-500 hover:text-red-700 transition-colors"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                </div>
                <p className="text-xs sm:text-sm text-neutral-500 mb-1">
                  <span className="font-medium text-[#202242]">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-neutral-500">
                  Any image format (will be cropped to square)
                </p>
              </>
            )}
          </div>
          {logoError && (
            <p className="mt-2 flex items-center text-xs text-red-600">
              <Info size={14} className="mr-1" />
              {logoError}
            </p>
          )}

          {/* Require Approval Toggle */}
          <div className="flex flex-col sm:flex-row p-3 sm:p-4 mt-4 rounded-2xl bg-gray-100 items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <label className="text-sm font-medium text-gray-700">
                Require approval
              </label>
              <Info size={14} className="text-gray-400" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requireApproval}
                onChange={(e) => {
                  console.log(
                    "Require approval toggled. Event ID:",
                    eventId,
                    "Checked:",
                    e.target.checked
                  );
                  handleInputChange("requireApproval", e.target.checked);
                }}
                className="sr-only"
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors ${
                  formData.requireApproval ? "bg-teal-500" : "bg-gray-200"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    formData.requireApproval
                      ? "translate-x-5"
                      : "translate-x-0.5"
                  } mt-0.5`}
                />
              </div>
            </label>
          </div>

          {/* Duplicate Registration Toggle */}
          <div className="flex flex-col sm:flex-row p-3 sm:p-4 mt-4 rounded-2xl bg-gray-100 items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <label className="text-sm font-medium text-gray-700">
                Duplicate registration
              </label>
              <Info size={14} className="text-gray-400" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.duplicateRegistration}
                onChange={(e) => {
                  console.log(
                    "Duplicate registration toggled. Event ID:",
                    eventId,
                    "Checked:",
                    e.target.checked
                  );
                  handleInputChange("duplicateRegistration", e.target.checked);
                }}
                className="sr-only"
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors ${
                  formData.duplicateRegistration ? "bg-teal-500" : "bg-gray-200"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    formData.duplicateRegistration
                      ? "translate-x-5"
                      : "translate-x-0.5"
                  } mt-0.5`}
                />
              </div>
            </label>
          </div>
          {/* Require Ticket */}
          {plan === "advance" ? (
            <div className="flex flex-col sm:flex-row p-3 sm:p-4 mt-4 rounded-2xl bg-gray-100 items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Ticket
                </label>
                <Info size={14} className="text-gray-400" />
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={ticket}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    console.log("Require ticket toggled:", isChecked);
                    setTicket(isChecked);
                    handleInputChange("requiredTicket", isChecked);
                  }}
                  className="sr-only"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                    ticket ? "bg-teal-500" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 mt-0.5 ${
                      ticket ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </label>
            </div>
          ) : null}
        </div>

        {/* Event Details Section */}
        <div className="w-full space-y-4 sm:space-y-6 border border-gray-200 p-4 sm:p-6 rounded-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Event name"
              value={formData.eventName}
              onChange={(e) => handleInputChange("eventName", e.target.value)}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-colors ${
                validationErrors.eventName
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {validationErrors.eventName && (
              <p className="mt-1 text-xs text-red-600">
                {validationErrors.eventName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Enter a description..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm resize-none transition-colors ${
                validationErrors.description
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {validationErrors.description && (
              <p className="mt-1 text-xs text-red-600">
                {validationErrors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date From <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={
                  formData.dateFrom
                    ? formData.dateFrom.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  handleInputChange(
                    "dateFrom",
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                  validationErrors.dateFrom
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {validationErrors.dateFrom && (
                <p className="mt-1 text-xs text-red-600">
                  {validationErrors.dateFrom}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={
                  formData.dateTo
                    ? formData.dateTo.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  handleInputChange(
                    "dateTo",
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                  validationErrors.dateTo ? "border-red-500" : "border-gray-300"
                }`}
              />
              {validationErrors.dateTo && (
                <p className="mt-1 text-xs text-red-600">
                  {validationErrors.dateTo}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time From
              </label>
              <input
                type="time"
                value={formData.timeFrom}
                onChange={(e) => handleInputChange("timeFrom", e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <input
                type="time"
                value={formData.timeTo}
                onChange={(e) => handleInputChange("timeTo", e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Event location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg pr-10 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                  validationErrors.location
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <MapPin className="absolute right-3 top-2.5 sm:top-3.5 h-4 w-4 text-gray-400" />
            </div>
            {validationErrors.location && (
              <p className="mt-1 text-xs text-red-600">
                {validationErrors.location}
              </p>
            )}
          </div>

          {plan === "advance" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Limits <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  type="number"
                  placeholder="Registration Limits"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg pr-10 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors border-gray-300"
                />
              </div>
            </div>
          ) : null}

          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) =>
                  handleInputChange("primaryColor", e.target.value)
                }
                className="flex-1 h-10 cursor-pointer"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) =>
                  handleInputChange("secondaryColor", e.target.value)
                }
                className="flex-1 h-10 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Guest Types Section */}
        <div className="w-full space-y-4 sm:space-y-6 border border-gray-200 p-4 sm:p-6 rounded-2xl">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Add Guest Types <span className="text-red-500">*</span>
              </label>
              <Info size={14} className="text-gray-400" />
            </div>

            {eventId ? (
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  type="text"
                  value={newGuestType}
                  onChange={(e) => setNewGuestType(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g. Speaker, VIP"
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
                <button
                  onClick={handleAddUserType}
                  className="px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm text-gray-700 transition-colors"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  type="text"
                  value={eventguesttype}
                  onChange={(e) => setEventguesttype(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g. Speaker, VIP"
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
                <button
                  onClick={handleEventType}
                  className="px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm text-gray-700 transition-colors"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            )}

            {validationErrors.guestTypes && (
              <p className="mb-2 text-xs text-red-600">
                {validationErrors.guestTypes}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Guest Types
            </label>

            {/* Loading state for badges */}
            {isLoadingBadges && (
              <div className="flex items-center justify-center py-4">
                <Loader2
                  size={16}
                  className="animate-spin text-teal-500 mr-2"
                />
                <span className="text-sm text-gray-600">Loading badges...</span>
              </div>
            )}

            {eventId ? (
              <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
                {/* Show guest types - display "Guest" only when completely empty */}
                {badges.length > 0 || formData.guestTypes.length > 0 ? (
                  <div className="mb-4">
                    {/* Show API Badges */}
                    {badges.map((badge, index) => (
                      <div
                        key={`api-${badge.id}`}
                        className="mb-2 flex items-center justify-between bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200"
                      >
                        <span className="text-sm text-gray-700 truncate pr-2">
                          {badge.attributes.name}
                        </span>
                        <button
                          onClick={() => handleDeleteBadgeType(badge.id, index)}
                          className="text-red-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}

                    {/* Show Local Guest Types */}
                    {formData.guestTypes.map((type, index) => (
                      <div
                        key={`local-${index}`}
                        className="mb-2 flex items-center justify-between bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200"
                      >
                        <span className="text-sm text-gray-700 truncate pr-2">
                          {type}
                        </span>
                        <button
                          onClick={() => removeGuestType(index)}
                          className="text-red-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Show "Guest" only when no guest types exist */
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200">
                      <span className="text-sm text-gray-700 truncate pr-2">
                        Guest
                      </span>
                      {/* Guest type cannot be deleted since it's default */}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
                {/* For new events - show "Guest" only when empty */}
                {formData.guestTypes.length > 0 ? (
                  formData.guestTypes.map((type, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200"
                    >
                      <span className="text-sm text-gray-700 truncate pr-2">
                        {type}
                      </span>
                      <button
                        onClick={() => removeGuestType(index)}
                        className="text-red-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  /* Show "Guest" only when no guest types exist */
                  <div className="flex items-center justify-between bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-700 truncate pr-2">
                      Guest
                    </span>
                    {/* Guest type cannot be deleted since it's default */}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
        <button
          onClick={handlePreviousClick}
          disabled={currentStep === 0 || isLoading}
          className={`w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors border
            ${
              currentStep === 0 || isLoading
                ? "text-gray-400 bg-gray-100 cursor-not-allowed border-gray-200"
                : "text-slate-800 border-gray-300 hover:bg-gray-50"
            }`}
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          disabled={isLoading}
          className={`w-full sm:w-auto px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2
            ${
              isLoading
                ? "bg-slate-600 cursor-not-allowed text-white"
                : "bg-slate-800 hover:bg-slate-900 text-white"
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {currentStep === totalSteps - 1 ? "Creating..." : "Loading..."}
            </>
          ) : currentStep === totalSteps - 1 ? (
            "Create Event"
          ) : (
            "Next →"
          )}
        </button>
      </div>

      {/* Help Section */}
      <div className="mt-6 sm:mt-8 lg:mt-12 flex justify-center sm:justify-end">
        <button className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 p-4 sm:p-6 bg-gray-50 rounded-2xl transition-colors">
          <span className="text-center sm:text-left">
            Can't find what you're looking for?
          </span>
          <ChevronLeft className="rotate-90" size={14} />
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default MainData;
