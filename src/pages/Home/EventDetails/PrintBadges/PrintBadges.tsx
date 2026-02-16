import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { deleteEventUser, getBadgesApi, getEventUsers, getEventUser, markEventUserPrinted, getEventbyId, getBadgeApi, getBadgeType, updateEventUser } from "@/apis/apiHelpers";

// Import refactored components and hooks using relative paths as per your structure
import PrintBadgesHeader from "./component/printBadgeHeader";
import PrintBadgesTable from "./component/printBadgeTable";
import PrintBadgesFilterAndSearch from "./component/printBadgeFilterSearch";
import BadgePreviewModal from "./component/badgePreviewModal";
import DeleteConfirmationModal from "./component/deleteConfirmationModal";
import { usePrintStyles } from "./hook/usePrintStyle";
import { X, Edit } from "lucide-react";

function PrintBadges() {
  const location = useLocation();
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventUsers, setUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState(new Set<any>());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showBadgePreviewModal, setShowBadgePreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserForPreview, setSelectedUserForPreview] = useState<any>(null);
  const [selectedBadgeTemplate, setSelectedBadgeTemplate] = useState<any>(null); // Store full badge template from API
  const [eventData, setEventData] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [updatingPrintStatus, setUpdatingPrintStatus] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

  // Edit user modal (same as RegisterdUser)
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    organization: "",
    position: "",
    user_type: "",
    printed: false,
    badge_id: "",
  });
  const [badgeTypes, setBadgeTypes] = useState<any[]>([]);
  const [badgeTypesLoading, setBadgeTypesLoading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [editAvatarError, setEditAvatarError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const rowsPerPage = 10;

  const getUserInitial = (user: any) => {
    const nameOrEmail =
      user?.attributes?.name ||
      user?.attributes?.email ||
      user?.attributes?.phone_number ||
      "U";
    const trimmed = typeof nameOrEmail === "string" ? nameOrEmail.trim() : "U";
    return (trimmed.charAt(0) || "U").toUpperCase();
  };

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
          const maxW = 1200, maxH = 1200;
          let w = img.width, h = img.height;
          if (w > h) { if (w > maxW) { h *= maxW / w; w = maxW; } }
          else { if (h > maxH) { w *= maxH / h; h = maxH; } }
          canvas.width = w;
          canvas.height = h;
          ctx?.drawImage(img, 0, 0, w, h);
          canvas.toBlob(
            (blob) => {
              if (blob)
                resolve(new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() }));
              else resolve(file);
            },
            "image/jpeg",
            0.8
          );
        };
      };
    });
  };

  // Integrate the custom print styles hook
  usePrintStyles("badges-print-container", isPrinting);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (editingUser) setEditAvatarError(false);
  }, [editingUser]);

  // Fetch badge types when edit modal opens (User Type dropdown)
  useEffect(() => {
    const fetchBadgeTypes = async () => {
      if (!eventId || !editingUser) {
        if (!editingUser) setBadgeTypes([]);
        return;
      }
      setBadgeTypesLoading(true);
      try {
        const response = await getBadgeType(eventId);
        const data = response?.data?.data ?? response?.data;
        const list = Array.isArray(data) ? data : [];
        setBadgeTypes(list);
        // Only sync badge_id from user_type when form hasn't been changed (avoid overwriting user edits)
        if (editingUser?.attributes?.user_type && list.length) {
          setEditForm((prev) => {
            if (prev.badge_id) return prev;
            const match = list.find(
              (b: any) =>
                (b.attributes?.name ?? b.name) === editingUser.attributes.user_type
            );
            if (!match) return prev;
            return {
              ...prev,
              badge_id: String(match.id ?? match.attributes?.id ?? ""),
            };
          });
        }
      } catch (err) {
        console.error("Error fetching badge types:", err);
        setBadgeTypes([]);
      } finally {
        setBadgeTypesLoading(false);
      }
    };
    fetchBadgeTypes();
  }, [eventId, editingUser]);

  const showNotification = (message: string, type: "success" | "error" | "warning" | "info") => {
    setNotification({ message, type });
  };


  // --- Data Fetching ---
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const idFromQuery = searchParams.get("eventId");
    setEventId(idFromQuery);

    if (idFromQuery) {
      fetchUsers(idFromQuery);
      fetchSelectedBadgeTemplate(idFromQuery);
    }
  }, [location.search]);

  // Fetch selected badge template from API - using default endpoint like registration forms
  const fetchSelectedBadgeTemplate = async (eventId: string) => {
    try {
      // Get event data
      const eventResponse = await getEventbyId(eventId);
      const eventData = eventResponse?.data?.data;
      setEventData(eventData);

      // Get the default badge template directly (same pattern as registration templates)
      const templateResponse = await getBadgeApi(eventId);
      const templateData = templateResponse?.data?.data;

      if (templateData) {
        setSelectedBadgeTemplate(templateData);
        console.log("=== Badge Template Selection (Default Endpoint) ===");
        console.log("Selected template name:", templateData?.attributes?.name);
        console.log("Selected template ID:", templateData?.id);
        console.log("Is default:", templateData?.attributes?.default);
        console.log("Template type:", templateData?.attributes?.template_data?.type);
        console.log("Background image URL:", templateData?.attributes?.background_image);
        console.log("Template data bgImage:", templateData?.attributes?.template_data?.bgImage);
      } else {
        console.log("No default badge template found!");
        setSelectedBadgeTemplate(null);
      }
    } catch (error) {
      console.error("Error fetching default badge template:", error);
      // Fallback: try to get all templates and find default
      try {
        const templatesResponse = await getBadgesApi(parseInt(eventId, 10));
        const templates = templatesResponse?.data?.data || [];
        const defaultTemplate = templates.find((t: any) => t.attributes?.default === true);
        if (defaultTemplate) {
          setSelectedBadgeTemplate(defaultTemplate);
          console.log("Fallback: Found default template from all templates");
        } else {
          showNotification("No default badge template found", "error");
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        showNotification("Failed to load badge template", "error");
      }
    }
  };

  const fetchUsers = async (id: string) => {
    setLoadingUsers(true);
    try {
      // Use per_page=10 so API returns correct total_pages (e.g. 12 users -> 2 pages). Larger per_page can be capped by backend and total_pages can be wrong.
      const perPage = 10;
      const first = await getEventUsers(id, { page: 1, per_page: perPage });
      const paginationMeta =
        first.data?.meta?.pagination || first.data?.pagination;
      const totalPages = paginationMeta?.total_pages ?? 1;
      const firstData = first.data?.data || first.data;
      const firstUsers = Array.isArray(firstData)
        ? firstData
        : firstData?.data || [];
      const allUsers: any[] = [...firstUsers];
      console.log('allUsers:', allUsers);

      if (totalPages > 1) {
        const pagePromises = [];
        for (let p = 2; p <= totalPages; p++) {
          pagePromises.push(
            getEventUsers(id, { page: p, per_page: perPage })
          );
        }
        const rest = await Promise.all(pagePromises);
        rest.forEach((r) => {
          const data = r.data?.data || r.data;
          const users = Array.isArray(data) ? data : data?.data || [];
          allUsers.push(...users);
        });
      }

      // Augment users with print-specific status + organization from custom_fields.title (so refresh shows correct org)
      const usersWithPrintStatus = allUsers.map((user: any) => {
        const attrs = user.attributes ?? {};
        const printed = attrs.printed === true;
        const printedAt =
          attrs.printed_at || attrs.last_printed_at || null;
        const printCount = attrs.print_count ?? (printed ? 1 : 0);
        const printedBy = attrs.printed_by ?? null;
        // Backend stores organization in custom_fields.title; set attributes.organization so table shows it after refresh
        const organization =
          attrs.custom_fields?.title ?? attrs.organization ?? null;
        return {
          ...user,
          attributes: {
            ...attrs,
            organization,
            custom_fields: {
              ...attrs.custom_fields,
              title: attrs.custom_fields?.title ?? attrs.organization,
            },
          },
          printStatus: printed ? "Printed" : "Pending",
          printedAt,
          printCount: typeof printCount === "number" ? printCount : printed ? 1 : 0,
          printedBy: printedBy ?? "—",
        };
      });
      setUsers(usersWithPrintStatus);
    } catch (error) {
      console.error("Error fetching event users:", error);
      showNotification("Failed to load users", "error");
    } finally {
      setLoadingUsers(false);
    }
  };


  // --- Update Print Status API Call (POST /printed, then GET single user for latest data) ---
  const normalizeEventUser = (raw: any) => {
    const attrs = raw?.attributes ?? raw;
    const printed = attrs?.printed === true;
    const printedAt = attrs?.printed_at ?? attrs?.last_printed_at ?? null;
    const printCount = attrs?.print_count ?? (printed ? 1 : 0);
    const printedBy = attrs?.printed_by ?? null;
    // API may store organization in custom_fields.title; table reads attributes.organization
    const organization = attrs?.organization ?? attrs?.custom_fields?.title ?? null;
    return {
      ...raw,
      id: raw?.id?.toString?.() ?? raw?.id,
      attributes: {
        ...attrs,
        organization,
        printed_at: attrs?.printed_at ?? attrs?.last_printed_at,
        last_printed_at: attrs?.last_printed_at ?? attrs?.printed_at,
      },
      printStatus: printed ? "Printed" : "Pending",
      printedAt,
      printCount: typeof printCount === "number" ? printCount : printed ? 1 : 0,
      printedBy: printedBy ?? "—",
    };
  };

  const updatePrintStatus = async (userIds: string[]) => {
    if (!eventId) {
      showNotification("Event ID is missing", "error");
      return false;
    }

    setUpdatingPrintStatus(true);
    try {
      // 1. Call POST .../event_users/{id}/printed for each user (backend updates print_count, last_printed_at)
      await Promise.all(
        userIds.map((userId) => markEventUserPrinted(eventId, userId))
      );

      // 2. Fetch each updated user via GET .../event_users/{id} and merge into state
      const updatedResponses = await Promise.all(
        userIds.map((userId) => getEventUser(eventId, userId))
      );

      const updatedUsers = updatedResponses.map((r) => {
        const data = r?.data?.data ?? r?.data;
        return data ? normalizeEventUser(data) : null;
      }).filter(Boolean) as any[];

      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          const updated = updatedUsers.find(
            (u) => (u?.id?.toString?.() ?? u?.id) === (user?.id?.toString?.() ?? user?.id)
          );
          return updated ?? user;
        })
      );

      return true;
    } catch (error) {
      console.error("Error updating print status:", error);
      showNotification("Failed to update print status", "error");
      return false;
    } finally {
      setUpdatingPrintStatus(false);
    }
  };

  // --- Filtering and Pagination Logic (all users loaded; filter + paginate client-side like Registered Users) ---
  const filteredUsers = eventUsers.filter((user) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      (user.attributes?.name?.toLowerCase().includes(searchLower)) ||
      (user.attributes?.email?.toLowerCase().includes(searchLower)) ||
      (user.attributes?.organization?.toLowerCase().includes(searchLower)) ||
      (user.attributes?.custom_fields?.title?.toLowerCase().includes(searchLower)) ||
      ((user.attributes?.user_type ?? "").toLowerCase().includes(searchLower)) ||
      (user.attributes?.phone_number?.toLowerCase().includes(searchLower));

    const matchesStatus =
      statusFilter === "all" ||
      user.printStatus?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + rowsPerPage);

  // Print stats for header (API uses last_printed_at; support printed_at for compatibility)
  const printCount = eventUsers.filter((u) => u.attributes?.printed === true).length;
  const getPrintedAt = (u: any) =>
    u.printedAt || u.attributes?.printed_at || u.attributes?.last_printed_at;
  const lastPrintedAt = eventUsers
    .filter((u) => getPrintedAt(u))
    .map((u) => new Date(getPrintedAt(u)).getTime())
    .reduce((max, t) => (t > max ? t : max), 0);
  const lastPrintedDate = lastPrintedAt ? new Date(lastPrintedAt) : null;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // --- User Selection and Actions ---
  const getSelectedUsersData = useCallback(() => {
    return eventUsers.filter((user) => selectedUsers.has(user.id));
  }, [eventUsers, selectedUsers]);

  const handleAction = async (action: string, userId: string) => {
    setLoadingUserId(userId);

    const idStr = String(userId);
    const user = eventUsers.find(
      (u) => String(u?.id) === idStr
    );

    await new Promise((resolve) => setTimeout(resolve, 300));

    if (action === "preview") {
      setSelectedUserForPreview(user);
      setShowBadgePreviewModal(true);
    } else if (action === "delete") {
      setUserToDelete(user);
      setShowDeleteModal(true);
    } else if (action === "edit" && user) {
      setEditingUser(user);
      setEditForm({
        name: user?.attributes?.name ?? "",
        email: user?.attributes?.email ?? "",
        phone_number: user?.attributes?.phone_number ?? "",
        organization:
          user?.attributes?.custom_fields?.title ??
          user?.attributes?.organization ??
          "",
        position: user?.attributes?.position ?? "",
        user_type: user?.attributes?.user_type ?? "",
        printed: user?.attributes?.printed ?? false,
        badge_id:
          user?.attributes?.badge_id != null
            ? String(user.attributes.badge_id)
            : user?.attributes?.badge_type ?? "",
      });
      setSelectedImageFile(null);
    }

    setLoadingUserId(null);
  };

  const handleUpdateUser = async () => {
    if (!eventId || !editingUser) return;
    setIsUpdating(true);
    try {
      const formData = new FormData();
      if (editForm.name) formData.append("event_user[name]", editForm.name);
      if (editForm.phone_number)
        formData.append("event_user[phone_number]", editForm.phone_number);
      if (editForm.email) formData.append("event_user[email]", editForm.email);
      if (editForm.position)
        formData.append("event_user[position]", editForm.position);
      if (editForm.printed !== undefined)
        formData.append("event_user[printed]", String(editForm.printed));
      if (editForm.user_type)
        formData.append("event_user[user_type]", editForm.user_type);
      if (editForm.badge_id)
        formData.append("event_user[badge_id]", editForm.badge_id);
      if (editForm.organization)
        formData.append(
          "event_user[custom_fields][title]",
          editForm.organization
        );
      if (selectedImageFile)
        formData.append("event_user[image]", selectedImageFile);

      const editingId = editingUser.id;
      const response = await updateEventUser(eventId, editingId, formData);
      console.log('response from updateEventUser:', response);
      const updatedUser = response?.data?.data;

      // Use API response so table shows exactly what was saved (same as RegisterdUser)
      if (updatedUser) {
        const normalized = normalizeEventUser(updatedUser);
        // Backend saves organization as custom_fields.title; prefer it over attributes.organization
        const attrs = normalized.attributes ?? {};
        const organization =
          attrs.custom_fields?.title ??
          attrs.organization ??
          editForm.organization ??
          "";
        normalized.attributes = {
          ...attrs,
          organization,
          custom_fields: {
            ...attrs.custom_fields,
            title: organization,
          },
        };
        setUsers((prev) =>
          prev.map((u) =>
            String(u?.id) === String(editingId) ? normalized : u
          )
        );
      } else {
        // Fallback: merge editForm into list item so display updates
        setUsers((prev) =>
          prev.map((u) => {
            if (String(u?.id) !== String(editingId)) return u;
            return {
              ...u,
              attributes: {
                ...u.attributes,
                name: editForm.name,
                email: editForm.email,
                phone_number: editForm.phone_number,
                organization: editForm.organization,
                position: editForm.position,
                user_type: editForm.user_type,
                printed: editForm.printed,
                badge_id: editForm.badge_id || u.attributes?.badge_id,
                custom_fields: {
                  ...u.attributes?.custom_fields,
                  title: editForm.organization,
                },
                image: updatedUser?.attributes?.image
                  ? `${updatedUser.attributes.image}?t=${Date.now()}`
                  : u.attributes?.image,
                updated_at: new Date().toISOString(),
              },
            };
          })
        );
      }
      showNotification("User updated successfully!", "success");
      setEditingUser(null);
      setSelectedImageFile(null);
    } catch (error) {
      console.error("Error updating user:", error);
      showNotification("Failed to update user. Please try again.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUserSelect = useCallback((userId: string) => {
    setSelectedUsers((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(userId)) {
        newSelected.delete(userId);
      } else {
        newSelected.add(userId);
      }
      return newSelected;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(paginatedUsers.map((user) => user.id)));
    }
  }, [selectedUsers, paginatedUsers]);

  const handleDelete = async () => {
    if (!userToDelete || !eventId) {
      console.error("Missing user or event ID for deletion");
      showNotification("Cannot delete user: Missing information", "error");
      return;
    }

    try {
      await deleteEventUser(eventId, userToDelete?.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      showNotification("User deleted successfully", "success");
      setSelectedUsers((prev) => {
        const newSelected = new Set(prev);
        newSelected.delete(userToDelete.id);
        return newSelected;
      });
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
    }
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Helper for formatting dates: one row like "Jan 15, 2026, 04:13 PM"
  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();
    const time = date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${month} ${day}, ${year}, ${time}`;
  }, []);

  // Determine which users to show in the preview modal
  const usersInPreviewModal = selectedUserForPreview
    ? [selectedUserForPreview]
    : getSelectedUsersData();

  // Direct Browser Print Functionality
const handlePrint = useCallback(async () => {
  if (usersInPreviewModal.length === 0) {
    showNotification("No badges to print.", "warning");
    return;
  }

  // Get user IDs to update print status
  const userIdsToUpdate = usersInPreviewModal.map(user => user.id);

  // Update print status immediately when print is clicked
  const updateSuccess = await updatePrintStatus(userIdsToUpdate);
  
  if (!updateSuccess) {
    showNotification("Failed to update print status. Printing cancelled.", "error");
    return;
  }

  // showNotification("Print status updated to 'Printed'!", "success");
}, [usersInPreviewModal]);


  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-4 right-4 z-[100] animate-slide-in">
            <div
              className={`px-6 py-3 rounded-lg shadow-lg ${
                notification.type === "success"
                  ? "bg-green-500 text-white"
                  : notification.type === "error"
                  ? "bg-red-500 text-white"
                  : notification.type === "warning"
                  ? "bg-yellow-500 text-white"
                  : "bg-blue-500 text-white"
              }`}
            >
              {notification.message}
            </div>
          </div>
        )}

        <div className="p-8">
          {/* Header Section */}
          <PrintBadgesHeader
            filteredUsersCount={filteredUsers.length}
            selectedUsersCount={selectedUsers.size}
            searchTerm={searchTerm}
            printCount={printCount}
            lastPrintedAt={lastPrintedDate}
            onPreviewSelected={() => {
              if (selectedUsers.size === 0) {
                showNotification("Please select at least one user to preview", "warning");
                return;
              }
              setSelectedUserForPreview(null);
              setShowBadgePreviewModal(true);
            }}
            disablePreview={selectedUsers.size === 0}
          />

          {/* Search and Filter Section */}
          <PrintBadgesFilterAndSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onExport={() =>
              showNotification("Export functionality not implemented yet.", "info")
            }
          />

          {/* Users Table Section */}
          <PrintBadgesTable
            paginatedUsers={paginatedUsers}
            loadingUsers={loadingUsers}
            selectedUsers={selectedUsers}
            handleSelectAll={handleSelectAll}
            handleUserSelect={handleUserSelect}
            handleAction={handleAction}
            loadingUserId={loadingUserId}
            formatDate={formatDate}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            filteredUsersCount={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            startIndex={startIndex}
          />
        </div>

        {/* Badge Preview Modal */}
        <BadgePreviewModal
          show={showBadgePreviewModal}
          onClose={() => {
            setShowBadgePreviewModal(false);
            setSelectedUserForPreview(null);
          }}
          usersToPreview={usersInPreviewModal}
          selectedUserForPreview={selectedUserForPreview}
          eventData={eventData}
          selectedBadgeTemplate={selectedBadgeTemplate}
          onPrint={handlePrint}
          setIsPrinting={setIsPrinting}
          updatingPrintStatus={updatingPrintStatus}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          show={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
          onConfirm={handleDelete}
          userName={userToDelete?.attributes?.name || "this user"}
        />

        {/* Edit User Modal (same as RegisterdUser) */}
        {editingUser && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
            onClick={() => setEditingUser(null)}
          >
            <div
              className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="relative w-28 h-28 mb-6 mx-auto">
                {selectedImageFile ? (
                  <img
                    src={URL.createObjectURL(selectedImageFile)}
                    alt="Preview"
                    className="w-28 h-28 rounded-full object-cover mx-auto shadow-lg border-4 border-blue-100"
                  />
                ) : editingUser.attributes?.image && !editAvatarError ? (
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
                  htmlFor="editImageUpload"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-700 transition text-white"
                >
                  <Edit className="w-4 h-4" />
                </label>
                <input
                  id="editImageUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      const compressed = await compressImage(e.target.files[0]);
                      setSelectedImageFile(compressed);
                      showNotification("Image ready to upload", "info");
                    }
                  }}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                  <input
                    type="text"
                    placeholder="Organization"
                    value={editForm.organization}
                    onChange={(e) =>
                      setEditForm({ ...editForm, organization: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                  {badgeTypesLoading ? (
                    <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm">
                      Loading user types...
                    </div>
                  ) : (
                    <select
                      value={editForm.badge_id}
                      onChange={(e) => {
                        const id = e.target.value;
                        const badge = badgeTypes.find(
                          (b) => String(b.id ?? b.attributes?.id ?? "") === id
                        );
                        const name = badge?.attributes?.name ?? badge?.name ?? "";
                        setEditForm({ ...editForm, badge_id: id, user_type: name });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    >
                      <option value="">Select user type</option>
                      {badgeTypes.map((badge) => (
                        <option
                          key={badge.id}
                          value={badge.id ?? badge.attributes?.id ?? ""}
                        >
                          {badge.attributes?.name ?? badge.name ?? `Badge ${badge.id}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

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
                    isUpdating ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isUpdating ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}
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

export default PrintBadges;