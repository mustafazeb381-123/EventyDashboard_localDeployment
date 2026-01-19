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
  const [activePopup, setActivePopup] = useState<any>(null);
  const [selectedUsers, setSelectedUsers] = useState(new Set<any>());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoadingActions, setIsLoadingActions] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showBadgePreviewModal, setShowBadgePreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserForPreview, setSelectedUserForPreview] = useState<any>(null);
  const [selectedBadgeTemplate, setSelectedBadgeTemplate] = useState<any>(null); // Store full badge template from API
  const [eventData, setEventData] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [updatingPrintStatus, setUpdatingPrintStatus] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

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

  const rowsPerPage = 8;

  // Integrate the custom print styles hook
  usePrintStyles("badges-print-container", isPrinting);


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

  const handleActionClick = useCallback(
    (userId: any) => {
      setActivePopup(activePopup === userId ? null : userId);
    },
    [activePopup]
  );

  const handleAction = async (action: string, userId: string) => {
    setIsLoadingActions(true);

    const user = eventUsers.find((u) => u.id === userId);

    await new Promise((resolve) => setTimeout(resolve, 300));

    if (action === "preview") {
      setSelectedUserForPreview(user);
      setShowBadgePreviewModal(true);
    } else if (action === "delete") {
      setUserToDelete(user);
      setShowDeleteModal(true);
    }

    setActivePopup(null);
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

  // toast.success("Print status updated to 'Printed'!");
}, [usersInPreviewModal]);


  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
    </>
  );
}

export default PrintBadges;
// src/hooks/usePrintStyles.ts
import { useEffect } from "react";

const PRINT_STYLE_ID = "badge-print-styles";

/**
 * Custom hook to inject print-only CSS rules for badge printing.
 * Ensures one badge per page, preserves colors and layout.
 */
export const usePrintStyles = (printAreaId: string, enabled: boolean) => {
  useEffect(() => {
    const printArea = document.getElementById(printAreaId);

    if (!enabled || !printArea) {
      const old = document.getElementById(PRINT_STYLE_ID);
      if (old) old.remove();
      if (printArea) printArea.removeAttribute("data-print-area");
      return;
    }

    let style = document.getElementById(
      PRINT_STYLE_ID
    ) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = PRINT_STYLE_ID;
      document.head.appendChild(style);
    }

    style.innerHTML = `
@page {
  size: A4 portrait;
  margin: 0;
}

@media print {
  body * {
    visibility: hidden !important;
  }

  [data-print-area="true"],
  [data-print-area="true"] * {
    visibility: visible !important;
  }

  [data-print-area="true"] {
    display: block !important;
    position: relative !important;
    background: white !important;
    width: 100% !important;
    margin: 0 auto !important;
    padding: 0 !important;
  }

  /* Ensure exactly one badge per page */
  .badge-print-page {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    height: 100vh !important;         /* each fills full page height */
    width: 100% !important;
    background: white !important;
    page-break-after: always !important;
    page-break-inside: avoid !important;
    break-after: page !important;
    box-sizing: border-box !important;
    margin: 0 !important;
  }

  .badge-print-page:last-child {
    page-break-after: avoid !important;
  }

  /* Maintain actual badge size and design */
  .badge-component-container {
    width: 70mm !important;           /* or whatever exact physical width you want */
    height: 100mm !important;         /* adjust to match your badge design */
    display: block !important;
    background: white !important;
    border: none !important;
    box-shadow: none !important;
    margin: 0 auto !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  * {
    box-shadow: none !important;
    border: none !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  img, svg {
    display: block !important;
    max-width: 100% !important;
    height: auto !important;
  }
}
`;

    printArea.setAttribute("data-print-area", "true");

    const cleanup = () => {
      printArea.removeAttribute("data-print-area");
      const old = document.getElementById(PRINT_STYLE_ID);
      if (old) old.remove();
    };

    window.addEventListener("afterprint", cleanup);
    return () => {
      window.removeEventListener("afterprint", cleanup);
      cleanup();
    };
  }, [enabled, printAreaId]);
};


