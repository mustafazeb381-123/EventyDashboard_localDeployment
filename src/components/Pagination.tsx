interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Builds a compact list of page numbers and ellipsis for large page counts.
 * e.g. [1] [2] [3] [...] [98] [99] [100] or [1] [...] [49] [50] [51] [...] [100]
 */
function getPaginationItems(
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 1) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const delta = 2; // siblings on each side of current (e.g. 48 49 [50] 51 52)
  const left = Math.max(2, currentPage - delta);
  const right = Math.min(totalPages - 1, currentPage + delta);

  const items: (number | "ellipsis")[] = [1];
  if (left > 2) items.push("ellipsis");
  for (let p = left; p <= right; p++) {
    items.push(p);
  }
  if (right < totalPages - 1) items.push("ellipsis");
  if (totalPages > 1) items.push(totalPages);

  return items;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const items = getPaginationItems(currentPage, totalPages);

  return (
    <div
      className={`flex flex-wrap justify-end items-center gap-1.5 mt-4 ${className}`}
    >
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition"
        aria-label="Previous page"
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 py-1 text-gray-500 select-none"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => goToPage(item)}
              className={`min-w-8 px-2.5 py-1.5 rounded-md text-sm font-medium transition ${
                currentPage === item
                  ? "bg-blue-600 text-white border border-blue-600 shadow-sm"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              }`}
              aria-label={`Page ${item}`}
              aria-current={currentPage === item ? "page" : undefined}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition"
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
}