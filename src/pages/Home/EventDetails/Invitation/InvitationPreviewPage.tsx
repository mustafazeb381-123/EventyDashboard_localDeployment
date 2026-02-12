import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, ChevronDown } from "lucide-react";

// Static data - will be replaced with dynamic data later
const STATIC_INVITATION = {
  title: "Annual Conference 2025",
  emailSubject: "ملتقى ميزانية 2026",
  scheduledFor: "-",
  communicationType: "Email",
  eventName: "mayar",
  emailBody: "",
};

const STATIC_USERS = [
  { id: "1", first_name: "Liliane", last_name: "Gotling", email: "lgotling0@howstuffworks.com", phone_number: "111-689-9928" },
  { id: "2", first_name: "Starlene", last_name: "Yegorkin", email: "syegorkin1@cbslocal.com", phone_number: "600-170-4717" },
  { id: "3", first_name: "Shanda", last_name: "Weathers", email: "sweathers2@chicagotribune.com", phone_number: "521-449-3367" },
  { id: "4", first_name: "Gardy", last_name: "Wagstaffe", email: "gwagstaffe3@narod.ru", phone_number: "131-496-8497" },
  { id: "5", first_name: "Alane", last_name: "Etock", email: "aetock4@dot.gov", phone_number: "125-527-9106" },
  { id: "6", first_name: "Kelcey", last_name: "Antonias", email: "kantonias5@mapy.cz", phone_number: "715-149-5413" },
  { id: "7", first_name: "Roana", last_name: "Weld", email: "rweld6@fastcompany.com", phone_number: "208-570-3627" },
  { id: "8", first_name: "Petronella", last_name: "Ritson", email: "pritson7@mozilla.org", phone_number: "406-558-3235" },
  { id: "9", first_name: "Gillie", last_name: "Zavattieri", email: "gzavattieri8@reverbnation.com", phone_number: "966-977-8288" },
  { id: "10", first_name: "Rudy", last_name: "Blamires", email: "rblamires9@cornell.edu", phone_number: "667-763-8015" },
];

function InvitationPreviewPage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Use static data
  const users = STATIC_USERS;
  const invitationTitle = STATIC_INVITATION.title;
  const emailSubject = STATIC_INVITATION.emailSubject;
  const scheduledFor = STATIC_INVITATION.scheduledFor;
  const communicationType = STATIC_INVITATION.communicationType;
  const eventName = STATIC_INVITATION.eventName;
  const emailBody = STATIC_INVITATION.emailBody;

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

  // For static display: show total as 1000 (as per example)
  const totalUsersCount = 1000;
  const showingFrom = filteredUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(currentPage * itemsPerPage, filteredUsers.length);
  
  // Calculate total pages based on total count (1000) for pagination display
  const totalPagesForPagination = Math.max(1, Math.ceil(totalUsersCount / itemsPerPage));

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleBack = () => {
    navigate(`/invitation`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      {/* ── Title bar ── */}
      <div className="shrink-0 text-center py-6 border-b border-gray-100">
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

      {/* Back button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
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
