import React, { useState } from "react";
import {
  Plus,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  Mail,
  MessageSquare,
  Search,
  Filter,
  MoreVertical,
  Users as UsersIcon,
  Copy,
  Check,
  ArrowRight,
  Trash2,
  Calendar,
  MapPin,
  List,
} from "lucide-react";

function Onboarding() {
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState("email");
  const [title, setTitle] = useState("");
  const [sendTo, setSendTo] = useState("All users Registered");
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("event");

  const users = [
    {
      id: "01",
      title: "Ethan Carter",
      type: "email",
      url: "https://site.eventmy.circular-for-news",
      createdAt: "06/04/2025",
      numberOfUsers: 3,
      status: "Success",
      avatar: "EC",
    },
    {
      id: "02",
      title: "Luca Thompson",
      type: "SMS",
      url: "https://site.eventmy.circular-for-news",
      createdAt: "06/04/2025",
      numberOfUsers: 3,
      status: "pending",
      avatar: "LT",
    },
    {
      id: "03",
      title: "Liam Anderson",
      type: "email",
      url: "https://site.eventmy.circular-for-news",
      createdAt: "06/04/2025",
      numberOfUsers: 3,
      status: "Rejected",
      avatar: "LA",
    },
    {
      id: "04",
      title: "Samantha Rivers",
      type: "SMS",
      url: "https://site.eventmy.circular-for-news",
      createdAt: "06/04/2025",
      numberOfUsers: 3,
      status: "pending",
      avatar: "SR",
    },
    {
      id: "05",
      title: "Liam Anderson",
      type: "email",
      url: "https://site.eventmy.circular-for-news",
      createdAt: "06/04/2025",
      numberOfUsers: 3,
      status: "pending",
      avatar: "LA",
    },
    {
      id: "06",
      title: "Samantha Rivers",
      type: "email",
      url: "https://site.eventmy.circular-for-news",
      createdAt: "06/04/2025",
      numberOfUsers: 3,
      status: "pending",
      avatar: "SR",
    },
  ];

  // 🔹 Pagination setup
  const itemsPerPage = 3; // number of rows per page
  const filteredUsers = users.filter((user) =>
    user.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const getPaginationNumbers = () => {
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleNewInvitation = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("New invitation:", { title, sendTo, type: selectedType });
    setIsLoading(false);
    setShowModal(false);
    setTitle("");
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
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((user) => user.id)));
    }
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    // You can add a toast notification here
    console.log("URL copied:", url);
  };

  const handleDelete = (userId) => {
    // Handle delete logic here
    console.log("Delete user:", userId);
  };

  const gateTypes = [
    {
      id: "event",
      label: "By Event",
      icon: Calendar,
      // description: "Select by event type"
    },
    {
      id: "area",
      label: "By Area",
      icon: MapPin,
      // description: "Select by area location"
    },
    {
      id: "agenda",
      label: "By Agenda",
      icon: List,
      // description: "Select by agenda items"
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  VIP Users
                </h1>
                <p className="text-gray-600 mt-1">
                  {users.length} total users • {selectedUsers.size} selected
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
               text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-600/25 
               hover:shadow-xl hover:shadow-blue-600/30 transition-all
                duration-200 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus size={18} />
              New Invitation
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-200/60">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedUsers.size === users.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => handleUserSelect(user.id)}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{user.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {user.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.type === "email" ? (
                            <Mail size={16} className="text-blue-500" />
                          ) : (
                            <MessageSquare
                              size={16}
                              className="text-green-500"
                            />
                          )}
                          <span className="text-sm text-gray-700 capitalize">
                            {user.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {user.url}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <ArrowRight size={16} />
                          </button>
                          <button 
                            onClick={() => handleCopy(user.url)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Copy size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-200/60">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(endIndex, filteredUsers.length)}
                </span>{" "}
                of <span className="font-medium">{filteredUsers.length}</span>{" "}
                users
                {searchTerm && (
                  <span className="ml-2 text-blue-600">• Filtered results</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors border ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed border-transparent"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white border-transparent hover:border-gray-200"
                  }`}
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {getPaginationNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        typeof page === "number" && handlePageChange(page)
                      }
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        page === currentPage
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-200"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors border ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed border-transparent"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white border-transparent hover:border-gray-200"
                  }`}
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  New Gate
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Gate Type Tabs with Icons and Radio Buttons */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Gate type
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {gateTypes.map((gateType) => {
                    const IconComponent = gateType.icon;
                    return (
                      <label
                        key={gateType.id}
                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          activeTab === gateType.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="relative">
                            <input
                              type="radio"
                              name="gateType"
                              value={gateType.id}
                              checked={activeTab === gateType.id}
                              onChange={(e) => setActiveTab(e.target.value)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              activeTab === gateType.id 
                                ? "border-blue-500 bg-blue-500" 
                                : "border-gray-300"
                            }`}>
                              {activeTab === gateType.id && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </div>
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <IconComponent 
                              className={`${
                                activeTab === gateType.id ? "text-blue-600" : "text-gray-600"
                              }`} 
                              size={20} 
                            />
                          </div>
                          <div>
                            <div className={`font-medium ${
                              activeTab === gateType.id ? "text-blue-700" : "text-gray-900"
                            }`}>
                              {gateType.label}
                            </div>
                            <div className="text-sm text-gray-500">
                              {gateType.description}
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200/60">
  <button
    onClick={handleNewInvitation}
    disabled={isLoading}
    className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
      isLoading ? "animate-pulse" : ""
    }`}
  >
    {isLoading ? (
      <>
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        Creating...
      </>
    ) : (
      <>
        <Plus size={18} />
        Add Gate
      </>
    )}
  </button>
</div>


          </div>
        </div>
      )}
    </>
  );
}

export default Onboarding;