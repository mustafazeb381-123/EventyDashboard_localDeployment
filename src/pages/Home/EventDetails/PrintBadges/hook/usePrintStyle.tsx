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
