import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Printer,
  Eye,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  Download,
  Settings,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

function PrintBadges() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activePopup, setActivePopup] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const users = [
    {
      id: "001",
      name: "Ethan Carter",
      email: "ethan.carter@company.com",
      phone: "+1 (555) 123-4567",
      userType: "Speaker",
      organization: "TechCorp Inc.",
      token: "TC4dOZx9K2",
      status: "Printed",
      avatar: "EC",
      printedAt: "2025-09-14 10:30 AM",
      department: "Engineering",
    },
    {
      id: "002",
      name: "Luna Thompson",
      email: "luna.thompson@startup.io",
      phone: "+1 (555) 234-5678",
      userType: "Attendee",
      organization: "StartupHub",
      token: "LT8xM3n5P1",
      status: "Pending",
      avatar: "LT",
      department: "Marketing",
    },
    {
      id: "003",
      name: "Liam Anderson",
      email: "liam.anderson@design.co",
      phone: "+1 (555) 345-6789",
      userType: "VIP",
      organization: "Design Studio",
      token: "LA2bQ7r4N8",
      status: "Printed",
      avatar: "LA",
      printedAt: "2025-09-14 09:15 AM",
      department: "Design",
    },
    {
      id: "004",
      name: "Samantha Rivers",
      email: "samantha.rivers@media.com",
      phone: "+1 (555) 456-7890",
      userType: "Media",
      organization: "Media Group",
      token: "SR5kL9m2X6",
      status: "Error",
      avatar: "SR",
      department: "Communications",
    },
    {
      id: "005",
      name: "Michael Chen",
      email: "michael.chen@finance.org",
      phone: "+1 (555) 567-8901",
      userType: "Sponsor",
      organization: "Finance Corp",
      token: "MC3pW8q1Y7",
      status: "Printed",
      avatar: "MC",
      printedAt: "2025-09-14 11:45 AM",
      department: "Finance",
    },
    {
      id: "006",
      name: "Emma Wilson",
      email: "emma.wilson@health.gov",
      phone: "+1 (555) 678-9012",
      userType: "Government",
      organization: "Health Department",
      token: "EW7tR2s9K4",
      status: "Pending",
      avatar: "EW",
      department: "Public Health",
    },
    {
      id: "007",
      name: "James Rodriguez",
      email: "james.rodriguez@edu.ac.uk",
      phone: "+44 20 7946 0958",
      userType: "Academic",
      organization: "University of London",
      token: "JR1nH6v3M8",
      status: "Printed",
      avatar: "JR",
      printedAt: "2025-09-14 08:20 AM",
      department: "Research",
    },
    {
      id: "008",
      name: "Sofia Martinez",
      email: "sofia.martinez@nonprofit.org",
      phone: "+1 (555) 789-0123",
      userType: "NGO",
      organization: "Global Aid Foundation",
      token: "SM4jB5z7L2",
      status: "Error",
      avatar: "SM",
      department: "Operations",
    },
    {
      id: "009",
      name: "Alexander Kim",
      email: "alex.kim@venture.capital",
      phone: "+1 (555) 890-1234",
      userType: "Investor",
      organization: "VentureMax",
      token: "AK9eT1w6P3",
      status: "Pending",
      avatar: "AK",
      department: "Investment",
    },
    {
      id: "010",
      name: "Isabella Foster",
      email: "isabella.foster@consulting.biz",
      phone: "+1 (555) 901-2345",
      userType: "Consultant",
      organization: "Strategic Solutions",
      token: "IF2cY8u4R9",
      status: "Printed",
      avatar: "IF",
      printedAt: "2025-09-13 04:30 PM",
      department: "Strategy",
    },
    {
      id: "011",
      name: "David Park",
      email: "david.park@retail.com",
      phone: "+1 (555) 012-3456",
      userType: "Partner",
      organization: "Retail Giants",
      token: "DP6fG3h5K8",
      status: "Pending",
      avatar: "DP",
      department: "Partnerships",
    },
    {
      id: "012",
      name: "Rachel Green",
      email: "rachel.green@analytics.io",
      phone: "+1 (555) 123-4567",
      userType: "Analyst",
      organization: "Data Insights Co",
      token: "RG7mN2j9L4",
      status: "Error",
      avatar: "RG",
      department: "Analytics",
    },
  ];

  const rowsPerPage = 8;

  // Filter and search logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.organization.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      user.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handleActionClick = (userId) => {
    setActivePopup(activePopup === userId ? null : userId);
  };

  const handleAction = async (action, userId) => {
    setIsLoading(true);
    console.log(`${action} clicked for user ${userId}`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setActivePopup(null);
    setIsLoading(false);
  };

  const handleUserSelect = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === paginatedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(paginatedUsers.map((user) => user.id)));
    }
  };

  const getUserTypeColor = (type) => {
    const colors = {
      Speaker: "bg-purple-100 text-purple-800 border-purple-200",
      Attendee: "bg-blue-100 text-blue-800 border-blue-200",
      VIP: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Media: "bg-pink-100 text-pink-800 border-pink-200",
      Sponsor: "bg-green-100 text-green-800 border-green-200",
      Government: "bg-indigo-100 text-indigo-800 border-indigo-200",
      Academic: "bg-teal-100 text-teal-800 border-teal-200",
      NGO: "bg-orange-100 text-orange-800 border-orange-200",
      Investor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      Consultant: "bg-cyan-100 text-cyan-800 border-cyan-200",
      Partner: "bg-violet-100 text-violet-800 border-violet-200",
      Analyst: "bg-rose-100 text-rose-800 border-rose-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
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

  const getStatusColor = (status) => {
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

  const handlePrintSelected = () => {
    if (selectedUsers.size === 0) return;
    setShowPrintModal(true);
  };

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

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
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Print Badges
                </h1>
                <p className="text-gray-600 mt-1">
                  {filteredUsers.length} users • {selectedUsers.size} selected
                  {searchTerm && (
                    <span className="text-indigo-600"> • Filtered results</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrintSelected}
                disabled={selectedUsers.size === 0}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/30 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Printer size={18} />
                Print Selected ({selectedUsers.size})
              </button>
              <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors">
                <Settings size={16} />
                Settings
              </button>
            </div>
          </div>

          {/* Filters and Search */}
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="printed">Printed</option>
                  <option value="pending">Pending</option>
                  <option value="error">Error</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
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
                      Contact
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Token
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
                  {paginatedUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => handleUserSelect(user.id)}
                        />
                      </td>
                      <td className="p-4 text-sm font-mono text-gray-900">
                        #{user.id}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {user.avatar}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.department}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900">
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.phone}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getUserTypeColor(
                            user.userType
                          )}`}
                        >
                          {user.userType}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900">
                          {user.organization}
                        </div>
                      </td>
                      <td className="p-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono">
                          {user.token}
                        </code>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              user.status
                            )}`}
                          >
                            <span className="flex items-center gap-1.5">
                              {getStatusIcon(user.status)}
                              {user.status}
                            </span>
                          </span>
                          {user.printedAt && (
                            <div className="text-xs text-gray-500">
                              {user.printedAt}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 relative">
                        <button
                          onClick={() => handleActionClick(user.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          disabled={isLoading}
                        >
                          <MoreVertical size={16} className="text-gray-600" />
                        </button>

                        {activePopup === user.id && (
                          <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-xl z-20 min-w-[180px] animate-in fade-in zoom-in-95 duration-200">
                            <div className="py-2">
                              <div className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-100">
                                Badge Actions
                              </div>
                              <button
                                onClick={() => handleAction("preview", user.id)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Eye size={16} className="text-blue-600" />
                                Preview Badge
                              </button>
                              <button
                                onClick={() => handleAction("print", user.id)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
                              >
                                <Printer size={16} />
                                Print Badge
                              </button>
                              <button
                                onClick={() => handleAction("delete", user.id)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={16} />
                                Remove User
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

            {/* Enhanced Pagination */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-200/60">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(startIndex + rowsPerPage, filteredUsers.length)}
                </span>{" "}
                of <span className="font-medium">{filteredUsers.length}</span>{" "}
                users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-200"
                  }`}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {getPaginationNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        typeof page === "number" && setCurrentPage(page)
                      }
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        page === currentPage
                          ? "bg-indigo-600 text-white shadow-sm"
                          : page === "..."
                          ? "text-gray-400 cursor-default"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-200"
                      }`}
                      disabled={page === "..."}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-200"
                  }`}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Printer className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Print Badges
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                You're about to print {selectedUsers.size} badge
                {selectedUsers.size !== 1 ? "s" : ""}. This action will mark
                them as printed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowPrintModal(false);
                    setSelectedUsers(new Set());
                    // Simulate printing
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Print Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close popup */}
      {activePopup && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setActivePopup(null)}
        />
      )}
    </>
  );
}

export default PrintBadges;
