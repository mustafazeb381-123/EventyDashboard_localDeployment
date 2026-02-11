import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Calendar,
  Users,
  Send,
  UserCheck,
  UserPlus,
  UserX,
  Percent,
  Copy,
  Download,
  Search,
  Check,
  Clock,
  Tag,
} from "lucide-react";
import { icons } from "@/utils/Assets";
import { getEventInvitations } from "@/apis/invitationService";
import type { EventInvitationUser } from "@/apis/invitationService";
import { Skeleton } from "@/components/ui/skeleton";

/** Parse list response and find invitation by id. List API returns { data: [ { id, type, attributes }, ... ], meta } */
function findInvitationFromListResponse(
  body: unknown,
  invitationId: string
): Record<string, unknown> | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;
  const data = raw.data;
  if (!Array.isArray(data)) return null;
  const list = data as Array<Record<string, unknown>>;
  const found = list.find((item) => String(item?.id) === String(invitationId));
  if (!found || typeof found !== "object") return null;
  const attrs = found.attributes;
  if (attrs && typeof attrs === "object") {
    return { id: found.id, ...(attrs as Record<string, unknown>) };
  }
  if ("title" in found || "invitation_type" in found) {
    return found as Record<string, unknown>;
  }
  return null;
}

type UserRow = {
  id: number;
  name: string;
  organization: string;
  position: string;
  email: string;
  phone: string;
  status: "approved" | "rejected" | "pending";
  delivery: "delivered" | "failed" | "pending";
  registered: boolean;
  confirmed: boolean;
  source?: string;
  invitation_sent_at?: string;
};

