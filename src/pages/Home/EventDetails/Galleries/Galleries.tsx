import React, { useState } from "react";
import {
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
} from "lucide-react";

function Galleries() {
  // Sample data - replace with your actual image data
  const [images, setImages] = useState([
    { id: 1, src: "https://picsum.photos/400/250?random=1", selected: false },
    { id: 2, src: "https://picsum.photos/400/250?random=2", selected: false },
    { id: 3, src: "https://picsum.photos/400/250?random=3", selected: false },
    { id: 4, src: "https://picsum.photos/400/250?random=4", selected: false },
    { id: 5, src: "https://picsum.photos/400/250?random=5", selected: false },
    { id: 6, src: "https://picsum.photos/400/250?random=6", selected: false },
    { id: 7, src: "https://picsum.photos/400/250?random=7", selected: false },
    { id: 8, src: "https://picsum.photos/400/250?random=8", selected: false },
    { id: 9, src: "https://picsum.photos/400/250?random=9", selected: false },
    { id: 10, src: "https://picsum.photos/400/250?random=10", selected: false },
    { id: 11, src: "https://picsum.photos/400/250?random=11", selected: false },
    { id: 12, src: "https://picsum.photos/400/250?random=12", selected: false },
    { id: 13, src: "https://picsum.photos/400/250?random=13", selected: false },
    { id: 14, src: "https://picsum.photos/400/250?random=14", selected: false },
    { id: 15, src: "https://picsum.photos/400/250?random=15", selected: false },
    { id: 16, src: "https://picsum.photos/400/250?random=16", selected: false },
    { id: 17, src: "https://picsum.photos/400/250?random=17", selected: false },
    { id: 18, src: "https://picsum.photos/400/250?random=18", selected: false },
    { id: 19, src: "https://picsum.photos/400/250?random=19", selected: false },
    { id: 20, src: "https://picsum.photos/400/250?random=20", selected: false },
  ]);

  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadingFiles, setUploadingFiles] = useState([]);

  const imagesPerPage = 12;
  const totalPages = Math.ceil(images.length / imagesPerPage);
  const selectedImages = images.filter((img) => img.selected);
  const selectedCount = selectedImages.length;

  // Get current page images
  const startIndex = (currentPage - 1) * imagesPerPage;
  const currentImages = images.slice(startIndex, startIndex + imagesPerPage);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setImages(images.map((img) => ({ ...img, selected: newSelectAll })));
  };

  const handleImageSelect = (imageId) => {
    setImages(
      images.map((img) =>
        img.id === imageId ? { ...img, selected: !img.selected } : img
      )
    );
  };

  const handleDelete = () => {
    setImages(images.filter((img) => !img.selected));
    setShowDeleteModal(false);
    setSelectAll(false);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);

    files.forEach((file, index) => {
      const uploadFile = {
        id: Date.now() + index,
        name: file.name,
        size: `${Math.round(file.size / 1024 / 1024)}mb`,
        status: index === 0 ? "uploaded" : index === 1 ? "uploading" : "failed",
        progress: index === 1 ? 20 : 0,
      };

      setUploadingFiles((prev) => [...prev, uploadFile]);

      // Simulate upload process
      if (uploadFile.status === "uploading") {
        let progress = 20;
        const interval = setInterval(() => {
          progress += 20;
          if (progress <= 100) {
            setUploadingFiles((prev) =>
              prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f))
            );
          }
          if (progress >= 100) {
            clearInterval(interval);
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id ? { ...f, status: "uploaded" } : f
              )
            );
          }
        }, 500);
      }
    });
  };

  const removeUploadFile = (fileId) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
        <Upload className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">No images yet</h3>
      <p className="text-sm text-gray-500 mb-4">
        Upload your first images to get started
      </p>
      <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
        <Plus className="w-4 h-4 inline mr-2" />
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

  if (images.length === 0) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="mr-3 w-4 h-4 text-blue-600 rounded border-gray-300"
                disabled
              />
              <span className="text-gray-700 font-medium">Select All</span>
            </div>

            <label className="flex items-center bg-white border-2 border-dashed border-gray-300 hover:border-blue-400 px-4 py-2 rounded-lg cursor-pointer transition-colors">
              <Plus className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-gray-700 font-medium">Add Images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

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
                      <button
                        onClick={() => removeUploadFile(file.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{file.size}</span>
                      {file.status === "uploaded" && (
                        <span className="text-xs text-green-600 font-medium">
                          Uploaded
                        </span>
                      )}
                      {file.status === "uploading" && (
                        <>
                          <span className="text-xs text-blue-600 font-medium">
                            %{file.progress} Uploading
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        </>
                      )}
                      {file.status === "failed" && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-red-600 font-medium">
                            Upload failed
                          </span>
                          <button className="text-xs text-blue-600 hover:text-blue-800">
                            Try Again
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="mr-3 w-4 h-4 text-blue-600 rounded border-gray-300"
            />
            <span className="text-gray-700 font-medium">Select All</span>
            {selectedCount > 0 && (
              <span className="ml-4 text-red-500 font-medium">
                ({selectedCount} Images Selected)
              </span>
            )}
          </div>

          <label className="flex items-center bg-white border-2 border-dashed border-gray-300 hover:border-blue-400 px-4 py-2 rounded-lg cursor-pointer transition-colors">
            <Plus className="w-5 h-5 text-gray-600 mr-2" />
            <span className="text-gray-700 font-medium">Add Images</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
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
                    <button
                      onClick={() => removeUploadFile(file.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{file.size}</span>
                    {file.status === "uploaded" && (
                      <span className="text-xs text-green-600 font-medium">
                        Uploaded
                      </span>
                    )}
                    {file.status === "uploading" && (
                      <>
                        <span className="text-xs text-blue-600 font-medium">
                          %{file.progress} Uploading
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-1 max-w-24">
                          <div
                            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      </>
                    )}
                    {file.status === "failed" && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-red-600 font-medium">
                          Upload failed
                        </span>
                        <button className="text-xs text-blue-600 hover:text-blue-800">
                          Try Again
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {currentImages.map((image) => (
            <div key={image.id} className="relative group">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
                <img
                  src={image.src}
                  alt={`Gallery image ${image.id}`}
                  className="w-full h-full object-cover"
                />

                {/* Selection overlay */}
                <div
                  className={`absolute inset-0 transition-all duration-200 ${
                    image.selected
                      ? "backdrop-blur-xs bg-opacity-20"
                      : " bg-opacity-0 group-hover:bg-opacity-10"
                  }`}
                >
                  {/* Selection checkbox */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleImageSelect(image.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        image.selected
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "bg-white border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {image.selected && <span className="text-xs">✓</span>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
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

            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              const pageNum = index + 1;
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span className="px-2 text-gray-400">...</span>
                <button
                  onClick={() => setCurrentPage(8)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  8
                </button>
                <button
                  onClick={() => setCurrentPage(9)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  9
                </button>
                <button
                  onClick={() => setCurrentPage(10)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  10
                </button>
              </>
            )}

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

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <X className="w-6 h-6 text-red-500" />
              </div>

              <h3 className="text-lg font-semibold text-center text-gray-900 mb-6">
                Delete image ?
              </h3>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Galleries;
