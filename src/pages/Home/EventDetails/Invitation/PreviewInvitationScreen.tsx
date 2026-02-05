import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import Pagination from "@/components/Pagination";
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
};

function formatDateTime(value: string) {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
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
}: PreviewInvitationScreenProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Same source as InvitationDetailsTab: event name from API shape or fallback
  const eventName =
    eventData?.data?.attributes?.name ??
    (eventId ? `Event (ID: ${eventId})` : "—");
  const eventLink = eventId
    ? `${window.location.origin}/event/${eventId}`
    : "#";

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-slate-900">Preview Invitation</h2>

      {/* Invitation details */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
        <h3 className="text-lg font-semibold text-slate-800">
          {invitationForm.invitationName || "—"}
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div>
            <dt className="text-slate-500">Email Subject</dt>
            <dd className="font-medium text-slate-900">
              {invitationForm.emailSubject || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Communication Type</dt>
            <dd className="font-medium text-slate-900">
              {invitationForm.communicationType || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Scheduled For</dt>
            <dd className="font-medium text-slate-900">
              {formatDateTime(invitationForm.scheduleSendAt)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Event</dt>
            <dd>
              <a
                href={eventLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                {eventName}
              </a>
            </dd>
          </div>
        </dl>
      </div>

      {/* Email preview */}
      <div>
        <h3 className="text-base font-semibold text-slate-800 mb-3">
          Email Preview
        </h3>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div
            className="p-6 prose prose-slate max-w-none min-h-[200px]"
            dangerouslySetInnerHTML={{ __html: emailHtml || "<p>No content</p>" }}
          />
        </div>
      </div>

      {/* Imported users */}
      <div>
        <h3 className="text-base font-semibold text-slate-800 mb-3">
          Imported Users
        </h3>
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700"
              >
                <option value={5}>Show 5</option>
                <option value={10}>Show 10</option>
                <option value={25}>Show 25</option>
                <option value={50}>Show 50</option>
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    First Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Last Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Phone Number
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-slate-500 text-sm"
                    >
                      No users to display
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {user.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {user.first_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {user.last_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {user.phone_number}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

export type { PreviewInvitationScreenProps };
