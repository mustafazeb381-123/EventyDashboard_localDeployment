import { useEffect, useState, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { deleteEventUser } from "@/apis/apiHelpers";
import { updateEventUser } from "@/apis/apiHelpers";
import { sendCredentials } from "@/apis/apiHelpers";
import { downloadEventUserTemplate } from "@/apis/apiHelpers";
import { uploadEventUserTemplate } from "@/apis/apiHelpers";
import { getEventUsers } from "@/apis/apiHelpers";
import { resetCheckInOutStatus } from "@/apis/apiHelpers";
import { approveEventUsers } from "@/apis/apiHelpers";
import { rejectEventUsers } from "@/apis/apiHelpers";

import Pagination from "@/components/Pagination";
import Search from "@/components/Search";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Trash2,
  Mail,
  Plus,
  Edit,
  RotateCcw,
  X,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  FileDown,
  FileSpreadsheet,
  MoreVertical,
  Info,
} from "lucide-react";

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
          0.8,
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

// Helper to get approval status: "approved" | "rejected" | "pending"
const getApprovalStatus = (user: any): "approved" | "rejected" | "pending" => {
  const status = user?.attributes?.approval_status;
  const approved = user?.attributes?.approved;
  if (status === "approved" || approved === true) return "approved";
  if (status === "rejected" || approved === false) return "rejected";
  return "pending";
};

