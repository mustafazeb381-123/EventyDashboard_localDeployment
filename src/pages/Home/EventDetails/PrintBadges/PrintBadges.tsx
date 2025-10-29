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
  X,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { deleteEventUser, getBadgeApi, getEventUsers } from "@/apis/apiHelpers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QRCode from "react-qr-code";
import {
  CardFooter,
  CardFooter2,
  CardHeader,
  CardHeader2,
} from "../../ExpressEvent/Badges/Badges";

// Badge Template Components
interface BadgeTemplateProps {
  user: any;
  event: any;
  badgeType: number;
  badgeColors: {
    headerColor: string;
    footerColor: string;
    backgroundColor: string;
  };
  qrImage?: string;
}

const BadgeTemplate1: React.FC<BadgeTemplateProps> = ({
  user,
  event,
  badgeType,
  badgeColors,
  qrImage,
}) => (
  <div
    className="flex flex-col h-125 w-full rounded-xl border-1 overflow-hidden"
    style={{
      backgroundColor: badgeColors.backgroundColor,
    }}
  >
    <div
      className="relative flex justify-center items-center gap-2 w-full rounded-t-xl overflow-hidden"
      style={{ height: "33%" }}
    >
      <div className="absolute inset-0">
        <CardHeader color={badgeColors.headerColor} />
      </div>
      <div className="relative z-10 flex items-center gap-2">
        {event?.attributes?.logo_url && (
          <img
            src={event.attributes.logo_url}
            alt="Logo"
            className="w-4 h-4 mb-3"
          />
        )}
        <h6 className="font-semibold mb-3 text-white text-xs">
          {event?.attributes?.name || "Company Name"}
        </h6>
      </div>
    </div>
    <div className="flex flex-1 flex-col justify-center items-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg mb-2">
        {user?.attributes?.name
          ?.split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "NA"}
      </div>
      <h2 className="text-xs font-bold text-gray-900 mt-1">
        {user?.attributes?.name || "User Name"}
      </h2>
      <p className="text-gray-600 text-xs">
        {user?.attributes?.user_type || "User Title"}
      </p>
    </div>
    <div
      className="relative flex justify-center items-center gap-2 w-full rounded-b-xl overflow-hidden"
      style={{ height: "15%" }}
    >
      <div className="absolute inset-0">
        <CardFooter color={badgeColors.footerColor} />
      </div>
    </div>
  </div>
);

const BadgeTemplate2: React.FC<BadgeTemplateProps> = ({
  user,
  event,
  badgeType,
  badgeColors,
  qrImage,
}) => (
  <div
    className="flex flex-col h-125 w-full rounded-xl border-1 overflow-hidden"
    style={{
      backgroundColor: badgeColors.backgroundColor,
    }}
  >
    <div
      className="relative flex justify-center items-center gap-2 w-full rounded-t-xl overflow-hidden"
      style={{ height: "33%" }}
    >
      <div className="absolute inset-0">
        <CardHeader color={badgeColors.headerColor} />
      </div>
    </div>
    <div className="flex flex-1 flex-col justify-evenly items-center">
      <div className="text-center">
        <h2 className="text-xs font-bold text-gray-900">
          {user?.attributes?.name || "User Name"}
        </h2>
        <p className="text-gray-600 text-xs">
          {user?.attributes?.user_type || "User Title"}
        </p>
      </div>
      <div className="relative z-10 flex items-center gap-2">
        {event?.attributes?.logo_url && (
          <img
            src={event.attributes.logo_url}
            alt="Logo"
            className="w-4 h-4 mb-3"
          />
        )}
        <h6 className="font-semibold mb-3 text-black text-xs">
          {event?.attributes?.name || "Company Name"}
        </h6>
      </div>
    </div>
    <div
      className="relative flex justify-center items-center gap-2 w-full rounded-b-xl overflow-hidden"
      style={{ height: "15%" }}
    >
      <div className="absolute inset-0">
        <CardFooter color={badgeColors.footerColor} />
      </div>
    </div>
  </div>
);