import React, { useRef, useState, useEffect } from "react";
import { X, Download, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import domtoimage from "dom-to-image-more";
import { renderBadgeTemplate } from "./badgeTemplate";

interface BadgePreviewModalProps {
  show: boolean;
  onClose: () => void;
  usersToPreview: any[];
  selectedUserForPreview: any;
  eventData: any;
  selectedBadgeTemplate: any;
  onPrint: () => void;
  updatingPrintStatus?: boolean;
}

const BadgePreviewModal: React.FC<BadgePreviewModalProps> = ({
  show,
  onClose,
  usersToPreview,
  selectedUserForPreview,
  eventData,
  selectedBadgeTemplate,
  onPrint,
  updatingPrintStatus = false,
}) => {
  const badgeRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const printComponentRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

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

  // ✅ New react-to-print Logic
  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
    onBeforePrint: async () => {
      onPrint(); // Update status in database
    },
  });

  if (!show) return null;

  // ✅ Your Original "Perfect" PDF Logic
  const downloadPdf = async () => {
    if (usersToPreview.length === 0) return;
    try {
      showNotification("Preparing PDF...", "info");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const scale = Math.max(3, window.devicePixelRatio || 1);

      for (let i = 0; i < usersToPreview.length; i++) {
        const user = usersToPreview[i];
        const badgeNode = badgeRefs.current[user.id];
        if (!badgeNode) continue;
        if (i > 0) pdf.addPage();
  //       const dataUrl = await domtoimage.toPng(badgeNode, {
  //         width: badgeNode.offsetWidth * scale,
  //         height: badgeNode.offsetHeight * scale,
  //         style: {
  //           transform: `scale(${scale})`,
  //           transformOrigin: "top left",
  //           width: `${badgeNode.offsetWidth}px`,
  //           height: `${badgeNode.offsetHeight}px`,
  //         },
  //         cacheBust: true,
  //       });

  //       const pdfW = pdf.internal.pageSize.getWidth();
  //       const pdfH = pdf.internal.pageSize.getHeight();
  //       pdf.addImage(dataUrl, "PNG", (pdfW - 350) / 2, (pdfH - 550) / 2, 350, 550);
  //     }
  //     pdf.save(`badges-${new Date().getTime()}.pdf`);
  //     toast.success("PDF downloaded!");
  //   } catch (err) {
  //     toast.error("Failed to create PDF.");
  //   }
  // };

  const dataUrl = await domtoimage.toPng(badgeNode, {
    width: badgeNode.offsetWidth * scale,
    height: badgeNode.offsetHeight * scale,
    style: {
      transform: `scale(${scale})`,
      transformOrigin: "top left",
      width: `${badgeNode.offsetWidth}px`,
      height: `${badgeNode.offsetHeight}px`,
      border: "none",
      boxShadow: "none",
      outline: "none",
    },
    cacheBust: true,
    filter: (node) => true,
    onclone: (clonedBadgeElement) => {
      const doc = clonedBadgeElement.ownerDocument;
      const style = doc.createElement("style");
      style.textContent = `
        * {
          box-shadow: none !important;
          border: none !important;
          outline: none !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        img, svg {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `;
      doc.head.appendChild(style);
      clonedBadgeElement.style.border = "none";
      clonedBadgeElement.style.outline = "none";
      clonedBadgeElement.style.boxShadow = "none";
      const allElements = clonedBadgeElement.querySelectorAll("*");
      allElements.forEach((el) => {
        (el as HTMLElement).style.border = "none";
        (el as HTMLElement).style.outline = "none";
        (el as HTMLElement).style.boxShadow = "none";
      });
    },
  });

  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();
  const margin = 36;
  const targetW = pdfW - 2 * margin;
  const targetH = pdfH - 2 * margin;

  const img = new Image();
  img.src = dataUrl;
  await new Promise((r) => (img.onload = r));

  const widthScale = targetW / img.width;
  const heightScale = targetH / img.height;
  const scaleFactor = Math.min(widthScale, heightScale);

  const finalW = img.width * scaleFactor;
  const finalH = img.height * scaleFactor;
  const x = (pdfW - finalW) / 2;
  const y = (pdfH - finalH) / 2;

  pdf.addImage(dataUrl, "PNG", x, y, finalW, finalH);
}

pdf.save(`badges-${new Date().toISOString().slice(0, 19)}.pdf`);
showNotification("PDF downloaded successfully!", "success");
} catch (err) {
console.error("PDF generation failed", err);
showNotification("Failed to create PDF.", "error");
}
};

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-7xl mx-auto relative overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header Actions */}
        <div className="p-4 border-b flex justify-between items-center bg-white z-10">
          <div className="flex items-center gap-2">
            <button onClick={downloadPdf} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Download size={16} /> Download PDF
            </button>
            <button 
              onClick={() => handlePrint()} 
              disabled={updatingPrintStatus}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Printer size={16} /> {updatingPrintStatus ? "Updating..." : "Print Badges"}
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Preview Area */}
        <div className="p-8 flex-1 overflow-y-auto bg-gray-50">
          <div className="flex flex-col items-center gap-12">
            {usersToPreview.map((user) => (
              <div key={user.id} className="flex flex-col items-center">
                <div
                  ref={(el) => (badgeRefs.current[user.id] = el)}
                  className="bg-white shadow-xl rounded-xl overflow-hidden"
                >
                  {renderBadgeTemplate(selectedBadgeTemplate, eventData, user)}
                </div>
                <p className="mt-2 text-sm text-gray-500 font-medium">{user.attributes?.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 🖨️ HIDDEN PRINT SECTION - react-to-print uses this */}
        <div style={{ display: "none" }}>
          <div ref={printComponentRef} className="print-container">
            <style>{`
              @media print {
                @page { size: A4 portrait; margin: 0; }
                .badge-print-wrapper {
                  display: flex !important;
                  justify-content: center !important;
                  align-items: center !important;
                  height: 100vh !important;
                  page-break-after: always !important;
                }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              }
            `}</style>
            {usersToPreview.map((user) => (
              <div key={user.id} className="badge-print-wrapper">
                {renderBadgeTemplate(selectedBadgeTemplate, eventData, user)}
              </div>
            ))}
          </div>
        </div>

      </div>

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
};

export default BadgePreviewModal;


import React from "react";
import QRCode from "react-qr-code";
import UserAvatar from "./useAvatar";
import {
  CardFooter,
  CardFooter2,
  CardHeader,
  CardHeader2,
} from "@/pages/Home/ExpressEvent/Badges/Badges";

interface BadgeTemplateProps {
  template: any;
  event: any;
  user?: any;
}

const getBadgeColors = (template: any, event: any) => {
  const templateData = template?.attributes?.template_data || {};
  const eventColors = event?.attributes || {};
  const templateName = template?.attributes?.name || "";
  const templateType = templateData.type || "";

  const fixRedBackground = (bgColor: string | null | undefined): string => {
    if (!bgColor) return "#ffffff";
    const color = bgColor.toLowerCase().trim();
    if (["#ff0000", "#f00", "red", "rgb(255, 0, 0)"].includes(color))
      return "#ffffff";
    return bgColor;
  };

  const isReadyMadeTemplate =
    templateName === "Template 1" ||
    templateName === "Template 2" ||
    templateType === "existing";

  let finalBgColor: string;
  if (isReadyMadeTemplate) {
    finalBgColor = fixRedBackground(eventColors.secondary_color) || "white";
  } else {
    finalBgColor =
      fixRedBackground(templateData.bgColor) ||
      fixRedBackground(eventColors.secondary_color) ||
      "white";
  }

  return {
    headerColor: eventColors.primary_color || "#4D4D4D",
    footerColor: eventColors.primary_color || "#4D4D4D",
    backgroundColor: finalBgColor,
  };
};

export const CustomBadgeTemplate: React.FC<BadgeTemplateProps> = ({
  template,
  event,
  user,
}) => {
  const templateData = template?.attributes?.template_data || {};
  const badgeColors = getBadgeColors(template, event);

  // Use 96 DPI for consistency (standard web DPI)
  const DPI = 96;
  let width = templateData.width || 3.5;
  let height = templateData.height || 5.5;
  if (width > 50) width = width / DPI;
  if (height > 50) height = height / DPI;

  const widthPx = width * DPI;
  const heightPx = height * DPI;
  
  // Positions are stored in pixels relative to a 400px wide canvas
  const canvasWidth = 400;
  const scaleX = widthPx / canvasWidth;
  const scaleY = heightPx / (canvasWidth * (height / width));

  const backgroundImageUrl =
    template?.attributes?.background_image || templateData.bgImage || null;
  const finalBackgroundColor = templateData.bgColor
    ? badgeColors.backgroundColor
    : templateData.hasBackground
    ? badgeColors.backgroundColor
    : "#ffffff";

  return (
    <div
      className="custom-badge-root"
      style={{
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        backgroundColor: finalBackgroundColor,
        backgroundImage: backgroundImageUrl
          ? `url(${backgroundImageUrl})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {templateData.hasPersonalPhoto && (
        <div
          style={{
            position: "absolute",
            borderRadius: "50%",
            border: "4px solid white",
            overflow: "hidden",
            width: `${(templateData.photoSize?.width || 200) * scaleX}px`,
            height: `${(templateData.photoSize?.height || 200) * scaleY}px`,
            top: `${(templateData.photoPosition?.y || 60) * scaleY}px`,
            left:
              templateData.photoAlignment === "center"
                ? "50%"
                : templateData.photoAlignment === "left"
                ? `${(templateData.photoPosition?.x || 200) * scaleX}px`
                : "auto",
            right:
              templateData.photoAlignment === "right"
                ? `${(templateData.photoPosition?.x || 200) * scaleX}px`
                : "auto",
            transform:
              templateData.photoAlignment === "center"
                ? "translateX(-50%)"
                : "none",
          }}
        >
          {user ? (
            (() => {
              const imageUrl = user?.attributes?.avatar || user?.attributes?.image;
              const userName = user?.attributes?.name || "User";
              const photoWidth = (templateData.photoSize?.width || 200) * scaleX;
              const photoHeight = (templateData.photoSize?.height || 200) * scaleY;
              
              if (imageUrl) {
                return (
                  <img
                    src={imageUrl}
                    alt={userName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      border: "none",
                      outline: "none",
                      boxShadow: "none",
                    }}
                    onError={(e) => {
                      // Fallback to initials if image fails
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector(".avatar-initials")) {
                        const initialsDiv = document.createElement("div");
                        initialsDiv.className = "avatar-initials";
                        initialsDiv.style.cssText = `
                          width: 100%;
                          height: 100%;
                          background-color: #4f46e5;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          color: white;
                          font-weight: 600;
                          font-size: ${Math.min(photoWidth, photoHeight) * 0.4}px;
                        `;
                        const initials = (userName || "U")
                          .trim()
                          .split(" ")
                          .filter(Boolean)
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "U";
                        initialsDiv.textContent = initials;
                        parent.appendChild(initialsDiv);
                      }
                    }}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                  />
                );
              }
              
              // Fallback to initials if no image
              const initials = (userName || "U")
                .trim()
                .split(" ")
                .filter(Boolean)
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "U";
              
              return (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 600,
                    fontSize: `${Math.min(photoWidth, photoHeight) * 0.4}px`,
                  }}
                >
                  {initials}
                </div>
              );
            })()
          ) : (
            <div style={{ width: "100%", height: "100%", backgroundColor: "#e5e7eb" }} />
          )}
        </div>
      )}

      {templateData.hasName && (
        <div
          style={{
            position: "absolute",
            width: "100%",
            top: `${(templateData.nameText?.position?.y || 280) * scaleY}px`,
            textAlign: templateData.nameText?.alignment || "center",
            fontSize: `${(templateData.nameText?.size || 24) * scaleY}px`,
            color: templateData.nameText?.color || "#000000",
            fontWeight: "bold",
            padding: "0 10px",
          }}
        >
          {user?.attributes?.name || "Name Placeholder"}
        </div>
      )}

      {templateData.hasCompany && (
        <div
          style={{
            position: "absolute",
            width: "100%",
            top: `${(templateData.companyText?.position?.y || 315) * scaleY}px`,
            textAlign: templateData.companyText?.alignment || "center",
            fontSize: `${(templateData.companyText?.size || 18) * scaleY}px`,
            color: templateData.companyText?.color || "#666666",
          }}
        >
          {user?.attributes?.organization || "Company Placeholder"}
        </div>
      )}

      {templateData.hasTitle && (
        <div
          style={{
            position: "absolute",
            width: "100%",
            top: `${(templateData.titleText?.position?.y || 350) * scaleY}px`,
            textAlign: templateData.titleText?.alignment || "center",
            fontSize: `${(templateData.titleText?.size || 16) * scaleY}px`,
            color: templateData.titleText?.color || "#999999",
          }}
        >
          {user?.attributes?.user_type || "Title Placeholder"}
        </div>
      )}

      {templateData.hasQrCode && (
        <div
          style={{
            position: "absolute",
            backgroundColor: "white",
            padding: "4px",
            borderRadius: "4px",
            width: `${(templateData.qrCodeSize?.width || 120) * scaleX}px`,
            height: `${(templateData.qrCodeSize?.height || 120) * scaleY}px`,
            top: `${(templateData.qrCodePosition?.y || 400) * scaleY}px`,
            left:
              templateData.qrCodeAlignment === "center"
                ? "50%"
                : templateData.qrCodeAlignment === "left"
                ? `${(templateData.qrCodePosition?.x || 200) * scaleX}px`
                : "auto",
            right:
              templateData.qrCodeAlignment === "right"
                ? `${(templateData.qrCodePosition?.x || 200) * scaleX}px`
                : "auto",
            transform:
              templateData.qrCodeAlignment === "center"
                ? "translateX(-50%)"
                : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {user?.attributes?.token ? (
            <QRCode
              value={user.attributes.token}
              size={Math.min(
                (templateData.qrCodeSize?.width || 120) * scaleX - 8,
                (templateData.qrCodeSize?.height || 120) * scaleY - 8
              )}
              style={{
                width: "100%",
                height: "100%",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
        </div>
      )}
    </div>
  );
};

export const ExistingBadgeTemplate1: React.FC<BadgeTemplateProps> = ({
  template,
  event,
  user,
}) => {
  const badgeColors = getBadgeColors(template, event);
  const primaryColor = event?.attributes?.primary_color || "#4D4D4D";
  const secondaryColor = badgeColors.backgroundColor || "white";
  
  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden shadow-lg"
      style={{
        backgroundColor: secondaryColor,
        width: "350px",
        height: "550px",
      }}
    >
      {/* Header Section - Fixed height container */}
      <div
        className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
        style={{ height: "90px" }}
      >
        <div className="absolute inset-0 h-full w-full">
          <CardHeader color={primaryColor} />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col justify-center items-center p-6">
        {/* Profile Picture */}
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 flex items-center justify-center">
          {user ? (
            (() => {
              const imageUrl = user?.attributes?.avatar || user?.attributes?.image;
              const userName = user?.attributes?.name || "User";
              
              if (imageUrl) {
                return (
                  <img
                    src={imageUrl}
                    alt={userName}
                    className="w-full h-full object-cover"
                    style={{ border: "none", outline: "none", boxShadow: "none" }}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector(".avatar-initials")) {
                        const initialsDiv = document.createElement("div");
                        initialsDiv.className = "avatar-initials";
                        initialsDiv.style.cssText = `
                          width: 100%;
                          height: 100%;
                          background-color: #4f46e5;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          color: white;
                          font-weight: 600;
                          font-size: 32px;
                        `;
                        const initials = (userName || "U")
                          .trim()
                          .split(" ")
                          .filter(Boolean)
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "U";
                        initialsDiv.textContent = initials;
                        parent.appendChild(initialsDiv);
                      }
                    }}
                  />
                );
              }
              
              const initials = (userName || "U")
                .trim()
                .split(" ")
                .filter(Boolean)
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "U";
              
              return (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "32px",
                  }}
                >
                  {initials}
                </div>
              );
            })()
          ) : (
            <div className="w-full h-full bg-gray-300" />
          )}
        </div>
        
        {/* Name */}
        <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-1">
          {user?.attributes?.name || "Name"}
        </h2>
        
        {/* Title */}
        <p className="text-gray-600 text-lg mt-1 mb-4">
          {user?.attributes?.user_type || "Title"}
        </p>

        {/* QR Code on front side */}
        <div className="mt-2 bg-white p-3 rounded-lg shadow-md">
          {user?.attributes?.token ? (
            <QRCode
              value={user.attributes.token}
              size={96}
              style={{ width: "96px", height: "96px" }}
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200" />
          )}
        </div>
      </div>

      {/* Footer Section - Fixed height container */}
      <div
        className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
        style={{ height: "41px" }}
      >
        <div className="absolute inset-0 h-full w-full">
          <CardFooter color={primaryColor} />
        </div>
      </div>
    </div>
  );
};

export const ExistingBadgeTemplate2: React.FC<BadgeTemplateProps> = ({
  template,
  event,
  user,
}) => {
  const badgeColors = getBadgeColors(template, event);
  const primaryColor = event?.attributes?.primary_color || "#4D4D4D";
  const secondaryColor = badgeColors.backgroundColor || "white";
  
  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden shadow-lg"
      style={{
        backgroundColor: secondaryColor,
        width: "350px",
        height: "550px",
      }}
    >
      {/* Header Section - Fixed height container */}
      <div
        className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
        style={{ height: "106px" }}
      >
        <div className="absolute inset-0 h-full w-full">
          <CardHeader2 color={primaryColor} />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col justify-center items-center p-6">
        {/* Profile Picture - Circular for Template 2 */}
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 flex items-center justify-center">
          {user ? (
            (() => {
              const imageUrl = user?.attributes?.avatar || user?.attributes?.image;
              const userName = user?.attributes?.name || "User";
              
              if (imageUrl) {
                return (
                  <img
                    src={imageUrl}
                    alt={userName}
                    className="w-full h-full object-cover"
                    style={{ border: "none", outline: "none", boxShadow: "none" }}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector(".avatar-initials")) {
                        const initialsDiv = document.createElement("div");
                        initialsDiv.className = "avatar-initials";
                        initialsDiv.style.cssText = `
                          width: 100%;
                          height: 100%;
                          background-color: #4f46e5;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          color: white;
                          font-weight: 600;
                          font-size: 32px;
                        `;
                        const initials = (userName || "U")
                          .trim()
                          .split(" ")
                          .filter(Boolean)
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "U";
                        initialsDiv.textContent = initials;
                        parent.appendChild(initialsDiv);
                      }
                    }}
                  />
                );
              }
              
              const initials = (userName || "U")
                .trim()
                .split(" ")
                .filter(Boolean)
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "U";
              
              return (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "32px",
                  }}
                >
                  {initials}
                </div>
              );
            })()
          ) : (
            <div className="w-full h-full bg-gray-300" />
          )}
        </div>
        
        {/* Name */}
        <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-1">
          {user?.attributes?.name || "Name"}
        </h2>
        
        {/* Title */}
        <p className="text-gray-600 text-lg mt-1 mb-4">
          {user?.attributes?.user_type || "Title"}
        </p>

        {/* QR Code on front side */}
        <div className="mt-2 bg-white p-3 rounded-lg shadow-md">
          {user?.attributes?.token ? (
            <QRCode
              value={user.attributes.token}
              size={96}
              style={{ width: "96px", height: "96px" }}
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200" />
          )}
        </div>
      </div>

      {/* Footer Section - Fixed height container */}
      <div
        className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
        style={{ height: "54px" }}
      >
        <div className="absolute inset-0 h-full w-full">
          <CardFooter2 color={primaryColor} />
        </div>
      </div>
    </div>
  );
};

export const renderBadgeTemplate = (
  template: any,
  eventData: any,
  user?: any
) => {
  if (!template) return <div>No badge selected</div>;
  const name = template?.attributes?.name || "";
  const type = template?.attributes?.template_data?.type || "";
  if (
    name === "Template 1" ||
    (type === "existing" && name.includes("Template 1"))
  ) {
    return (
      <ExistingBadgeTemplate1
        template={template}
        event={eventData}
        user={user}
      />
    );
  }
  if (
    name === "Template 2" ||
    (type === "existing" && name.includes("Template 2"))
  ) {
    return (
      <ExistingBadgeTemplate2
        template={template}
        event={eventData}
        user={user}
      />
    );
  }
  return (
    <CustomBadgeTemplate template={template} event={eventData} user={user} />
  );
};
import React from "react";
import { Trash2 } from "lucide-react";

interface DeleteConfirmationModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  show,
  onClose,
  onConfirm,
  userName,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-500" />
        </div>

        <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
          Delete User?
        </h3>
        <p className="text-sm text-gray-600 text-center mb-6">
          Are you sure you want to delete{" "}
          <strong>{userName || "this user"}</strong>? This action cannot be
          undone.
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;


import React from "react";
import { Search, Download } from "lucide-react";

interface PrintBadgesFilterAndSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onExport: () => void; // Callback for export functionality
}

const PrintBadgesFilterAndSearch: React.FC<PrintBadgesFilterAndSearchProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onExport,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 mb-6 p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name, email, or organization..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white"
          >
            <option value="all">All Status</option>
            <option value="printed">Printed</option>
            <option value="pending">Pending</option>
            <option value="error">Error</option>
          </select>
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintBadgesFilterAndSearch;

import React from "react";
import { Eye, Settings, Users as UsersIcon } from "lucide-react";

interface PrintBadgesHeaderProps {
  filteredUsersCount: number;
  selectedUsersCount: number;
  searchTerm: string;
  onPreviewSelected: () => void;
  disablePreview: boolean;
  // onSettingsClick: () => void; // Add if Settings button needs functionality
}

const PrintBadgesHeader: React.FC<PrintBadgesHeaderProps> = ({
  filteredUsersCount,
  selectedUsersCount,
  searchTerm,
  onPreviewSelected,
  disablePreview,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-600 rounded-xl shadow-lg">
          <UsersIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Manage Badges
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredUsersCount} users • {selectedUsersCount} selected
            {searchTerm && (
              <span className="text-indigo-600"> • Filtered results</span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onPreviewSelected}
          disabled={disablePreview}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/30 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <Eye size={18} />
          Preview Selected ({selectedUsersCount})
        </button>
        <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors">
          <Settings size={16} />
          Settings {/* Placeholder for settings functionality */}
        </button>
      </div>
    </div>
  );
};

export default PrintBadgesHeader;


import React from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import PrintBadgesTableRow from "./printBadgeTableRow";

interface PrintBadgesTableProps {
  paginatedUsers: any[]; // Users for the current page
  loadingUsers: boolean;
  selectedUsers: Set<string>;
  handleSelectAll: () => void;
  handleUserSelect: (userId: string) => void;
  handleActionClick: (userId: string) => void;
  activePopup: string | null;
  handleAction: (action: string, userId: string) => void;
  isLoadingActions: boolean;
  formatDate: (dateString: string) => string;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  filteredUsersCount: number; // Total count of filtered users
  rowsPerPage: number;
  startIndex: number;
}

const PrintBadgesTable: React.FC<PrintBadgesTableProps> = ({
  paginatedUsers,
  loadingUsers,
  selectedUsers,
  handleSelectAll,
  handleUserSelect,
  handleActionClick,
  activePopup,
  handleAction,
  isLoadingActions,
  formatDate,
  currentPage,
  totalPages,
  setCurrentPage,
  filteredUsersCount,
  rowsPerPage,
  startIndex,
}) => {
  // Logic to generate pagination numbers (kept here as it's tightly coupled with pagination UI)
  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80 border-b border-gray-200/60">
            <tr>
              <th className="text-left p-4">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={
                    selectedUsers.size === paginatedUsers.length &&
                    paginatedUsers.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                ID
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Participant
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray:600 uppercase tracking-wider">
                Type
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Organization
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Created
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/60">
            {loadingUsers ? (
              <>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="p-4">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-40"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-28"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </td>
                  </tr>
                ))}
              </>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <Users className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-sm">No users found</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <PrintBadgesTableRow
                  key={user.id}
                  user={user}
                  isSelected={selectedUsers.has(user.id)}
                  onSelect={handleUserSelect}
                  onActionClick={handleActionClick}
                  activePopup={activePopup}
                  onPerformAction={handleAction}
                  isLoadingActions={isLoadingActions}
                  formatDate={formatDate}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-200/60">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
          <span className="font-medium">
            {Math.min(startIndex + rowsPerPage, filteredUsersCount)}
          </span>{" "}
          of <span className="font-medium">{filteredUsersCount}</span> users
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:text-gray-900 border border-transparent"
            }`}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {getPaginationNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === "number" && setCurrentPage(page)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  page === currentPage
                    ? "bg-indigo-600 text-white shadow-sm"
                    : page === "..."
                    ? "text-gray-400 cursor-default"
                    : "text-gray-600 hover:text-gray-900 border border-transparent"
                }`}
                disabled={page === "..."}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:text-gray-900 border border-transparent"
            }`}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintBadgesTable;


import React from "react";
import {
  MoreVertical,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import UserAvatar from "./useAvatar";

// Helper functions for status display, extracted for reusability
const getStatusIcon = (status: string) => {
  switch (status) {
    case "Printed":
      return <CheckCircle size={14} className="text-green-600" />;
    case "Pending":
      return <Clock size={14} className="text-amber-600" />;
    case "Error":
      return <AlertCircle size={14} className="text-red-600" />;
    default:
      return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Printed":
      return "bg-green-50 text-green-700 border-green-200";
    case "Pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Error":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

interface PrintBadgesTableRowProps {
  user: any; // Consider more specific user type
  isSelected: boolean;
  onSelect: (userId: string) => void;
  onActionClick: (userId: string) => void; // Toggles the action popup
  activePopup: string | null; // ID of the user whose popup is active
  onPerformAction: (action: string, userId: string) => void; // Handles preview/delete actions
  isLoadingActions: boolean; // Indicates if an action is in progress
  formatDate: (dateString: string) => string;
}

const PrintBadgesTableRow: React.FC<PrintBadgesTableRowProps> = ({
  user,
  isSelected,
  onSelect,
  onActionClick,
  activePopup,
  onPerformAction,
  isLoadingActions,
  formatDate,
}) => {
  return (
    <tr
      key={user.id}
      className="hover:bg-gray-50/50 transition-colors group relative"
    >
      <td className="p-4">
        <input
          type="checkbox"
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          checked={isSelected}
          onChange={() => onSelect(user.id)}
        />
      </td>
      <td className="p-4 text-sm font-mono text-gray-900">#{user.id}</td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} size="table" />
          {/* <img
            src={user?.attributes?.image || user?.attributes?.avatar}
            alt={user?.attributes?.name || "User"}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              display: "none",
            }}
          /> */}

          {/* Use flexible UserAvatar */}
          <div>
            <div className="font-medium text-gray-900">
              {user.attributes?.name || "Unknown"}
            </div>
            <div className="text-sm text-gray-500">{user.department}</div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="text-sm text-gray-900">
          {user.attributes?.email || "No email"}
        </div>
      </td>
      <td className="p-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200">
          {user.attributes?.user_type || "Attendee"}
        </span>
      </td>
      <td className="p-4">
        <div className="text-sm text-gray-900">
          {user.attributes?.organization || "No organization"}
        </div>
      </td>
      <td className="p-4">
        <div className="text-sm text-gray-900">
          {formatDate(user.attributes?.created_at)}
        </div>
      </td>
      <td className="p-4">
        <div className="flex flex-col gap-1">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
              user.printStatus
            )}`}
          >
            <span className="flex items-center gap-1.5">
              {getStatusIcon(user.printStatus)}
              {user.printStatus}
            </span>
          </span>
          {user.printedAt && (
            <div className="text-xs text-gray-500">
              {formatDate(user.printedAt)}
            </div>
          )}
        </div>
      </td>
      <td className="p-4 relative">
        <button
          onClick={() => onActionClick(user.id)}
          className="p-2 bg-gray-100 rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:bg-gray-200"
          disabled={isLoadingActions}
        >
          <MoreVertical size={16} className="text-gray-600" />
        </button>

        {activePopup === user.id && (
          <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-xl z-20 min-w-[180px]">
            <div className="py-2">
              <div className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-100">
                Badge Actions
              </div>

              <button
                onClick={() => onPerformAction("preview", user.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Eye size={16} />
                Preview Badge
              </button>

              <button
                onClick={() => onPerformAction("delete", user.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
                Remove User
              </button>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
};

export default PrintBadgesTableRow;


import React, { useState } from "react";

interface UserAvatarProps {
  user: any; // Consider defining a more specific type for user
  size?: "sm" | "md" | "lg" | "table"; // Various predefined sizes
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = "md" }) => {
  const [loadError, setLoadError] = useState(false);
  const imageUrl = user?.attributes?.avatar || user?.attributes?.image;
  const userName =
    user?.attributes?.name ||
    user?.attributes?.email ||
    user?.attributes?.phone_number ||
    "User";

  let dimensions = "w-12 h-12 text-sm"; // Default 'md'
  if (size === "sm") dimensions = "w-8 h-8 text-xs";
  else if (size === "lg") dimensions = "w-16 h-16 text-lg";
  else if (size === "table") dimensions = "w-10 h-10 text-sm"; // Specific size for table rows

  if (imageUrl && !loadError) {
    return (
      <img
        src={imageUrl}
        alt={userName}
        className={`${dimensions} rounded-full object-cover`}
        style={{ border: "none", outline: "none", boxShadow: "none" }}
        onError={() => setLoadError(true)}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
      />
    );
  }

  const initials =
    (userName || "U")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div
      className={`${dimensions} bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold`}
      style={{ border: "none", outline: "none", boxShadow: "none" }}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;





