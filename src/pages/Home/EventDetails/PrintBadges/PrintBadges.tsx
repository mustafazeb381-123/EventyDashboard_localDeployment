import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { deleteEventUser, getBadgesApi, getEventUsers, updateEventUser, getEventbyId, getBadgeApi } from "@/apis/apiHelpers";

// Import refactored components and hooks using relative paths as per your structure
import PrintBadgesHeader from "./component/printBadgeHeader";
import PrintBadgesTable from "./component/printBadgeTable";
import PrintBadgesFilterAndSearch from "./component/printBadgeFilterSearch";
import BadgePreviewModal from "./component/badgePreviewModal";
import DeleteConfirmationModal from "./component/deleteConfirmationModal";
import { usePrintStyles } from "./hook/usePrintStyle";


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

  const rowsPerPage = 8;

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
      const response = await getEventUsers(id);
      console.log('response from getEventUsers:', response);
      const users = response.data.data || response.data || [];
      // Augment users with print-specific status fields
      const usersWithPrintStatus = users.map((user: any) => ({
        ...user,
        printStatus: user.attributes?.printed ? "Printed" : "Pending",
        printedAt: user.attributes?.printed_at || null,
      }));
      setUsers(usersWithPrintStatus);
    } catch (error) {
      console.error("Error fetching event users:", error);
      showNotification("Failed to load users", "error");
    } finally {
      setLoadingUsers(false);
    }
  };


  // --- Update Print Status API Call ---
  const updatePrintStatus = async (userIds: string[]) => {
    if (!eventId) {
      showNotification("Event ID is missing", "error");
      return false;
    }

    setUpdatingPrintStatus(true);
    try {
      // Update each user's print status
      const updatePromises = userIds.map(async (userId) => {
        const formData = new FormData();
        formData.append("event_user[printed]", "true");
        
        const response = await updateEventUser(eventId, userId, formData);
        return response.data;
      });

      await Promise.all(updatePromises);
      
      // Update local state to reflect the changes immediately
      setUsers(prevUsers => 
        prevUsers.map(user => 
          userIds.includes(user.id) 
            ? {
                ...user,
                attributes: {
                  ...user.attributes,
                  printed: true,
                  printed_at: new Date().toISOString()
                },
                printStatus: "Printed",
                printedAt: new Date().toISOString()
              }
            : user
        )
      );

      // toast.success(`Print status updated for ${userIds.length} user(s)`);
      return true;
    } catch (error) {
      console.error("Error updating print status:", error);
      showNotification("Failed to update print status", "error");
      return false;
    } finally {
      setUpdatingPrintStatus(false);
    }
  };

  // --- Filtering and Pagination Logic ---
  const filteredUsers = eventUsers.filter((user) => {
    const matchesSearch =
      user.attributes?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.attributes?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.attributes?.organization?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      user.printStatus?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // --- User Selection and Actions ---
  const getSelectedUsersData = useCallback(() => {
    return eventUsers.filter((user) => selectedUsers.has(user.id));
  }, [eventUsers, selectedUsers]);

  const handleAction = async (action: string, userId: string) => {
    setLoadingUserId(userId);

    const user = eventUsers.find((u) => u.id === userId);

    await new Promise((resolve) => setTimeout(resolve, 300));

    if (action === "preview") {
      setSelectedUserForPreview(user);
      setShowBadgePreviewModal(true);
    } else if (action === "delete") {
      setUserToDelete(user);
      setShowDeleteModal(true);
    }

    setLoadingUserId(null);
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

  // Helper for formatting dates
  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
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