const BadgeTemplate3: React.FC<BadgeTemplateProps> = ({
  user,
  event,
  badgeType,
  badgeColors,
  qrImage,
}) => (
  <div
    className="flex flex-col h-125 w-full rounded-xl border-1 overflow-hidden"
    style={{
      backgroundColor: badgeColors.backgroundColor,
    }}
  >
    <div
      className="relative flex justify-center items-center gap-2 w-full rounded-t-xl overflow-hidden"
      style={{ height: "33%" }}
    >
      <div className="absolute inset-0">
        <CardHeader2 color={badgeColors.headerColor} />
      </div>
    </div>
    <div className="flex flex-1 flex-col items-center">
      <div className="rounded-full w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg mb-2">
        {user?.attributes?.name
          ?.split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "NA"}
      </div>
      <h2 className="text-xs font-bold text-gray-900 mt-1">
        {user?.attributes?.name || "User Name"}
      </h2>
      <p className="text-gray-600 text-xs">
        {user?.attributes?.user_type || "User Title"}
      </p>
    </div>
    <div
      className="relative flex justify-center items-center gap-2 w-full rounded-b-xl overflow-hidden"
      style={{ height: "15%" }}
    >
      <div className="absolute inset-0">
        <CardFooter2 color={badgeColors.footerColor} />
      </div>
    </div>
  </div>
);

const BadgeTemplate4: React.FC<BadgeTemplateProps> = ({
  user,
  event,
  badgeType,
  badgeColors,
  qrImage,
}) => (
  <div
    className="flex flex-col h-125 w-full rounded-xl border-1 overflow-hidden"
    style={{
      backgroundColor: badgeColors.backgroundColor,
    }}
  >
    <div
      className="relative flex justify-center items-center gap-2 w-full rounded-t-xl overflow-hidden"
      style={{ height: "33%" }}
    >
      <div className="absolute inset-0">
        <CardHeader2 color={badgeColors.headerColor} />
      </div>
    </div>
    <div className="flex flex-1 flex-col justify-evenly items-center">
      <div className="text-center">
        <h2 className="text-xs font-bold text-gray-900">
          {user?.attributes?.name || "User Name"}
        </h2>
        <p className="text-gray-600 text-xs">
          {user?.attributes?.user_type || "User Title"}
        </p>
      </div>
      <div className="relative z-10 flex items-center gap-2">
        {event?.attributes?.logo_url && (
          <img
            src={event.attributes.logo_url}
            alt="Logo"
            className="w-4 h-4 mb-3"
          />
        )}
        <h6 className="font-semibold mb-3 text-black text-xs">
          {event?.attributes?.name || "Company Name"}
        </h6>
      </div>
    </div>
    <div
      className="relative flex justify-center items-center gap-2 w-full rounded-b-xl overflow-hidden"
      style={{ height: "15%" }}
    >
      <div className="absolute inset-0">
        <CardFooter2 color={badgeColors.footerColor} />
      </div>
    </div>
  </div>
);

