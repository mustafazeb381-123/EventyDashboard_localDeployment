import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { deleteEventUser, getBadgeApi, getEventUsers } from "@/apis/apiHelpers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [eventUsers, setUsers] = useState<any[]>([]); // TODO: Consider a more specific type for eventUser
  const [currentPage, setCurrentPage] = useState(1);
  const [activePopup, setActivePopup] = useState<any>(null); // For MoreVertical dropdown in table
  const [selectedUsers, setSelectedUsers] = useState(new Set<any>()); // Stores user IDs for bulk actions
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoadingActions, setIsLoadingActions] = useState(false); // For individual row actions (preview/delete)
  const [loadingUsers, setLoadingUsers] = useState(false); // For main table user data
  const [showBadgePreviewModal, setShowBadgePreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserForPreview, setSelectedUserForPreview] =
    useState<any>(null); // For single user badge preview (from row action)
  const [selectedBadgeTemplate, setSelectedBadgeTemplate] = useState<number>(1);
  const [eventData, setEventData] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const [badgeColors, setBadgeColors] = useState({
    headerColor: "#4D4D4D",
    footerColor: "#4D4D4D",
    backgroundColor: "white",
  });
  const [qrImage, setQrImage] = useState<string>(""); // Saved QR image data URL, if any

  const rowsPerPage = 8;

  // Integrate the custom print styles hook
  const [isPrinting, setIsPrinting] = useState(false); // State to control print styles activation
  // 'badges-print-container' matches the ID of the div in BadgePreviewModal that serves as the print area.
  usePrintStyles("badges-print-container", isPrinting);

  // --- Data Fetching ---
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const idFromQuery = searchParams.get("eventId");
    setEventId(idFromQuery);

    // Load saved badge preferences from localStorage
    const savedBadgeId = localStorage.getItem("active_badge_id");
    const savedQrImage = localStorage.getItem("badge_qr_image");
    const savedHeaderColor = localStorage.getItem("badge_header_color");
    const savedFooterColor = localStorage.getItem("badge_footer_color");
    const savedBgColor = localStorage.getItem("badge_background_color");

    if (savedBadgeId) {
      setSelectedBadgeTemplate(parseInt(savedBadgeId, 10));
    }
    if (savedQrImage) {
      setQrImage(savedQrImage);
    }
    if (savedHeaderColor || savedFooterColor || savedBgColor) {
      setBadgeColors({
        headerColor: savedHeaderColor || "#4D4D4D",
        footerColor: savedFooterColor || "#4D4D4D",
        backgroundColor: savedBgColor || "white",
      });
    }

    if (idFromQuery) {
      fetchUsers(idFromQuery);
      fetchEventData(idFromQuery);
    }
  }, [location.search]); // Depend on location.search to refetch if eventId changes in URL

  const fetchUsers = async (id: string) => {
    setLoadingUsers(true);
    try {
      const response = await getEventUsers(id);
      const users = response.data.data || response.data || [];
      // Augment users with print-specific status fields
      const usersWithPrintStatus = users.map((user: any) => ({
        ...user,
        printStatus: "Pending", // Default status for new users
        printedAt: null, // Default printed date
      }));
      setUsers(usersWithPrintStatus);
    } catch (error) {
      console.error("Error fetching event users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchEventData = async (id: string) => {
    try {
      const response = await getBadgeApi(id);
      setEventData(response?.data?.data);
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  };

  // --- Filtering and Pagination Logic ---
  const filteredUsers = eventUsers.filter((user) => {
    const matchesSearch =
      user.attributes?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.attributes?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.attributes?.organization
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      user.printStatus?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // --- User Selection and Actions ---
  const getSelectedUsersData = useCallback(() => {
    return eventUsers.filter((user) => selectedUsers.has(user.id));
  }, [eventUsers, selectedUsers]);

  const handleActionClick = useCallback(
    (userId: any) => {
      setActivePopup(activePopup === userId ? null : userId);
    },
    [activePopup]
  );

  const handleAction = async (action: string, userId: string) => {
    setIsLoadingActions(true); // Indicate an action is in progress

    const user = eventUsers.find((u) => u.id === userId);

    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API call/processing time

    if (action === "preview") {
      setSelectedUserForPreview(user); // Set this user for single preview
      setShowBadgePreviewModal(true);
    } else if (action === "delete") {
      setUserToDelete(user);
      setShowDeleteModal(true);
    }

    setActivePopup(null); // Close action popup
    setIsLoadingActions(false);
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
    if (
      selectedUsers.size === paginatedUsers.length &&
      paginatedUsers.length > 0
    ) {
      setSelectedUsers(new Set()); // Deselect all
    } else {
      setSelectedUsers(new Set(paginatedUsers.map((user) => user.id))); // Select all on current page
    }
  }, [selectedUsers, paginatedUsers]);

  const handleDelete = async () => {
    if (!userToDelete || !eventId) {
      console.error("Missing user or event ID for deletion");
      toast.error("Cannot delete user: Missing information");
      return;
    }

    try {
      await deleteEventUser(eventId, userToDelete?.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id)); // Remove user from state
      toast.success("User deleted successfully");
      setSelectedUsers((prev) => {
        // Also remove from selected if present
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
      toast.error(
        `Failed to delete user: ${error.response?.data?.error || error.message}`
      );
    }
    setShowDeleteModal(false);
    setUserToDelete(null); // Clear user to delete
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
    ? [selectedUserForPreview] // If a single user was selected for preview
    : getSelectedUsersData(); // Otherwise, show all selected users

  // Direct Browser Print Functionality for the modal, triggered by the modal component
  const handlePrint = useCallback(async () => {
    if (usersInPreviewModal.length === 0) {
      toast.warning("No badges to print.");
      setIsPrinting(false); // Ensure print state is off if nothing to print
      return;
    }

    // `setIsPrinting(true)` has already been called by BadgePreviewModal
    // The `usePrintStyles` hook will now apply the print-specific CSS.
    // Give a small delay for DOM and styles to render before triggering print dialog.
    await new Promise((resolve) => setTimeout(resolve, 100));
    window.print();
    // The cleanup (`setIsPrinting(false)`) is handled by the `usePrintStyles` hook
    // via its `afterprint` event listener.
    toast.dismiss(); // Dismiss the initial "Preparing for print" toast
    toast.success("Print job sent to printer!"); // Show success toast after print dialog
  }, [usersInPreviewModal, setIsPrinting]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Toast notifications container */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        <div className="p-8">
          {/* Header Section */}
          <PrintBadgesHeader
            filteredUsersCount={filteredUsers.length}
            selectedUsersCount={selectedUsers.size}
            searchTerm={searchTerm}
            onPreviewSelected={() => {
              if (selectedUsers.size === 0) {
                toast.warning("Please select at least one user to preview");
                return;
              }
              setSelectedUserForPreview(null); // Ensure no single user preview if bulk selected
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
              toast.info("Export functionality not implemented yet.")
            }
          />

          {/* Users Table Section */}
          <PrintBadgesTable
            paginatedUsers={paginatedUsers}
            loadingUsers={loadingUsers}
            selectedUsers={selectedUsers}
            handleSelectAll={handleSelectAll}
            handleUserSelect={handleUserSelect}
            handleActionClick={handleActionClick}
            activePopup={activePopup}
            handleAction={handleAction}
            isLoadingActions={isLoadingActions}
            formatDate={formatDate}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            filteredUsersCount={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            startIndex={startIndex}
          />
        </div>

        {/* Overlay to close action popups */}
        {activePopup && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => setActivePopup(null)}
          />
        )}

        {/* Badge Preview Modal */}
        <BadgePreviewModal
          show={showBadgePreviewModal}
          onClose={() => {
            setShowBadgePreviewModal(false);
            setSelectedUserForPreview(null); // Clear single user preview when modal closes
            // Note: Clearing badgeRefs is handled internally by the modal
          }}
          usersToPreview={usersInPreviewModal}
          selectedUserForPreview={selectedUserForPreview}
          eventData={eventData}
          selectedBadgeTemplate={selectedBadgeTemplate}
          badgeColors={badgeColors}
          qrImage={qrImage}
          onPrint={handlePrint} // Pass the print handler
          setIsPrinting={setIsPrinting} // Pass the setter for the print state
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          show={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setUserToDelete(null); // Clear user to delete
          }}
          onConfirm={handleDelete}
          userName={userToDelete?.attributes?.name || "this user"}
        />
      </div>
    </>
  );
}

export default PrintBadges;
