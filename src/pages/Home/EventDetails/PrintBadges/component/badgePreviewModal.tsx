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
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

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