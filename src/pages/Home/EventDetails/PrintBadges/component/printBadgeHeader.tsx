import React from "react";
import { Eye, Printer, Clock, Users as UsersIcon } from "lucide-react";

interface PrintBadgesHeaderProps {
  filteredUsersCount: number;
  selectedUsersCount: number;
  searchTerm: string;
  printCount: number;
  lastPrintedAt: Date | null;
  onPreviewSelected: () => void;
  disablePreview: boolean;
  // onSettingsClick: () => void; // Add if Settings button needs functionality
}

const formatLastPrinted = (date: Date) =>
  date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const PrintBadgesHeader: React.FC<PrintBadgesHeaderProps> = ({
  filteredUsersCount,
  selectedUsersCount,
  searchTerm,
  printCount,
  lastPrintedAt,
  onPreviewSelected,
  disablePreview,
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
          {/* Print count & last printed below the subtitle */}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-indigo-600" />
              <span>
                <span className="font-medium text-indigo-600">{printCount}</span>
                {" "}badges printed
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>
                Last printed:{" "}
                <span className="font-medium text-indigo-600">
                  {lastPrintedAt ? formatLastPrinted(lastPrintedAt) : "Never"}
                </span>
              </span>
            </span>
          </div>
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
        {/* <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors">
          <Settings size={16} />
          Settings 
        </button> */}
        </div>
      </div>
    </div>
  );
};

export default PrintBadgesHeader;
