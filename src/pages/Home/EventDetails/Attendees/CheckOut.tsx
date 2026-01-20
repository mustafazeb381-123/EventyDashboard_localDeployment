import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getCheckOuts } from "@/apis/apiHelpers";
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
  const [eventUsers, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const itemsPerPage = 10;
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

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

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users when eventId, currentPage, or search term changes
  useEffect(() => {
    if (eventId && currentPage > 0) {
      if (debouncedSearchTerm) {
        searchUsersAcrossPages(eventId, debouncedSearchTerm);
      } else {
        fetchUsers(eventId, currentPage);
      }
    }
  }, [eventId, currentPage, debouncedSearchTerm]);

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

  const fetchUsers = async (id: string, page: number = 1) => {
    setLoadingUsers(true);
    setIsSearching(false);
    try {
      const response = await getCheckOuts(id, {
        page,
        per_page: itemsPerPage,
      });

      // Handle JSON:API response structure
      const responseData = response.data?.data || response.data;
      const users = Array.isArray(responseData)
        ? responseData
        : responseData?.data || [];

      setUsers(users);

      // Set pagination metadata
      const paginationMeta =
        response.data?.meta?.pagination || response.data?.pagination;
      if (paginationMeta) {
        setPagination(paginationMeta);
      }
    } catch (error) {
      console.error("Error fetching users who need to check out:", error);
      showNotification("Failed to load users", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Search users across all pages
  const searchUsersAcrossPages = async (id: string, searchQuery: string) => {
    setLoadingUsers(true);
    setIsSearching(true);
    try {
      // First, get the first page to know total pages
      const firstPageResponse = await getCheckOuts(id, {
        page: 1,
        per_page: itemsPerPage,
      });

      const paginationMeta =
        firstPageResponse.data?.meta?.pagination ||
        firstPageResponse.data?.pagination;
      const totalPages = paginationMeta?.total_pages || 1;

      // Search through all pages
      const allMatchingUsers: any[] = [];
      const searchLower = searchQuery.toLowerCase();

      // Fetch all pages and filter
      const pagePromises = [];
      for (let page = 1; page <= totalPages; page++) {
        pagePromises.push(
          getCheckOuts(id, {
            page,
            per_page: itemsPerPage,
          })
        );
      }

      const allPagesResponses = await Promise.all(pagePromises);

      // Filter users from all pages
      allPagesResponses.forEach((response) => {
        const responseData = response.data?.data || response.data;
        const users = Array.isArray(responseData)
          ? responseData
          : responseData?.data || [];

        const matchingUsers = users.filter((user: any) => {
          const name = user.attributes?.name?.toLowerCase() || "";
          const email = user.attributes?.email?.toLowerCase() || "";
          const organization =
            user.attributes?.organization?.toLowerCase() || "";
          const phoneNumber =
            user.attributes?.phone_number?.toLowerCase() || "";

          const matchesSearch =
            name.includes(searchLower) ||
            email.includes(searchLower) ||
            organization.includes(searchLower) ||
            phoneNumber.includes(searchLower);

          return matchesSearch;
        });

        allMatchingUsers.push(...matchingUsers);
      });

      // Paginate the search results
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedResults = allMatchingUsers.slice(startIndex, endIndex);

      setUsers(paginatedResults);

      // Set pagination metadata for search results
      setPagination({
        current_page: currentPage,
        total_pages: Math.ceil(allMatchingUsers.length / itemsPerPage),
        total_count: allMatchingUsers.length,
        per_page: itemsPerPage,
        next_page:
          currentPage < Math.ceil(allMatchingUsers.length / itemsPerPage)
            ? currentPage + 1
            : null,
        prev_page: currentPage > 1 ? currentPage - 1 : null,
      });
    } catch (error) {
      console.error("Error searching users:", error);
      showNotification("Failed to search users", "error");
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
                {pagination?.total_count || eventUsers.length} Users
              </span>
            </div>
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
              {pagination ? (
                <>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, pagination.total_count)}{" "}
                  of {pagination.total_count} users
                </>
              ) : (
                <>Loading...</>
              )}
            </span>
          </div>
        </div>

        {/* Table */}
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
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        {isSearching && debouncedSearchTerm
                          ? `No users found matching "${debouncedSearchTerm}"`
                          : "No users found"}
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

              {pagination && (
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
