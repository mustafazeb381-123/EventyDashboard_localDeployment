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
