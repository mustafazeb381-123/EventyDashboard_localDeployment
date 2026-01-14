import React, { useEffect, useState, useRef, useMemo } from "react";
import Assets from "../../../../utils/Assets";
import { Clock, Edit, MapPin, Loader2, Share2, XCircle } from "lucide-react";
import RegistrationChart from "./components/RegsitrationChart";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  getEventbyId,
  updateEventById,
  getEventUserMetrics,
} from "@/apis/apiHelpers";
import { toast, ToastContainer } from "react-toastify";
import imageCompression from "browser-image-compression";

type HomeSummaryProps = {
  chartData?: Array<Record<string, any>>;
  onTimeRangeChange?: (range: string) => void;
};

function HomeSummary({ chartData, onTimeRangeChange }: HomeSummaryProps) {
  const [eventData, setEventData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Default chart data if none provided
  const defaultChartData = useMemo(
    () => [
      { label: "Jan", registered: 45 },
      { label: "Feb", registered: 120 },
      { label: "Mar", registered: 155 },
      { label: "Apr", registered: 60 },
      { label: "May", registered: 85 },
      { label: "Jun", registered: 200 },
    ],
    []
  );

  // Derive chart data from metrics API with fallbacks
  const derivedChartData = useMemo(() => {
    const normalizePoint = (item: any, index: number) => {
      const rawLabel =
        item?.label ||
        item?.date ||
        item?.day ||
        item?.month ||
        item?.period ||
        item?.name ||
        `Day ${index + 1}`;

      // Format date-like labels to shorter month/day
      let label = rawLabel;
      if (typeof rawLabel === "string" && /\d{4}-\d{2}-\d{2}/.test(rawLabel)) {
        label = new Date(rawLabel).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }

      const value =
        item?.registered ??
        item?.count ??
        item?.total ??
        item?.value ??
        item?.registration ??
        item?.registrations ??
        item?.users ??
        0;

      return {
        label: label || rawLabel || `Day ${index + 1}`,
        registered: Number(value) || 0,
      };
    };

    const metricsSeries =
      // Common keys from API responses
      metrics?.registrations_by_day ||
      metrics?.registration_chart ||
      metrics?.registration_trend ||
      metrics?.daily_registration ||
      metrics?.chart ||
      // Some backends nest arrays under a generic data key
      metrics?.data ||
      // If the whole metrics payload is already an array, use it directly
      (Array.isArray(metrics) ? metrics : null);

    if (Array.isArray(metricsSeries) && metricsSeries.length) {
      return metricsSeries
        .map(normalizePoint)
        .filter((d) => !Number.isNaN(d.registered));
    }

    // Handle object maps like { "2024-01-01": 12, "2024-01-02": 4 }
    if (
      metricsSeries &&
      typeof metricsSeries === "object" &&
      !Array.isArray(metricsSeries)
    ) {
      const entries = Object.entries(metricsSeries).map(([key, value], idx) =>
        normalizePoint({ label: key, registered: value }, idx)
      );

      if (entries.length) {
        return entries.filter((d) => !Number.isNaN(d.registered));
      }
    }

    // If no time series is present, build a simple series from aggregate metrics
    const hasAggregateMetrics =
      metrics &&
      (metrics.total_registration !== undefined ||
        metrics.todays_registration !== undefined ||
        metrics.approved_registration !== undefined ||
        metrics.pending_users !== undefined);

    if (hasAggregateMetrics) {
      const aggregateSeries = [
        {
          label: "Total",
          registered: Number(metrics?.total_registration) || 0,
        },
        {
          label: "Today",
          registered: Number(metrics?.todays_registration) || 0,
        },
        {
          label: "Approved",
          registered: Number(metrics?.approved_registration) || 0,
        },
        { label: "Pending", registered: Number(metrics?.pending_users) || 0 },
      ];

      return aggregateSeries.filter((d) => !Number.isNaN(d.registered));
    }

    if (chartData && chartData.length) {
      return chartData
        .map((item, index) => normalizePoint(item, index))
        .filter((d) => !Number.isNaN(d.registered));
    }

    return defaultChartData;
  }, [metrics, chartData, defaultChartData]);

  // Image cropping states
  console.log("Derived chart data:", derivedChartData); // Light logging

  const useDefaultFallback = false; // New prop to avoid dummy chart data
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
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramId } = useParams();
  const [eventId, setEventId] = useState<string | undefined>(
    (location.state as any)?.eventId || paramId
  );

  // Keep eventId in sync with params, search, or localStorage so metrics fetch fires with a valid ID.
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const fromQuery = searchParams.get("eventId");
    const fromState = (location.state as any)?.eventId;

    if (fromQuery && fromQuery !== eventId) {
      setEventId(fromQuery);
      return;
    }

    if (fromState && fromState !== eventId) {
      setEventId(fromState);
      return;
    }

    if (!fromQuery && !fromState && !eventId) {
      const stored =
        localStorage.getItem("create_eventId") ||
        localStorage.getItem("edit_eventId");
      if (stored) {
        setEventId(stored);
      }
    }
  }, [location.search, location.state, paramId, eventId]);

  // Fetch event data
  const getEventDataById = async (id: string | number) => {
    try {
      const response = await getEventbyId(id);
      setEventData(response.data.data);
    } catch (error) {
      console.error("Error fetching event by ID:", error);
    }
  };

  // Fetch metrics data
  const fetchEventMetrics = async (id: string | number) => {
    try {
      const response = await getEventUserMetrics(id);
      console.log("Metrics response:", response.data);

      // Accept common response shapes: { metrics: ... } or { data: { metrics: ... } } or { data: [...] }
      const metricsPayload =
        response?.data?.metrics ||
        response?.data?.data?.metrics ||
        response?.data?.data ||
        response?.data;

      setMetrics(metricsPayload);
    } catch (error) {
      console.error("Error fetching event metrics:", error);
    }
  };

  useEffect(() => {
    if (eventId) {
      getEventDataById(eventId);
      fetchEventMetrics(eventId);
    }
  }, [eventId]);

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="w-full px-4 sm:px-6 lg:px-8 animate-pulse">
      {/* Event Details Skeleton */}
      <div className="p-4 sm:p-6 lg:p-6 bg-white rounded-2xl flex flex-col lg:flex-row items-start justify-between gap-4 lg:gap-0">
        {/* Logo and Event Name Skeleton */}
        <div className="gap-3 flex flex-col sm:flex-row items-center w-full lg:w-auto">
          {/* Logo Skeleton */}
          <div className="h-[150px] w-[150px] sm:h-[180px] sm:w-[180px] lg:h-[200px] lg:w-[200px] bg-gray-200 rounded-2xl shrink-0"></div>

          {/* Text Details Skeleton */}
          <div className="items-center text-center sm:text-left w-full sm:w-auto">
            {/* Event Type Badge Skeleton */}
            <div className="h-8 w-32 bg-gray-200 rounded-3xl mx-auto sm:mx-0"></div>

            {/* Event Name Skeleton */}
            <div className="mt-4 lg:mt-4 h-6 w-48 sm:w-64 bg-gray-200 rounded-lg mx-auto sm:mx-0"></div>

            {/* Date Skeleton */}
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 lg:mt-4">
              <div className="h-5 w-5 bg-gray-200 rounded"></div>
              <div className="h-4 w-48 sm:w-64 bg-gray-200 rounded"></div>
            </div>

            {/* Location Skeleton */}
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 lg:mt-4">
              <div className="h-5 w-5 bg-gray-200 rounded"></div>
              <div className="h-4 w-40 sm:w-56 bg-gray-200 rounded"></div>
            </div>

            {/* Last Edit Skeleton */}
            <div className="mt-4 lg:mt-[23px] h-4 w-32 bg-gray-200 rounded mx-auto sm:mx-0"></div>
          </div>
        </div>

        {/* Buttons Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="h-10 w-full sm:w-40 bg-gray-200 rounded-2xl"></div>
          <div className="h-10 w-full sm:w-32 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="mt-6 lg:mt-6 gap-3 sm:gap-4 lg:gap-3 grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-white flex items-center gap-3 p-4 lg:p-4 rounded-2xl shadow-sm"
          >
            {/* Icon Skeleton */}
            <div className="p-3 lg:p-4 bg-gray-200 rounded-xl shrink-0">
              <div className="h-5 w-5 sm:h-6 sm:w-6 bg-gray-300 rounded"></div>
            </div>
            {/* Text Skeleton */}
            <div className="justify-between flex flex-col min-w-0 flex-1 gap-2">
              <div className="h-4 w-24 sm:w-32 bg-gray-200 rounded"></div>
              <div className="h-5 w-16 sm:w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="mt-6 lg:mt-6 bg-white rounded-2xl p-4 sm:p-6 lg:p-6 shadow-sm">
        {/* Chart Title Skeleton */}
        <div className="h-6 w-48 bg-gray-200 rounded-lg mb-4"></div>

        {/* Chart Area Skeleton */}
        <div className="h-80 w-full bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="flex items-end gap-2 sm:gap-4 h-full w-full px-4 pb-4">
            {[1, 2, 3, 4, 5, 6].map((bar) => (
              <div
                key={bar}
                className="flex-1 bg-gray-200 rounded-t"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (!eventData) {
    return <SkeletonLoader />;
  }

  const {
    name,
    event_type,
    event_date_from,
    event_date_to,
    event_time_from,
    event_time_to,
    about,
    location: eventLocation,
    logo_url,
    primary_color,
    secondary_color,
    registration_page_banner,
    require_approval,
  } = eventData.attributes;

  // Define stats config (label + icon + key) using real metrics data
  const stats = [
    {
      label: "Total Registrations",
      value: metrics?.total_registration || 0,
      icon: Assets.icons.totalRegistration,
    },
    {
      label: "Today Registrations",
      value: metrics?.todays_registration || 0,
      icon: Assets.icons.todayRegistration,
    },
    {
      label: "Approved Registrations",
      value: metrics?.approved_registration || 0,
      icon: Assets.icons.approvedRegistration,
    },
    {
      label: "Pending Users",
      value: metrics?.pending_users || 0,
      icon: Assets.icons.pendingUsers,
    },
  ];

  const handleTimeRangeChange = (newRange: string) => {
    // Call parent callback if provided
    if (onTimeRangeChange) {
      onTimeRangeChange(newRange);
    }
  };

  // Format time nicely
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Handle file selection - show cropping modal
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const file = files && files[0];
    if (!file || !eventId) return;

    // File type validation
    const allowedTypes = [
      "image/svg+xml",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload SVG, PNG, or JPG.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // For SVG files, skip cropping and compress directly
    if (file.type === "image/svg+xml") {
      handleSvgUpload(file);
      return;
    }

    // For other image types, open crop interface
    const objectUrl = URL.createObjectURL(file);
    setOriginalImageSrc(objectUrl);
    setIsCropping(true);
  };

  // Handle SVG upload (no cropping needed)
  const handleSvgUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Compress SVG if needed (though SVG compression is limited)
      let fileToUpload = file;

      if (file.size > 2 * 1024 * 1024) {
        toast.error("SVG file is too large. Maximum allowed size is 2MB.");
        setIsUploading(false);
        return;
      }

      const fd = new FormData();
      fd.append("event[logo]", fileToUpload);

      const response = await updateEventById(eventId, fd);

      setEventData((prev: any) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          logo_url: response?.data?.data?.attributes?.logo_url,
        },
      }));

      toast.success("Logo updated successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error updating logo");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle image load for cropping
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({
      width: img.width,
      height: img.height,
    });

    // Initialize crop area to center square (80% of smaller dimension) for logo
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
    if (isResizing) return;

    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    // Check if click is on a resize handle
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    // Define resize handle areas (20px hit area)
    const handles = {
      topLeft: {
        x: cropArea.x - 10,
        y: cropArea.y - 10,
        width: 20,
        height: 20,
      },
      topRight: {
        x: cropArea.x + cropArea.width - 10,
        y: cropArea.y - 10,
        width: 20,
        height: 20,
      },
      bottomLeft: {
        x: cropArea.x - 10,
        y: cropArea.y + cropArea.height - 10,
        width: 20,
        height: 20,
      },
      bottomRight: {
        x: cropArea.x + cropArea.width - 10,
        y: cropArea.y + cropArea.height - 10,
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
    if (
      (!isDragging && !isResizing) ||
      !imageDimensions.width ||
      !imageDimensions.height
    )
      return;
    e.preventDefault();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;

    if (isDragging && !isResizing) {
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
      // Resize from a corner while maintaining square aspect ratio
      const deltaX = currentX - dragStart.x;
      const deltaY = currentY - dragStart.y;

      setCropArea((prev) => {
        let newCrop = { ...prev };
        const minSize = 50; // Minimum crop size

        // Calculate the change in size (use the larger delta to maintain square)
        const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;

        switch (resizeCorner) {
          case "topLeft":
            const newSizeTL = Math.max(minSize, prev.width - delta);
            newCrop.x = prev.x + prev.width - newSizeTL;
            newCrop.y = prev.y + prev.height - newSizeTL;
            newCrop.width = newSizeTL;
            newCrop.height = newSizeTL;
            break;
          case "topRight":
            const newSizeTR = Math.max(minSize, prev.width + delta);
            newCrop.y = prev.y + prev.height - newSizeTR;
            newCrop.width = newSizeTR;
            newCrop.height = newSizeTR;
            break;
          case "bottomLeft":
            const newSizeBL = Math.max(minSize, prev.width - delta);
            newCrop.x = prev.x + prev.width - newSizeBL;
            newCrop.width = newSizeBL;
            newCrop.height = newSizeBL;
            break;
          case "bottomRight":
            const newSizeBR = Math.max(minSize, prev.width + delta);
            newCrop.width = newSizeBR;
            newCrop.height = newSizeBR;
            break;
        }

        // Ensure crop area stays within image bounds
        if (newCrop.x < 0) {
          newCrop.width += newCrop.x;
          newCrop.x = 0;
          newCrop.height = newCrop.width; // Maintain square
        }
        if (newCrop.y < 0) {
          newCrop.height += newCrop.y;
          newCrop.y = 0;
          newCrop.width = newCrop.height; // Maintain square
        }
        if (newCrop.x + newCrop.width > imageDimensions.width) {
          newCrop.width = imageDimensions.width - newCrop.x;
          newCrop.height = newCrop.width; // Maintain square
        }
        if (newCrop.y + newCrop.height > imageDimensions.height) {
          newCrop.height = imageDimensions.height - newCrop.y;
          newCrop.width = newCrop.height; // Maintain square
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

  // Cancel cropping
  const cancelCrop = () => {
    setIsCropping(false);
    if (originalImageSrc) {
      URL.revokeObjectURL(originalImageSrc);
    }
    setOriginalImageSrc("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle crop complete - crop, compress, and upload
  const handleCropComplete = async () => {
    if (!imgRef.current || !canvasRef.current || !eventId) return;

    setIsUploading(true);
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

      // Set canvas size to 400x400 (target size)
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
        async (blob) => {
          if (!blob) {
            toast.error("Failed to crop image. Please try again.");
            setIsUploading(false);
            return;
          }

          try {
            // Convert blob to File
            const croppedFile = new File([blob], "cropped-logo.jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            // Compress the cropped image
            let finalFile = croppedFile;
            if (croppedFile.size > 500 * 1024) {
              // Compress if larger than 500KB
              const compressionOptions = {
                maxSizeMB: 0.5, // Target size: 500KB
                maxWidthOrHeight: 400, // Already 400x400, but keep for safety
                useWebWorker: true,
                fileType: "image/jpeg",
              };

              finalFile = await imageCompression(
                croppedFile,
                compressionOptions
              );
            }

            // Upload the compressed file
            const fd = new FormData();
            fd.append("event[logo]", finalFile);

            const response = await updateEventById(eventId, fd);

            // Update the event data with new logo URL
            setEventData((prev: any) => ({
              ...prev,
              attributes: {
                ...prev.attributes,
                logo_url: response?.data?.data?.attributes?.logo_url,
              },
            }));

            toast.success("Logo updated successfully");

            // Close cropping mode
            setIsCropping(false);
            if (originalImageSrc) {
              URL.revokeObjectURL(originalImageSrc);
            }
            setOriginalImageSrc("");
          } catch (error: any) {
            console.error("Error processing image:", error);
            toast.error(
              error?.response?.data?.message || "Error updating logo"
            );
          } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }
        },
        "image/jpeg",
        0.9 // Quality
      );
    } catch (error: any) {
      console.error("Error cropping image:", error);
      toast.error("Failed to crop image. Please try again.");
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* edit event details */}

        <div className="p-4 sm:p-6 lg:p-6 bg-white rounded-2xl flex flex-col lg:flex-row items-start justify-between gap-4 lg:gap-0">
          {/* logo and event name */}
          <div className="gap-3 flex flex-col sm:flex-row items-center w-full lg:w-auto">
            <div className="relative h-[150px] w-[150px] sm:h-[180px] sm:w-[180px] lg:h-[200px] lg:w-[200px] bg-neutral-50 items-center justify-center flex rounded-2xl shrink-0">
              {/* Upload Loading Overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10">
                  <div className="relative">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <div className="absolute inset-0 h-8 w-8 border-2 border-blue-100 rounded-full"></div>
                  </div>
                  <p className="text-blue-600 text-xs font-medium mt-3">
                    Uploading...
                  </p>
                </div>
              )}

              {/* Edit button - directly triggers file selection */}
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 flex items-center justify-center absolute top-2 right-2 rounded-xl bg-white drop-shadow-2xl transition-all duration-200 z-20 ${
                  isUploading
                    ? "cursor-not-allowed opacity-75"
                    : "cursor-pointer hover:bg-gray-50 hover:scale-105"
                }`}
              >
                {isUploading ? (
                  <div className="relative">
                    <Loader2
                      size={16}
                      className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 animate-spin text-blue-600"
                    />
                    <div className="absolute inset-0 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border border-blue-100 rounded-full"></div>
                  </div>
                ) : (
                  <Edit
                    size={16}
                    className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600"
                  />
                )}
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".svg,.png,.jpg,.jpeg"
                disabled={isUploading}
              />

              {/* Current logo display */}
              {eventData?.attributes?.logo_url ? (
                <img
                  src={eventData.attributes.logo_url}
                  alt="Event Logo"
                  className={`h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 rounded-2xl transition-opacity duration-200 ${
                    isUploading ? "opacity-50" : "opacity-100"
                  }`}
                />
              ) : (
                <div
                  className={`h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 bg-gray-300 flex items-center justify-center rounded-2xl text-gray-500 text-xs font-medium transition-opacity duration-200 ${
                    isUploading ? "opacity-50" : "opacity-100"
                  }`}
                >
                  No Logo
                </div>
              )}
            </div>

            {/* text detail part */}
            <div className="items-center text-center sm:text-left w-full sm:w-auto">
              {/* express or advance event */}
              <div className="p-3 lg:p-3 bg-emerald-50 rounded-3xl items-center flex gap-2 justify-center sm:justify-start w-fit mx-auto sm:mx-0">
                <img src={Assets.icons.expressDot} className="h-2 w-2" alt="" />
                <p className="text-emerald-500 text-xs sm:text-sm">
                  {event_type}
                </p>
              </div>

              {/* event name */}
              <p className="mt-4 lg:mt-4 text-sm sm:text-base lg:text-lg text-slate-800 font-medium">
                {name}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 lg:mt-4">
                <Clock
                  size={16}
                  className="sm:w-5 sm:h-5 lg:w-5 lg:h-5"
                  color="#525252"
                />
                <p className="text-neutral-500 text-xs sm:text-sm font-normal">
                  {event_date_from} {formatTime(event_time_from)} to{" "}
                  {event_date_to} {formatTime(event_time_to)}
                </p>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 lg:mt-4">
                <MapPin
                  size={16}
                  className="sm:w-5 sm:h-5 lg:w-5 lg:h-5"
                  color="#525252"
                />
                <p className="text-neutral-500 text-xs sm:text-sm font-normal">
                  {eventLocation}
                </p>
              </div>

              <p className="mt-4 lg:mt-6 text-neutral-500 text-xs sm:text-sm font-normal">
                Last edit: Before 3hr
              </p>
            </div>
          </div>

          {/* edit button and share button */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div
              onClick={() => {
                const registrationUrl = `${window.location.origin}/register/${eventId}`;
                navigator.clipboard
                  .writeText(registrationUrl)
                  .then(() => {
                    toast.success("Registration link copied to clipboard!");
                  })
                  .catch(() => {
                    toast.error("Failed to copy link");
                  });
              }}
              className="rounded-2xl bg-green-50 py-2 px-4 lg:py-2.5 lg:px-4 flex items-center gap-2 cursor-pointer hover:bg-green-100 transition-colors justify-center shrink-0"
            >
              <Share2 size={16} className="lg:w-5 lg:h-5 text-green-600" />
              <p className="text-green-700 text-xs sm:text-sm font-normal">
                Copy Registration Link
              </p>
            </div>
            <div
              onClick={() =>
                navigate("/express-event", {
                  state: {
                    // Event type and basic info
                    plan: event_type,
                    eventData: eventData,
                    isEditing: true,

                    // All event attributes
                    eventAttributes: {
                      name,
                      event_type,
                      event_date_from,
                      event_date_to,
                      event_time_from,
                      event_time_to,
                      about,
                      location: eventLocation,
                      logo_url,
                      primary_color,
                      secondary_color,
                      registration_page_banner,
                      require_approval,
                    },

                    // Component props
                    chartData,
                    onTimeRangeChange,

                    // Event ID for reference
                    eventId,

                    // Stats data
                    stats,

                    // Additional metadata
                    lastEdit: "Before 3hr",
                    currentStep: 0, // Start from first step when editing
                  },
                })
              }
              className="rounded-2xl bg-[#F2F6FF] py-2 px-4 lg:py-2.5 lg:px-4 flex items-center gap-2 cursor-pointer hover:bg-[#E8F1FF] transition-colors justify-center shrink-0"
            >
              <Edit size={16} className="lg:w-5 lg:h-5" />
              <p className="text-[#202242] text-xs sm:text-sm font-normal">
                Edit Event
              </p>
            </div>
          </div>
        </div>

        {/* registration and user counters - Responsive Grid */}
        <div className="mt-6 lg:mt-6 gap-3 sm:gap-4 lg:gap-3 grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {stats.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="bg-white flex items-center gap-3 p-4 lg:p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-3 lg:p-4 bg-neutral-50 rounded-xl shrink-0">
                <img
                  src={item.icon}
                  alt={item.label}
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              </div>
              <div className="justify-between flex flex-col min-w-0 flex-1">
                <p className="text-xs font-normal sm:text-sm text-[#656C95] line-clamp-2">
                  {item.label}
                </p>
                <p className="mt-1 text-sm sm:text-base lg:text-lg font-medium text-[#202242]">
                  {item.value.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Registrations Activity Chart */}
        <div className="mt-6 lg:mt-6">
          <RegistrationChart
            data={derivedChartData}
            title="Registrations Activity"
            legend="Registered"
            useDefaultFallback={useDefaultFallback}
            onTimeRangeChange={handleTimeRangeChange}
            height="320px"
            xAxisKey="label"
            yAxisKey="registered"
            className="shadow-sm hover:shadow-md transition-shadow"
          />
        </div>
      </div>

      {/* Cropping Modal */}
      {isCropping && originalImageSrc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Crop Image (Drag to adjust)
              </h3>
              <button
                onClick={cancelCrop}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isUploading}
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="mb-6">
              <div
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
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleCropComplete}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Crop & Upload"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} className="hidden" />

      <ToastContainer />
    </>
  );
}

export default HomeSummary;