// Helper to get attendance status for filtering
const getAttendanceStatus = (
  user: any,
): "attended" | "not_attended" | "checked_in" | null => {
  const statuses = user?.attributes?.check_user_area_statuses;
  if (Array.isArray(statuses) && statuses.length > 0) {
    const hasCheckIn = statuses.some((s: any) => s?.check_in);
    const hasCheckOut = statuses.some((s: any) => s?.check_out);
    if (hasCheckOut) return "attended";
    if (hasCheckIn) return "checked_in";
  }
  if (user?.attributes?.attended === true) return "attended";
  return "not_attended";
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
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("search") ?? "",
  );
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>(
    () => searchParams.get("approvalStatus") ?? "all",
  );
  const [filterGuestType, setFilterGuestType] = useState<string>(
    () => searchParams.get("guestType") ?? "all",
  );
  const [filterAttendanceStatus, setFilterAttendanceStatus] = useState<string>(
    () => searchParams.get("attendanceStatus") ?? "all",
  );
  const [filterDateFrom, setFilterDateFrom] = useState<string>(
    () => searchParams.get("dateFrom") ?? "",
  );
  const [filterDateTo, setFilterDateTo] = useState<string>(
    () => searchParams.get("dateTo") ?? "",
  );
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
  const [openActionsUserId, setOpenActionsUserId] = useState<string | null>(
    null,
  );
  const [actionsTriggerRect, setActionsTriggerRect] = useState<DOMRect | null>(
    null,
  );
  const [userForInfoModal, setUserForInfoModal] = useState<any | null>(null);

  const closeActionsMenu = () => {
    setOpenActionsUserId(null);
    setActionsTriggerRect(null);
  };
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<any | null>(null);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [approvingBulk, setApprovingBulk] = useState(false);
  const [rejectingBulk, setRejectingBulk] = useState(false);
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
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

  const showNotification = (
    message: string,
    type: "success" | "error" | "info",
  ) => {
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
          "error",
        );
      } else {
        showNotification(
          "Failed to import users. Check the file and try again.",
          "error",
        );
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
          "success",
        );
      }
      setSelectedUsers([]);
    } catch (err) {
      console.error("Error sending credentials:", err);

      if (isSingleUser) {
        showNotification(
          "Failed to send credentials to user. Please try again.",
          "error",
        );
      } else {
        showNotification(
          "Failed to send credentials. Please try again.",
          "error",
        );
      }
    } finally {
      setSendingCredentials(false);
      setSendingCredentialsUserId(null);
    }
  };

  const handleApproveUsers = async (userIds?: string[]) => {
    const idsToUse = userIds ?? selectedUsers;
    if (!eventId || idsToUse.length === 0) return;
    const isSingle = !!userIds && userIds.length === 1;
    if (isSingle) setApprovingUserId(userIds![0]);
    else setApprovingBulk(true);
    try {
      const res = await approveEventUsers(eventId, idsToUse);
      const count = res?.data?.approved_count ?? idsToUse.length;
      showNotification(
        count === 1
          ? "User approved successfully!"
          : `Successfully approved ${count} user(s).`,
        "success",
      );
      setSelectedUsers((prev) => prev.filter((id) => !idsToUse.includes(id)));
      fetchUsers(eventId, currentPage);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to approve users.";
      showNotification(msg, "error");
    } finally {
      setApprovingBulk(false);
      setApprovingUserId(null);
    }
  };

  const handleRejectUsers = async (userIds?: string[]) => {
    const idsToUse = userIds ?? selectedUsers;
    if (!eventId || idsToUse.length === 0) return;
    const isSingle = !!userIds && userIds.length === 1;
    if (isSingle) setRejectingUserId(userIds![0]);
    else setRejectingBulk(true);
    try {
      const res = await rejectEventUsers(eventId, idsToUse);
      const count = res?.data?.rejected_count ?? idsToUse.length;
      showNotification(
        count === 1
          ? "User rejected successfully."
          : `Successfully rejected ${count} user(s).`,
        "error",
      );
      setSelectedUsers((prev) => prev.filter((id) => !idsToUse.includes(id)));
      fetchUsers(eventId, currentPage);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to reject users.";
      showNotification(msg, "error");
    } finally {
      setRejectingBulk(false);
      setRejectingUserId(null);
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
      if (editForm.printed !== undefined)
        formData.append("event_user[printed]", String(editForm.printed));

      // ✅ Add user_type
      if (editForm.user_type)
        formData.append("event_user[user_type]", editForm.user_type);

      // ✅ Save organization to custom_fields.title instead of event_user[organization]
      if (editForm.organization)
        formData.append(
          "event_user[custom_fields][title]",
          editForm.organization,
        );

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
                  custom_fields: {
                    ...u.attributes?.custom_fields,
                    title: editForm.organization, // Update title in custom_fields with organization value
                  },
                  image: updatedUser?.attributes?.image
                    ? `${updatedUser.attributes.image}?t=${Date.now()}`
                    : u.attributes.image,
                  updated_at: new Date().toISOString(),
                },
              }
            : u,
        ),
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

  // Sync filters to URL (consistent UI + shareable links)
  useEffect(() => {
    const next = new URLSearchParams(location.search);
    if (filterStatus && filterStatus !== "all")
      next.set("approvalStatus", filterStatus);
    else next.delete("approvalStatus");
    if (filterGuestType && filterGuestType !== "all")
      next.set("guestType", filterGuestType);
    else next.delete("guestType");
    if (filterAttendanceStatus && filterAttendanceStatus !== "all")
      next.set("attendanceStatus", filterAttendanceStatus);
    else next.delete("attendanceStatus");
    if (filterDateFrom) next.set("dateFrom", filterDateFrom);
    else next.delete("dateFrom");
    if (filterDateTo) next.set("dateTo", filterDateTo);
    else next.delete("dateTo");
    if (searchTerm.trim()) next.set("search", searchTerm.trim());
    else next.delete("search");
    setSearchParams(next, { replace: true });
  }, [
    filterStatus,
    filterGuestType,
    filterAttendanceStatus,
    filterDateFrom,
    filterDateTo,
    searchTerm,
  ]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to page 1 when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users when eventId, currentPage, search term, or filter type changes
  useEffect(() => {
    if (eventId && currentPage > 0) {
      if (debouncedSearchTerm) {
        searchUsersAcrossPages(eventId, debouncedSearchTerm, filterStatus);
      } else {
        fetchUsers(eventId, currentPage);
      }
    }
  }, [eventId, currentPage, debouncedSearchTerm, filterStatus]);

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
            paginationMeta.total_count?.toString() || "0",
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
  const searchUsersAcrossPages = async (
    id: string,
    searchQuery: string,
    statusFilter: string = "all",
  ) => {
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
          }),
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
          // Filter by status first
          if (statusFilter !== "all") {
            const status = getApprovalStatus(user);
            if (status !== statusFilter) {
              return false;
            }
          }

          // Then filter by search term
          const name = user.attributes?.name?.toLowerCase() || "";
          const email = user.attributes?.email?.toLowerCase() || "";
          const organization =
            user.attributes?.organization?.toLowerCase() || "";
          const phoneNumber =
            user.attributes?.phone_number?.toLowerCase() || "";
          // Include title from custom_fields in search
          const title =
            user.attributes?.custom_fields?.title?.toLowerCase() || "";
          const userType = (user?.attributes?.user_type || "").toLowerCase();

          return (
            name.includes(searchLower) ||
            email.includes(searchLower) ||
            organization.includes(searchLower) ||
            phoneNumber.includes(searchLower) ||
            title.includes(searchLower) ||
            userType.includes(searchLower)
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

  // Unique guest types from current data (for dropdown)
  const uniqueGuestTypes = useMemo(() => {
    const set = new Set<string>();
    eventUsers.forEach((u: any) => {
      const t = u?.attributes?.user_type;
      if (t && String(t).trim()) set.add(String(t).trim());
    });
    return Array.from(set).sort();
  }, [eventUsers]);

  // Filter users: Approval Status, Attendance Status, Guest Type, Date range, Search
  const filteredUsers = eventUsers.filter((user: any) => {
    if (filterStatus !== "all") {
      const status = getApprovalStatus(user);
      if (status !== filterStatus) return false;
    }
    if (filterGuestType !== "all") {
      const ut = (user?.attributes?.user_type || "").trim();
      if (ut !== filterGuestType) return false;
    }
    if (filterAttendanceStatus !== "all") {
      const att = getAttendanceStatus(user);
      if (att !== filterAttendanceStatus) return false;
    }
    if (filterDateFrom || filterDateTo) {
      const created = user?.attributes?.created_at || "";
      if (!created) return false;
      const d = new Date(created).getTime();
      if (filterDateFrom && d < new Date(filterDateFrom).getTime())
        return false;
      if (filterDateTo && d > new Date(filterDateTo + "T23:59:59").getTime())
        return false;
    }
    if (debouncedSearchTerm.trim() !== "") {
      const searchLower = debouncedSearchTerm.toLowerCase().trim();
      const name = (user?.attributes?.name || "").toLowerCase();
      const email = (user?.attributes?.email || "").toLowerCase();
      const phone = (user?.attributes?.phone_number || "").toLowerCase();
      const organization = (user?.attributes?.organization || "").toLowerCase();
      const title = (
        user?.attributes?.custom_fields?.title || ""
      ).toLowerCase();
      const userType = (user?.attributes?.user_type || "").toLowerCase();
      return (
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        phone.includes(searchLower) ||
        organization.includes(searchLower) ||
        title.includes(searchLower) ||
        userType.includes(searchLower)
      );
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Full date + time for modals (e.g. "30/1/2026, 2:30 PM")
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const mins = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    const m = mins < 10 ? `0${mins}` : mins;
    return `${day}/${month}/${year}, ${h12}:${m} ${ampm}`;
  };

  // Fetch all users across pages for export (filter by status and optional date range)
  const fetchAllUsersForExport = async (): Promise<any[]> => {
    if (!eventId) return [];
    const perPage = 100;
    const first = await getEventUsers(eventId, { page: 1, per_page: perPage });
    const paginationMeta =
      first.data?.meta?.pagination || first.data?.pagination;
    const totalPages = paginationMeta?.total_pages || 1;
    const allUsers: any[] = [];
    const responseData = first.data?.data || first.data;
    const firstUsers = Array.isArray(responseData)
      ? responseData
      : responseData?.data || [];
    allUsers.push(...firstUsers);
    if (totalPages > 1) {
      const pagePromises = [];
      for (let p = 2; p <= totalPages; p++) {
        pagePromises.push(
          getEventUsers(eventId, { page: p, per_page: perPage }),
        );
      }
      const rest = await Promise.all(pagePromises);
      rest.forEach((r) => {
        const data = r.data?.data || r.data;
        const users = Array.isArray(data) ? data : data?.data || [];
        allUsers.push(...users);
      });
    }
    // Apply same filters as table: Approval, Guest Type, Attendance, Date range, Search
    return allUsers.filter((user: any) => {
      if (filterStatus !== "all") {
        const status = getApprovalStatus(user);
        if (status !== filterStatus) return false;
      }
      if (filterGuestType !== "all") {
        const ut = (user?.attributes?.user_type || "").trim();
        if (ut !== filterGuestType) return false;
      }
      if (filterAttendanceStatus !== "all") {
        const att = getAttendanceStatus(user);
        if (att !== filterAttendanceStatus) return false;
      }
      if (filterDateFrom || filterDateTo) {
        const created = user?.attributes?.created_at || "";
        if (!created) return false;
        const d = new Date(created).getTime();
        if (filterDateFrom && d < new Date(filterDateFrom).getTime())
          return false;
        if (filterDateTo && d > new Date(filterDateTo + "T23:59:59").getTime())
          return false;
      }
      if (debouncedSearchTerm.trim() !== "") {
        const searchLower = debouncedSearchTerm.toLowerCase().trim();
        const name = (user?.attributes?.name || "").toLowerCase();
        const email = (user?.attributes?.email || "").toLowerCase();
        const phone = (user?.attributes?.phone_number || "").toLowerCase();
        const org = (user?.attributes?.organization || "").toLowerCase();
        const title = (
          user?.attributes?.custom_fields?.title || ""
        ).toLowerCase();
        const userType = (user?.attributes?.user_type || "").toLowerCase();
        if (
          !name.includes(searchLower) &&
          !email.includes(searchLower) &&
          !phone.includes(searchLower) &&
          !org.includes(searchLower) &&
          !title.includes(searchLower) &&
          !userType.includes(searchLower)
        )
          return false;
      }
      return true;
    });
  };

  const escapeCsvCell = (val: string): string => {
    const s = String(val ?? "").replace(/"/g, '""');
    return s.includes(",") || s.includes("\n") || s.includes('"')
      ? `"${s}"`
      : s;
  };

  // Collect all unique custom field keys from users for export columns
  const getCustomFieldKeys = (users: any[]): string[] => {
    const set = new Set<string>();
    users.forEach((user: any) => {
      const cf = user?.attributes?.custom_fields;
      if (cf && typeof cf === "object")
        Object.keys(cf).forEach((k) => set.add(k));
    });
    return Array.from(set).sort();
  };

  // Format a single custom field value for export (no JSON brackets for primitives)
  const formatCustomFieldValue = (v: unknown): string => {
    if (v == null) return "";
    if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean"
    )
      return String(v);
    return JSON.stringify(v);
  };

  const handleExportCsv = async () => {
    if (!eventId) {
      showNotification("Event ID is required.", "error");
      return;
    }
    setExportingCsv(true);
    try {
      const users = await fetchAllUsersForExport();
      const customKeys = getCustomFieldKeys(users);
      const baseHeaders = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Organization",
        "Position",
        "Type",
        "Approval Status",
        "Printed",
        "Image URL",
        "Created",
        "Updated",
        "Attended",
        "Approval status (raw)",
        "Check-in/out statuses",
      ];
      const headers = [
        ...baseHeaders,
        ...customKeys.map((k) => `Custom: ${k}`),
      ];
      const rows = users.map((user: any) => {
        const status = getApprovalStatus(user);
        const org =
          user?.attributes?.custom_fields?.title ||
          user?.attributes?.organization ||
          "";
        const checkStatuses = user?.attributes?.check_user_area_statuses;
        const checkStatusesStr =
          Array.isArray(checkStatuses) && checkStatuses.length > 0
            ? JSON.stringify(checkStatuses)
            : "";
        const baseValues = [
          user.id,
          user?.attributes?.name ?? "",
          user?.attributes?.email ?? "",
          user?.attributes?.phone_number ?? "",
          org,
          user?.attributes?.position ?? "",
          user?.attributes?.user_type ?? "",
          status,
          user?.attributes?.printed === true
            ? "Yes"
            : user?.attributes?.printed === false
              ? "No"
              : "",
          user?.attributes?.image ?? "",
          user?.attributes?.created_at ?? "",
          user?.attributes?.updated_at ?? "",
          user?.attributes?.attended === true
            ? "Yes"
            : user?.attributes?.attended === false
              ? "No"
              : "",
          user?.attributes?.approval_status ?? "",
          checkStatusesStr,
        ];
        const customValues = customKeys.map((k) =>
          formatCustomFieldValue(user?.attributes?.custom_fields?.[k]),
        );
        return [...baseValues, ...customValues].map(escapeCsvCell);
      });
      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
        "\n",
      );
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `registered_users_${eventId}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification(`Exported ${users.length} users (CSV).`, "success");
    } catch (e) {
      console.error(e);
      showNotification("Export failed.", "error");
    } finally {
      setExportingCsv(false);
    }
  };

  const handleExportExcel = async () => {
    if (!eventId) {
      showNotification("Event ID is required.", "error");
      return;
    }
    setExportingExcel(true);
    try {
      const users = await fetchAllUsersForExport();
      const customKeys = getCustomFieldKeys(users);
      const baseHeaders = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Organization",
        "Position",
        "Type",
        "Approval Status",
        "Printed",
        "Image URL",
        "Created",
        "Updated",
        "Attended",
        "Approval status (raw)",
        "Check-in/out statuses",
      ];
      const headers = [
        ...baseHeaders,
        ...customKeys.map((k) => `Custom: ${k}`),
      ];
      const rows = users.map((user: any) => {
        const status = getApprovalStatus(user);
        const org =
          user?.attributes?.custom_fields?.title ||
          user?.attributes?.organization ||
          "";
        const checkStatuses = user?.attributes?.check_user_area_statuses;
        const checkStatusesStr =
          Array.isArray(checkStatuses) && checkStatuses.length > 0
            ? JSON.stringify(checkStatuses)
            : "";
        const baseValues = [
          user.id,
          user?.attributes?.name ?? "",
          user?.attributes?.email ?? "",
          user?.attributes?.phone_number ?? "",
          org,
          user?.attributes?.position ?? "",
          user?.attributes?.user_type ?? "",
          status,
          user?.attributes?.printed === true
            ? "Yes"
            : user?.attributes?.printed === false
              ? "No"
              : "",
          user?.attributes?.image ?? "",
          user?.attributes?.created_at ?? "",
          user?.attributes?.updated_at ?? "",
          user?.attributes?.attended === true
            ? "Yes"
            : user?.attributes?.attended === false
              ? "No"
              : "",
          user?.attributes?.approval_status ?? "",
          checkStatusesStr,
        ];
        const customValues = customKeys.map((k) =>
          formatCustomFieldValue(user?.attributes?.custom_fields?.[k]),
        );
        return [...baseValues, ...customValues].join("\t");
      });
      const tsv = [headers.join("\t"), ...rows].join("\n");
      const blob = new Blob(["\uFEFF" + tsv], {
        type: "application/vnd.ms-excel;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `registered_users_${eventId}_${new Date().toISOString().slice(0, 10)}.xls`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification(`Exported ${users.length} users (Excel).`, "success");
    } catch (e) {
      console.error(e);
      showNotification("Export failed.", "error");
    } finally {
      setExportingExcel(false);
    }
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
        "error",
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleResetCheckInOut = (user: any) => {
    setUserToReset(user);
    setIsResetModalOpen(true);
  };

  const confirmResetCheckInOut = async () => {
    if (!eventId || !userToReset) {
      showNotification("Event ID is missing.", "error");
      setIsResetModalOpen(false);
      setUserToReset(null);
      return;
    }

    setResettingUserId(userToReset.id);
    try {
      const response = await resetCheckInOutStatus(eventId, userToReset.id);
      console.log("Reset response:", response.data);

      showNotification("Check-in/out status reset successfully!", "success");
      setIsResetModalOpen(false);
      setUserToReset(null);
    } catch (error: any) {
      console.error("Error resetting status:", error);
      showNotification("Failed to reset check-in/out status.", "error");
    } finally {
      setResettingUserId(null);
    }
  };

  return (
    <>
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
                    : "bg-green-500 text-white"
              }`}
            >
              {notification.message}
            </div>
          </div>
        )}

        <div className="max-w-8xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Registered Users</h1>

          {/* Export: respects current filters (Approval, Guest Type, Attendance, Date range, Search) */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-sm text-gray-600 mb-3">
              Export respects current filters (approval status, guest type,
              attendance, date range, search).
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportCsv}
                disabled={exportingCsv}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm"
              >
                <FileDown className="w-4 h-4" />
                {exportingCsv ? "Exporting…" : "Export CSV"}
              </button>
              <button
                onClick={handleExportExcel}
                disabled={exportingExcel}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {exportingExcel ? "Exporting…" : "Export Excel"}
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-gray-900">Total</h1>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                  {filterStatus !== "all" ||
                  filterGuestType !== "all" ||
                  filterAttendanceStatus !== "all" ||
                  filterDateFrom ||
                  filterDateTo ||
                  debouncedSearchTerm.trim() !== ""
                    ? `${filteredUsers.length} Users (filtered)`
                    : `${pagination?.total_count || eventUsers.length} Users`}
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
                    {downloadingTemplate
                      ? "...Downloading"
                      : "Download Template"}
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

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApproveUsers()}
                  title="Approve selected"
                  className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  disabled={approvingBulk}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRejectUsers()}
                  title="Reject selected"
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  disabled={rejectingBulk}
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSendCredentials()}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  disabled={sendingCredentials}
                >
                  <Mail className="w-4 h-4" />
                  {sendingCredentials ? "...Sending" : "Send Credentials"}
                </button>
              </div>
            </div>
          )}

          {/* Filters: Search, Approval Status, Guest Type, Attendance Status, Date range */}
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search
                  value={searchTerm}
                  onChange={(val) => {
                    setSearchTerm(val);
                    setCurrentPage(1);
                  }}
                  placeholder="Search users..."
                />
              </div>
              <div className="relative w-full sm:w-40">
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none bg-white pr-10 text-sm"
                >
                  <option value="all">All approval</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
              </div>
              <div className="relative w-full sm:w-40">
                <select
                  value={filterGuestType}
                  onChange={(e) => {
                    setFilterGuestType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none bg-white pr-10 text-sm"
                >
                  <option value="all">All guest types</option>
                  {uniqueGuestTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
              </div>
              <div className="relative w-full sm:w-44">
                <select
                  value={filterAttendanceStatus}
                  onChange={(e) => {
                    setFilterAttendanceStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none bg-white pr-10 text-sm"
                >
                  <option value="all">All attendance</option>
                  <option value="attended">Attended</option>
                  <option value="not_attended">Not attended</option>
                  <option value="checked_in">Checked in</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => {
                    setFilterDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="From"
                />
                <span className="text-gray-400 text-sm">–</span>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => {
                    setFilterDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="To"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div className="overflow-x-auto">
              {loadingUsers ? (
                <table className="w-full">
                  <thead className="bg-gray-50/80 border-b border-gray-200/60">
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
                          <Skeleton className="h-4 w-16" />
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
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50/80 border-b border-gray-200/60">
                    <tr>
                      <th className="w-12 px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          onChange={handleSelectAll}
                          checked={
                            filteredUsers.length > 0 &&
                            selectedUsers.length === filteredUsers.length &&
                            filteredUsers.every((user) =>
                              selectedUsers.includes(user.id),
                            )
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
                        Approval Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200/60">
                    {filteredUsers.length === 0 && !loadingUsers ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          {filterStatus !== "all" ||
                          filterGuestType !== "all" ||
                          filterAttendanceStatus !== "all" ||
                          filterDateFrom ||
                          filterDateTo ||
                          debouncedSearchTerm.trim() !== ""
                            ? "No users match the current filters."
                            : "No users found"}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, index) => (
                        <tr
                          key={user.id}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
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
                            {user?.attributes?.custom_fields?.title ||
                              user?.attributes?.organization ||
                              "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {user?.attributes?.user_type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {getApprovalStatus(user) === "approved" && (
                              <span
                                title="Approved"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </span>
                            )}
                            {getApprovalStatus(user) === "rejected" && (
                              <span
                                title="Rejected"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700"
                              >
                                <XCircle className="w-4 h-4" />
                              </span>
                            )}
                            {getApprovalStatus(user) === "pending" && (
                              <span
                                title="Pending"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700"
                              >
                                <Clock className="w-4 h-4" />
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(user?.attributes?.created_at)}
                          </td>

                          <td className="px-6 py-4">
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  if (openActionsUserId === user.id) {
                                    closeActionsMenu();
                                  } else {
                                    setOpenActionsUserId(user.id);
                                    setActionsTriggerRect(
                                      (
                                        e.currentTarget as HTMLElement
                                      ).getBoundingClientRect(),
                                    );
                                  }
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Actions"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {openActionsUserId === user.id &&
                                actionsTriggerRect && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-10"
                                      aria-hidden
                                      onClick={closeActionsMenu}
                                    />
                                    <div
                                      className="fixed z-20 w-[208px] min-w-[200px] bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 flex flex-col max-h-[280px]"
                                      style={(() => {
                                        const GAP = 6;
                                        const PAD = 8;
                                        const openBelow =
                                          actionsTriggerRect.bottom +
                                            280 +
                                            GAP <=
                                          window.innerHeight - PAD;
                                        const top = openBelow
                                          ? actionsTriggerRect.bottom + GAP
                                          : Math.max(
                                              PAD,
                                              actionsTriggerRect.top -
                                                280 -
                                                GAP,
                                            );
                                        let left =
                                          actionsTriggerRect.right - 208;
                                        left = Math.max(
                                          PAD,
                                          Math.min(
                                            left,
                                            window.innerWidth - 208 - PAD,
                                          ),
                                        );
                                        return { top, left };
                                      })()}
                                    >
                                      <div className="overflow-y-auto overflow-x-hidden overscroll-contain flex-1 min-h-0 py-0.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setUserForInfoModal(user);
                                            closeActionsMenu();
                                          }}
                                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
                                        >
                                          <Info className="w-4 h-4 shrink-0" />
                                          More Information
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleApproveUsers([user.id]);
                                            closeActionsMenu();
                                          }}
                                          disabled={approvingUserId === user.id}
                                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 disabled:opacity-50 text-left"
                                        >
                                          <CheckCircle className="w-4 h-4 shrink-0" />
                                          Accept
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleRejectUsers([user.id]);
                                            closeActionsMenu();
                                          }}
                                          disabled={rejectingUserId === user.id}
                                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 text-left"
                                        >
                                          <XCircle className="w-4 h-4 shrink-0" />
                                          Reject
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingUser(user);
                                            setEditForm({
                                              name:
                                                user?.attributes?.name || "",
                                              email:
                                                user?.attributes?.email || "",
                                              phone_number:
                                                user?.attributes
                                                  ?.phone_number || "",
                                              organization:
                                                user?.attributes?.custom_fields
                                                  ?.title ||
                                                user?.attributes
                                                  ?.organization ||
                                                "",
                                              position:
                                                user?.attributes?.position ||
                                                "",
                                              image:
                                                user?.attributes?.image || "",
                                              user_type:
                                                user?.attributes?.user_type ||
                                                "",
                                              printed:
                                                user?.attributes?.printed ||
                                                false,
                                            });
                                            closeActionsMenu();
                                          }}
                                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 text-left"
                                        >
                                          <Edit className="w-4 h-4 shrink-0" />
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleSendCredentials([user.id]);
                                            closeActionsMenu();
                                          }}
                                          disabled={
                                            sendingCredentialsUserId === user.id
                                          }
                                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-blue-700 hover:bg-blue-50 disabled:opacity-50 text-left"
                                        >
                                          {sendingCredentialsUserId ===
                                          user.id ? (
                                            <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin shrink-0" />
                                          ) : (
                                            <Mail className="w-4 h-4 shrink-0" />
                                          )}
                                          Send Credentials
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setUserToDelete(user);
                                            setIsDeleteModalOpen(true);
                                            closeActionsMenu();
                                          }}
                                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 text-left"
                                        >
                                          <Trash2 className="w-4 h-4 shrink-0" />
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loadingUsers && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-200/60">
                <div className="text-sm text-gray-600">
                  {pagination ? (
                    <>
                      Showing{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          currentPage * itemsPerPage,
                          pagination.total_count,
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {pagination.total_count}
                      </span>{" "}
                      users
                      {(filterStatus !== "all" ||
                        filterGuestType !== "all" ||
                        filterAttendanceStatus !== "all" ||
                        filterDateFrom ||
                        filterDateTo ||
                        debouncedSearchTerm.trim() !== "") && (
                        <span className="ml-2 text-blue-600">
                          • Filtered: {filteredUsers.length} user
                          {filteredUsers.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </>
                  ) : (
                    <>Loading...</>
                  )}
                </div>
                {pagination && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.total_pages || 1}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      // Scroll to top when page changes
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className=""
                  />
                )}
              </div>
            )}
          </div>

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
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!!deletingUserId}
                  >
                    {deletingUserId ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isResetModalOpen && userToReset && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
              onClick={() => {
                if (!resettingUserId) {
                  setIsResetModalOpen(false);
                  setUserToReset(null);
                }
              }}
            >
              <div
                className="bg-white p-6 rounded-lg w-96"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-2 text-gray-900">
                  Reset check-in/out status?
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to reset the check-in/out status for{" "}
                  <span className="font-semibold">
                    {userToReset.attributes?.name || "this user"}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setIsResetModalOpen(false);
                      setUserToReset(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!!resettingUserId}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmResetCheckInOut}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!!resettingUserId}
                  >
                    {resettingUserId ? "Resetting..." : "Reset"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* More Information modal: all user data in table form with image */}
          {userForInfoModal && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
              onClick={() => setUserForInfoModal(null)}
            >
              <div
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">
                    More Information
                  </h2>
                  <button
                    type="button"
                    onClick={() => setUserForInfoModal(null)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="px-6 py-4 overflow-y-auto flex-1">
                  {/* User image (actual image, not URL) + name & email */}
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                    <div className="flex-shrink-0 w-24 h-24 rounded-full border-2 border-gray-200 shadow-sm overflow-hidden bg-gray-100 flex items-center justify-center">
                      {userForInfoModal?.attributes?.image ? (
                        <img
                          src={userForInfoModal.attributes.image}
                          alt={userForInfoModal?.attributes?.name || "User"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback)
                              (fallback as HTMLElement).classList.remove(
                                "hidden",
                              );
                          }}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                        />
                      ) : null}
                      <div
                        className={`w-full h-full flex items-center justify-center text-2xl font-semibold text-blue-700 bg-blue-100 ${userForInfoModal?.attributes?.image ? "hidden" : ""}`}
                        aria-hidden
                      >
                        {getUserInitial(userForInfoModal)}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-lg truncate">
                        {userForInfoModal?.attributes?.name || "—"}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {userForInfoModal?.attributes?.email || "—"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        ID: {userForInfoModal?.id ?? "—"}
                      </p>
                    </div>
                  </div>

                  {/* Key–value table */}
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-semibold text-gray-600 uppercase tracking-wider w-[40%]">
                          Key
                        </th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-600 uppercase tracking-wider">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        {
                          key: "Phone",
                          value:
                            userForInfoModal?.attributes?.phone_number ?? "—",
                        },
                        {
                          key: "Position",
                          value: userForInfoModal?.attributes?.position ?? "—",
                        },
                        {
                          key: "Organization",
                          value:
                            userForInfoModal?.attributes?.organization ||
                            userForInfoModal?.attributes?.custom_fields
                              ?.title ||
                            "—",
                        },
                        {
                          key: "Type",
                          value: userForInfoModal?.attributes?.user_type ?? "—",
                        },
                        {
                          key: "Printed",
                          value:
                            userForInfoModal?.attributes?.printed == null
                              ? "—"
                              : userForInfoModal?.attributes?.printed
                                ? "Yes"
                                : "No",
                        },
                        {
                          key: "Approval status",
                          value:
                            userForInfoModal?.attributes?.approval_status ??
                            "—",
                        },
                        {
                          key: "Approved",
                          value:
                            userForInfoModal?.attributes?.approved == null
                              ? "—"
                              : userForInfoModal?.attributes?.approved
                                ? "Yes"
                                : "No",
                        },
                        {
                          key: "Created at",
                          value: formatDateTime(
                            userForInfoModal?.attributes?.created_at ?? "",
                          ),
                        },
                        {
                          key: "Updated at",
                          value: formatDateTime(
                            userForInfoModal?.attributes?.updated_at ?? "",
                          ),
                        },
                        {
                          key: "Attended",
                          value:
                            userForInfoModal?.attributes?.attended == null
                              ? "—"
                              : userForInfoModal?.attributes?.attended
                                ? "Yes"
                                : "No",
                        },
                        {
                          key: "Check-in/out statuses",
                          value: (() => {
                            const s =
                              userForInfoModal?.attributes
                                ?.check_user_area_statuses;
                            if (!s || !Array.isArray(s) || s.length === 0)
                              return "—";
                            return (
                              <div className="space-y-3">
                                {s.map((item: any, idx: number) => (
                                  <div
                                    key={item?.id ?? idx}
                                    className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-xs"
                                  >
                                    <div className="font-semibold text-gray-600 mb-2">
                                      Session {idx + 1}
                                      {item?.session_area_id != null &&
                                        ` (Area ID: ${item.session_area_id})`}
                                    </div>
                                    <table className="w-full border-collapse">
                                      <tbody>
                                        <tr>
                                          <td className="py-1 pr-2 font-medium text-gray-500 w-28">
                                            Check in
                                          </td>
                                          <td className="py-1 text-gray-900">
                                            {item?.check_in
                                              ? formatDateTime(item.check_in)
                                              : "—"}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td className="py-1 pr-2 font-medium text-gray-500">
                                            Check out
                                          </td>
                                          <td className="py-1 text-gray-900">
                                            {item?.check_out
                                              ? formatDateTime(item.check_out)
                                              : "—"}
                                          </td>
                                        </tr>
                                        {item?.event_user_id != null && (
                                          <tr>
                                            <td className="py-1 pr-2 font-medium text-gray-500">
                                              Event user ID
                                            </td>
                                            <td className="py-1 text-gray-900">
                                              {item.event_user_id}
                                            </td>
                                          </tr>
                                        )}
                                        {item?.event_id != null && (
                                          <tr>
                                            <td className="py-1 pr-2 font-medium text-gray-500">
                                              Event ID
                                            </td>
                                            <td className="py-1 text-gray-900">
                                              {item.event_id}
                                            </td>
                                          </tr>
                                        )}
                                        {item?.session_area_id != null && (
                                          <tr>
                                            <td className="py-1 pr-2 font-medium text-gray-500">
                                              Session area ID
                                            </td>
                                            <td className="py-1 text-gray-900">
                                              {item.session_area_id}
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                ))}
                              </div>
                            );
                          })(),
                        },
                        {
                          key: "Custom fields",
                          value: (() => {
                            const cf =
                              userForInfoModal?.attributes?.custom_fields;
                            if (!cf || typeof cf !== "object") return "—";
                            const entries = Object.entries(cf);
                            if (entries.length === 0) return "—";
                            return (
                              <table className="w-full border-collapse text-sm bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                                <tbody>
                                  {entries.map(([k, v]) => (
                                    <tr
                                      key={k}
                                      className="border-b border-gray-100 last:border-b-0"
                                    >
                                      <td className="py-1.5 px-2 font-medium text-gray-600 capitalize w-32 align-top">
                                        {k.replace(/_/g, " ")}
                                      </td>
                                      <td className="py-1.5 px-2 text-gray-900 align-top break-words">
                                        {v == null
                                          ? "—"
                                          : typeof v === "object"
                                            ? JSON.stringify(v)
                                            : String(v)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            );
                          })(),
                        },
                      ].map(({ key, value }) => (
                        <tr
                          key={key}
                          className="border-b border-gray-100 hover:bg-gray-50/50"
                        >
                          <td className="py-2.5 px-3 font-medium text-gray-600 align-top">
                            {key}
                          </td>
                          <td className="py-2.5 px-3 text-gray-900 align-top break-words">
                            {typeof value === "string" ? value || "—" : value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 border-t border-gray-200 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setUserForInfoModal(null)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Close
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
                          e.target.files[0],
                        );
                        setSelectedImageFile(compressedFile);
                        showNotification(
                          "Image compressed and ready to upload",
                          "info",
                        );
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
    </>
  );
}

export default RegisterdUser;
