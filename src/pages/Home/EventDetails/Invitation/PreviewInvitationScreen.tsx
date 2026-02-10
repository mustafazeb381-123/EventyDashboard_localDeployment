import { useState, useMemo } from "react";
import { Search, ChevronDown } from "lucide-react";
import type { ParsedInvitee } from "./InviteesTab";
import type { InvitationForm } from "./newInvitationTypes";

type PreviewInvitationScreenProps = {
  invitationForm: InvitationForm;
  eventData: any;
  eventId: string | null;
  emailHtml: string;
  parsedInvitees: ParsedInvitee[];
  onBack: () => void;
  onSendTestEmail: () => void;
  onSendInvitation: () => void;
  isSending?: boolean;
  isCreatingInvitation?: boolean;
};

function formatDateTime(value: string) {
  if (!value) return "-";
  // Keep ISO-like format: 2026-02-15 15:43
  const d = new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

export function PreviewInvitationScreen({
  invitationForm,
  eventData,
  eventId,
  emailHtml,
  parsedInvitees,
  onBack,
  onSendTestEmail,
  onSendInvitation,
  isSending = false,
  isCreatingInvitation = false,
}: PreviewInvitationScreenProps) {
  const busy = isSending || isCreatingInvitation;
  const sendInvitationDisabled = busy || parsedInvitees.length === 0;

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return parsedInvitees;
    const q = searchTerm.toLowerCase().trim();
    return parsedInvitees.filter(
      (u) =>
        u.first_name.toLowerCase().includes(q) ||
        u.last_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone_number.includes(q) ||
        u.id.toLowerCase().includes(q)
    );
  }, [parsedInvitees, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const allSelected =
    paginatedUsers.length > 0 &&
    paginatedUsers.every((u) => selectedIds.has(u.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedUsers.map((u) => u.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const eventName =
    eventData?.data?.attributes?.name ??
    (eventId ? `Event (ID: ${eventId})` : "—");
  const eventLink = eventId
    ? `${window.location.origin}/event/${eventId}`
    : "#";

  const showingFrom = filteredUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(currentPage * itemsPerPage, filteredUsers.length);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Centered Title ── */}
      <div className="text-center py-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Preview Invitation</h1>
      </div>

      <div className="px-6 py-6 max-w-[1200px] mx-auto space-y-6">

        {/* ── Details Card — 2-column grid layout ── */}
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4">
            {invitationForm.invitationName || "Annual Conference 2025"}
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {/* Left column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 font-medium">Email Subject:</span>
                <span className="text-blue-500 font-medium dir-rtl">
                  {invitationForm.emailSubject || "ملتقى ميزانية 2026"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 font-medium">Scheduled For:</span>
                <span className="text-blue-500 font-medium">
                  {formatDateTime(invitationForm.scheduleSendAt) || "2026-02-15 15:43"}
                </span>
              </div>
            </div>
            {/* Right column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 font-medium">Communication Type:</span>
                <span className="text-blue-500 font-medium">
                  {invitationForm.communicationType || "Email"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 font-medium">Event:</span>
                <a
                  href={eventLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 font-medium hover:text-blue-600 hover:underline"
                >
                  {eventName || "Budget Forum 2026"}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Action Buttons Row ── */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={busy}
            className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onSendTestEmail}
            disabled={busy}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Test Email
          </button>
          <button
            type="button"
            onClick={onSendInvitation}
            disabled={sendInvitationDisabled}
            className="px-5 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending…
              </span>
            ) : (
              "Send Invitation"
            )}
          </button>
        </div>

        {/* ── Two-Column: Email Preview (left) | Imported Users (right) ── */}
        <div className="grid grid-cols-2 gap-5 items-start">

          {/* ── Left: Email Preview ── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Email Preview</h3>
            <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
              <div
                className="p-5 prose prose-sm prose-slate max-w-none min-h-[300px] text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: emailHtml || "<p class='text-gray-400'>No email content available.</p>",
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
                <span className="text-xs text-gray-500 flex-shrink-0">Show in page</span>
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

            {/* Table with horizontal scroll (shows progress bar) */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
              <div className="overflow-x-auto" style={{ overflowX: "scroll" }}>
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-[#1b3a5c]">
                      {/* Checkbox */}
                      <th className="px-3 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleSelectAll}
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
                          colSpan={6}
                          className="px-4 py-10 text-center text-gray-400 text-sm"
                        >
                          No users to display
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user) => {
                        const isSelected = selectedIds.has(user.id);
                        return (
                          <tr
                            key={user.id}
                            className={`transition-colors ${
                              isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                            }`}
                          >
                            <td className="px-3 py-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(user.id)}
                                className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer"
                              />
                            </td>
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
                        );
                      })
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
                    {filteredUsers.length} users
                  </p>

                  {/* Page buttons */}
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

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
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
                      );
                    })}

                    {/* Next */}
                    <button
                      onClick={() =>
                        currentPage < totalPages &&
                        setCurrentPage(currentPage + 1)
                      }
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
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

export type { PreviewInvitationScreenProps };