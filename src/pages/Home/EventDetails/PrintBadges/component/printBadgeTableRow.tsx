import React from "react";
import {
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
  onPerformAction: (action: string, userId: string) => void; // Handles preview action
  loadingUserId: string | null; // ID of the user whose action is in progress
  formatDate: (dateString: string) => string;
}

const PrintBadgesTableRow: React.FC<PrintBadgesTableRowProps> = ({
  user,
  isSelected,
  onSelect,
  onPerformAction,
  loadingUserId,
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
      <td className="p-4">
        <button
          onClick={() => onPerformAction("preview", user.id)}
          className="w-full px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          disabled={loadingUserId === user.id}
        >
          {loadingUserId === user.id ? "Loading..." : "Print Badge"}
        </button>
      </td>
    </tr>
  );
};

export default PrintBadgesTableRow;
