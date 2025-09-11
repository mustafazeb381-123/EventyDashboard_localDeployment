import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Printer,
  Eye,
  Trash2,
  MoreVertical,
} from "lucide-react";

function PrintBadges() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activePopup, setActivePopup] = useState(null);

  const users = [
    {
      id: "01",
      name: "Ethan Ca...",
      email: "merom8...",
      phone: "1119111911",
      userType: "Attendee",
      organization: "--",
      token: "__4dOZx...",
      status: "Printed",
    },
    {
      id: "02",
      name: "Luca Tho...",
      email: "contact...",
      phone: "1119111911",
      userType: "Attendee",
      organization: "--",
      token: "__4dOZx...",
      status: "--",
    },
    {
      id: "03",
      name: "Liam And...",
      email: "support...",
      phone: "1119111911",
      userType: "Attendee",
      organization: "--",
      token: "__4dOZx...",
      status: "Printed",
    },
    {
      id: "04",
      name: "Samanth...",
      email: "luna_sta...",
      phone: "1119111911",
      userType: "Attendee",
      organization: "--",
      token: "__4dOZx...",
      status: "Printed",
    },
    {
      id: "05",
      name: "Liam And...",
      email: "info@cre...",
      phone: "1119111911",
      userType: "Attendee",
      organization: "--",
      token: "__4dOZx...",
      status: "--",
    },
    {
      id: "06",
      name: "Samanth...",
      email: "luna_sta...",
      phone: "1119111911",
      userType: "Attendee",
      organization: "--",
      token: "__4dOZx...",
      status: "--",
    },
    {
      id: "07",
      name: "Ethan Ca...",
      email: "merom8...",
      phone: "1119111911",
      userType: "Attendee",
      organization: "--",
      token: "__4dOZx...",
      status: "Printed",
    },
    {
      id: "08",
      name: "Luca Tho...",
      email: "contact...",
      phone: "1119111911",
      userType: "Attendee",
      organization: "--",
      token: "__4dOZx...",
      status: "--",
    },
    {
      id: "09",
      name: "Liam And...",
      email: "support...",
      phone: "1119111911",
      userType: "Attendee",
      organization: "--",
      token: "__4dOZx...",
      status: "Printed",
    },
    {
      id: "10",
      name: "Samanth...",
      email: "luna_sta...",
      phone: "1119111911",
      userType: "Attendee",
      organization: "--",
      token: "__4dOZx...",
      status: "Printed",
    },
    {
      id: "11",
      name: "Liam And...",
      email: "info@cre...",
      phone: "1119111911",
      userType: "Attendee",
      organization: "--",
      token: "__4dOZx...",
      status: "--",
    },
    {
      id: "12",
      name: "Samanth...",
      email: "luna_sta...",
      phone: "1119111911",
      userType: "Attendee",
      organization: "--",
      token: "__4dOZx...",
      status: "--",
    },
  ];

  const rowsPerPage = 10; // 👈 change as needed
  const totalPages = Math.ceil(users.length / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = users.slice(startIndex, startIndex + rowsPerPage);

  const handleActionClick = (userId) => {
    setActivePopup(activePopup === userId ? null : userId);
  };

  const handleAction = (action, userId) => {
    console.log(`${action} clicked for user ${userId}`);
    setActivePopup(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-gray-900 font-medium">Users</span>
            <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded">
              {users.length} Users
            </span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <Printer size={16} />
            <span className="text-gray-700">Print All</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Phone Number</th>
                <th className="text-left p-4">User type</th>
                <th className="text-left p-4">Organization</th>
                <th className="text-left p-4">Token</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="p-4 text-gray-900">{user.id}</td>
                  <td className="p-4 text-gray-900">{user.name}</td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4 text-gray-600">{user.phone}</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {user.userType}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{user.organization}</td>
                  <td className="p-4 text-gray-600">{user.token}</td>
                  <td className="p-4">
                    {user.status === "Printed" ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Printed
                      </span>
                    ) : (
                      <span className="text-gray-600">--</span>
                    )}
                  </td>
                  <td className="p-4 relative">
                    <button
                      onClick={() => handleActionClick(user.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <MoreVertical size={16} className="text-gray-600" />
                    </button>

                    {activePopup === user.id && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                        <div className="py-2">
                          <div className="px-3 py-2 text-sm font-medium text-gray-700 border-b border-gray-100">
                            Actions-Popup
                          </div>
                          <button
                            onClick={() => handleAction("preview", user.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Eye size={16} /> Preview
                          </button>
                          <button
                            onClick={() => handleAction("print", user.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                          >
                            <Printer size={16} /> Print
                          </button>
                          <button
                            onClick={() => handleAction("delete", user.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <ChevronUp size={16} className="rotate-[-90deg]" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Next
            <ChevronDown size={16} className="rotate-[-90deg]" />
          </button>
        </div>
      </div>

      {/* Click outside to close popup */}
      {activePopup && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActivePopup(null)}
        />
      )}
    </div>
  );
}

export default PrintBadges;
