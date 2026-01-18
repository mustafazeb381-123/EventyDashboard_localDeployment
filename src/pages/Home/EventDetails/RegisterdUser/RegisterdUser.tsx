import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { deleteEventUser } from "@/apis/apiHelpers";
import { updateEventUser } from "@/apis/apiHelpers";
import { sendCredentials } from "@/apis/apiHelpers";
import { downloadEventUserTemplate } from "@/apis/apiHelpers";
import { uploadEventUserTemplate } from "@/apis/apiHelpers";
import { getEventUsers } from "@/apis/apiHelpers";
import { resetCheckInOutStatus } from "@/apis/apiHelpers";

import Pagination from "@/components/Pagination";
import Search from "@/components/Search";
import { Skeleton } from "@/components/ui/skeleton";

import { Trash2, Mail, Plus, Edit, RotateCcw, X } from "lucide-react";

// Image compression function
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxWidth = 1200;
        const maxHeight = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.8
        );
      };
    };
  });
};

// Helper to derive user initial
const getUserInitial = (user: any) => {
  const nameOrEmail =
    user?.attributes?.name ||
    user?.attributes?.email ||
    user?.attributes?.phone_number ||
    "U";
  const trimmed = typeof nameOrEmail === "string" ? nameOrEmail.trim() : "U";
  return (trimmed.charAt(0) || "U").toUpperCase();
};

