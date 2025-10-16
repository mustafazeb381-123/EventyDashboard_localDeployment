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
  Ticket,
  Trash2,
  Edit2,
} from "lucide-react";
import Assets from "@/utils/Assets";

function TicketManagement() {
  const [activeTab, setActiveTab] = useState("types");
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState("email");
  const [title, setTitle] = useState("");
  const [sendTo, setSendTo] = useState("All users Registered");
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const users = [
    {
      id: "01",
      name: "Elton Carter",
      email: "mecnm8703@gmail.com",
      ticketType: "Event",
    },
    {
      id: "02",
      name: "Luca Thompson",
      email: "contact@techinnovations.org",
      ticketType: "Agencia",
    },
    {
      id: "03",
      name: "Liam Anderson",
      email: "support@ecommercehub.com",
      ticketType: "Avec",
    },
    {
      id: "04",
      name: "Samantha Rivera",
      email: "luna_star@yahoo.com",
      ticketType: "Avec",
    },
    {
      id: "05",
      name: "Samantha Rivera",
      email: "info@creativedesigns.net",
      ticketType: "Agencia",
    },
  ];

  const types = [
    {
      id: "01",
      ticketType: "Went",
      description: "Lorem Ipsum color six..",
      price: "200 SAR",
      ticketLimit: "300",
      availableTicket: "180",
      soldTicket: "120",
    },
    {
      id: "02",
      ticketType: "Agenda",
      description: "Lorem Ipsum color six..",
      price: "200 SAR",
      ticketLimit: "300",
      availableTicket: "180",
      soldTicket: "120",
    },
    {
      id: "03",
      ticketType: "Avec",
      description: "Lorem Ipsum color six..",
      price: "200 SAR",
      ticketLimit: "300",
      availableTicket: "180",
      soldTicket: "120",
    },
    {
      id: "04",
      ticketType: "Avec",
      description: "Lorem Ipsum color six..",
      price: "200 SAR",
      ticketLimit: "300",
      availableTicket: "180",
      soldTicket: "120",
    },
    {
      id: "05",
      ticketType: "Agenda",
      description: "Lorem Ipsum color six..",
      price: "200 SAR",
      ticketLimit: "300",
      availableTicket: "180",
      soldTicket: "120",
    },
    {
      id: "06",
      ticketType: "Agenda",
      description: "Lorem Ipsum color six..",
      price: "200 SAR",
      ticketLimit: "300",
      availableTicket: "180",
      soldTicket: "120",
    },
  ];

  // 🔹 Pagination setup
  const itemsPerPage = 3;
  const currentData = activeTab === "users" ? users : types;
  const filteredData = currentData.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ticketType?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

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

  const handleTypeSelect = (typeId) => {
    const newSelected = new Set(selectedTypes);
    if (newSelected.has(typeId)) {
      newSelected.delete(typeId);
    } else {
      newSelected.add(typeId);
    }
    setSelectedTypes(newSelected);
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((user) => user.id)));
    }
  };

  const handleSelectAllTypes = () => {
    if (selectedTypes.size === types.length) {
      setSelectedTypes(new Set());
    } else {
      setSelectedTypes(new Set(types.map((type) => type.id)));
    }
  };

  const renderUsersTable = () => (
    <table className="w-full">
      <thead className="bg-gray-50/80 border-b border-gray-200/60">
        <tr>
          <th className="px-6 py-4 text-left">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              checked={selectedUsers.size === users.length}
              onChange={handleSelectAllUsers}
            />
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            #
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            User
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Email
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Ticket Type
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200/60">
        {paginatedData.map((user, index) => (
          <tr
            key={user.id}
            className="hover:bg-gray-50/50 transition-colors group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <td className="px-6 py-4">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                checked={selectedUsers.has(user.id)}
                onChange={() => handleUserSelect(user.id)}
              />
            </td>
            <td className="px-6 py-4 text-sm font-medium text-gray-900">
              {user.id}
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
            <td className="px-6 py-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-300 text-gray-700 border border-blue-200">
                {user.ticketType}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderTypesTable = () => (
    <table className="w-full">
      <thead className="bg-gray-50/80 border-b border-gray-200/60">
        <tr>
          <th className="px-6 py-4 text-left">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              checked={selectedTypes.size === types.length}
              onChange={handleSelectAllTypes}
            />
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            #
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Ticket Type
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Description
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Ticket Price
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Ticket Limit
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Available Ticket
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Sold Ticket
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200/60">
        {paginatedData.map((type, index) => (
          <tr
            key={type.id}
            className="hover:bg-gray-50/50 transition-colors group"
          >
            <td className="px-6 py-4">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                checked={selectedTypes.has(type.id)}
                onChange={() => handleTypeSelect(type.id)}
              />
            </td>
            <td className="px-6 py-4 text-sm font-medium text-gray-900">
              {type.id}
            </td>
            <td className="px-6 py-4 text-sm font-medium text-gray-900">
              {type.ticketType}
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
              {type.description}
            </td>
            <td className="px-6 py-4 text-sm font-medium text-gray-900">
              {type.price}
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
              {type.ticketLimit}
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
              {type.availableTicket}
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
              {type.soldTicket}
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-1">
                <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
                <button className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 color="yellow" size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="p-8">
          <div className="flex justify-between items-center">
            {/* Left Section */}
            <div className="flex items-center space-x-3 bg-white shadow-md rounded-xl p-4 border border-gray-100 w-1/2 mr-3">
              <div className="rounded bg-gray-100 p-4">
                <img
                  src={Assets.icons.totalTicket}
                  alt="Total Tickets"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Tickets
                </p>
                <p className="text-lg font-semibold text-gray-900">300</p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3 bg-white shadow-md rounded-xl p-4 border border-gray-100 w-1/2">
              <div className="rounded bg-gray-100 p-4">
                <img
                  src={Assets.icons.totalSold}
                  alt="Total Tickets"
                  className="w-6 h-6 object-contain"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Sold Tickets
                </p>
                <p className="text-lg font-semibold text-gray-900">300</p>
              </div>
            </div>
          </div>

          {/* Header with Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4 mt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <h1 className="text-3xl font-regular text-gray-900 tracking-tight">
                  
                  {activeTab === "types" ? "Ticket Types" : "All Tickets"}
                </h1>
                <p className="text-sm font-medium text-gray-500 px-3">{activeTab === "types" ? "6 Types" : "6 Tickets"}</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 
             bg-blue-100
             text-[color:var(--color-pri-color-800)] 
             hover:bg-blue-800
             px-6 py-3 rounded-xl font-medium shadow-lg 
             shadow-[color:var(--color-pri-color-800)]/25 
             hover:shadow-xl hover:shadow-[color:var(--color-pri-color-800)]/30 
             transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus size={18} />
              New Tickets
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-white rounded-2xl shadow-sm border border-gray-200/60 p-1.5 w-fit">
            <button
              onClick={() => setActiveTab("types")}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 w-40 cursor-pointer ${
                activeTab === "types"
                  ? "bg-blue-100 text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Types
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-2 px-6 rounded-xl font-medium transition-all duration-200 w-40 cursor-pointer ${
                activeTab === "users"
                  ? "bg-blue-100 text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Users
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div className="overflow-x-auto">
              {activeTab === "users" ? renderUsersTable() : renderTypesTable()}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-200/60">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(endIndex, filteredData.length)}
                </span>{" "}
                of <span className="font-medium">{filteredData.length}</span>{" "}
                {activeTab === "users" ? "users" : "types"}
                {searchTerm && (
                  <span className="ml-2 text-blue-600">• Filtered results</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    currentPage === 1
                      ? "text-gray-900 cursor-not-allowed border border-gray-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white border border-gray-200 hover:border-gray-300"
                  }`}
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {getPaginationNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors border ${
                        page === currentPage
                          ? "bg-blue-100 text-gray-900 border-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? "text-gray-900 cursor-not-allowed border border-gray-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white border border-gray-200 hover:border-gray-300"
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
        <div
          // onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  New Ticket
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-900 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                 Ticket Types
                </label>
                <div className="relative mb-4">
                  <select
                    value={sendTo}
                    onChange={(e) => setSendTo(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none bg-white"
                  >
                    <option>All users Types</option>
                    <option>Type 1</option>
                    <option>Type 2</option>
                    <option>Type 3</option>
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-900 pointer-events-none"
                    size={20}
                  />
                </div>
                <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Enter Your Description..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
                <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Tickets Limit
                </label>
                <input
                  type="text"
                  placeholder="Text here"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
                <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Ticket Type
                </label>
                <input
                  type="text"
                  placeholder="Text here"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              </div>

              {/* Invitation type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                 Currency
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedType === "email"
                        ? "border-blue-500 "
                        : "border-gray-300 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="invitationType"
                      value="email"
                      checked={selectedType === "email"}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-gray-900">Email</div>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedType === "sms"
                        ? "border-blue-500 "
                        : "border-gray-300 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="invitationType"
                      value="sms"
                      checked={selectedType === "sms"}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-gray-900">SMS</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-6 border-t border-gray-200/60">
  <button
    onClick={handleNewInvitation}
    disabled={isLoading}
    className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-100 text-gray-900 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
      isLoading ? "animate-pulse" : ""
    }`}
  >
    {isLoading ? (
      <>
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        Sending...
      </>
    ) : (
      <>
        <Plus size={18} />
        Add Ticket
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

export default TicketManagement;
