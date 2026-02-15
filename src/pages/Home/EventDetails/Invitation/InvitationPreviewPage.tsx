import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, ChevronDown } from "lucide-react";
import { getEventInvitations, getEventInvitation } from "@/apis/invitationService";
import { parseInvitationResponse } from "./NewInvitation";
import { resolveInvitationEmailLinks } from "./resolveInvitationEmailLinks";

export type PreviewInvitee = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
};

function formatScheduled(value: string | undefined): string {
  if (!value) return "-";
  try {
    const d = new Date(value);
    return isNaN(d.getTime()) ? String(value) : d.toLocaleString();
  } catch {
    return String(value ?? "-");
  }
}

function InvitationPreviewPage() {
  const navigate = useNavigate();
  const params = useParams<{ invitationId: string }>();
  const [searchParams] = useSearchParams();
  const invitationId = params.invitationId ?? null;
  const eventId = searchParams.get("eventId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitationTitle, setInvitationTitle] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [scheduledFor, setScheduledFor] = useState("-");
  const [communicationType, setCommunicationType] = useState("email");
  const [eventName, setEventName] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [users, setUsers] = useState<PreviewInvitee[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch invitations via list GET API, then find the one matching invitationId (POST returns this id)
  useEffect(() => {
    if (!eventId || !invitationId) {
      setLoading(false);
      setError("Missing event or invitation. Open preview from the invitation list with an event selected.");
      return;
    }
    setError(null);
    setLoading(true);

    function parseListResponse(body: unknown): Record<string, unknown> | null {
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

    getEventInvitations(eventId, { page: 1, per_page: 100 })
      .then(async (res) => {
        const body = res.data as unknown;
        let attrs = parseListResponse(body);
        // Fallback: if not in first page, try single GET (GET /events/{event_id}/event_invitations/{id})
        if (!attrs) {
          try {
            const singleRes = await getEventInvitation(eventId, invitationId);
            attrs = parseInvitationResponse(singleRes.data as unknown);
          } catch {
            setError("Invitation not found. It may be on another page.");
            return;
          }
        }
        if (!attrs) {
          setError("Could not read invitation data.");
          return;
        }
        setInvitationTitle(String(attrs.title ?? ""));
        setEmailSubject(String(attrs.invitation_email_subject ?? ""));
        setScheduledFor(formatScheduled(attrs.scheduled_send_time as string | undefined));
        setCommunicationType(String(attrs.invitation_type ?? "email").toLowerCase());
        const rawBody = String(attrs.invitation_email_body ?? "");
        setEmailBody(resolveInvitationEmailLinks(rawBody, eventId, { forPreview: true }));
        const raw = attrs as Record<string, unknown>;
        const rawEventName =
          raw.event_name ??
          (typeof raw.event === "object" && raw.event !== null && "name" in raw.event
            ? (raw.event as { name?: string }).name
            : undefined);
        setEventName(rawEventName ? String(rawEventName) : `Event (ID: ${eventId})`);

        const rawUsers = (attrs.event_invitation_users as Array<Record<string, unknown>>) ?? [];
        const filtered = rawUsers.filter((u) => u != null && u.id != null && String(u.id).trim() !== "");
        const list: PreviewInvitee[] = filtered.map((u, i) => ({
          id: String(u?.id ?? `row-${i + 1}`),
          first_name: String(u?.first_name ?? ""),
          last_name: String(u?.last_name ?? ""),
          email: String(u?.email ?? ""),
          phone_number: String(u?.phone_number ?? ""),
        }));
        setUsers(list);
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string }; status?: number } })?.response?.data?.message ??
          (err as Error)?.message ??
          "Failed to load invitation.";
        setError(String(msg));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [eventId, invitationId]);

  // Filter and paginate users
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const q = searchTerm.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.first_name.toLowerCase().includes(q) ||
        u.last_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone_number.includes(q) ||
        u.id.toLowerCase().includes(q),
    );
  }, [users, searchTerm]);

  const totalUsersCount = filteredUsers.length;
  const showingFrom = filteredUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(currentPage * itemsPerPage, filteredUsers.length);
  const totalPagesForPagination = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleBack = () => {
    navigate(`/invitation${eventId ? `?eventId=${eventId}` : ""}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-white items-center justify-center gap-4 p-8 relative">
        <button
          onClick={handleBack}
          className="absolute left-6 top-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors z-10 bg-white border border-gray-200 shadow-sm"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">Loading invitation…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-white items-center justify-center gap-4 p-8">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to invitations
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-white relative">
      {/* ── Title bar with Back button ── */}
      <div className="shrink-0 flex items-center justify-center py-6 border-b border-gray-100 relative">
        <button
          onClick={handleBack}
          className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors z-10 bg-white border border-gray-200 shadow-sm"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Preview Invitation</h1>
      </div>

      {/* ── Full-screen centered content ── */}
      <div className="flex-1 flex items-center justify-center w-full p-6 overflow-auto">
        <div className="w-full max-w-full mx-auto space-y-6">
          {/* ── Details Card — 2-column grid layout ── */}
          <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              {invitationTitle}
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {/* Left column */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 font-medium">
                    Email Subject:
                  </span>
                  <span className="text-blue-500 font-medium dir-rtl">
                    {emailSubject}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 font-medium">
                    Scheduled For:
                  </span>
                  <span className="text-blue-500 font-medium">
                    {scheduledFor}
                  </span>
                </div>
              </div>
              {/* Right column */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 font-medium">
                    Communication Type:
                  </span>
                  <span className="text-blue-500 font-medium">
                    {communicationType === "whatsapp"
                      ? "WhatsApp"
                      : communicationType === "sms"
                        ? "SMS"
                        : "Email"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 font-medium">Event:</span>
                  <span className="text-blue-500 font-medium">
                    {eventName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Two-Column: Email Preview (left) | Imported Users (right) ── */}
          <div className="grid grid-cols-2 gap-5 items-start">
            {/* ── Left: Email Preview ── */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Email Preview
              </h3>
              <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                <div
                  className="p-5 prose prose-sm prose-slate max-w-none min-h-[300px] text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html:
                      emailBody ||
                      "<p class='text-gray-400'>No email content available.</p>",
                  }}
                />
              </div>
            </div>

            {/* ── Right: Imported Users ── */}
            <div>
              {/* Header row: "Imported Users" + Show in page + Search */}
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-sm font-semibold text-gray-700 flex-shrink-0">
                  Imported Users
                </h3>
                {/* Show in page dropdown */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    Show in page
                  </span>
                  <div className="relative">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="appearance-none pl-2 pr-6 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs w-36 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Table with horizontal scroll */}
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="bg-[#1b3a5c]">
                        <th className="px-4 py-3 text-left">
                          <span className="text-xs font-semibold text-white uppercase tracking-wider">
                            ID
                          </span>
                        </th>
                        <th className="px-4 py-3 text-left">
                          <span className="text-xs font-semibold text-white uppercase tracking-wider">
                            First Name
                          </span>
                        </th>
                        <th className="px-4 py-3 text-left">
                          <span className="text-xs font-semibold text-white uppercase tracking-wider">
                            Last Name
                          </span>
                        </th>
                        <th className="px-4 py-3 text-left">
                          <span className="text-xs font-semibold text-white uppercase tracking-wider">
                            Email
                          </span>
                        </th>
                        <th className="px-4 py-3 text-left">
                          <span className="text-xs font-semibold text-white uppercase tracking-wider">
                            Phone Number
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedUsers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-10 text-center text-gray-400 text-sm"
                          >
                            No users to display
                          </td>
                        </tr>
                      ) : (
                        paginatedUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-700">
                              {user.id}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {user.first_name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {user.last_name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                              {user.email}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                              {user.phone_number}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ── Pagination Footer ── */}
                <div className="border-t border-gray-200 px-4 py-3 bg-white">
                  <div className="flex items-center justify-between">
                    {/* Count */}
                    <p className="text-xs text-gray-500">
                      Showing {showingFrom} to {showingTo} of{" "}
                      {totalUsersCount} users
                    </p>

                    {/* Page buttons */}
                    {totalPagesForPagination > 1 && (
                      <div className="flex items-center gap-1.5">
                        {/* Previous */}
                        <button
                          onClick={() =>
                            currentPage > 1 && setCurrentPage(currentPage - 1)
                          }
                          disabled={currentPage === 1}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          ← Previous
                        </button>

                        {/* Page numbers - show up to 5 pages */}
                        {Array.from({ length: Math.min(totalPagesForPagination, 5) }, (_, i) => i + 1).map(
                          (page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                                page === currentPage
                                  ? "bg-blue-600 text-white shadow-sm"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {page}
                            </button>
                          ),
                        )}

                        {/* Next */}
                        <button
                          onClick={() =>
                            currentPage < totalPagesForPagination &&
                            setCurrentPage(currentPage + 1)
                          }
                          disabled={currentPage === totalPagesForPagination}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dir-rtl {
          direction: rtl;
          unicode-bidi: embed;
        }
      `}</style>
    </div>
  );
}

export default InvitationPreviewPage;
