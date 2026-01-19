import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
  ArrowLeft,
  Loader2,
  Eye,
  Maximize2,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import {
  getGalleryApi,
  uploadGalleryImagesApi,
  deleteGalleryImageApi,
} from "@/apis/galleryService";

interface Image {
  id: number;
  filename: string;
  url: string;
  content_type: string;
  byte_size: number;
  selected?: boolean; // UI state
}

interface Gallery {
  id: number;
  title: string;
  description: string;
  images: Image[];
}

// Helper for file size
const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

function Galleries() {
  const { id: eventId, galleryId } = useParams<{
    id: string;
    galleryId: string;
  }>();
  const navigate = useNavigate();

  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection & Modal
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<Image | null>(null);

  // Image View Modal & Carousel
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 12;

  // Upload
  const [uploadingFiles, setUploadingFiles] = useState<
    Array<{
      id: number;
      name: string;
      size: string;
      status: "compressing" | "uploading" | "failed";
      progress: number;
      file: File;
    }>
  >([]);

  // Notification
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Fetch Gallery Data
  const fetchGallery = async () => {
    if (!eventId || !galleryId) return;
    try {
      setLoading(true);
      const response = await getGalleryApi(eventId, galleryId);
      // Assuming response structure based on Swagger explanation, verify if nested
      // Swagger says: { id, title, ... } for gallery.
      // User request implied nested images or separate call?
      // "click on specific galleriy then show the ui of picture where we can add the pictures"
      // If images are not in gallery object, we might need a separate endpoint but Swagger didn't show one for "list images".
      // Usually "Get a specific gallery" returns its relations or there is /galleries/:id/images.
      // I will assume the `images` are included in the Gallery response for now or I handle it if separate.
      // If the API strictly matches the swagger example { id, event_id, title... } without images,
      // then we might assume images are fetched separately. But typical REST implementation might include them.
      // Let's assume they are included as `images` array in the response based on the upload response example showing `gallery: { images: [...] }`.

      const galleryData = response.data;
      console.log("Gallery API Response:", galleryData);

      // Handle the strict JSON:API response structure: response.data.data.attributes.images
      const galleryItem = galleryData.data || galleryData;
      const attributes = galleryItem?.attributes || galleryItem;
      const imagesList = attributes?.images || galleryData.images || [];

      console.log("Gallery Attributes:", attributes);
      console.log("Images List:", imagesList);

      if (attributes) {
        // Create a flattened gallery object for state if needed, or just use attributes
        setGallery({
          id: galleryItem?.id || galleryData.id,
          ...attributes,
        });
      } else {
        setGallery(galleryData);
      }

      if (Array.isArray(imagesList) && imagesList.length > 0) {
        console.log("Setting images:", imagesList);
        setImages(imagesList.map((img: any) => ({ ...img, selected: false })));
      } else {
        // If not provided, maybe empty or need different call. Warn log.
        console.warn("No images found in gallery response", galleryData);
        setImages([]);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
      showNotification("Failed to load gallery details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [eventId, galleryId]);

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

  // Derived State for Pagination
  const totalPages = Math.ceil(images.length / imagesPerPage);
  const selectedImages = images.filter((img) => img.selected);
  const selectedCount = selectedImages.length;

  const startIndex = (currentPage - 1) * imagesPerPage;
  const currentImages = images.slice(startIndex, startIndex + imagesPerPage);

  // Handlers
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setImages(images.map((img) => ({ ...img, selected: newSelectAll })));
  };

  const handleImageSelect = (imageId: number) => {
    setImages(
      images.map((img) =>
        img.id === imageId ? { ...img, selected: !img.selected } : img
      )
    );
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !eventId || !galleryId) return;

    const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes
    const filesArray = Array.from(files);

    // Create initial upload states for all files
    const initialUploads = filesArray.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: formatBytes(file.size),
      status: "compressing" as const,
      progress: 0,
      file: file,
    }));

    setUploadingFiles((prev) => [...prev, ...initialUploads]);

    // Compress images that are larger than 1MB
    const compressedFiles: File[] = [];
    const compressionResults: {
      success: boolean;
      file?: File;
      index: number;
    }[] = [];

    const compressionPromises = filesArray.map(async (file, index) => {
      try {
        if (file.size > MAX_FILE_SIZE) {
          // Compress the image
          const options = {
            maxSizeMB: 1, // Target size: 1MB
            maxWidthOrHeight: 1920, // Max width or height
            useWebWorker: true, // Use web worker for better performance
            fileType: file.type, // Preserve original file type
          };

          const compressedFile = await imageCompression(file, options);
          compressedFiles.push(compressedFile);
          compressionResults.push({
            success: true,
            file: compressedFile,
            index,
          });

          // Update upload state to show compression completed
          setUploadingFiles((prev) =>
            prev.map((upload) =>
              upload.id === initialUploads[index].id
                ? {
                    ...upload,
                    status: "uploading",
                    size: formatBytes(compressedFile.size),
                    file: compressedFile,
                  }
                : upload
            )
          );
        } else {
          // File is already under 1MB, use as is
          compressedFiles.push(file);
          compressionResults.push({ success: true, file: file, index });

          // Update upload state to show ready for upload
          setUploadingFiles((prev) =>
            prev.map((upload) =>
              upload.id === initialUploads[index].id
                ? { ...upload, status: "uploading" }
                : upload
            )
          );
        }
      } catch (error) {
        console.error(`Error compressing ${file.name}:`, error);
        compressionResults.push({ success: false, index });

        // If compression fails, try to use original file if it's close to 1MB
        if (file.size <= MAX_FILE_SIZE * 1.5) {
          compressedFiles.push(file);
          compressionResults[compressionResults.length - 1] = {
            success: true,
            file: file,
            index,
          };
          setUploadingFiles((prev) =>
            prev.map((upload) =>
              upload.id === initialUploads[index].id
                ? { ...upload, status: "uploading" }
                : upload
            )
          );
        } else {
          // File is too large and compression failed
          setUploadingFiles((prev) =>
            prev.map((upload) =>
              upload.id === initialUploads[index].id
                ? { ...upload, status: "failed" }
                : upload
            )
          );
          showNotification(`Failed to compress ${file.name}. File is too large.`, "error");
        }
      }
    });

    // Wait for all compression operations to complete
    await Promise.all(compressionPromises);

    // Filter out failed files - use compressionResults to determine valid files
    const validFiles = compressionResults
      .filter((result) => result.success === true && result.file)
      .map((result) => result.file!);

    // If no valid files after compression, return early
    if (validFiles.length === 0) {
      // Reset input
      if (event.target) {
        event.target.value = "";
      }
      // Clear failed uploads after a delay
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((f) => f.status !== "failed"));
      }, 3000);
      return;
    }

    // Real Upload Implementation
    const formData = new FormData();
    validFiles.forEach((file) => {
      formData.append("images", file); // API expects "images" as array parameter
    });

    try {
      // We upload all at once as per API "images" parameter in Swagger
      // Optimistic UI update could be tricky with bulk upload, but we show "Uploading..."

      const uploadResponse = await uploadGalleryImagesApi(
        eventId,
        galleryId,
        formData
      );
      console.log("Upload Response:", uploadResponse);

      // Check if the response includes the updated gallery with images
      const responseData = uploadResponse.data;
      const galleryData = responseData?.gallery || responseData?.data;
      const uploadedImages = galleryData?.images || responseData?.images || [];

      showNotification("Images uploaded successfully", "success");
      setUploadingFiles([]); // Clear uploads on success

      // If response includes images, update state immediately, then refresh
      if (Array.isArray(uploadedImages) && uploadedImages.length > 0) {
        console.log("Updating images from upload response:", uploadedImages);
        setImages((prev) => [
          ...prev,
          ...uploadedImages.map((img: any) => ({ ...img, selected: false })),
        ]);
      }

      // Always refresh to get the latest state from server
      await fetchGallery();
    } catch (error: any) {
      console.error("Upload failed", error);

      // Handle specific error cases
      let errorMessage = "Failed to upload images";

      if (error.response?.status === 413) {
        errorMessage =
          "File size too large. Maximum file size is 1MB per image.";
      } else if (error.response?.status === 422) {
        errorMessage =
          error.response?.data?.errors?.join(", ") ||
          "Validation failed. Please check your files.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showNotification(errorMessage, "error");
      setUploadingFiles((prev) =>
        prev.map((f) => ({ ...f, status: "failed" }))
      );

      // Auto remove failed uploads after 5 seconds
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((f) => f.status !== "failed"));
      }, 5000);
    } finally {
      // Reset input after upload attempt
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const removeUploadFile = (fileId: number) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const initiateDelete = (image: Image) => {
    setImageToDelete(image);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventId || !galleryId || !imageToDelete) return;

    try {
      await deleteGalleryImageApi(eventId, galleryId, imageToDelete.id);
      showNotification("Image deleted successfully", "success");
      setShowDeleteModal(false);
      setImageToDelete(null);
      // Remove locally to avoid full underlying re-fetch flicker if desired, or just fetch
      setImages((prev) => prev.filter((img) => img.id !== imageToDelete.id));

      // If viewing images, adjust index if needed
      if (showImageViewer) {
        const deletedIndex = images.findIndex(
          (img) => img.id === imageToDelete.id
        );
        if (deletedIndex !== -1) {
          // If we deleted the last image, go to previous
          if (currentImageIndex >= images.length - 1) {
            setCurrentImageIndex(Math.max(0, images.length - 2));
          }

          // If no images left, close the viewer
          if (images.length <= 1) {
            setShowImageViewer(false);
          }
        }
      }
    } catch (error: any) {
      console.error("Delete failed", error);
      console.error("Delete failed", error?.data);

      showNotification(error?.data?.errors?.[0]?.detail || "Failed to delete image", "error");
    }
  };

  // Open image viewer
  const openImageViewer = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageViewer(true);
  };

  // Navigate images in viewer
  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!showImageViewer) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") setShowImageViewer(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showImageViewer, currentImageIndex, images.length]);

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <Upload className="w-12 h-12 text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">No images yet</h3>
      <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
        Start building your gallery by uploading your first photos
      </p>
      <label className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 font-medium">
        <Plus className="w-5 h-5" />
        Add Images
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>
    </div>
  );

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen animate-pulse">
      <div className="mx-auto">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
            <div>
              <div className="h-7 w-48 bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded"></div>
            </div>
          </div>
          {/* Stats Skeleton */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        {/* Toolbar Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="h-5 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
            <div className="h-10 w-36 bg-gray-200 rounded-xl"></div>
          </div>
        </div>

        {/* Image Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
            <div key={item} className="relative">
              <div className="bg-gray-200 rounded-xl aspect-square shadow-sm"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow border border-gray-100"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {gallery?.title || "Gallery"}
              </h1>
              {gallery?.description && (
                <p className="text-gray-500 text-sm mt-0.5">
                  {gallery.description}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-3 text-sm text-gray-500">
            <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium">
              {images.length} {images.length === 1 ? "Photo" : "Photos"}
            </span>
          </div>
        </div>

        {images.length === 0 && uploadingFiles.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-5 h-5 text-blue-600 rounded-md border-gray-300 cursor-pointer focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">Select All</span>
                </label>
                {selectedCount > 0 && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedCount} selected
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {images.length > 0 && (
                  <button
                    onClick={() => openImageViewer(0)}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                  >
                    <Eye className="w-5 h-5" />
                    <span>View All Images</span>
                  </button>
                )}
                <label className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium">
                  <Plus className="w-5 h-5" />
                  <span>Add Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Upload Progress */}
            {uploadingFiles.length > 0 && (
              <div className="mb-6 space-y-2">
                {uploadingFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {file.name}
                        </span>
                        {/* <button
                                onClick={() => removeUploadFile(file.id)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button> */}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {file.size}
                        </span>
                        {file.status === "failed" ? (
                          <span className="text-xs text-red-600">Failed</span>
                        ) : file.status === "compressing" ? (
                          <span className="text-xs text-yellow-600">
                            Compressing...
                          </span>
                        ) : (
                          <span className="text-xs text-blue-600">
                            Uploading...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Image Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              {currentImages.map((image, idx) => {
                const globalIndex = startIndex + idx;
                return (
                  <div key={image.id} className="relative group">
                    <div
                      className={`relative bg-gray-100 rounded-xl overflow-hidden aspect-square shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                        image.selected
                          ? "ring-3 ring-blue-500 ring-offset-2"
                          : ""
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.filename}
                        onClick={() => openImageViewer(globalIndex)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                      />

                      {/* Selection overlay */}
                      <div
                        className={`absolute inset-0 transition-all duration-200 ${
                          image.selected
                            ? "bg-blue-500/20"
                            : "bg-black/0 group-hover:bg-black/10"
                        }`}
                      />

                      {/* Selection checkbox */}
                      <div className="absolute top-2 left-2 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageSelect(image.id);
                          }}
                          className={`w-6 h-6 rounded-md flex items-center justify-center transition-all shadow-sm ${
                            image.selected
                              ? "bg-blue-500 text-white"
                              : "bg-white/90 backdrop-blur-sm text-gray-400 opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          {image.selected && (
                            <span className="text-sm font-bold">✓</span>
                          )}
                        </button>
                      </div>

                      {/* View fullscreen button */}
                      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openImageViewer(globalIndex);
                          }}
                          className="w-8 h-8 rounded-md bg-white/90 backdrop-blur-sm text-gray-600 hover:text-gray-900 hover:bg-white flex items-center justify-center transition-all shadow-sm"
                          title="View fullscreen"
                        >
                          <Maximize2 size={16} />
                        </button>
                      </div>

                      {/* Delete button - positioned below fullscreen button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          initiateDelete(image);
                        }}
                        className="absolute top-12 right-2 bg-white/90 backdrop-blur-sm text-red-500 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500 hover:text-white shadow-sm z-10"
                        title="Delete image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>

                <span className="px-4 text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div
            onClick={() => setShowDeleteModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          >
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
              <div
                onClick={() => setShowDeleteModal(false)}
                className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 cursor-pointer"
              >
                <X className="w-6 h-6 text-red-500" />
              </div>

              <h3 className="text-lg font-semibold text-center text-gray-900 mb-6">
                Delete image?
              </h3>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Viewer Modal / Lightbox */}
        {showImageViewer && images.length > 0 && (
          <div
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowImageViewer(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setShowImageViewer(false)}
              className="absolute top-4 right-4 z-[60] text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <X size={24} />
            </button>

            {/* Image container */}
            <div
              className="relative w-full h-full flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous button */}
              {images.length > 1 && (
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 z-50 text-white hover:text-gray-300 transition-colors p-3 rounded-full hover:bg-white/10 bg-black/30 backdrop-blur-sm"
                >
                  <ChevronLeft size={32} />
                </button>
              )}

              {/* Main image */}
              <div className="max-w-7xl max-h-full flex flex-col items-center">
                <img
                  src={images[currentImageIndex]?.url}
                  alt={images[currentImageIndex]?.filename || "Gallery image"}
                  className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                />

                {/* Image info */}
                <div className="mt-4 text-center text-white">
                  <p className="text-sm font-medium">
                    {images[currentImageIndex]?.filename}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {currentImageIndex + 1} of {images.length}
                  </p>
                </div>
              </div>

              {/* Next button */}
              {images.length > 1 && (
                <button
                  onClick={goToNext}
                  className="absolute right-4 z-50 text-white hover:text-gray-300 transition-colors p-3 rounded-full hover:bg-white/10 bg-black/30 backdrop-blur-sm"
                >
                  <ChevronRight size={32} />
                </button>
              )}

              {/* Thumbnail strip at bottom - above delete button */}
              {images.length > 1 && (
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50 max-w-4xl overflow-x-auto px-4">
                  <div className="flex gap-2 bg-black/30 backdrop-blur-sm rounded-lg p-2">
                    {images.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                          idx === currentImageIndex
                            ? "border-blue-500 scale-110"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.filename}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Delete button at bottom center - outside image container, fixed position */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[60] pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (images[currentImageIndex]) {
                    initiateDelete(images[currentImageIndex]);
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium shadow-lg backdrop-blur-sm"
              >
                <Trash2 size={18} />
                <span>Delete Image</span>
              </button>
            </div>
          </div>
        )}
      </div>

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

export default Galleries;
