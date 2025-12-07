// Updated TemplateForm.jsx
import { useRef, useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Info, XCircle, Upload, Crop } from "lucide-react";
import Assets from "@/utils/Assets";
import ReusableRegistrationForm from "../../components/ReusableRegistrationForm";
import {
  getEventbyId,
  updateEventById,
  updateRegistrationFieldToggleApi,
  getRegistrationFieldApi,
} from "@/apis/apiHelpers";
import { Skeleton } from "@/components/ui/skeleton";

function TemplateFormTwo({
  data,
  eventId: propEventId,
  isUserRegistration = false,
  eventData: propEventData,
}: {
  data?: any;
  eventId?: string;
  isUserRegistration?: boolean;
  eventData?: any;
} = {}) {
  // Log all field attributes for debugging
  useMemo(() => {
    if (Array.isArray(data)) {
      console.log(`Template Two received ${data.length} fields:`, data);
    }
  }, [data]);

  // Banner state
  const [bannerUrl, setBannerUrl] = useState(null);
  const [formData, setFormData] = useState({ eventLogo: null });
  const [logoError, setLogoError] = useState("");
  const [toggleLoading, setToggleLoading] = useState({});
  const [eventData, setEventData] = useState<any>(null);
  const [apiFormData, setApiFormData] = useState<any[]>([]);
  const [isLoadingApiData, setIsLoadingApiData] = useState(false);
  const [isLoadingEventData, setIsLoadingEventData] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image cropping states
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [originalImageSrc, setOriginalImageSrc] = useState<string>("");
  const [cropArea, setCropArea] = useState({
    x: 0,
    y: 0,
    width: 200,
    height: 150,
  });
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch event and banner on mount and after upload
  const { id: routeId } = useParams();
  const effectiveEventId =
    (propEventId as string | undefined) ||
    (routeId as string | undefined) ||
    localStorage.getItem("create_eventId") ||
    undefined;

  useEffect(() => {
    const fetchBanner = async () => {
      if (!effectiveEventId) return;

      // Use event data from prop if available - skip API call
      if (propEventData) {
        setBannerUrl(
          propEventData?.attributes?.registration_page_banner ||
            propEventData?.registration_page_banner ||
            null
        );
        setEventData(propEventData);
        setIsLoadingEventData(false);
        return;
      }

      const cacheKey = `event_meta_${effectiveEventId}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setEventData(parsed);
          setBannerUrl(parsed?.attributes?.registration_page_banner || null);
          setIsLoadingEventData(false);
          return;
        } catch (err) {
          console.warn("TemplateTwo - failed to parse cached event", err);
        }
      }

      setIsLoadingEventData(true);
      try {
        const response = await getEventbyId(effectiveEventId);
        setEventData(response.data.data);
        setBannerUrl(
          response.data.data?.attributes?.registration_page_banner || null
        );
        sessionStorage.setItem(cacheKey, JSON.stringify(response.data.data));
      } catch (error) {
        setBannerUrl(null);
      } finally {
        setIsLoadingEventData(false);
      }
    };
    fetchBanner();
  }, [effectiveEventId, propEventData]);

  // Default form fields when no data is provided (for preview)
  const defaultFormFields = [
    {
      id: 1,
      name: "fullName",
      type: "text",
      label: "Full Name",
      placeholder: "Enter your full name",
      required: true,
      active: true,
    },
    {
      id: 2,
      name: "email",
      type: "email",
      label: "Email",
      placeholder: "Enter your email",
      required: true,
      active: true,
    },
    {
      id: 3,
      name: "phoneNumber",
      type: "tel",
      label: "Phone Number",
      placeholder: "Enter your phone number",
      required: true,
      active: true,
    },
    {
      id: 4,
      name: "company",
      type: "text",
      label: "Company",
      placeholder: "Enter your company name",
      required: false,
      active: true,
    },
  ];

  // Fetch form fields from API when no data is provided
  useEffect(() => {
    const fetchApiFormData = async () => {
      if (!effectiveEventId) return;
      if (data && Array.isArray(data) && data.length > 0) return; // Don't fetch if data is already provided

      const cacheKey = `registration_fields_${effectiveEventId}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setApiFormData(parsed);
          setIsLoadingApiData(false);
        } catch (err) {
          console.warn("TemplateTwo - failed to parse cached fields", err);
        }
      } else {
        setIsLoadingApiData(true);
      }

      try {
        const response = await getRegistrationFieldApi(effectiveEventId);
        console.log(
          "TemplateTwo - getRegistrationFieldApi response:",
          response.data
        );
        const fields = response.data.data || [];
        setApiFormData(fields);
        sessionStorage.setItem(cacheKey, JSON.stringify(fields));
      } catch (error) {
        console.error("TemplateTwo - Failed to get registration field:", error);
        setApiFormData([]);
      } finally {
        setIsLoadingApiData(false);
      }
    };

    fetchApiFormData();
  }, [effectiveEventId, data]);

  const renderSkeleton = () => (
    <div className="space-y-4" aria-label="Template two loading">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );

  const renderEventSkeleton = () => (
    <div className="space-y-3" aria-label="Event info loading">
      <Skeleton className="h-20 w-20 rounded" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-10 w-full" />
    </div>
  );

  const formFields = useMemo((): any[] => {
    // Priority: 1. data prop, 2. apiFormData, 3. defaultFormFields
    let sourceData = data;
    if (!Array.isArray(sourceData) || sourceData.length === 0) {
      sourceData = apiFormData;
    }
    if (!Array.isArray(sourceData) || sourceData.length === 0) {
      return defaultFormFields;
    }

    return sourceData.map((field: any) => {
      const attr = field.attributes || {};
      return {
        id: field.id,
        name: attr.field || attr.name || "field_" + field.id,
        type:
          attr.field === "image"
            ? "file"
            : attr.validation_type === "email"
            ? "email"
            : attr.validation_type === "alphabetic"
            ? "text"
            : "text",
        label: attr.name || "Field",
        placeholder:
          attr.field === "image" ? "" : `Enter ${attr.name || "value"}`,
        required: !!attr.required,
        fullWidth: !!attr.full_width,
        active: attr.active,
        // Add file-specific properties for image fields
        ...(attr.field === "image" && {
          accept: "image/jpeg,image/png,image/jpg",
          maxSize: 2 * 1024 * 1024, // 2MB
          allowedTypes: ["image/jpeg", "image/png", "image/jpg"],
          hint: "Upload JPG, PNG (Max 2MB)",
        }),
      };
    });
  }, [data, apiFormData]);

  const [fieldActiveStates, setFieldActiveStates] = useState<{
    [key: string]: boolean;
  }>({});

  // Update field active states when formFields change
  useEffect(() => {
    const newActiveStates = formFields.reduce((acc: any, field: any) => {
      // Default to active (true) if not specified, especially for default fields
      acc[field.id] = field.active !== false;
      return acc;
    }, {});
    setFieldActiveStates(newActiveStates);
  }, [formFields]);

  const handleToggleField = async (fieldId: any, setLoading: any) => {
    if (!effectiveEventId) return;
    setLoading((prev: any) => ({ ...prev, [fieldId]: true }));
    const newActive = !fieldActiveStates[fieldId];
    try {
      await updateRegistrationFieldToggleApi(
        { active: newActive },
        effectiveEventId,
        fieldId
      );
      setFieldActiveStates((prev: any) => ({
        ...prev,
        [fieldId]: newActive,
      }));
    } catch (error) {
      console.error("Failed to toggle field:", error);
    }
    setLoading((prev: any) => ({ ...prev, [fieldId]: false }));
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

        // Set canvas size to the crop area dimensions
        canvas.width = cropArea.width * scaleX;
        canvas.height = cropArea.height * scaleY;

        // Draw cropped image
        ctx.drawImage(
          img,
          cropArea.x * scaleX,
          cropArea.y * scaleY,
          cropArea.width * scaleX,
          cropArea.height * scaleY,
          0,
          0,
          cropArea.width * scaleX,
          cropArea.height * scaleY
        );

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              setLogoError("Failed to crop image. Please try again.");
              return;
            }

            // Convert blob to File
            const croppedFile = new File([blob], "cropped-banner.jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            // Set the cropped file
            setFormData((prev: Any) => ({
              ...prev,
              eventLogo: croppedFile,
            }));

            // Close cropping mode
            setIsCropping(false);
            setOriginalImageSrc("");

            // Auto-upload after cropping
            updateBanner(croppedFile);
          },
          "image/jpeg",
          0.95 // Quality
        );
      } catch (error) {
        console.error("Error cropping image:", error);
        setLogoError("Failed to crop image. Please try again.");
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
    setLogoError("");
  };

  // Handle image load for cropping
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({
      width: img.width,
      height: img.height,
    });

    // Initialize crop area to cover entire image
    setCropArea({
      x: 0,
      y: 0,
      width: img.width,
      height: img.height,
    });
  };

  // Handle mouse/touch events for moving the crop area
  const handleCropStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isResizing) return;

    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    // Check if click is on a resize handle
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    // Define resize handle areas
    const handles = {
      topLeft: { x: cropArea.x - 5, y: cropArea.y - 5, width: 20, height: 20 },
      topRight: {
        x: cropArea.x + cropArea.width - 15,
        y: cropArea.y - 5,
        width: 20,
        height: 20,
      },
      bottomLeft: {
        x: cropArea.x - 5,
        y: cropArea.y + cropArea.height - 15,
        width: 20,
        height: 20,
      },
      bottomRight: {
        x: cropArea.x + cropArea.width - 15,
        y: cropArea.y + cropArea.height - 15,
        width: 20,
        height: 20,
      },
    };

    // Check which handle was clicked
    for (const [corner, area] of Object.entries(handles)) {
      if (
        clickX >= area.x &&
        clickX <= area.x + area.width &&
        clickY >= area.y &&
        clickY <= area.y + area.height
      ) {
        setIsResizing(true);
        setResizeCorner(corner);
        setDragStart({ x: clickX, y: clickY });
        return;
      }
    }

    // If not on a resize handle, start dragging
    setIsDragging(true);
    setDragStart({
      x: clientX - rect.left - cropArea.x,
      y: clientY - rect.top - cropArea.y,
    });
  };

  const handleCropMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging && !isResizing) return;
    e.preventDefault();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;

    if (isDragging) {
      // Move the entire crop area
      const newX = currentX - dragStart.x;
      const newY = currentY - dragStart.y;

      // Constrain crop area within image bounds
      setCropArea((prev) => ({
        ...prev,
        x: Math.max(0, Math.min(newX, imageDimensions.width - prev.width)),
        y: Math.max(0, Math.min(newY, imageDimensions.height - prev.height)),
      }));
    } else if (isResizing && resizeCorner) {
      // Resize from a corner
      const deltaX = currentX - dragStart.x;
      const deltaY = currentY - dragStart.y;

      setCropArea((prev) => {
        let newCrop = { ...prev };

        switch (resizeCorner) {
          case "topLeft":
            newCrop.x = Math.max(0, prev.x + deltaX);
            newCrop.y = Math.max(0, prev.y + deltaY);
            newCrop.width = Math.max(50, prev.width - deltaX);
            newCrop.height = Math.max(50, prev.height - deltaY);
            break;
          case "topRight":
            newCrop.y = Math.max(0, prev.y + deltaY);
            newCrop.width = Math.max(50, prev.width + deltaX);
            newCrop.height = Math.max(50, prev.height - deltaY);
            break;
          case "bottomLeft":
            newCrop.x = Math.max(0, prev.x + deltaX);
            newCrop.width = Math.max(50, prev.width - deltaX);
            newCrop.height = Math.max(50, prev.height + deltaY);
            break;
          case "bottomRight":
            newCrop.width = Math.max(50, prev.width + deltaX);
            newCrop.height = Math.max(50, prev.height + deltaY);
            break;
        }

        // Ensure crop area stays within image bounds
        if (newCrop.x + newCrop.width > imageDimensions.width) {
          newCrop.width = imageDimensions.width - newCrop.x;
        }
        if (newCrop.y + newCrop.height > imageDimensions.height) {
          newCrop.height = imageDimensions.height - newCrop.y;
        }

        return newCrop;
      });

      setDragStart({ x: currentX, y: currentY });
    }
  };

  const handleCropEnd = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeCorner(null);
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setLogoError("");

      // Validate it's an image file
      if (!file.type.startsWith("image/")) {
        setLogoError("Please select an image file");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // For all image types, open crop interface
      const objectUrl = URL.createObjectURL(file);
      setOriginalImageSrc(objectUrl);
      setIsCropping(true);
    }
  };

  const removeImage = (e: any) => {
    e.stopPropagation();
    setFormData((prev) => ({
      ...prev,
      eventLogo: null,
    }));
    setLogoError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload banner and refresh from API
  const updateBanner = async (file?: any) => {
    const bannerFile = file || formData.eventLogo;
    if (!bannerFile || !effectiveEventId) return;

    try {
      const payload = new FormData();
      payload.append("event[registration_page_banner]", bannerFile);

      const response = await updateEventById(effectiveEventId, payload);
      console.log("Event banner updated:", response);

      // Fetch updated event/banner - only if not using prop data
      if (!propEventData) {
        const eventResponse = await getEventbyId(effectiveEventId);
        console.log("Fetched event after banner update:", eventResponse);
        setEventData(eventResponse.data.data);
        setBannerUrl(
          eventResponse.data.data?.attributes?.registration_page_banner ||
            eventResponse.data.data?.registration_page_banner ||
            null
        );
        const cacheKey = `event_meta_${effectiveEventId}`;
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify(eventResponse.data.data)
        );
      } else {
        // Update from response if available
        if (response?.data?.data) {
          setEventData(response.data.data);
          setBannerUrl(
            response.data.data?.attributes?.registration_page_banner ||
              response.data.data?.registration_page_banner ||
              null
          );
        }
      }

      setFormData({ eventLogo: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setLogoError(""); // Clear any errors
    } catch (error) {
      setLogoError("Failed to update banner.");
      console.error("Failed to update banner:", error);
    }
  };

  const handleFormSubmit = (formValues: any) => {
    console.log("Form submitted:", formValues);
    alert("Registration submitted successfully!");
  };

  // Removed duplicate fetchEventData - using the useEffect above instead

  return (
    <div className="w-full p-4">
      {/* Image Cropping Modal */}
      {isCropping && originalImageSrc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Crop Banner Image
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
                ref={containerRef}
                className="relative mx-auto border border-gray-300 rounded-lg overflow-hidden bg-transparent"
                style={{
                  maxWidth: "600px",
                  maxHeight: "400px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
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
                  className="max-w-full max-h-full"
                  onLoad={handleImageLoad}
                  draggable={false}
                  style={{
                    objectFit: "contain",
                  }}
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
                        cursor: isDragging ? "grabbing" : "grab",
                      }}
                    >
                      {/* Resize handles */}
                      <div
                        className="absolute -top-2 -left-2 w-6 h-6 bg-white rounded-full border-2 border-blue-500 cursor-nwse-resize"
                        title="Drag to resize from top-left"
                      />
                      <div
                        className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full border-2 border-blue-500 cursor-nesw-resize"
                        title="Drag to resize from top-right"
                      />
                      <div
                        className="absolute -bottom-2 -left-2 w-6 h-6 bg-white rounded-full border-2 border-blue-500 cursor-nesw-resize"
                        title="Drag to resize from bottom-left"
                      />
                      <div
                        className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full border-2 border-blue-500 cursor-nwse-resize"
                        title="Drag to resize from bottom-right"
                      />

                      {/* Center drag area */}
                      <div
                        className="absolute inset-0 cursor-move"
                        title="Drag to move crop area"
                      />
                    </div>
                  </>
                )}
              </div>
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
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-white transition-colors"
              >
                Crop & Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Event Cover Image Upload */}
      <div
        style={{
          width: "100%",
          backgroundImage: ` url(${
            formData.eventLogo
              ? URL.createObjectURL(formData.eventLogo)
              : eventData?.attributes?.registration_page_banner
              ? eventData.attributes.registration_page_banner
              : bannerUrl
              ? bannerUrl
              : Assets.images.uploadBackground2
          })`,
        }}
        className="w-full  h-[400px] flex items-center justify-center border rounded-3xl
         from-white/50 to-transparent
        border-gray-200  sm:p-5 bg-cover bg-center bg-no-repeat relative"
      >
        {/* Show upload button only if NO image exists */}
        {!formData.eventLogo &&
          !eventData?.attributes?.registration_page_banner &&
          !bannerUrl && (
            <button
              className="btn flex flex-row items-center gap-2 bg-indigo-950 py-3 px-5 rounded-xl cursor-pointer hover:bg-indigo-900 transition-colors"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-5 w-5 text-white" />
              <span className="text-white">Upload Banner Image</span>
            </button>
          )}

        {/* Show Edit Banner button if a banner exists and no new image is selected */}
        {!formData.eventLogo &&
          (eventData?.attributes?.registration_page_banner || bannerUrl) && (
            <button
              className="absolute top-3 right-3 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-800 rounded-lg hover:bg-white transition-colors flex items-center gap-2 border border-gray-200"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Crop size={16} />
              Edit/Crop Banner
            </button>
          )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".svg,.png,.jpg,.jpeg"
        />

        {/* Remove button (only when a new image is selected before upload) */}
        {formData.eventLogo && (
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-3 right-3 p-1 bg-white rounded-full shadow-md text-red-500 hover:text-red-700 transition-colors"
          >
            <XCircle size={20} />
          </button>
        )}
      </div>

      {/* Upload button (only when a new image is selected but not cropping) */}
      {formData.eventLogo && !isCropping && (
        <button
          type="button"
          onClick={() => updateBanner()}
          className="mt-3 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
        >
          Upload Banner
        </button>
      )}

      {logoError && (
        <p className="mt-2 flex items-center text-xs text-red-600">
          <Info size={14} className="mr-1 " />
          {logoError}
        </p>
      )}

      <div style={{ marginTop: 16 }} />

      {/* Event Information Display */}
      {isLoadingEventData ? (
        renderEventSkeleton()
      ) : (
        <div className="gap-3 flex flex-row items-center">
          <div style={{ padding: 32 }} className=" bg-neutral-50 rounded-2xl">
            <img
              src={eventData?.attributes?.logo_url || Assets.images.sccLogo}
              style={{ height: 67.12, width: 72 }}
            />
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-slate-800 text-md font-poppins font-medium">
              {eventData?.attributes?.name || "Event Name"}
            </p>

            <div className="flex flex-row items-center gap-3 ">
              <img
                src={Assets.icons.clock}
                style={{ height: 20, width: 20 }}
                alt=""
              />
              <p className="text-neutral-600 font-poppins font-normal text-xs">
                {eventData?.attributes?.event_date_from} -{" "}
                {eventData?.attributes?.event_date_to}
              </p>
            </div>

            <div className="flex flex-row items-center gap-3 ">
              <img
                src={Assets.icons.location}
                style={{ height: 20, width: 20 }}
                alt=""
              />
              <p className=" text-neutral-600 font-poppins font-normal text-xs">
                {eventData?.attributes?.location || "Location"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }} />

      <p className="text-slate-800 text-xs font-poppins font-medium">
        About{" "}
        <span className="text-neutral-600 text-xs font-normal">
          {eventData?.attributes?.about || "Event description"}
        </span>
      </p>

      <div style={{ marginTop: 24 }} />

      {/* Registration Form */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Please fill name and contact information of attendees.
        </h3>

        {isLoadingApiData ? (
          renderSkeleton()
        ) : formFields.length > 0 ? (
          <ReusableRegistrationForm
            // @ts-ignore - Temporary ignore for form fields typing issue
            formFields={formFields.map((field) => ({
              ...field,
              active: fieldActiveStates[field.id] !== false, // Show as active by default, disable only if explicitly set to false
            }))}
            onToggleField={(fieldId: any) =>
              handleToggleField(fieldId, setToggleLoading)
            }
            toggleLoading={toggleLoading}
            onSubmit={handleFormSubmit}
            submitButtonText="Register"
            isUserRegistration={isUserRegistration}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No form fields available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplateFormTwo;
