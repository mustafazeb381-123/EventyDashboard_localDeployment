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
  Pencil,
  MoreVertical,
  FileText,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  UserCheck,
  BarChart2,
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

// Static invitation data matching screenshot layout
const staticInvitations = [
  {
    id: "182",
    name: "VIP Morning Day 5 – 8 الساعة",
    emailSubject: "ملتقى ميزانية 2026",
    channel: "Email",
    status: "done",
    created: "Jan 18, 2026",
  },
  {
    id: "182",
    name: "VIP Morning Day 5 – 8 الساعة",
    emailSubject: "ملتقى ميزانية 2026",
    channel: "Email",
    status: "done",
    created: "Jan 18, 2026",
  },
  {
    id: "182",
    name: "VIP Morning Day 5 – 8 الساعة",
    emailSubject: "ملتقى ميزانية 2026",
    channel: "Email",
    status: "done",
    created: "Jan 18, 2026",
  },
  {
    id: "182",
    name: "VIP Morning Day 5 – 8 الساعة",
    emailSubject: "ملتقى ميزانية 2026",
    channel: "Email",
    status: "done",
    created: "Jan 18, 2026",
  },
  {
    id: "182",
    name: "VIP Morning Day 5 – 8 الساعة",
    emailSubject: "ملتقى ميزانية 2026",
    channel: "Email",
    status: "done",
    created: "Jan 18, 2026",
  },
  {
    id: "182",
    name: "VIP Morning Day 5 – 8 الساعة",
    emailSubject: "ملتقى ميزانية 2026",
    channel: "Email",
    status: "done",
    created: "Jan 18, 2026",
  },
  {
    id: "182",
    name: "VIP Morning Day 5 – 8 الساعة",
    emailSubject: "ملتقى ميزانية 2026",
    channel: "Email",
    status: "done",
    created: "Jan 18, 2026",
  },
  {
    id: "182",
    name: "VIP Morning Day 5 – 8 الساعة",
    emailSubject: "ملتقى ميزانية 2026",
    channel: "Email",
    status: "done",
    created: "Jan 18, 2026",
  },
  {
    id: "182",
    name: "VIP Morning Day 5 – 8 الساعة",
    emailSubject: "ملتقى ميزانية 2026",
    channel: "Email",
    status: "done",
    created: "Jan 18, 2026",
  },
  {
    id: "182",
    name: "VIP Morning Day 5 – 8 الساعة",
    emailSubject: "ملتقى ميزانية 2026",
    channel: "Email",
    status: "done",
    created: "Jan 18, 2026",
  },
];

