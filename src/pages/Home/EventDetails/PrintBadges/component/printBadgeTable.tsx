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
              <tr>
                <td colSpan={9} className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-sm">Loading users...</p>
                  </div>
                </td>
              </tr>
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
                : "text-gray-600 hover:text-gray-900 hover:bg-white border border-transparent hover:border-200"
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
                    : "text-gray-600 hover:text-gray-900 hover:bg-white border border-transparent hover:border-200"
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
                : "text-gray-600 hover:text-gray-900 hover:bg-white border border-transparent hover:border-200"
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