// Avatar component with image fallback
const UserAvatar = ({ user }: { user: any }) => {
  const [loadError, setLoadError] = useState(false);
  const imageUrl = user?.attributes?.image; // use image from attributes

  if (imageUrl && !loadError) {
    return (
      <img
        src={imageUrl}
        alt={user?.attributes?.name || "User Avatar"}
        className="w-10 h-10 rounded-full object-cover"
        onError={() => setLoadError(true)}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
      {getUserInitial(user)}
    </div>
  );
};

function RegisterdUser() {
  const location = useLocation();
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventUsers, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [editAvatarError, setEditAvatarError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const itemsPerPage = 10; // Server-side pagination items per page

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sendingCredentials, setSendingCredentials] = useState(false);
  const [sendingCredentialsUserId, setSendingCredentialsUserId] = useState<
    string | null
  >(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Store event user length in localStorage whenever pagination changes
  useEffect(() => {
    if (eventId && pagination?.total_count) {
      const storageKey = `eventUsersLength_${eventId}`;
      localStorage.setItem(storageKey, pagination.total_count.toString());
    }
  }, [pagination, eventId]);

  // Reset avatar error state when switching edit target
  useEffect(() => {
    setEditAvatarError(false);
  }, [editingUser]);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: "success" | "error" | "info") => {
    setNotification({ message, type });
  };

  const [editForm, setEditForm] = useState({
    image: "",
    name: "",
    email: "",
    phone_number: "",
    organization: "",
    position: "",
    user_type: "",
    printed: false,
  });

  const handleDownloadTemplate = async () => {
    if (!eventId) return;

    setDownloadingTemplate(true); // start loader

    try {
      const response = await downloadEventUserTemplate(eventId);
      console.log("Template response:", response);

      const blob = response.data;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "event_users_template.xlsx");
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);

      showNotification("Template downloaded successfully!", "success");
    } catch (error) {
      console.error("Error downloading template:", error);
      showNotification("Failed to download template.", "error");
    } finally {
      setDownloadingTemplate(false); // stop loader
    }
  };

  const handleUploadTemplate = async () => {
    if (!uploadFile) {
      showNotification("Please select a file!", "error");
      return;
    }
    if (!eventId) {
      showNotification("Event ID is required!", "error");
      return;
    }

    setUploadingTemplate(true); // start loader

    try {
      const response = await uploadEventUserTemplate(eventId, uploadFile);
      console.log("Import response:", response.data);
      showNotification("Users imported successfully!", "success");

      fetchUsers(eventId, currentPage); // refresh user list

      // Reset uploadFile so the submit button disappears
      setUploadFile(null);

      // Close modal
      setIsImportModalOpen(false);
    } catch (err: any) {
      console.error("Error importing users:", err);

      if (err.response) {
        console.error("Server response data:", err.response.data);
        showNotification(
          `Import failed: ${err.response.data?.message || "Validation error"}`,
          "error"
        );
      } else {
        showNotification("Failed to import users. Check the file and try again.", "error");
      }
    } finally {
      setUploadingTemplate(false); // stop loader
    }
  };

  const handleSendCredentials = async (userIds?: string[]) => {
    const idsToSend = userIds || selectedUsers;

    if (!eventId || idsToSend.length === 0) return;

    // Track which user(s) are sending credentials
    const isSingleUser = userIds && userIds.length === 1;
    if (isSingleUser) {
      setSendingCredentialsUserId(userIds[0]);
    }
    setSendingCredentials(true);

    try {
      const response = await sendCredentials(eventId, idsToSend);
      console.log("API response:", response.data);

      if (isSingleUser) {
        showNotification("Credentials sent to user successfully!", "success");
      } else {
        showNotification(
          `Credentials sent to ${idsToSend.length} users successfully!`,
          "success"
        );
      }
      setSelectedUsers([]);
    } catch (err) {
      console.error("Error sending credentials:", err);

      if (isSingleUser) {
        showNotification("Failed to send credentials to user. Please try again.", "error");
      } else {
        showNotification("Failed to send credentials. Please try again.", "error");
      }
    } finally {
      setSendingCredentials(false);
      setSendingCredentialsUserId(null);
    }
  };

  const handleUpdateUser = async () => {
    if (!eventId || !editingUser) return;

    setIsUpdating(true);

    try {
      const formData = new FormData();

      // Append user fields
      if (editForm.name) formData.append("event_user[name]", editForm.name);
      if (editForm.phone_number)
        formData.append("event_user[phone_number]", editForm.phone_number);
      if (editForm.email) formData.append("event_user[email]", editForm.email);
      if (editForm.position)
        formData.append("event_user[position]", editForm.position);
      if (editForm.organization)
        formData.append("event_user[organization]", editForm.organization);
      if (editForm.printed !== undefined)
        formData.append("event_user[printed]", String(editForm.printed));

      // ✅ Add user_type
      if (editForm.user_type)
        formData.append("event_user[user_type]", editForm.user_type);

      // Append image if provided
      if (selectedImageFile)
        formData.append("event_user[image]", selectedImageFile);

      const response = await updateEventUser(eventId, editingUser.id, formData);
      console.log("Update response:", response.data);

      // Get updated user from API if returned
      const updatedUser = response?.data?.data;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                attributes: {
                  ...u.attributes,
                  ...editForm, // includes user_type now
                  image: updatedUser?.attributes?.image
                    ? `${updatedUser.attributes.image}?t=${Date.now()}`
                    : u.attributes.image,
                  updated_at: new Date().toISOString(),
                },
              }
            : u
        )
      );

      showNotification("User updated successfully!", "success");
      setEditingUser(null);
      setSelectedImageFile(null);

      // Refresh current page to show updated data
      fetchUsers(eventId, currentPage);
    } catch (error) {
      console.error("Error updating user:", error);
      showNotification("Failed to update user. Please try again.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle event ID change from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const idFromQuery = searchParams.get("eventId");

    console.log("🔍 URL search params:", {
      search: location.search,
      idFromQuery,
      currentEventId: eventId,
    });

    if (idFromQuery && idFromQuery !== eventId) {
      // Event changed, reset to page 1
      console.log("✅ Setting eventId from URL:", idFromQuery);
      setEventId(idFromQuery);
      setCurrentPage(1);
    } else if (!idFromQuery && eventId) {
      // If no eventId in URL but we have one in state, keep it
      console.log("⚠️ No eventId in URL, keeping current eventId:", eventId);
    } else if (!idFromQuery && !eventId) {
      // Try to get from localStorage as fallback
      const storedEventId =
        localStorage.getItem("create_eventId") ||
        localStorage.getItem("edit_eventId");
      if (storedEventId) {
        console.log("✅ Using eventId from localStorage:", storedEventId);
        setEventId(storedEventId);
      } else {
        console.log("⚠️ No eventId found in URL or localStorage");
      }
    }
  }, [location.search, eventId]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to page 1 when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users when eventId, currentPage, or search term changes
  useEffect(() => {
    if (eventId && currentPage > 0) {
      if (debouncedSearchTerm) {
        searchUsersAcrossPages(eventId, debouncedSearchTerm);
      } else {
        fetchUsers(eventId, currentPage);
      }
    }
  }, [eventId, currentPage, debouncedSearchTerm]);

  const fetchUsers = async (id: string, page: number = 1) => {
    setLoadingUsers(true);
    setIsSearching(false);
    try {
      const response = await getEventUsers(id, {
        page,
        per_page: itemsPerPage,
      });
      console.log("get event users api:", response.data);

      // Handle JSON:API response structure
      const responseData = response.data?.data || response.data;
      const users = Array.isArray(responseData)
        ? responseData
        : responseData?.data || [];

      setUsers(users);

      // Set pagination metadata
      const paginationMeta =
        response.data?.meta?.pagination || response.data?.pagination;
      if (paginationMeta) {
        setPagination(paginationMeta);
        // Update localStorage with total count
        if (id) {
          const storageKey = `eventUsersLength_${id}`;
          localStorage.setItem(
            storageKey,
            paginationMeta.total_count?.toString() || "0"
          );
        }
      }
    } catch (error) {
      console.error("Error fetching event users:", error);
      showNotification("Failed to load users", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Search users across all pages
  const searchUsersAcrossPages = async (id: string, searchQuery: string) => {
    setLoadingUsers(true);
    setIsSearching(true);
    try {
      // First, get the first page to know total pages
      const firstPageResponse = await getEventUsers(id, {
        page: 1,
        per_page: itemsPerPage,
      });

      const paginationMeta =
        firstPageResponse.data?.meta?.pagination ||
        firstPageResponse.data?.pagination;
      const totalPages = paginationMeta?.total_pages || 1;

      // Search through all pages
      const allMatchingUsers: any[] = [];
      const searchLower = searchQuery.toLowerCase();

      // Fetch all pages and filter
      const pagePromises = [];
      for (let page = 1; page <= totalPages; page++) {
        pagePromises.push(
          getEventUsers(id, {
            page,
            per_page: itemsPerPage,
          })
        );
      }

      const allPagesResponses = await Promise.all(pagePromises);

      // Filter users from all pages
      allPagesResponses.forEach((response) => {
        const responseData = response.data?.data || response.data;
        const users = Array.isArray(responseData)
          ? responseData
          : responseData?.data || [];

        const matchingUsers = users.filter((user: any) => {
          const name = user.attributes?.name?.toLowerCase() || "";
          const email = user.attributes?.email?.toLowerCase() || "";
          const organization =
            user.attributes?.organization?.toLowerCase() || "";
          const phoneNumber =
            user.attributes?.phone_number?.toLowerCase() || "";

          return (
            name.includes(searchLower) ||
            email.includes(searchLower) ||
            organization.includes(searchLower) ||
            phoneNumber.includes(searchLower)
          );
        });

        allMatchingUsers.push(...matchingUsers);
      });

      // Paginate the search results
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedResults = allMatchingUsers.slice(startIndex, endIndex);

      setUsers(paginatedResults);

      // Set pagination metadata for search results
      setPagination({
        current_page: currentPage,
        total_pages: Math.ceil(allMatchingUsers.length / itemsPerPage),
        total_count: allMatchingUsers.length,
        per_page: itemsPerPage,
        next_page:
          currentPage < Math.ceil(allMatchingUsers.length / itemsPerPage)
            ? currentPage + 1
            : null,
        prev_page: currentPage > 1 ? currentPage - 1 : null,
      });
    } catch (error) {
      console.error("Error searching users:", error);
      showNotification("Failed to search users", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    const formattedDate = date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return (
      <>
        {formattedDate}
        <br />
        {formattedTime}
      </>
    );
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!eventId || !userToDelete) {
      showNotification("Event ID is missing. Cannot delete user.", "error");
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      return;
    }

    try {
      setDeletingUserId(userToDelete.id);

      await deleteEventUser(eventId, userToDelete.id);

      showNotification("User deleted successfully", "success");

      fetchUsers(eventId, currentPage);
      setUserToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      console.error("Error deleting user:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        requestUrl: error.config?.url,
      });

      showNotification(
        `Failed to delete user: ${error.response?.data?.error || error.message}`,
        "error"
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(eventUsers.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const getUserInitial = (user: any) => {
    const nameOrEmail =
      user?.attributes?.name ||
      user?.attributes?.email ||
      user?.attributes?.phone_number ||
      "U";
    const trimmed =
      typeof nameOrEmail === "string" ? nameOrEmail.trim() : "U";
    return (trimmed.charAt(0) || "U").toUpperCase();
  };

  const UserAvatar = ({ user }: { user: any }) => {
    const [loadError, setLoadError] = useState(false);
    const imageUrl = user?.attributes?.image; // use image from attributes

    if (imageUrl && !loadError) {
      return (
        <img
          src={imageUrl}
          alt={user?.attributes?.name || "User Avatar"}
          className="w-10 h-10 rounded-full object-cover"
          onError={() => setLoadError(true)}
        />
      );
    }

    return (
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
        {getUserInitial(user)}
      </div>
    );
  };

  const handleResetCheckInOut = async (userId: string) => {
    if (!eventId) {
      showNotification("Event ID is missing.", "error");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to reset this user's check-in/out status?"
      )
    )
      return;

    try {
      const response = await resetCheckInOutStatus(eventId, userId);
      console.log("Reset response:", response.data);

      showNotification("Check-in/out status reset successfully!", "success");
    } catch (error: any) {
      console.error("Error resetting status:", error);
      showNotification("Failed to reset check-in/out status.", "error");
    }
  };

  return (
    <div className="bg-white min-h-screen p-6">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      <div className="max-w-8xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Registered Users</h1>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">Total</h1>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                {eventUsers.length} Users
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Import Attendees
          </button>

          {isImportModalOpen && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
              onClick={() => setIsImportModalOpen(false)} // Close on outside click
            >
              <div
                className="bg-white p-6 rounded-lg w-96"
                onClick={(e) => e.stopPropagation()} // Prevent modal content clicks from closing
              >
                <h2 className="text-xl font-bold mb-4 text-center">
                  Import Attendees
                </h2>

                {/* Download Template */}
                <button
                  onClick={handleDownloadTemplate}
                  className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full flex justify-center items-center gap-2 disabled:opacity-50"
                  disabled={downloadingTemplate}
                >
                  {downloadingTemplate ? "...Downloading" : "Download Template"}
                </button>

                {/* File Upload */}
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-sm border border-gray-300 rounded-lg py-2 px-3 transition-colors text-gray-500 bg-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer mb-4"
                />

                {/* Submit Button (only show if file is selected) */}

                <button
                  onClick={handleUploadTemplate}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={uploadingTemplate} // disable while uploading
                >
                  {uploadingTemplate ? "...Uploading" : "Submit"}
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedUsers.length > 0 && (
          <div className="flex items-center justify-between mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-700 font-medium">
              {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""}{" "}
              selected
            </p>

            <button
              onClick={() => handleSendCredentials()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              disabled={sendingCredentials} // disable while sending
            >
              <Mail className="w-4 h-4" />
              {sendingCredentials ? "...Sending" : "Send Credentials"}
            </button>
          </div>
        )}

        <div className="flex justify-between mb-4">
          <div className="relative w-1/3">
            <Search
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
              }}
              placeholder="Search users across all pages..."
            />
          </div>
          <div>
            <span className="text-gray-600 text-sm">
              {pagination ? (
                <>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, pagination.total_count)}{" "}
                  of {pagination.total_count} users
                </>
              ) : (
                <>Loading...</>
              )}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          {loadingUsers ? (
            <div className="p-6">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-6 py-3 text-left">
                      <Skeleton className="w-4 h-4" />
                    </th>
                    <th className="px-6 py-3 text-left">
                      <Skeleton className="h-4 w-12" />
                    </th>
                    <th className="px-6 py-3 text-left">
                      <Skeleton className="h-4 w-20" />
                    </th>
                    <th className="px-6 py-3 text-left">
                      <Skeleton className="h-4 w-24" />
                    </th>
                    <th className="px-6 py-3 text-left">
                      <Skeleton className="h-4 w-28" />
                    </th>
                    <th className="px-6 py-3 text-left">
                      <Skeleton className="h-4 w-16" />
                    </th>
                    <th className="px-6 py-3 text-left">
                      <Skeleton className="h-4 w-20" />
                    </th>
                    <th className="px-6 py-3 text-left">
                      <Skeleton className="h-4 w-20" />
                    </th>
                    <th className="px-6 py-3 text-left">
                      <Skeleton className="h-4 w-16" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4">
                        <Skeleton className="w-4 h-4" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-12" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-36" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-8 h-8 rounded-lg" />
                          <Skeleton className="w-8 h-8 rounded-lg" />
                          <Skeleton className="w-8 h-8 rounded-lg" />
                          <Skeleton className="w-8 h-8 rounded-lg" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        onChange={handleSelectAll}
                        checked={
                          eventUsers.length > 0 &&
                          selectedUsers.length === eventUsers.length
                        }
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {eventUsers.length === 0 && !loadingUsers ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        {isSearching && debouncedSearchTerm
                          ? `No users found matching "${debouncedSearchTerm}"`
                          : "No users found"}
                      </td>
                    </tr>
                  ) : (
                    eventUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {user.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={user} />
                            <span className="text-sm font-medium text-gray-900">
                              {user?.attributes?.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user?.attributes?.email}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user?.attributes?.organization}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user?.attributes?.user_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(user?.attributes?.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(user?.attributes?.updated_at)}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleResetCheckInOut(user.id)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setEditForm({
                                  name: user?.attributes?.name || "",
                                  email: user?.attributes?.email || "",
                                  phone_number:
                                    user?.attributes?.phone_number || "",
                                  organization:
                                    user?.attributes?.organization || "",
                                  position: user?.attributes?.position || "",
                                  image: user?.attributes?.image || "",
                                  user_type: user?.attributes?.user_type || "",
                                  printed: user?.attributes?.printed || false,
                                });
                              }}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleSendCredentials([user.id])}
                              disabled={sendingCredentialsUserId === user.id}
                              className={`p-2 rounded-lg transition-colors ${
                                sendingCredentialsUserId === user.id
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-blue-600 hover:bg-blue-50"
                              }`}
                            >
                              {sendingCredentialsUserId === user.id ? (
                                <div
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    border: "2px solid #d1d5db",
                                    borderTop: "2px solid #3b82f6",
                                    borderRadius: "50%",
                                    animation: "spin 1s linear infinite",
                                  }}
                                />
                              ) : (
                                <Mail className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {pagination && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.total_pages || 1}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    // Scroll to top when page changes
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="m-2"
                />
              )}
            </>
          )}

          {isDeleteModalOpen && userToDelete && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
              onClick={() => {
                if (!deletingUserId) {
                  setIsDeleteModalOpen(false);
                  setUserToDelete(null);
                }
              }}
            >
              <div
                className="bg-white p-6 rounded-lg w-96"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-2 text-gray-900">
                  Delete user?
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete{" "}
                  {userToDelete.attributes?.name || "this user"}? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setUserToDelete(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    disabled={!!deletingUserId}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteUser}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    disabled={!!deletingUserId}
                  >
                    {deletingUserId ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {editingUser && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
              onClick={() => setEditingUser(null)}
            >
              <div
                className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Edit User
                  </h2>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Avatar Section */}
                <div className="relative w-28 h-28 mb-6 mx-auto">
                  {selectedImageFile ? (
                    <img
                      src={URL.createObjectURL(selectedImageFile)}
                      alt="Preview"
                      className="w-28 h-28 rounded-full object-cover mx-auto shadow-lg border-4 border-blue-100"
                    />
                  ) : editingUser.attributes.image && !editAvatarError ? (
                    <img
                      src={editingUser.attributes.image}
                      alt="Current"
                      className="w-28 h-28 rounded-full object-cover mx-auto shadow-lg border-4 border-blue-100"
                      onError={() => setEditAvatarError(true)}
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-blue-50 flex items-center justify-center mx-auto shadow-lg border-4 border-blue-100 text-3xl font-semibold text-blue-500">
                      {getUserInitial(editingUser)}
                    </div>
                  )}

                  <label
                    htmlFor="imageUpload"
                    className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-700 transition text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </label>

                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const compressedFile = await compressImage(
                          e.target.files[0]
                        );
                        setSelectedImageFile(compressedFile);
                        showNotification("Image compressed and ready to upload", "info");
                      }
                    }}
                  />
                </div>

                {/* Form Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      placeholder="Organization"
                      value={editForm.organization}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          organization: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Type
                    </label>
                    <input
                      type="text"
                      placeholder="User Type"
                      value={editForm.user_type}
                      onChange={(e) =>
                        setEditForm({ ...editForm, user_type: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setEditingUser(null)}
                    className="flex-1 px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateUser}
                    disabled={isUpdating}
                    className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition ${
                      isUpdating
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isUpdating ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
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

export default RegisterdUser;
