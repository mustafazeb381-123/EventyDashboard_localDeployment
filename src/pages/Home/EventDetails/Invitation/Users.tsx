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
import { getEventbyId, sendCredentials } from "@/apis/apiHelpers";
import {
  getEventInvitations,
  deleteEventInvitation,
  type EventInvitation,
} from "@/apis/invitationService";
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

/** Format invitation created_at for display */
function formatInvitationDate(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

// (Static fallback removed — list comes from API)
const _unused = [
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
  const [currentPage, setCurrentPage] = useState(1);
  const [eventId, setEventId] = useState<string | null>(null);
  const [actualEventId, setActualEventId] = useState<string | null>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [invitations, setInvitations] = useState<EventInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [invitationPagination, setInvitationPagination] = useState<{
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  } | null>(null);
  const [sendingCredentialsUserId, setSendingCredentialsUserId] = useState<
    string | null
  >(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [actionsMenuOpenId, setActionsMenuOpenId] = useState<string | null>(
    null,
  );
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 10;

  // Close actions menu when clicking outside (use 'click' so menu open state + ref are set before we check)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(e.target as Node)
      ) {
        setActionsMenuOpenId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
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

  // Fetch event invitations when we have an eventId (for the list table)
  useEffect(() => {
    const idToUse = actualEventId || eventId;
    if (idToUse && currentPage > 0) {
      fetchInvitations(idToUse, currentPage);
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

  const fetchInvitations = async (id: string, page: number = 1) => {
    setLoadingInvitations(true);
    try {
      const response = await getEventInvitations(id, {
        page,
        per_page: itemsPerPage,
      });
      // API returns JSON:API format: { data: [{ id, type, attributes }, ...], meta: { pagination } }
      const res = response.data as unknown as {
        data?: Array<{ id: string; type?: string; attributes?: Record<string, unknown> }>;
        meta?: { pagination?: Record<string, number | null> };
      };
      const rawList = Array.isArray(res?.data) ? res.data : [];
      // Normalize JSON:API format (id + attributes) to flat invitation objects
      const list: EventInvitation[] = rawList.map((item) =>
        item.attributes
          ? { id: Number(item.id) || item.id, ...item.attributes } as EventInvitation
          : (item as unknown as EventInvitation)
      );
      setInvitations(list);
      const meta = res?.meta?.pagination;
      if (meta) {
        setInvitationPagination({
          current_page: meta.current_page ?? 1,
          total_pages: meta.total_pages ?? 1,
          total_count: meta.total_count ?? 0,
          per_page: meta.per_page ?? itemsPerPage,
        });
      } else {
        setInvitationPagination(null);
      }
    } catch {
      setInvitations([]);
      setInvitationPagination(null);
    } finally {
      setLoadingInvitations(false);
    }
  };

  // Filter invitations by channel (invitation_type) and search term
  const filteredInvitations = useMemo(() => {
    return invitations.filter((inv) => {
      if (filterType !== "all") {
        const type = (inv.invitation_type || "").toLowerCase();
        if (type !== filterType.toLowerCase()) return false;
      }
      if (!searchTerm.trim()) return true;
      const searchLower = searchTerm.toLowerCase().trim();
      const title = (inv.title || "").toLowerCase();
      const subject = (inv.invitation_email_subject || "").toLowerCase();
      const type = (inv.invitation_type || "").toLowerCase();
      return (
        title.includes(searchLower) ||
        subject.includes(searchLower) ||
        type.includes(searchLower)
      );
    });
  }, [invitations, filterType, searchTerm]);

  // Stats from invitations API (total from pagination; completed/pending from list)
  const stats = useMemo(() => {
    const total = invitationPagination?.total_count ?? invitations.length;
    const withInvitees = invitations.filter(
      (inv) => (inv.event_invitation_users_count ?? 0) > 0,
    ).length;
    return {
      total,
      completed: withInvitees,
      inProgress: 0,
      pending: Math.max(0, total - withInvitees),
    };
  }, [invitations, invitationPagination]);

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
    if (isSingleUser) setSendingCredentialsUserId(userIds[0]);
    try {
      await sendCredentials(String(idToUse), idsToSend);
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
      showNotification(
        isSingleUser
          ? "Failed to send invitation to user. Please try again."
          : errorMessage,
        "error",
      );
    } finally {
      setSendingCredentialsUserId(null);
    }
  };

  const handleInvitationSelect = (invId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(invId)) {
      newSelected.delete(invId);
    } else {
      newSelected.add(invId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    const list = filteredInvitations;
    if (selectedUsers.size === list.length && list.length > 0) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(list.map((inv) => String(inv.id))));
    }
  };

  const totalPages = invitationPagination?.total_pages ?? 1;
  const totalCount = invitationPagination?.total_count ?? 0;
  const listToShow = filteredInvitations;

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
        <div className="px-6 py-6 max-w-full mx-auto">
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
                <Download style={{ color: "#2B7FFF" }} size={15} />
                Export CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                <FileText style={{ color: "#2B7FFF" }} size={15} />
                Event Report
              </button>
              <button
                onClick={() =>
                  navigate(
                    `/invitation/new${eventId ? `?eventId=${eventId}` : ""}`,
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
              <div
                className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#FAFAFA" }}
              >
                <UserCheck className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">
                  Total Invitations
                </p>
                <p className="text-2lg font-bold text-gray-700 leading-none mt-2">
                  {stats.total || 140}
                </p>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
              <div
                className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#FAFAFA" }}
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Completed</p>
                <p className="text-2lg font-bold text-gray-700 leading-none mt-2">
                  {stats.completed || 0}
                </p>
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
              <div
                className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#FAFAFA" }}
              >
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
              <div
                className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#FAFAFA" }}
              >
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
                disabled={loadingInvitations}
                className="appearance-none pl-4 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 min-w-[140px] cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={15}
              />
            </div>
          </div>

          {/* ── Table ── */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1b3a5c]">
                    {/* Checkbox */}
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={
                          listToShow.length > 0 &&
                          selectedUsers.size === listToShow.length
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
                  {loadingInvitations ? (
                    Array.from({ length: 10 }).map((_, index) => (
                      <tr key={index}>
                        <td className="px-4 py-4">
                          <Skeleton className="h-4 w-4 rounded" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-12 rounded" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-4 w-40" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-4 w-56" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-6 w-8 rounded-full" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-1">
                            <Skeleton className="w-7 h-7 rounded" />
                            <Skeleton className="w-7 h-7 rounded" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : listToShow.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-gray-500 text-sm"
                      >
                        {actualEventId || eventId
                          ? "No invitations found"
                          : "Select an event (add ?eventId= to URL or use event from storage)"}
                      </td>
                    </tr>
                  ) : (
                    listToShow.map((invitation) => {
                      const rowKey = `inv-${invitation.id}`;
                      const isSelected = selectedUsers.has(
                        String(invitation.id),
                      );
                      const status =
                        (invitation.event_invitation_users_count ?? 0) > 0
                          ? "done"
                          : "pending";
                      return (
                        <tr
                          key={rowKey}
                          className={`transition-colors ${
                            isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                handleInvitationSelect(String(invitation.id))
                              }
                              className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm font-semibold text-gray-700">
                              #{invitation.id}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-900">
                              {invitation.title || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-700 dir-rtl">
                              {invitation.invitation_email_subject || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg border-gray-200 bg-white">
                              <Mail
                                size={15}
                                className="text-gray-500"
                                style={{ color: "#2B7FFF" }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {status === "pending" ? (
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
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">
                              {formatInvitationDate(invitation.created_at)}
                            </span>
                          </td>
                          <td className="px-4 py-4 align-top overflow-visible relative">
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const eventIdToPass = actualEventId || eventId;
                                  const previewPath = `/invitation/preview-page/${invitation.id}${eventIdToPass ? `?eventId=${eventIdToPass}` : ""}`;
                                  navigate(previewPath);
                                }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                title="View"
                              >
                                <Eye size={16} />
                              </button>
                              <div
                                className="relative inline-block"
                                ref={
                                  actionsMenuOpenId === rowKey
                                    ? actionsMenuRef
                                    : undefined
                                }
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActionsMenuOpenId(
                                      actionsMenuOpenId === rowKey
                                        ? null
                                        : rowKey,
                                    );
                                  }}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                  title="More actions"
                                >
                                  <MoreVertical size={16} />
                                </button>
                                {actionsMenuOpenId === rowKey && (
                                  <div className="absolute right-0 top-full mt-1 z-[100] min-w-[180px] py-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const eventIdToPass = actualEventId || eventId;
                                        navigate(
                                          `/invitation/report/${invitation.id}`,
                                          {
                                            state: {
                                              invitationName: invitation.title,
                                              createdAt: formatInvitationDate(
                                                invitation.created_at,
                                              ),
                                              eventId: eventIdToPass ?? undefined,
                                            },
                                          },
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
                                      onClick={() => {
                                        const eventIdToPass = actualEventId || eventId;
                                        navigate(
                                          `/invitation/edit/${invitation.id}${eventIdToPass ? `?eventId=${eventIdToPass}` : ""}`,
                                        );
                                        setActionsMenuOpenId(null);
                                      }}
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
                                      onClick={() => setActionsMenuOpenId(null)}
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

            {/* ── Pagination Footer (show when there is data; page controls when totalCount >= 10 / multiple pages) ── */}
            {(totalCount > 0 || listToShow.length > 0) && (
              <div className="border-t border-gray-200 px-5 py-3 bg-white">
                <div className="flex items-center justify-between">
                  {/* Left: count info */}
                  <p className="text-sm text-gray-500">
                    {totalCount === 0
                      ? `Showing ${listToShow.length} invitation${listToShow.length !== 1 ? "s" : ""}`
                      : (() => {
                          const page = invitationPagination?.current_page ?? 1;
                          const per =
                            invitationPagination?.per_page ?? itemsPerPage;
                          const start = (page - 1) * per + 1;
                          const end = Math.min(page * per, totalCount);
                          return `Showing ${start} to ${end} of ${totalCount} invitations`;
                        })()}
                  </p>

                  {/* Center: page buttons — only when more than one page (e.g. totalCount >= 10) */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          currentPage > 1 && handlePageChange(currentPage - 1)
                        }
                        disabled={currentPage === 1}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        ← Previous
                      </button>

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
                          ),
                        )}
                      </div>

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
                  )}

                  {/* Right: spacer when page controls shown, else empty */}
                  <div className={totalPages > 1 ? "w-[120px]" : ""} />
                </div>
              </div>
            )}
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
