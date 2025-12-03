import React, { useRef } from "react";
import { X, Download, Printer } from "lucide-react";
import jsPDF from "jspdf";
import domtoimage from "dom-to-image-more";
import { toast } from "react-toastify";
import { renderBadgeTemplate } from "./badgeTemplate";

interface BadgePreviewModalProps {
  show: boolean;
  onClose: () => void;
  usersToPreview: any[];
  selectedUserForPreview: any;
  eventData: any;
  selectedBadgeTemplate: number;
  badgeColors: {
    headerColor: string;
    footerColor: string;
    backgroundColor: string;
  };
  qrImage: string;
  onPrint: () => void;
  setIsPrinting: (printing: boolean) => void;
  updatingPrintStatus?: boolean;
}

const BadgePreviewModal: React.FC<BadgePreviewModalProps> = ({
  show,
  onClose,
  usersToPreview,
  selectedUserForPreview,
  eventData,
  selectedBadgeTemplate,
  badgeColors,
  qrImage,
  onPrint,
  setIsPrinting,
  updatingPrintStatus = false,
}) => {
  const badgeRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  if (!show) return null;

  const handleOpenPrintTab = () => {
    if (usersToPreview.length === 0) {
      toast.warning("No badges to print.");
      return;
    }

    // Call the onPrint function to update print status
    onPrint();
    
    // Then open the print tab
    const badgesHtml = usersToPreview
      .map((user) => {
        const badgeContent = badgeRefs.current[user.id]?.innerHTML || "";
        return `
          <div class="badge-print-page">
            <div class="badge-inner">
              ${badgeContent}
            </div>
          </div>`;
      })
      .join("");
    const htmlContent = `
<html>
  <head>
    <title>Print Badges</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 15mm;
      }

      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      body {
        font-family: Arial, sans-serif;
        background: #f9f9f9;
        margin: 0;
        padding: 20px;
      }

      .print-actions {
        text-align: center;
        margin-bottom: 20px;
        position: sticky;
        top: 0;
        background: #fff;
        padding: 10px 0;
        border-bottom: 1px solid #ddd;
        z-index: 999;
      }

      .print-button {
        background: #007bff;
        color: white;
        border: none;
        padding: 10px 30px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 25px;
      }

      .print-button:hover {
        background: #0056b3;
      }

      /* ✅ Badge container - One badge per page, no empty pages */
      .badge-print-page {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 800px !important;
        min-height: 280px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 12px;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
        page-break-after: always;
        overflow: hidden;
        position: relative;
        margin: 0 auto 40px auto;
      }

      .badge-print-page:last-child {
        page-break-after: auto !important;
      }

      /* Badge inner layout */
      .badge-inner {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        text-align: center;
        transform-origin: center;
        box-sizing: border-box;
        padding: 20px;
      }

      /* ✅ Profile image styles */
      .badge-inner img:not([class*="qr"]) {
        width: 100px !important;
        height: 100px !important;
        object-fit: cover !important;
        border-radius: 50% !important;
        margin: 0 auto 8px auto !important;
        display: block !important;
      }

      /* ✅ QR Code styling */
      .badge-inner svg,
      .badge-inner [class*="qr"],
      .badge-inner canvas {
         width: 770px !important;
        height: 300px !important;
        display: block !important;
        margin: 20px auto 0 auto !important;
        object-fit: contain !important;
      }

      /* ✅ Center text */
      .badge-inner h1,
      .badge-inner h2,
      .badge-inner h3,
      .badge-inner p,
      .badge-inner h6 {
        text-align: center;
        margin: 4px 0;
        word-break: break-word;
      }

      /* Logo images */
      .badge-inner img[alt="Logo"] {
        width: 16px !important;
        height: 16px !important;
        border-radius: 0 !important;
        margin: 0 4px 12px 0 !important;
      }

      @media print {
        .print-actions {
          display: none;
        }
        body {
          background: white;
        }
        .badge-print-page {
          box-shadow: none;
          border: none;
          margin: 0;
          page-break-after: always;
        }
        .badge-print-page:last-child {
          page-break-after: auto;
        }
      }
    </style>
  </head>
  <body>
    <div class="print-actions">
      <button class="print-button" onclick="window.print()">🖨 Print Now</button>
    </div>
    ${badgesHtml}
  </body>
</html>
`;

    const newWindow = window.open("", "_blank");

    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();

      setTimeout(() => {
        newWindow.focus();
      }, 500);

      toast.info("Print page opened in a new tab.");
    } else {
      toast.error("Popup blocked! Please allow popups for this site.");
    }
  };

  const downloadPdf = async () => {
    if (usersToPreview.length === 0) {
      toast.warning("No badges to generate for PDF.");
      return;
    }

    try {
      toast.info("Preparing PDF...");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const scale = Math.max(3, window.devicePixelRatio || 1);

      for (let i = 0; i < usersToPreview.length; i++) {
        const user = usersToPreview[i];
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
      toast.success("PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF generation failed", err);
      toast.error("Failed to create PDF.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-7xl mx-auto relative overflow-hidden max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white rounded-full p-1"
        >
          <X size={24} />
        </button>

        <div className="absolute left-6 top-4 z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={downloadPdf}
              disabled={usersToPreview.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg shadow"
            >
              <Download size={16} />
              Download PDF
            </button>

            <button
              onClick={handleOpenPrintTab}
              disabled={usersToPreview.length === 0 || updatingPrintStatus}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg shadow"
            >
              <Printer size={16} />
              {updatingPrintStatus ? "Updating Status..." : "Open Print Page"}
            </button>
          </div>
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
            Badge Preview
          </h2>
          <p className="text-center text-gray-600 mb-8">
            {selectedUserForPreview
              ? `Showing badge for ${
                  selectedUserForPreview.attributes?.name || "selected user"
                }`
              : `Showing ${usersToPreview.length} selected badge${
                  usersToPreview.length !== 1 ? "s" : ""
                }`}
          </p>

          {usersToPreview.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No badges to display.
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 p-4">
              {usersToPreview.map((user) => (
                <div key={user.id} className="flex flex-col items-center">
                  <div
                    ref={(el) => (badgeRefs.current[user.id] = el)}
                    className="w-64 flex flex-col justify-center items-center text-center transform transition-transform duration-200"
                    style={{
                      border: "none",
                      outline: "none",
                      boxShadow: "none",
                    }}
                  >
                    {renderBadgeTemplate(
                      selectedBadgeTemplate,
                      user,
                      eventData,
                      badgeColors,
                      qrImage
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BadgePreviewModal;