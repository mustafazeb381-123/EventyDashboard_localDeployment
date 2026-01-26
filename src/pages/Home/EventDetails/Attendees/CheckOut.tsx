import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getCheckOuts, getSessionAreaApi } from "@/apis/apiHelpers";
import Pagination from "@/components/Pagination";
import Search from "@/components/Search";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
      {getUserInitial(user)}
    </div>
  );
};

function CheckOut() {
  const location = useLocation();
  const [eventId, setEventId] = useState<string | null>(null);
  const [sessionAreaId, setSessionAreaId] = useState<string | number | null>(null);
  const [sessionAreas, setSessionAreas] = useState<any[]>([]); // Store all session areas
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]); // Store all users
  const [eventUsers, setUsers] = useState<any[]>([]); // Displayed users (paginated)
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const itemsPerPage = 10;
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: "success" | "error") => {
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
      // Keep current eventId if no query param
    } else if (!idFromQuery && !eventId) {
      // Try to get from localStorage as fallback
      const storedEventId =
        localStorage.getItem("create_eventId") ||
        localStorage.getItem("edit_eventId");
      if (storedEventId) {
        setEventId(storedEventId);
      }
    }
  }, [location.search, eventId]);

  // Fetch session areas and set the first one as default
  useEffect(() => {
    const fetchSessionAreas = async () => {
      if (!eventId) return;
      setLoadingAreas(true);
      try {
        const response = await getSessionAreaApi(eventId);
        const areas = response?.data?.data || [];
        setSessionAreas(areas);
        if (areas.length > 0) {
          // Use the first session area as default
          setSessionAreaId(areas[0].id);
        } else {
          setSessionAreaId(null);
          showNotification("No session areas found for this event", "error");
        }
      } catch (error) {
        console.error("Error fetching session areas:", error);
        showNotification("Failed to load session areas", "error");
        setSessionAreas([]);
        setSessionAreaId(null);
      } finally {
        setLoadingAreas(false);
      }
    };
    fetchSessionAreas();
  }, [eventId]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users when eventId or sessionAreaId changes
  useEffect(() => {
    if (eventId && sessionAreaId) {
      fetchUsers(eventId, sessionAreaId);
    }
  }, [eventId, sessionAreaId]);

  // Filter and paginate users when search term or page changes
  useEffect(() => {
    if (allUsers.length === 0) {
      setUsers([]);
      setPagination({
        current_page: 1,
        total_pages: 0,
        total_count: 0,
        per_page: itemsPerPage,
      });
      return;
    }

    // Filter users by search term
    let filteredUsers = allUsers;
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filteredUsers = allUsers.filter((user: any) => {
        const name = user.attributes?.name?.toLowerCase() || "";
        const email = user.attributes?.email?.toLowerCase() || "";
        const organization = user.attributes?.organization?.toLowerCase() || "";
        const phoneNumber = user.attributes?.phone_number?.toLowerCase() || "";

        return (
          name.includes(searchLower) ||
          email.includes(searchLower) ||
          organization.includes(searchLower) ||
          phoneNumber.includes(searchLower)
        );
      });
    }

    // Paginate filtered users
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    setUsers(paginatedUsers);
    setPagination({
      current_page: currentPage,
      total_pages: Math.ceil(filteredUsers.length / itemsPerPage),
      total_count: filteredUsers.length,
      per_page: itemsPerPage,
    });
  }, [allUsers, debouncedSearchTerm, currentPage]);

  const fetchUsers = async (id: string, areaId: string | number) => {
    setLoadingUsers(true);
    try {
      // Use getCheckOuts the same way as GateOnboarding.tsx
      const response = await getCheckOuts(id, areaId);

      // Handle JSON:API response structure (same as GateOnboarding.tsx)
      const users = response?.data?.data || [];
      setAllUsers(users); // Store all users
      setCurrentPage(1); // Reset to first page when fetching new data
    } catch (error) {
      console.error("Error fetching users who need to check out:", error);
      showNotification("Failed to load users", "error");
      setAllUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };


  return (
    <div className="bg-white min-h-screen p-6">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      <div className="max-w-8xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Registered Users</h1>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">Total</h1>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                {pagination?.total_count || allUsers.length} Users
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Session Area:</label>
            <select
              value={sessionAreaId ?? ""}
              onChange={(e) => {
                const selectedId = e.target.value;
                setSessionAreaId(selectedId ? selectedId : null);
                setCurrentPage(1); // Reset to first page when changing session area
              }}
              disabled={loadingAreas || sessionAreas.length === 0}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingAreas ? (
                <option value="">Loading session areas...</option>
              ) : sessionAreas.length === 0 ? (
                <option value="">No session areas available</option>
              ) : (
                <>
                  {sessionAreas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.attributes?.name || `Area ${area.id}`}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>


        <div className="flex justify-between mb-4">
          <div className="relative w-1/3">
            <Search
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
              }}
              placeholder="Search users..."
            />
          </div>
          <div>
            <span className="text-gray-600 text-sm">
              {loadingUsers ? (
                <>Loading...</>
              ) : pagination ? (
                pagination.total_count > 0 ? (
                  <>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, pagination.total_count)}{" "}
                    of {pagination.total_count} users
                  </>
                ) : (
                  <>0 users</>
                )
              ) : (
                <>0 users</>
              )}
            </span>
          </div>
        </div>

        {/* Table */}
        {loadingAreas ? (
          <div className="border border-gray-200 rounded-lg p-12 text-center">
            <div className="text-gray-500 text-lg">Loading session areas...</div>
          </div>
        ) : !sessionAreaId ? (
          <div className="border border-gray-200 rounded-lg p-12 text-center">
            <div className="text-gray-500 text-lg">No session areas available</div>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {loadingUsers ? (
            <div className="p-6">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <Skeleton className="h-4 w-12" />
                    </th>
                    <th className="px-6 py-3 text-left">
                      <Skeleton className="h-4 w-20" />
                    </th>
                    <th className="px-6 py-3 text-left">
                      <Skeleton className="h-4 w-24" />
                    </th>
                    <th className="px-6 py-3 text-left">
                      <Skeleton className="h-4 w-28" />
                    </th>
                    <th className="px-6 py-3 text-left">
                      <Skeleton className="h-4 w-20" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-12" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {eventUsers.length === 0 && !loadingUsers ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-16 text-center"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <svg
                            className="w-16 h-16 text-gray-400 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <p className="text-lg font-medium text-gray-900 mb-1">
                            {debouncedSearchTerm
                              ? `No users found matching "${debouncedSearchTerm}"`
                              : "No users found"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {debouncedSearchTerm
                              ? "Try adjusting your search criteria"
                              : "There are no users to display at this time"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    eventUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {user.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={user} />
                            <span className="text-sm font-medium text-gray-900">
                              {user?.attributes?.name || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user?.attributes?.email || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user?.attributes?.user_type || "Guest"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Checked In
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {pagination && pagination.total_pages > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.total_pages || 1}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="m-2"
                />
              )}
            </>
          )}
          </div>
        )}
      </div>

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
    </div>
  );
}

export default CheckOut;