function Invitations() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
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
  const [actionsMenuOpenId, setActionsMenuOpenId] = useState<string | null>(
    null
  );
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 10;

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(e.target as Node)
      ) {
        setActionsMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    type: "success" | "error" | "info"
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
        if (badgeName) defaultNames.add(badgeName);
      }
    });
    return defaultNames;
  }, [badges]);

  // Filter users by type, badge, and search term
  const filteredUsers = users.filter((user: any) => {
    const userType = (user?.attributes?.user_type || "").toLowerCase();
    if (defaultBadgeNames.has(userType)) return false;
    if (filterType !== "all") {
      if (userType !== filterType.toLowerCase()) return false;
    }
    if (searchTerm.trim() === "") return true;
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
      (u: any) => u?.attributes?.invitation_status === "completed"
    ).length;
    const inProgress = users.filter(
      (u: any) => u?.attributes?.invitation_status === "in_progress"
    ).length;
    const pending = users.filter(
      (u: any) =>
        !u?.attributes?.invitation_status ||
        u?.attributes?.invitation_status === "pending"
    ).length;
    return { total, completed, inProgress, pending };
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
        "error"
      );
      return;
    }
    const isSingleUser = userIds && userIds.length === 1;
    if (isSingleUser) setSendingCredentialsUserId(userIds[0]);
    try {
      await sendCredentials(String(idToUse), idsToSend);
      if (isSingleUser) {
        showNotification("Invitation sent to user successfully!", "success");
      } else {
        showNotification(
          `Invitation sent to ${idsToSend.length} users successfully!`,
          "success"
        );
      }
      setSelectedUsers(new Set());
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to send invitation. Please try again.";
      showNotification(
        isSingleUser
          ? "Failed to send invitation to user. Please try again."
          : errorMessage,
        "error"
      );
    } finally {
      setSendingCredentialsUserId(null);
    }
  };

  const handleUserSelect = (invId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(invId)) {
      newSelected.delete(invId);
    } else {
      newSelected.add(invId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    const list = staticInvitations;
    if (selectedUsers.size === list.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(list.map((_, i) => String(i))));
    }
  };

  const totalPages = pagination?.total_pages || 3;
  const totalCount = pagination?.total_count ?? 30;

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

      <div className="min-h-screen bg-gray-50">
        <div className="px-6 py-6 max-w-[1400px] mx-auto">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <UsersIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Invitation Users
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                <Download style={{color: "#2B7FFF"}} size={15} />
                Export CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                <FileText style={{color: "#2B7FFF"}} size={15} />
                Event Report
              </button>
              <button
                onClick={() =>
                  navigate(
                    `/invitation/new${eventId ? `?eventId=${eventId}` : ""}`
                  )
                }
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                <Plus size={15} />
                Creat New Invitations
              </button>
            </div>
          </div>

          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Total */}
            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{backgroundColor:"#FAFAFA"}}>
                <UserCheck className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Total Invitations</p>
                <p className="text-2lg font-bold text-gray-700 leading-none mt-2">
                  {stats.total || 140}
                </p>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{backgroundColor:'#FAFAFA'}}>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Completed</p>
                <p className="text-2lg font-bold text-gray-700 leading-none mt-2">
                  {stats.completed || 122}
                </p>
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{backgroundColor:'#FAFAFA'}}>
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">In Progress</p>
                <p className="text-2lg font-bold text-gray-700 leading-none mt-2">
                  {stats.inProgress || 0}
                </p>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{backgroundColor:'#FAFAFA'}}>
                <Mail className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Pending</p>
                <p className="text-2lg font-bold text-gray-700 leading-none mt-2">
                  {stats.pending || 18}
                </p>
              </div>
            </div>
          </div>

          {/* ── Search & Filter ── */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="appearance-none pl-4 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 min-w-[140px] cursor-pointer"
              >
                <option value="all">All Types</option>
                {badges.length > 0 ? (
                  badges.map((badge: any) => (
                    <option key={badge.id} value={badge?.attributes?.name || ""}>
                      {badge?.attributes?.name}
                    </option>
                  ))
                ) : (
                  <option value="guest">Guest</option>
                )}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={15}
              />
            </div>
          </div>

          {/* ── Table ── */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1b3a5c]">
                    {/* Checkbox */}
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.size === staticInvitations.length &&
                          staticInvitations.length > 0
                        }
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-400 accent-white cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="text-xs font-semibold text-white uppercase tracking-wider">
                        ID
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="text-xs font-semibold text-white uppercase tracking-wider">
                        Name
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="text-xs font-semibold text-white uppercase tracking-wider">
                        Email Subject
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="text-xs font-semibold text-white uppercase tracking-wider">
                        Channel
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="text-xs font-semibold text-white uppercase tracking-wider">
                        Status
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="text-xs font-semibold text-white uppercase tracking-wider">
                        Created
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="text-xs font-semibold text-white uppercase tracking-wider">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingUsers ? (
                    Array.from({ length: 10 }).map((_, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-4 rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-5 w-12 rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-40" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-56" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-6 w-8 rounded-full" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Skeleton className="w-7 h-7 rounded" />
                            <Skeleton className="w-7 h-7 rounded" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : staticInvitations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-gray-500 text-sm"
                      >
                        No invitations found
                      </td>
                    </tr>
                  ) : (
                    staticInvitations.map((invitation, index) => {
                      const rowKey = `${invitation.id}-${index}`;
                      const isSelected = selectedUsers.has(String(index));
                      return (
                        <tr
                          key={rowKey}
                          className={`transition-colors ${
                            isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleUserSelect(String(index))}
                              className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer"
                            />
                          </td>

                          {/* ID — #182 format, no colored badge */}
                          <td className="px-4 py-3">
                            <span className="text-sm font-semibold text-gray-700">
                              #{invitation.id}
                            </span>
                          </td>

                          {/* Name */}
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-900">
                              {invitation.name}
                            </span>
                          </td>

                          {/* Email Subject */}
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-700 dir-rtl">
                              {invitation.emailSubject}
                            </span>
                          </td>

                          {/* Channel — icon only inside a small rounded box */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg border-gray-200 bg-white">
                              <Mail size={15} className="text-gray-500" style={{color:"#2B7FFF"}} />
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            {invitation.status === "pending" ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-600 border border-orange-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                Done
                              </span>
                            )}
                          </td>

                          {/* Created */}
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600">
                              {invitation.created}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-0.5">
                              {/* View */}
                              <button
                                type="button"
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                title="View"
                              >
                                <Eye size={16} />
                              </button>

                              {/* More / Three-dot menu */}
                              <div
                                className="relative"
                                ref={
                                  actionsMenuOpenId === rowKey
                                    ? actionsMenuRef
                                    : undefined
                                }
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActionsMenuOpenId(
                                      actionsMenuOpenId === rowKey
                                        ? null
                                        : rowKey
                                    )
                                  }
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                  title="More actions"
                                >
                                  <MoreVertical size={16} />
                                </button>

                                {actionsMenuOpenId === rowKey && (
                                  <div className="absolute right-0 top-full mt-1 z-20 min-w-[180px] py-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigate(
                                          `/invitation/report/${invitation.id}`,
                                          {
                                            state: {
                                              invitationName: invitation.name,
                                              createdAt: invitation.created,
                                            },
                                          }
                                        );
                                        setActionsMenuOpenId(null);
                                      }}
                                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                                    >
                                      <BarChart2
                                        size={15}
                                        className="text-orange-500 flex-shrink-0"
                                      />
                                      Invitation Report
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActionsMenuOpenId(null)
                                      }
                                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                                    >
                                      <Pencil
                                        size={15}
                                        className="text-green-600 flex-shrink-0"
                                      />
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActionsMenuOpenId(null)
                                      }
                                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                                    >
                                      <Copy
                                        size={15}
                                        className="text-pink-500 flex-shrink-0"
                                      />
                                      Clone
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination Footer ── */}
            <div className="border-t border-gray-200 px-5 py-3 bg-white">
              <div className="flex items-center justify-between">
                {/* Left: count info */}
                <p className="text-sm text-gray-500">
                  Showing 1 to {staticInvitations.length} of {totalCount} invitations
                </p>

                {/* Center: page buttons */}
                <div className="flex items-center gap-2">
                  {/* Previous */}
                  <button
                    onClick={() =>
                      currentPage > 1 && handlePageChange(currentPage - 1)
                    }
                    disabled={currentPage === 1}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                            page === currentPage
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() =>
                      currentPage < totalPages &&
                      handlePageChange(currentPage + 1)
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>

                {/* Right: spacer to balance layout */}
                <div className="w-[120px]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .dir-rtl { direction: rtl; unicode-bidi: embed; }
      `}</style>
    </>
  );
}

export default Invitations;