function mapInvitationUserToRow(u: EventInvitationUser): UserRow {
  const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || "—";
  const sent = !!u.invitation_sent_at;
  return {
    id: u.id,
    name,
    organization: "—",
    position: "—",
    email: u.email ?? "",
    phone: u.phone_number ?? "—",
    status: "pending",
    delivery: sent ? "delivered" : "pending",
    registered: false,
    confirmed: false,
    source: u.source,
    invitation_sent_at: u.invitation_sent_at,
  };
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

function InvitationReport() {
  const navigate = useNavigate();
  const { invitationId } = useParams<{ invitationId: string }>();
  const location = useLocation();
  const state = location.state as {
    invitationName?: string;
    type?: string;
    createdAt?: string;
    eventId?: string | null;
  } | null;

  const [invitation, setInvitation] = useState<Record<string, unknown> | null>(null);
  const [loadingInvitation, setLoadingInvitation] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const eventId = state?.eventId ?? null;

  useEffect(() => {
    if (!invitationId || !eventId) {
      setLoadingInvitation(false);
      if (!eventId && invitationId) setLoadError("Event ID is missing. Open this report from the invitation list.");
      return;
    }
    setLoadingInvitation(true);
    setLoadError(null);
    getEventInvitations(eventId, { page: 1, per_page: 100 })
      .then((res) => {
        const data = res.data as unknown;
        const attrs = findInvitationFromListResponse(data, invitationId);
        if (attrs) {
          setInvitation(attrs);
          setLoadError(null);
        } else {
          setInvitation(null);
          setLoadError("Invitation not found in list.");
        }
      })
      .catch(() => {
        setInvitation(null);
        setLoadError("Failed to load invitation.");
      })
      .finally(() => setLoadingInvitation(false));
  }, [invitationId, eventId]);

  const invitationName = (invitation?.title as string) ?? state?.invitationName ?? "Invitation Report";
  const type = (invitation?.invitation_type as string) ?? state?.type ?? "—";
  const createdAt = state?.createdAt ?? (invitation?.created_at ? formatDate(String(invitation.created_at)) : "—");

  const rawUsers: EventInvitationUser[] = useMemo(() => {
    const list = invitation?.event_invitation_users;
    if (!Array.isArray(list)) return [];
    return list as EventInvitationUser[];
  }, [invitation]);

  const allUsers: UserRow[] = useMemo(() => rawUsers.map(mapInvitationUserToRow), [rawUsers]);

  const sentCount = useMemo(
    () => rawUsers.filter((u) => u.invitation_sent_at).length,
    [rawUsers]
  );
  const duplicateEmailsCount = useMemo(() => {
    const emails = rawUsers.map((u) => (u.email ?? "").toLowerCase()).filter(Boolean);
    const seen = new Set<string>();
    let dupes = 0;
    emails.forEach((e) => {
      if (seen.has(e)) dupes += 1;
      else seen.add(e);
    });
    return dupes;
  }, [rawUsers]);

  const total = allUsers.length;
  const stats = useMemo(
    () => ({
      totalInvitations: total,
      sent: sentCount,
      registered: 0,
      conversionRate: total > 0 ? `${((0 / total) * 100).toFixed(1)}%` : "0%",
      duplicateEmails: duplicateEmailsCount,
    }),
    [total, sentCount, duplicateEmailsCount]
  );

  const registrationStatus = useMemo(
    () => ({
      approved: 0,
      rejected: 0,
      pending: total,
      total,
    }),
    [total]
  );

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return allUsers;
    const q = searchQuery.toLowerCase();
    return allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.organization.toLowerCase().includes(q)
    );
  }, [allUsers, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, safePage, pageSize]);

  const currentPageIds = useMemo(
    () => new Set(paginatedUsers.map((u) => u.id)),
    [paginatedUsers]
  );
  const allOnPageSelected =
    currentPageIds.size > 0 && [...currentPageIds].every((id) => selectedIds.has(id));

  const handleSelectAll = () => {
    if (allOnPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        currentPageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        currentPageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBackToList = () => {
    const eventId = state?.eventId;
    const path = eventId ? `/invitation?eventId=${eventId}` : "/invitation";
    navigate(path, { state: location.state });
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const startItem = (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, filteredUsers.length);

  function StatusIconCell({
    status,
    type,
  }: {
    status: UserRow["status"] | UserRow["delivery"] | boolean;
    type: "status" | "delivery" | "bool";
  }) {
    if (type === "bool") {
      const on = status as boolean;
      return (
        <div className="flex items-center justify-center">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              on
                ? "bg-green-100 border-2 border-green-500"
                : "bg-orange-100 border-2 border-orange-400"
            }`}
          >
            {on ? (
              <Check size={14} className="text-green-600" strokeWidth={2.5} />
            ) : (
              <Clock size={14} className="text-orange-500" strokeWidth={2} />
            )}
          </div>
        </div>
      );
    }

    const s = status as string;
    const isApproved = s === "approved" || s === "delivered";
    // Rejected/failed show as pending (orange clock) — no red X

    return (
      <div className="flex items-center justify-center">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isApproved
              ? "bg-green-100 border-2 border-green-500"
              : "bg-orange-100 border-2 border-orange-400"
          }`}
        >
          {isApproved ? (
            <Check size={14} className="text-green-600" strokeWidth={2.5} />
          ) : (
            <Clock size={14} className="text-orange-500" strokeWidth={2} />
          )}
        </div>
      </div>
    );
  }

  const printStyles =
    "@media print{body *{visibility:hidden}#invitation-report-print,#invitation-report-print *{visibility:visible}#invitation-report-print{position:absolute;left:0;top:0;width:100%}.no-print{display:none!important}}";

  if (loadingInvitation) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-7 w-48" />
          </div>
          <Skeleton className="h-6 w-64 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
          <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 border-b border-gray-100 last:border-0">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-red-600 mb-4">{loadError}</p>
          <button
            type="button"
            onClick={() => navigate(state?.eventId ? `/invitation?eventId=${state.eventId}` : "/invitation")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200"
          >
            <ArrowLeft size={18} />
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{printStyles}</style>
      <div className="min-h-screen bg-gray-50 p-6">
      {/* Header - White with black text */}
      <div className="bg-white rounded-xl shadow-sm mb-6" style={{ backgroundColor: "#F7FAFF" }}>
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center overflow-hidden">
                  <img src={icons.reports} alt="" className="w-6 h-6 object-contain brightness-0 invert" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Invitation Report</h1>
              </div>
              <p className="text-gray-900 text-base font-medium mb-2">{invitationName}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1.5">
                  <Tag size={14} />
                  {type}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} />
                  Created: {createdAt}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 no-print">
              <button
                onClick={handleBackToList}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={18} />
                Back to List
              </button>
              <button
                onClick={handlePrintReport}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Printer size={18} />
                Print Report
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Inside white container */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Invitations */}
            <div className="rounded-lg border border-gray-200 p-5 shadow-sm" style={{ backgroundColor: "#FFFFFF" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center" style={{backgroundColor:"#FAFAFA"}}>
                  <Users size={20} className="text-purple-600" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-600 mb-0.5">Total Invitations</p>
                  <p className="text-2lg font-bold text-gray-700">{stats.totalInvitations}</p>
                </div>
              </div>
            </div>

            {/* Sent */}
            <div className="rounded-lg border border-gray-200 p-5 shadow-sm" style={{ backgroundColor: "#FFFFFF" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FAFAFA" }}>
                  <Send size={20} className="text-cyan-500" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-600 mb-0.5">Sent</p>
                  <p className="text-2lg font-bold text-gray-700">{stats.sent}</p>
                </div>
              </div>
            </div>

            {/* Registered */}
            <div className="rounded-lg border border-gray-200 p-5 shadow-sm" style={{ backgroundColor: "#FFFFFF" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center" style={{backgroundColor:"#FAFAFA"}}>
                  <UserCheck size={20} className="text-green-600" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-600 mb-0.5">Registered</p>
                  <p className="text-2lg font-bold text-gray-700">{stats.registered}</p>
                </div>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="rounded-lg border border-gray-200 p-5 shadow-sm" style={{ backgroundColor: "#FFFFFF" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center" style={{backgroundColor:"#FAFAFA"}}>
                  <Percent size={20} className="text-orange-600" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-600 mb-0.5">Conversion Rate</p>
                  <p className="text-2lg font-bold text-gray-700">{stats.conversionRate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Duplicate Emails - Single card */}
          <div className="max-w-xs mb-6">
                  <div className="rounded-lg border border-gray-200 p-5 shadow-sm" style={{ backgroundColor: "#FFFFFF" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center" style={{backgroundColor:"#FAFAFA"}}>
                  <Copy size={20} className="text-red-600" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-600 mb-0.5">Duplicate Emails</p>
                  <p className="text-2lg font-bold text-gray-700">{stats.duplicateEmails}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Status Section - background #E3EFF9 */}
          <div className="rounded-lg border border-gray-200 p-6 mb-6 shadow-sm" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="flex items-center gap-2 mb-6">
              <UserPlus size={20} className="shrink-0" strokeWidth={2} style={{ color: "#656C95" }} />
              <h2 className="text-lg font-semibold text-gray-900">Registration Status</h2>
            </div>

            <div className="space-y-4">
              {/* Approved - icon small circle background emerald/100 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <UserCheck size={18} className="text-green-600" strokeWidth={2} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Approved</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{registrationStatus.approved}</span>
                </div>
                <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${(registrationStatus.approved / registrationStatus.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Rejected - icon small circle background pink/50 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
                      <UserX size={18} className="text-red-600" strokeWidth={2} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Rejected</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{registrationStatus.rejected}</span>
                </div>
                <div className="h-2 bg-red-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: `${(registrationStatus.rejected / registrationStatus.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Pending - icon small circle background orange/50 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                      <Clock size={18} className="text-orange-600" strokeWidth={2} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Pending</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{registrationStatus.pending}</span>
                </div>
                <div className="h-2 bg-orange-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${(registrationStatus.pending / registrationStatus.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Conversion Rate - only this section has pri-color/100 background */}
              <div
                className="pt-4 pb-4 px-3 -mx-3 rounded-lg border-t border-gray-200 mt-4"
                style={{ backgroundColor: "#EAF1FF" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-regular text-gray-700">Conversion Rate:</span>
                  <span className="text-sm font-medium text-gray-700">{stats.conversionRate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200 no-print">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className="text-base font-semibold text-gray-900">
                  Invitation Users ({filteredUsers.length})
                </h3>
                <div className="flex items-center gap-3">
                  <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Download size={16} />
                    Export CSV
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Show in page</span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                    >
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={allOnPageSelected}
                        onChange={handleSelectAll}
                        aria-label="Select all on page"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Organization</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Position</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Delivery</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Registered</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Confirmed</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold no-print">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center text-gray-500 text-sm">
                        {allUsers.length === 0 ? "No invitation users for this invitation." : "No users match your search."}
                      </td>
                    </tr>
                  ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 no-print">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={selectedIds.has(user.id)}
                          onChange={() => handleSelectOne(user.id)}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{user.organization}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{user.position}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.phone}</td>
                      <td className="px-4 py-3">
                        <StatusIconCell status={user.status} type="status" />
                      </td>
                      <td className="px-4 py-3">
                        <StatusIconCell status={user.delivery} type="delivery" />
                      </td>
                      <td className="px-4 py-3">
                        <StatusIconCell status={user.registered} type="bool" />
                      </td>
                      <td className="px-4 py-3">
                        <StatusIconCell status={user.confirmed} type="bool" />
                      </td>
                      <td className="px-4 py-3 no-print">
                        <button type="button" className="p-1 hover:bg-gray-100 rounded">
                          <img src={icons.copyIcon} alt="Copy" className="w-12 h-12 object-contain" />
                        </button>
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - only show when more than 10 users */}
            <div className="p-4 border-t border-gray-200 no-print">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm text-gray-600">
                  Showing {startItem}–{endItem} of {filteredUsers.length}
                </p>
                {filteredUsers.length > 10 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safePage <= 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => {
                          if (totalPages <= 7) return true;
                          if (p === 1 || p === totalPages) return true;
                          if (Math.abs(p - safePage) <= 1) return true;
                          return false;
                        })
                        .map((p, idx, arr) => (
                          <span key={p} className="flex items-center gap-1">
                            {idx > 0 && arr[idx - 1] !== p - 1 && (
                              <span className="px-1 text-gray-400">…</span>
                            )}
                            <button
                              type="button"
                              onClick={() => setCurrentPage(p)}
                              className={`min-w-[2rem] px-3 py-1 text-sm font-medium rounded ${
                                p === safePage
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {p}
                            </button>
                          </span>
                        ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage >= totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Print-only: full report with all data */}
      <div id="invitation-report-print" className="hidden print:block p-6 bg-white">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invitation Report</h1>
          <p className="text-gray-900 font-medium">{invitationName}</p>
          <p className="text-sm text-gray-600">
            {type} · Created: {createdAt}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm">
          <div>
            <p className="text-gray-600">Total Invitations</p>
            <p className="text-lg font-bold text-gray-900">{stats.totalInvitations}</p>
          </div>
          <div>
            <p className="text-gray-600">Sent</p>
            <p className="text-lg font-bold text-gray-900">{stats.sent}</p>
          </div>
          <div>
            <p className="text-gray-600">Registered</p>
            <p className="text-lg font-bold text-gray-900">{stats.registered}</p>
          </div>
          <div>
            <p className="text-gray-600">Conversion Rate</p>
            <p className="text-lg font-bold text-gray-900">{stats.conversionRate}</p>
          </div>
          <div>
            <p className="text-gray-600">Duplicate Emails</p>
            <p className="text-lg font-bold text-gray-900">{stats.duplicateEmails}</p>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Registration Status</h2>
          <p className="text-sm text-gray-600">
            Approved: {registrationStatus.approved} · Rejected: {registrationStatus.rejected} ·
            Pending: {registrationStatus.pending}
          </p>
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">
          Invitation Users ({allUsers.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Name</th>
                <th className="px-3 py-2 text-left font-semibold">Organization</th>
                <th className="px-3 py-2 text-left font-semibold">Position</th>
                <th className="px-3 py-2 text-left font-semibold">Email</th>
                <th className="px-3 py-2 text-left font-semibold">Phone</th>
                <th className="px-3 py-2 text-left font-semibold">Status</th>
                <th className="px-3 py-2 text-left font-semibold">Delivery</th>
                <th className="px-3 py-2 text-left font-semibold">Registered</th>
                <th className="px-3 py-2 text-left font-semibold">Confirmed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-3 py-2 text-gray-900">{user.name}</td>
                  <td className="px-3 py-2 text-gray-900">{user.organization}</td>
                  <td className="px-3 py-2 text-gray-900">{user.position}</td>
                  <td className="px-3 py-2 text-gray-600">{user.email}</td>
                  <td className="px-3 py-2 text-gray-600">{user.phone}</td>
                  <td className="px-3 py-2 capitalize">{user.status}</td>
                  <td className="px-3 py-2 capitalize">{user.delivery}</td>
                  <td className="px-3 py-2">{user.registered ? "Yes" : "No"}</td>
                  <td className="px-3 py-2">{user.confirmed ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default InvitationReport;