// Main Component
function PrintBadges() {
  const location = useLocation();
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventUsers, setUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activePopup, setActivePopup] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserForPreview, setSelectedUserForPreview] =
    useState<any>(null);
  console.log("select user preview-----+++--------", selectedUserForPreview);
  const [selectedBadgeTemplate, setSelectedBadgeTemplate] = useState<number>(1);
  const [eventData, setEventData] = useState<any>(null);
  const [currentAction, setCurrentAction] = useState(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  console.log("user to delete-------", userToDelete);

  // 🟢 New state for badge colors and QR image
  const [badgeColors, setBadgeColors] = useState({
    headerColor: "#4D4D4D",
    footerColor: "#4D4D4D",
    backgroundColor: "white",
  });
  const [qrImage, setQrImage] = useState<string>("");

  const rowsPerPage = 8;

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const idFromQuery = searchParams.get("eventId");
    setEventId(idFromQuery);

    // 🟢 Load badge data from localStorage
    const savedBadgeId = localStorage.getItem("active_badge_id");
    const savedQrImage = localStorage.getItem("badge_qr_image");
    console.log("saved qr image", savedQrImage);
    const savedHeaderColor = localStorage.getItem("badge_header_color");
    const savedFooterColor = localStorage.getItem("badge_footer_color");
    const savedBgColor = localStorage.getItem("badge_background_color");

    if (savedBadgeId) {
      setSelectedBadgeTemplate(parseInt(savedBadgeId, 10));
    }
    if (savedQrImage) {
      setQrImage(savedQrImage);
    }
    if (savedHeaderColor || savedFooterColor || savedBgColor) {
      setBadgeColors({
        headerColor: savedHeaderColor || "#4D4D4D",
        footerColor: savedFooterColor || "#4D4D4D",
        backgroundColor: savedBgColor || "white",
      });
    }

    if (idFromQuery) {
      fetchUsers(idFromQuery);
      fetchEventData(idFromQuery);
    }
  }, [location.search]);

  const fetchUsers = async (id: string) => {
    setLoadingUsers(true);
    try {
      const response = await getEventUsers(id);
      const users = response.data.data || response.data || [];
      console.log("get event user respose api", users);
      const usersWithPrintStatus = users.map((user: any) => ({
        ...user,
        printStatus: "Pending",
        printedAt: null,
        // token: `TK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        phone: "+1 (555) 123-4567",
        department: "General",
      }));

      setUsers(usersWithPrintStatus);
    } catch (error) {
      console.error("Error fetching event users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchEventData = async (id: string) => {
    try {
      const response = await getBadgeApi(id);
      console.log(
        "bage get api++++++++++++:::::::;;;;;",
        response?.data?.data?.attributes?.name
      );
      setEventData(response?.data?.data);
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  };

  // Filter and search logic
  const filteredUsers = eventUsers.filter((user) => {
    const matchesSearch =
      user.attributes?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.attributes?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.attributes?.organization
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      user.printStatus?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handleActionClick = (userId: any) => {
    setActivePopup(activePopup === userId ? null : userId);
  };

  const handleAction = async (action: any, userId: any) => {
    setIsLoading(true);
    setCurrentAction(action);

    console.log(`${action} clicked for user ${userId}`);

    // Find the user first - this was missing for the delete case
    const user = eventUsers.find((u) => u.id === userId);
    console.log("Found user for action:", user);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (action === "preview") {
      setSelectedUserForPreview(user);
      setPreviewModal(true);
    } else if (action === "delete") {
      setUserToDelete(user); // ✅ Now user is defined
      setShowDeleteModal(true);
    } else if (action === "print") {
      setSelectedUserForPreview(user);
      setPreviewModal(true);
    }

    setActivePopup(null);
    setIsLoading(false);
  };

  const handleUserSelect = (userId: any) => {
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
    console.log("statuesssssssssss", status);
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
    if (selectedUsers.size === 0) {
      toast.warning("Please select at least one user to print");
      return;
    }
    setShowPrintModal(true);
  };

  const handlePrintConfirm = () => {
    setUsers((prev) =>
      prev.map((user) =>
        selectedUsers.has(user.id)
          ? {
              ...user,
              printStatus: "Printed",
              printedAt: new Date().toISOString(),
            }
          : user
      )
    );

    toast.success(
      `Successfully printed ${selectedUsers.size} badge${
        selectedUsers.size !== 1 ? "s" : ""
      }`
    );
    setShowPrintModal(false);
    setSelectedUsers(new Set());
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const UserAvatar = ({ user }: { user: any }) => {
    const imageUrl = user?.attributes?.image;
    const userName = user?.attributes?.name || "User";

    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={userName}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }

    const initials = userName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
        {initials}
      </div>
    );
  };

  const generateQRCodeData = (user) => {
    console.log("token------", user);
    return user?.attributes?.token;
  };

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

  const renderBadgeTemplate = (badgeType: number, user: any) => {
    console.log("🔹 renderBadgeTemplate called");
    console.log("➡️ badgeType:", badgeType);
    console.log("👤 user:", user);
    console.log("📅 eventData:", eventData);
    console.log("🎨 badgeColors:", badgeColors);
    console.log("📱 qrImage:", qrImage);

    switch (badgeType) {
      case 1:
        return (
          <BadgeTemplate1
            user={user}
            event={eventData}
            badgeType={badgeType}
            badgeColors={badgeColors}
            qrImage={qrImage}
          />
        );
      case 2:
        return (
          <BadgeTemplate2
            user={user}
            event={eventData}
            badgeType={badgeType}
            badgeColors={badgeColors}
            qrImage={qrImage}
          />
        );
      case 3:
        return (
          <BadgeTemplate3
            user={user}
            event={eventData}
            badgeType={badgeType}
            badgeColors={badgeColors}
            qrImage={qrImage}
          />
        );
      case 4:
        return (
          <BadgeTemplate4
            user={user}
            event={eventData}
            badgeType={badgeType}
            badgeColors={badgeColors}
            qrImage={qrImage}
          />
        );
      default:
        return (
          <BadgeTemplate1
            user={user}
            event={eventData}
            badgeType={badgeType}
            badgeColors={badgeColors}
            qrImage={qrImage}
          />
        );
    }
  };

  const handleDelete = async (user) => {
    console.log("Delete button clicked");
    console.log("User to delete:", user);
    console.log("Event ID:", eventId);

    if (!userToDelete || !eventId) {
      console.error("Missing user or event ID for deletion");
      toast.error("Cannot delete user: Missing information");
      return;
    }

    try {
      const response = await deleteEventUser(eventId, userToDelete?.id);
      console.log("response-----------", response);
      setUsers((prev) => prev.filter((user) => user.id !== userToDelete.id));
      toast.success("User deleted successfully");
      setSelectedUsers((prev) => {
        const newSelected = new Set(prev);
        newSelected.delete(userToDelete.id);
        return newSelected;
      });
    } catch (error: any) {
      console.error("Error deleting user:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        requestUrl: error.config?.url,
      });

      toast.error(
        `Failed to delete user: ${error.response?.data?.error || error.message}`
      );
    }
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
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
                      Email
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                    paginatedUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50/50 transition-colors group relative"
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
                            <UserAvatar user={user} />
                            <div>
                              <div className="font-medium text-gray-900">
                                {user.attributes?.name || "Unknown"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.department}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-900">
                            {user.attributes?.email || "No email"}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getUserTypeColor(
                              user.attributes?.user_type || "Attendee"
                            )}`}
                          >
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
                        <td className="p-4 relative">
                          {/* Three dots button - visible on row hover */}
                          <button
                            onClick={() => handleActionClick(user.id)}
                            className="p-2 bg-gray-100 rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:bg-gray-200"
                            disabled={isLoading}
                          >
                            <MoreVertical size={16} className="text-gray-600" />
                          </button>

                          {/* Popup appears when clicked */}
                          {activePopup === user.id && (
                            <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-xl z-20 min-w-[180px]">
                              <div className="py-2">
                                <div className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-100">
                                  Badge Actions
                                </div>

                                <button
                                  onClick={() =>
                                    handleAction("preview", user.id)
                                  }
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
                                  onClick={() =>
                                    handleAction("delete", user.id)
                                  }
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl transform animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Printer className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Print Badges
                  </h3>
                </div>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <p className="text-gray-600 mb-6">
                    You're about to print <strong>{selectedUsers.size}</strong>{" "}
                    badge
                    {selectedUsers.size !== 1 ? "s" : ""}. This action will mark
                    them as printed.
                  </p>

                  {/* Badge Template Selection */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Select Badge Template
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((templateId) => (
                        <div
                          key={templateId}
                          className={`border-2 rounded-xl p-2 cursor-pointer transition-all ${
                            selectedBadgeTemplate === templateId
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedBadgeTemplate(templateId)}
                        >
                          <div className="h-32 bg-white rounded-lg overflow-hidden">
                            {renderBadgeTemplate(templateId, eventUsers[0])}
                          </div>
                          <p className="text-xs text-center mt-2 font-medium">
                            Template {templateId}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Print Summary
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Total Badges:</span>
                        <span className="font-medium">
                          {selectedUsers.size}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Paper Size:</span>
                        <span className="font-medium">A4 (Standard)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Print Quality:</span>
                        <span className="font-medium">High</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Template:</span>
                        <span className="font-medium text-indigo-600">
                          Template {selectedBadgeTemplate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowPrintModal(false)}
                      className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePrintConfirm}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Printer size={18} />
                      Print Now
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 text-center">
                      Badge Preview
                    </h4>
                    <div className="flex flex-col items-center">
                      <div className="w-64 h-80 mb-4">
                        {renderBadgeTemplate(
                          selectedBadgeTemplate,
                          eventUsers[0]
                        )}
                      </div>
                      <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                        <QRCode
                          value={`Printing ${
                            selectedUsers.size
                          } badges for event ${eventId || "N/A"}`}
                          size={120}
                          level="H"
                          fgColor="#1f2937"
                          bgColor="#ffffff"
                        />
                      </div>
                      <p className="text-sm text-gray-600 text-center mt-4">
                        Preview shows Template {selectedBadgeTemplate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal && selectedUserForPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-5xl mx-auto relative overflow-hidden">
            <button
              onClick={() => {
                setPreviewModal(false);
                setSelectedUserForPreview(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X size={24} />
            </button>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
                Badge Preview
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="flex justify-center items-start">
                  <div className="w-80">
                    {renderBadgeTemplate(
                      selectedBadgeTemplate,
                      selectedUserForPreview
                    )}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl justify-center items-center flex border-indigo-200 shadow-md mb-6">
                  <QRCode
                    value={generateQRCodeData(selectedUserForPreview)}
                    size={220}
                    level="H"
                    fgColor="#1f2937"
                    bgColor="#ffffff"
                  />
                </div>
              </div>
            </div>
            {currentAction === "print" && (
              <div className="flex border-t border-gray-200 mb-4 mx-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(true);
                    setPreviewModal(false);
                  }}
                  className="flex-1 py-4 px-6 bg-red-50 hover:bg-red-100 text-red-600 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Printer size={18} />
                  Print Badge
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activePopup && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setActivePopup(null)}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>

            <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
              Delete User?
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Are you sure you want to delete{" "}
              <strong>{userToDelete?.attributes?.name || "this user"}</strong>?
              This action cannot be undone.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log(
                    "Delete button clicked - userToDelete:",
                    userToDelete
                  );
                  console.log("Event ID:", eventId);
                  handleDelete(userToDelete);
                }}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PrintBadges;
