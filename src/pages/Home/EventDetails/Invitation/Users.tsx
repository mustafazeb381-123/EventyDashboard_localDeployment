import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  X,
  ChevronDown,
  Mail,
  Search,
  Users as UsersIcon,
  Upload,
  Eye,
  MoreVertical,
  FileText,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  UserCheck,
  BarChart2,
  Tag,
  Share2,
  Zap,
  Settings,
  Copy,
  Info,
} from "lucide-react";
import {
  getEventUsers,
  createEventUser,
  getEventbyId,
  sendCredentials,
  getBadgeType,
} from "@/apis/apiHelpers";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/components/Pagination";

// Helper to derive user initial
const getUserInitial = (user: any) => {
  const nameOrEmail =
    user?.attributes?.name ||
    user?.attributes?.email ||
    user?.attributes?.phone_number ||
    "U";
  const trimmed = typeof nameOrEmail === "string" ? nameOrEmail.trim() : "U";
  return (trimmed.charAt(0) || "U").toUpperCase();
};

// Avatar component with image fallback
const UserAvatar = ({ user }: { user: any }) => {
  const [loadError, setLoadError] = useState(false);
  const imageUrl = user?.attributes?.image;

  if (imageUrl && !loadError) {
    return (
      <img
        src={imageUrl}
        alt={user?.attributes?.name || "User Avatar"}
        className="w-10 h-10 rounded-full object-cover"
        onError={() => setLoadError(true)}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-semibold text-base">
      {getUserInitial(user)}
    </div>
  );
};

// Static invitation data (screenshot) - full table layout
const staticInvitations = [
  {
    id: "58",
    name: "Copy of Copy of Althenayan Dinner",
    emailSubject: "Invitation: Althenayan Exclusive Private Dinner - FMF 2026",
    channel: "Email",
    status: "pending",
    type: "Public-9",
    scheduled: "Immediate",
  },
  {
    id: "57",
    name: "Copy of Gather Batch 6 & Reminder",
    emailSubject: "Guest Information | FMF Premier 26 | Time Sensitive",
    channel: "Email",
    status: "done",
    type: "Public-9",
    scheduled: "Immediate",
  },
  {
    id: "56",
    name: "Copy of Batch 6",
    emailSubject: "FMF Premier 2026 | Official Private Invitation",
    channel: "Email",
    status: "done",
    type: "Public-9",
    scheduled: "Immediate",
  },
  {
    id: "55",
    name: "Copy of Dinner Invite Batch 2",
    emailSubject: "ESNAD Premier Dinner | Private Invitation",
    channel: "Email",
    status: "done",
    type: "Public-9",
    scheduled: "Immediate",
  },
  {
    id: "54",
    name: "Copy of Esnad Batch 1",
    emailSubject: "FMF Premier 2026 | Official Private Invitation",
    channel: "Email",
    status: "done",
    type: "Public-9",
    scheduled: "Immediate",
  },
  {
    id: "53",
    name: "Copy of AlRushaid Dinner Additional",
    emailSubject:
      "Invitation: AlRushaid Group Exclusive Private Dinner - FMF 2026",
    channel: "Email",
    status: "done",
    type: "Public-9",
    scheduled: "Immediate",
  },
  {
    id: "52",
    name: "Copy of Althenayan Dinner",
    emailSubject: "Invitation: Althenayan Exclusive Private Dinner - FMF 2026",
    channel: "Email",
    status: "done",
    type: "Public-9",
    scheduled: "Immediate",
  },
  {
    id: "51",
    name: "Artar Dinner Additional",
    emailSubject:
      "Invitation: ARTAR & GMCG Exclusive Private Dinner - FMF 2026",
    channel: "Email",
    status: "done",
    type: "Public-9",
    scheduled: "Immediate",
  },
  {
    id: "50",
    name: "AlRushaid Dinner Additional",
    emailSubject:
      "Invitation: AlRushaid Group Exclusive Private Dinner - FMF 2026",
    channel: "Email",
    status: "done",
    type: "Public-9",
    scheduled: "Immediate",
  },
  {
    id: "49",
    name: "Badge Collection",
    emailSubject: "FMF Premier 2026 | Budge Collection Details",
    channel: "Email",
    status: "done",
    type: "Public-9",
    scheduled: "Immediate",
  },
  {
    id: "48",
    name: "Additional - FMF",
    emailSubject: "FMF Premier 2026 | Official Private Invitation",
    channel: "Email",
    status: "done",
    type: "Public-9",
    scheduled: "Immediate",
  },
];

// Email Templates
const templates = [
  {
    id: 1,
    name: "Professional",
    preview: "Template 1",
    backgroundColor: "#ffffff",
  },
  {
    id: 2,
    name: "Colorful",
    preview: "Template 2",
    backgroundColor: "#f0f9ff",
  },
  {
    id: 3,
    name: "Elegant",
    preview: "Template 3",
    backgroundColor: "#fef3c7",
  },
];

function Invitations() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [badges, setBadges] = useState<any[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventId, setEventId] = useState<string | null>(null);
  const [actualEventId, setActualEventId] = useState<string | null>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [pagination, setPagination] = useState<any>(null);
  const [sendingCredentialsUserId, setSendingCredentialsUserId] = useState<
    string | null
  >(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const itemsPerPage = 10;

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (
    message: string,
    type: "success" | "error" | "info",
  ) => {
    setNotification({ message, type });
  };

  // Handle event ID change from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const idFromQuery = searchParams.get("eventId");

    if (idFromQuery && idFromQuery !== eventId) {
      setEventId(idFromQuery);
      setCurrentPage(1);
    } else if (!idFromQuery && eventId) {
      // Keep current eventId
    } else if (!idFromQuery && !eventId) {
      const storedEventId =
        localStorage.getItem("create_eventId") ||
        localStorage.getItem("edit_eventId");
      if (storedEventId) {
        setEventId(storedEventId);
      }
    }
  }, [location.search, eventId]);

  // Fetch event data to get the actual event ID
  useEffect(() => {
    if (eventId) {
      fetchEventData(eventId);
    }
  }, [eventId]);

  // Fetch badges when we have an eventId
  useEffect(() => {
    const idToUse = actualEventId || eventId;
    if (idToUse) {
      fetchBadges(idToUse);
    }
  }, [actualEventId, eventId]);

  // Fetch users when we have an eventId
  useEffect(() => {
    const idToUse = actualEventId || eventId;
    if (idToUse && currentPage > 0) {
      fetchUsers(idToUse, currentPage);
    }
  }, [actualEventId, eventId, currentPage]);

  const fetchEventData = async (id: string) => {
    try {
      const response = await getEventbyId(id);
      const actualId = response?.data?.data?.id;
      if (actualId) {
        setActualEventId(String(actualId));
        setEventData(response.data);
      } else {
        setActualEventId(null);
      }
    } catch (error: any) {
      setActualEventId(null);
    }
  };

  const fetchBadges = async (id: string) => {
    if (!id) return;

    setLoadingBadges(true);
    try {
      const response = await getBadgeType(id);
      const result = response.data;

      if (result?.data && Array.isArray(result.data)) {
        setBadges(result.data);
      } else {
        setBadges([]);
      }
    } catch (error) {
      setBadges([]);
    } finally {
      setLoadingBadges(false);
    }
  };

  const fetchUsers = async (id: string, page: number = 1) => {
    setLoadingUsers(true);
    try {
      const response = await getEventUsers(id, {
        page,
        per_page: itemsPerPage,
      });

      const responseData = response.data?.data || response.data;
      const allUsers = Array.isArray(responseData)
        ? responseData
        : responseData?.data || [];

      setUsers(allUsers);

      const paginationMeta =
        response.data?.meta?.pagination || response.data?.pagination;
      if (paginationMeta) {
        setPagination(paginationMeta);
      }
    } catch (error) {
      setUsers([]);
      setPagination(null);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Create a set of default badge names for quick lookup
  const defaultBadgeNames = useMemo(() => {
    const defaultNames = new Set<string>();
    badges.forEach((badge: any) => {
      if (badge?.attributes?.default === true) {
        const badgeName = (badge?.attributes?.name || "").toLowerCase();
        if (badgeName) {
          defaultNames.add(badgeName);
        }
      }
    });
    return defaultNames;
  }, [badges]);

  // Filter users by type, badge, and search term
  const filteredUsers = users.filter((user: any) => {
    const userType = (user?.attributes?.user_type || "").toLowerCase();

    if (defaultBadgeNames.has(userType)) {
      return false;
    }

    if (filterType !== "all") {
      if (userType !== filterType.toLowerCase()) {
        return false;
      }
    }

    if (searchTerm.trim() === "") {
      return true;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const name = (user?.attributes?.name || "").toLowerCase();
    const email = (user?.attributes?.email || "").toLowerCase();
    const phone = (user?.attributes?.phone_number || "").toLowerCase();
    const organization = (user?.attributes?.organization || "").toLowerCase();
    const position = (user?.attributes?.position || "").toLowerCase();

    return (
      name.includes(searchLower) ||
      email.includes(searchLower) ||
      phone.includes(searchLower) ||
      organization.includes(searchLower) ||
      position.includes(searchLower) ||
      userType.includes(searchLower)
    );
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const total = users.length;
    const completed = users.filter(
      (u: any) => u?.attributes?.invitation_status === "completed",
    ).length;
    const inProgress = users.filter(
      (u: any) => u?.attributes?.invitation_status === "in_progress",
    ).length;
    const pending = users.filter(
      (u: any) =>
        !u?.attributes?.invitation_status ||
        u?.attributes?.invitation_status === "pending",
    ).length;

    return {
      total,
      completed,
      inProgress,
      pending,
    };
  }, [users]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSendInvitation = async (userIds?: string[]) => {
    const idToUse = actualEventId || eventId;
    if (!idToUse) {
      showNotification("Event ID is missing. Cannot send invitation.", "error");
      return;
    }

    const idsToSend: string[] =
      userIds || Array.from(selectedUsers).map((id) => String(id));
    if (idsToSend.length === 0) {
      showNotification(
        "Please select at least one user to send invitation.",
        "error",
      );
      return;
    }

    const isSingleUser = userIds && userIds.length === 1;
    if (isSingleUser) {
      setSendingCredentialsUserId(userIds[0]);
    }

    try {
      const response = await sendCredentials(String(idToUse), idsToSend);

      if (isSingleUser) {
        showNotification("Invitation sent to user successfully!", "success");
      } else {
        showNotification(
          `Invitation sent to ${idsToSend.length} users successfully!`,
          "success",
        );
      }
      setSelectedUsers(new Set());
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to send invitation. Please try again.";

      if (isSingleUser) {
        showNotification(
          "Failed to send invitation to user. Please try again.",
          "error",
        );
      } else {
        showNotification(errorMessage, "error");
      }
    } finally {
      setSendingCredentialsUserId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUserSelect = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    const list = staticInvitations;
    if (selectedUsers.size === list.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(list.map((inv) => inv.id)));
    }
  };

  return (
    <>
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      <div className="min-h-screen bg-white">
        <div className="px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Invitation Users
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Download size={16} />
                Export CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <FileText size={16} />
                Event Report
              </button>
              <button
                onClick={() =>
                  navigate(
                    `/invitation/new${eventId ? `?eventId=${eventId}` : ""}`,
                  )
                }
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
              >
                <Plus size={16} />
                Create New Invitation
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Total Invitations
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.completed}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.inProgress}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pending}
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={loadingBadges}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-10 disabled:opacity-50 min-w-[150px]"
              >
                <option value="all">All Types</option>
                {badges.length > 0 ? (
                  badges.map((badge: any) => (
                    <option
                      key={badge.id}
                      value={badge?.attributes?.name || ""}
                    >
                      {badge?.attributes?.name}
                    </option>
                  ))
                ) : (
                  <option value="guest">Guest</option>
                )}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>
          </div>

          {/* Table - Invitations (screenshot layout) */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1e3a5f] border-b border-[#1e3a5f]">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
                        # ID
                      </span>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
                        <FileText size={16} />
                        Name
                      </span>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
                        <Mail size={16} />
                        Email Subject
                      </span>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
                        <Share2 size={16} />
                        Channel
                      </span>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
                        <CheckCircle size={16} />
                        Status
                      </span>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
                        <Tag size={16} />
                        Type
                      </span>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
                        <Clock size={16} />
                        Scheduled
                      </span>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
                        <Settings size={16} />
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loadingUsers ? (
                    Array.from({ length: 10 }).map((_, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4">
                          <Skeleton className="h-6 w-10 rounded" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-40" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-56" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-6 w-14 rounded-full" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <Skeleton className="w-8 h-8 rounded" />
                            <Skeleton className="w-8 h-8 rounded" />
                            <Skeleton className="w-8 h-8 rounded" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : staticInvitations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No invitations found
                      </td>
                    </tr>
                  ) : (
                    staticInvitations.map((invitation) => (
                      <tr
                        key={invitation.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-blue-600 text-white text-sm font-medium">
                            {invitation.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {invitation.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {invitation.emailSubject}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                            <Mail size={14} />
                            {invitation.channel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {invitation.status === "pending" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                              <Clock size={14} />
                              Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                              <CheckCircle size={14} />
                              Done
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {invitation.type}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                            <Zap size={14} className="text-gray-500" />
                            {invitation.scheduled}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/invitation/report/${invitation.id}`,
                                  {
                                    state: {
                                      invitationName: invitation.name,
                                      type: invitation.type,
                                      createdAt: "January 27, 2026 at 15:04",
                                    },
                                  },
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                              title="Report"
                            >
                              <BarChart2 size={16} />
                            </button>
                            <button
                              type="button"
                              className="w-8 h-8 flex items-center justify-center rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              className="w-8 h-8 flex items-center justify-center rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                              title="Copy"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing 1 to {staticInvitations.length} of{" "}
                  {pagination?.total_count ?? staticInvitations.length}{" "}
                  invitations
                </div>
                {pagination && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.total_pages || 1}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Invitation is now a separate page at /invitation/new */}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export default Invitations;
