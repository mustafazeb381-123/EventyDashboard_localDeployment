// return (
//   <>
//     <style>{`
//       @media print {
//         @page {
//           margin: 0;
//         }
//         body {
//           margin: 0;
//           padding: 0;
//         }
//         .print-page {
//           width: 100vw;
//           height: 100vh;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           page-break-after: always;
//           break-after: page;
//         }
//         .print-page:last-child {
//           page-break-after: avoid;
//           break-after: avoid;
//         }
//       }
//     `}</style>

//     <div ref={ref}>
//       {users.map((user: any) => (
//         <div
//           key={user.id}
//           className="print-page"
//           style={{
//             width: "100vw",
//             height: "100vh",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             pageBreakAfter: "always",
//           }}
//         >
//           {renderBadgeTemplate(template, eventData, user)}
//         </div>
//       ))}
//     </div>
//   </>
// );
// }
// );



import React, { useRef, useState, useEffect, forwardRef } from "react";
import { X, Download, Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import domtoimage from "dom-to-image-more";
import { renderBadgeTemplate } from "./badgeTemplate";

/** Print content: one badge per page, centered on each page. */
const PrintContent = forwardRef<HTMLDivElement, { template: any; eventData: any; users: any[] }>(
  function PrintContent({ template, eventData, users }, ref) {
    if (!template) return <div ref={ref} />;
    return (
      <>
        <style>{`
          @media print {
            @page {
              margin: 0;
              size: letter;
            }
            html, body, .print-root, .print-page {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              background-color: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-page {
              width: 100%;
              height: 100vh;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              page-break-after: always;
              break-after: page;
              box-sizing: border-box;
            }
            .print-page:last-child {
              page-break-after: avoid;
              break-after: avoid;
            }
            /* Remove gray shadow/outline around the badge when printing */
            .print-page > *,
            .print-root .custom-badge-root,
            .print-root .rounded-xl {
              box-shadow: none !important;
              -webkit-box-shadow: none !important;
            }
          }
        `}</style>

        <div
          ref={ref}
          className="print-root"
          style={{ background: "#fff", backgroundColor: "#fff" }}
        >
          {users.map((user: any) => (
            <div
              key={user.id}
              className="print-page"
              style={{ background: "#fff", backgroundColor: "#fff" }}
            >
              {renderBadgeTemplate(template, eventData, user)}
            </div>
          ))}
        </div>
      </>
    );
  }
);

interface BadgePreviewModalProps {
  show: boolean;
  onClose: () => void;
  usersToPreview: any[];
  selectedUserForPreview?: any;
  eventData: any;
  selectedBadgeTemplate: any;
  allBadgeTemplates?: any[]; // All templates for this event (same as Badge/Advance Badge page)
  onPrint: (usersToPrint?: any[]) => void;
  updatingPrintStatus?: boolean;
  setIsPrinting?: React.Dispatch<React.SetStateAction<boolean>>;
}

const BadgePreviewModal: React.FC<BadgePreviewModalProps> = ({
  show,
  onClose,
  usersToPreview,
  selectedUserForPreview,
  eventData,
  selectedBadgeTemplate,
  allBadgeTemplates = [],
  onPrint,
  updatingPrintStatus = false,
}) => {
  const badgeRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const printComponentRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation("dashboard");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Template selected in this modal for printing (same list as Badge/Advance Badge page)
  const [selectedTemplateForPrint, setSelectedTemplateForPrint] = useState<any>(null);

  // Users selected for printing (multi-select); badges for these users shown in column
  const [selectedUsersForPrint, setSelectedUsersForPrint] = useState<any[]>([]);

  // Sync when modal opens: do NOT pre-select the template from Badges/AdvanceBadge — user picks in this modal
  useEffect(() => {
    if (show) {
      setSelectedTemplateForPrint(null);
      if (usersToPreview.length > 0) {
        setSelectedUsersForPrint(
          selectedUserForPreview
            ? [selectedUserForPreview]
            : usersToPreview
        );
      }
    }
  }, [show, usersToPreview, selectedUserForPreview]);

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

  const isUserSelectedForPrint = (user: any) =>
    selectedUsersForPrint.some((u) => String(u?.id) === String(user?.id));

  const isTemplateSelected = (template: any) =>
    selectedTemplateForPrint &&
    String(template?.id) === String(selectedTemplateForPrint?.id);

  const handleTemplateClick = (template: any) => {
    setSelectedTemplateForPrint(template);
  };

  const handleBadgeClick = (user: any) => {
    setSelectedUsersForPrint((prev) => {
      const id = String(user?.id);
      const isSelected = prev.some((u) => String(u?.id) === id);
      if (isSelected) return prev.filter((u) => String(u?.id) !== id);
      return [...prev, user];
    });
  };

  // Explicitly use modal selection; only fall back to event default when nothing selected in modal
  const templateToUse = selectedTemplateForPrint ?? selectedBadgeTemplate;

  // ✅ react-to-print: trigger after a tick so DOM has latest template selection
  const handlePrintFromHook = useReactToPrint({
    contentRef: printComponentRef,
    pageStyle: `
      @page { margin: 0; size: letter; }
      html, body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; background-color: #ffffff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .print-root, .print-page { background: #ffffff !important; background-color: #ffffff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .print-page > *, .print-root .custom-badge-root, .print-root .rounded-xl { box-shadow: none !important; -webkit-box-shadow: none !important; }
    `,
    onBeforePrint: async () => {
      onPrint(selectedUsersForPrint);
    },
  });

  const handlePrint = () => {
    setTimeout(() => handlePrintFromHook(), 0);
  };

  if (!show) return null;

  const usersForPdfOrPrint = selectedUsersForPrint.length > 0 ? selectedUsersForPrint : usersToPreview;

  // PDF download: uses selected badge(s) only
  const downloadPdf = async () => {
    if (usersForPdfOrPrint.length === 0) return;
    try {
      showNotification("Preparing PDF...", "info");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const scale = Math.max(3, window.devicePixelRatio || 1);
      const margin = 36;
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const targetW = pdfW - 2 * margin;
      const targetH = pdfH - 2 * margin;

      for (let i = 0; i < usersForPdfOrPrint.length; i++) {
        const user = usersForPdfOrPrint[i];
        const badgeNode = badgeRefs.current[user.id];
        if (!badgeNode) continue;
        if (i > 0) pdf.addPage();

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
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[101] animate-slide-in">
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

      <div className="bg-white rounded-2xl shadow-2xl w-[50%] mx-auto relative overflow-hidden max-h-[95vh] flex flex-col">
        
        {/* Header Actions */}
        <div className="p-4 border-b flex justify-between items-center bg-white z-10">
          <div className="flex items-center gap-2">
            <button onClick={downloadPdf} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Download size={16} /> {t("printBadges.downloadPdf")}
            </button>
            <button 
              onClick={() => handlePrint()} 
              disabled={updatingPrintStatus}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Printer size={16} /> {updatingPrintStatus ? t("printBadges.updating") : t("printBadges.printBadges")}
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Preview Area */}
        <div className="p-8 flex-1 overflow-y-auto bg-gray-50 flex flex-col gap-8">
          {/* Row 1: Template names + Participant names (names only) */}
          <div className="flex flex-col sm:flex-row gap-6 flex-wrap">
            {/* Section 1: Choose template – names only */}
            {allBadgeTemplates.length > 0 && (
              <div className="flex-shrink-0">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {t("printBadges.chooseTemplate")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allBadgeTemplates.map((template: any) => {
                    const templateId = template?.id ?? template?.attributes?.id;
                    const templateName =
                      template?.attributes?.name ?? template?.name ?? `Template ${templateId}`;
                    return (
                      <button
                        key={templateId}
                        type="button"
                        onClick={() => handleTemplateClick(template)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isTemplateSelected(template)
                            ? "ring-2 ring-pink-500 ring-offset-2 bg-pink-500 text-white"
                            : "bg-white border border-gray-200 text-gray-700 hover:border-pink-300 hover:bg-pink-50/50"
                        }`}
                      >
                        {templateName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 2: Participants – multi-select for print */}
            {/* {templateToUse && usersToPreview.length > 0 && (
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Participants
                </h3>
                <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
                  {usersToPreview.map((user) => {
                    const name =
                      user?.attributes?.name ??
                      user?.attributes?.email ??
                      `Participant ${user?.id}`;
                    const selected = isUserSelectedForPrint(user);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleBadgeClick(user)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                          selected
                            ? "ring-2 ring-pink-500 ring-offset-2 bg-pink-500 text-white"
                            : "bg-white border border-gray-200 text-gray-700 hover:border-pink-300 hover:bg-pink-50/50"
                        }`}
                      >
                        <span className="truncate max-w-[180px]">{name}</span>
                        {selected && (
                          <span className="shrink-0 text-xs font-medium opacity-90">
                            Selected for print
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )} */}
          </div>

          {/* Row 2: Badge previews – all selected users in a column (always visible) */}
          {templateToUse && usersForPdfOrPrint.length > 0 && (
            <div className="w-full">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {t("printBadges.badgePreview")}
              </h3>
              <div className="flex flex-col gap-6">
                {usersForPdfOrPrint.map((user) => (
                  <div key={user.id} className="flex flex-col items-center">
                    <div
                      ref={(el) => {
                        badgeRefs.current[user.id] = el;
                      }}
                      className="w-full bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200 p-4 flex items-center justify-center"
                    >
                      {renderBadgeTemplate(templateToUse, eventData, user)}
                    </div>
                    <p className="mt-2 text-sm text-gray-500 font-medium">
                      {user?.attributes?.name ?? user?.attributes?.email ?? `Participant ${user?.id}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 🖨️ HIDDEN PRINT SECTION - PrintContent receives current template so print uses modal selection */}
        <div style={{ display: "none" }}>
          <PrintContent
            ref={printComponentRef}
            template={templateToUse}
            eventData={eventData}
            users={usersForPdfOrPrint}
          />
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
};

export default BadgePreviewModal;