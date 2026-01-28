import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  Plus,
  X,
  ChevronDown,
  Mail,
  Search,
  Users as UsersIcon,
  Upload,
} from "lucide-react";
import { getEventUsers, createEventUser, getEventbyId, sendCredentials, getBadgeType } from "@/apis/apiHelpers";
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
    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
      {getUserInitial(user)}
    </div>
  );
};

function Users() {
  const location = useLocation();
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [badges, setBadges] = useState<any[]>([]); // Store ALL badges for dynamic dropdown
  const [loadingBadges, setLoadingBadges] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventId, setEventId] = useState<string | null>(null);
  const [actualEventId, setActualEventId] = useState<string | null>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [pagination, setPagination] = useState<any>(null);
  const [sendingCredentialsUserId, setSendingCredentialsUserId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Add User Form State
  const [addUserForm, setAddUserForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    organization: "",
    position: "",
    user_type: "",
    title: "",
    age: "",
    city: "",
    country: "",
    id_number: "",
    passport_number: "",
    blood_type: "",
    gender: "",
    seat_row: "",
    seat_column: "",
    password: "",
    password_confirmation: "",
    device_token: "",
    image: null as File | null,
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

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

  const showNotification = (message: string, type: "success" | "error" | "info") => {
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
      // Try to get from localStorage as fallback
      const storedEventId =
        localStorage.getItem("create_eventId") ||
        localStorage.getItem("edit_eventId");
      if (storedEventId) {
        setEventId(storedEventId);
      }
    }
  }, [location.search, eventId]);

  // Fetch event data to get the actual event ID (optional - fallback to eventId if it fails)
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

  // Fetch users when we have an eventId (use actualEventId if available, otherwise use eventId)
  useEffect(() => {
    const idToUse = actualEventId || eventId;
    if (idToUse && currentPage > 0) {
      fetchUsers(idToUse, currentPage);
    }
  }, [actualEventId, eventId, currentPage]);

  const fetchEventData = async (id: string) => {
    try {
      const response = await getEventbyId(id);
      console.log("Event data response:", response.data);
      
      // Extract the actual event ID from the API response
      const actualId = response?.data?.data?.id;
      if (actualId) {
        setActualEventId(String(actualId));
        setEventData(response.data);
        console.log("✅ Using actual event ID from API:", actualId);
      } else {
        // Fallback: use the original eventId if no actual ID found
        console.warn("⚠️ No event ID found in API response, using original eventId:", id);
        setActualEventId(null); // Will fallback to eventId
      }
    } catch (error: any) {
      console.warn("⚠️ Error fetching event data, will use original eventId:", error);
      // Don't show error - just fallback to using eventId directly
      setActualEventId(null); // Will fallback to eventId
    }
  };

  const fetchBadges = async (id: string) => {
    if (!id) return;

    setLoadingBadges(true);
    try {
      console.log("Fetching badges for event ID:", id);

      const response = await getBadgeType(id);

      console.log("Badges API Response in invitation users", response);

      const result = response.data;
      console.log("✅ Raw badges fetched:", result?.data);
      console.log("✅ All badge names:", result?.data?.map((b: any) => b?.attributes?.name));
      console.log("✅ All badge default values:", result?.data?.map((b: any) => ({
        id: b.id,
        name: b?.attributes?.name,
        default: b?.attributes?.default
      })));

      // Store ALL badges (both default and non-default) so we can check which ones are default
      // This is needed to exclude users with default badge types
      if (result?.data && Array.isArray(result.data)) {
        setBadges(result.data);
        console.log("✅ All badges stored (including default ones):", result.data);
      } else {
        setBadges([]);
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);
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

      // Show all users (both normal and VIP)
      setUsers(allUsers);

      // Set pagination metadata
      const paginationMeta =
        response.data?.meta?.pagination || response.data?.pagination;
      if (paginationMeta) {
        setPagination(paginationMeta);
      }
    } catch (error) {
      console.error("Error fetching event users:", error);
      // Set empty state when API fails
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
    console.log("🔵 Default badge names (will be excluded):", Array.from(defaultNames));
    return defaultNames;
  }, [badges]);

  // Filter users by type, badge, and search term
  // IMPORTANT: Exclude users whose user_type matches a badge with default: true
  const filteredUsers = users.filter((user: any) => {
    const userType = (user?.attributes?.user_type || "").toLowerCase();

    // GLOBAL EXCLUSION: If the user's type matches any badge marked as default: true,
    // then this user should NOT be displayed in the invitation list
    if (defaultBadgeNames.has(userType)) {
      console.log(`❌ Excluding user ${user.id} (${user?.attributes?.name}) - user_type "${userType}" matches default badge`);
      return false;
    }

    // Filter by type (using badge names from API)
    if (filterType !== "all") {
      if (userType !== filterType.toLowerCase()) {
        return false;
      }
    }

    // Filter by search term
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSendInvitation = async (userIds?: string[]) => {
    const idToUse = actualEventId || eventId;
    if (!idToUse) {
      showNotification("Event ID is missing. Cannot send invitation.", "error");
      return;
    }

    const idsToSend: string[] = userIds || Array.from(selectedUsers).map(id => String(id));
    if (idsToSend.length === 0) {
      showNotification("Please select at least one user to send invitation.", "error");
      return;
    }

    // Track which user(s) are sending invitations
    const isSingleUser = userIds && userIds.length === 1;
    if (isSingleUser) {
      setSendingCredentialsUserId(userIds[0]);
    }

    try {
      const response = await sendCredentials(String(idToUse), idsToSend);
      console.log("Invitation sent response:", response.data);

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
      console.error("Error sending invitation:", err);
      const errorMessage = 
        err?.response?.data?.message || 
        err?.response?.data?.error ||
        err?.message ||
        "Failed to send invitation. Please try again.";

      if (isSingleUser) {
        showNotification("Failed to send invitation to user. Please try again.", "error");
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

  const handleCreateUser = async () => {
    // Use actualEventId if available, otherwise fallback to eventId
    const idToUse = actualEventId || eventId;
    
    if (!idToUse) {
      showNotification("Event ID is missing. Cannot create user.", "error");
      console.error("❌ Event ID validation failed:", { 
        eventId, 
        actualEventId, 
        eventData,
        location: location.search 
      });
      return;
    }

    // Validate required fields
    if (!addUserForm.name || !addUserForm.email) {
      showNotification("Name and Email are required fields", "error");
      return;
    }

    setIsCreatingUser(true);

    // Use the event ID (actualEventId preferred, fallback to eventId)
    const validEventId = String(idToUse).trim();
    if (!validEventId) {
      showNotification("Invalid Event ID", "error");
      setIsCreatingUser(false);
      return;
    }

    try {
      const formData = new FormData();

      // Append tenant_uuid if available (for multi-tenancy)
      const tenantUuid = localStorage.getItem("tenant_uuid");
      if (tenantUuid) {
        formData.append("tenant_uuid", tenantUuid);
        console.log("✅ Including tenant_uuid:", tenantUuid);
      }

      // Append required fields
      formData.append("event_user[name]", addUserForm.name);
      formData.append("event_user[email]", addUserForm.email);

      // Append optional fields
      if (addUserForm.phone_number)
        formData.append("event_user[phone_number]", addUserForm.phone_number);
      if (addUserForm.organization)
        formData.append("event_user[organization]", addUserForm.organization);
      if (addUserForm.position)
        formData.append("event_user[position]", addUserForm.position);
      if (addUserForm.user_type)
        formData.append("event_user[user_type]", addUserForm.user_type);
      if (addUserForm.title)
        formData.append("event_user[title]", addUserForm.title);
      if (addUserForm.age)
        formData.append("event_user[age]", addUserForm.age);
      if (addUserForm.city)
        formData.append("event_user[city]", addUserForm.city);
      if (addUserForm.country)
        formData.append("event_user[country]", addUserForm.country);
      if (addUserForm.id_number)
        formData.append("event_user[id_number]", addUserForm.id_number);
      if (addUserForm.passport_number)
        formData.append("event_user[passport_number]", addUserForm.passport_number);
      if (addUserForm.blood_type)
        formData.append("event_user[blood_type]", addUserForm.blood_type);
      if (addUserForm.gender)
        formData.append("event_user[gender]", addUserForm.gender);
      if (addUserForm.seat_row)
        formData.append("event_user[seat_row]", addUserForm.seat_row);
      if (addUserForm.seat_column)
        formData.append("event_user[seat_column]", addUserForm.seat_column);
      if (addUserForm.password)
        formData.append("event_user[password]", addUserForm.password);
      if (addUserForm.password_confirmation)
        formData.append("event_user[password_confirmation]", addUserForm.password_confirmation);
      if (addUserForm.device_token)
        formData.append("event_user[device_token]", addUserForm.device_token);

      // Append image if provided
      if (addUserForm.image) {
        formData.append("event_user[image]", addUserForm.image);
      }

      // Debug: Log form data
      console.log("📤 Creating user with:", {
        eventId: validEventId,
        eventIdType: typeof validEventId,
        endpoint: `/events/${validEventId}/event_users`,
        fullUrl: `https://scceventy.dev/en/api_dashboard/v1/events/${validEventId}/event_users`,
        hasToken: !!localStorage.getItem("token"),
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
          key,
          value: value instanceof File ? `File: ${value.name} (${(value.size / 1024).toFixed(2)}KB)` : value
        }))
      });

      // Log each form data entry for debugging
      for (const [key, value] of formData.entries()) {
        console.log(`FormData[${key}]:`, value instanceof File ? `File: ${value.name}` : value);
      }

      const response = await createEventUser(validEventId, formData);
      console.log("✅ Create user response:", response.data);

      showNotification("User created successfully!", "success");
      setShowAddUserModal(false);
      
      // Reset form
      setAddUserForm({
        name: "",
        email: "",
        phone_number: "",
        organization: "",
        position: "",
        user_type: "",
        title: "",
        age: "",
        city: "",
        country: "",
        id_number: "",
        passport_number: "",
        blood_type: "",
        gender: "",
        seat_row: "",
        seat_column: "",
        password: "",
        password_confirmation: "",
        device_token: "",
        image: null,
      });

      // Refresh user list
      const idToRefresh = actualEventId || eventId;
      if (idToRefresh) {
        fetchUsers(String(idToRefresh), currentPage);
      }
    } catch (error: any) {
      console.error("❌ Error creating user:", error);
      console.error("Error details:", {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        url: error?.config?.url,
        method: error?.config?.method,
        eventId: eventId,
      });

      const errorMessage = 
        error?.response?.data?.message || 
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create user. Please try again.";

      showNotification(errorMessage, "error");
    } finally {
      setIsCreatingUser(false);
    }
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
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((user: any) => user.id)));
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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Invitation Users
                </h1>
                <p className="text-gray-600 mt-1">
                  {pagination?.total_count || users.length} total users • {selectedUsers.size} selected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700
                 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-green-600/25 
                 hover:shadow-xl hover:shadow-green-600/30 transition-all
                  duration-200 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Plus size={18} />
                Add User
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 mb-6 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to page 1 when search changes
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1); // Reset to page 1 when filter changes
                  }}
                  disabled={loadingBadges}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none bg-white pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={20}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-200/60">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedUsers.size === users.length && users.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {loadingUsers ? (
                    // Skeleton Loader
                    Array.from({ length: 10 }).map((_, index) => (
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <Skeleton className="w-4 h-4 rounded" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-12" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex flex-col gap-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-40" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Skeleton className="w-4 h-4 rounded" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Skeleton className="w-8 h-8 rounded-lg" />
                            <Skeleton className="w-8 h-8 rounded-lg" />
                            <Skeleton className="w-8 h-8 rounded-lg" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        {searchTerm.trim() !== "" && filterType !== "all"
                          ? `No users found matching "${searchTerm}" with type "${filterType}"`
                          : searchTerm.trim() !== ""
                          ? `No users found matching "${searchTerm}"`
                          : filterType !== "all"
                          ? `No users found with type "${filterType}"`
                          : "No users found"}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50/50 transition-colors group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedUsers.has(user.id)}
                            onChange={() => handleUserSelect(user.id)}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          #{user.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={user} />
                            <div>
                              <div className="font-medium text-gray-900">
                                {user?.attributes?.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user?.attributes?.email || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Mail size={16} className="text-blue-500" />
                            <span className="text-sm text-gray-700 capitalize">
                              {user?.attributes?.user_type || "User"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(user?.attributes?.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                            <div className="w-2 h-2 rounded-full mr-2 bg-emerald-500"></div>
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSendInvitation([user.id])}
                              disabled={sendingCredentialsUserId === user.id}
                              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                sendingCredentialsUserId === user.id
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-blue-600 text-white hover:bg-blue-700"
                              }`}
                            >
                              {sendingCredentialsUserId === user.id ? (
                                <span className="flex items-center gap-2">
                                  <div
                                    style={{
                                      width: "14px",
                                      height: "14px",
                                      border: "2px solid #d1d5db",
                                      borderTop: "2px solid #9333ea",
                                      borderRadius: "50%",
                                      animation: "spin 1s linear infinite",
                                    }}
                                  />
                                  Sending...
                                </span>
                              ) : (
                                "Invitation"
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end px-6 py-4 bg-gray-50/50 border-t border-gray-200/60">
              {pagination && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.total_pages || 1}
                  onPageChange={handlePageChange}
                  className=""
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div
          onClick={() => !isCreatingUser && setShowAddUserModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200/60 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
                <p className="text-gray-600 mt-1">Create a new user for this event</p>
              </div>
              <button
                onClick={() => !isCreatingUser && setShowAddUserModal(false)}
                disabled={isCreatingUser}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Required Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={addUserForm.name}
                    onChange={(e) =>
                      setAddUserForm({ ...addUserForm, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={addUserForm.email}
                    onChange={(e) =>
                      setAddUserForm({ ...addUserForm, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1234567890"
                    value={addUserForm.phone_number}
                    onChange={(e) =>
                      setAddUserForm({ ...addUserForm, phone_number: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Organization
                  </label>
                  <input
                    type="text"
                    placeholder="Organization Name"
                    value={addUserForm.organization}
                    onChange={(e) =>
                      setAddUserForm({ ...addUserForm, organization: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={addUserForm.position}
                    onChange={(e) =>
                      setAddUserForm({ ...addUserForm, position: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    User Type
                  </label>
                  <select
                    value={addUserForm.user_type}
                    onChange={(e) =>
                      setAddUserForm({ ...addUserForm, user_type: e.target.value })
                    }
                    disabled={loadingBadges}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select user type</option>
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
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="City"
                    value={addUserForm.city}
                    onChange={(e) =>
                      setAddUserForm({ ...addUserForm, city: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    placeholder="Country"
                    value={addUserForm.country}
                    onChange={(e) =>
                      setAddUserForm({ ...addUserForm, country: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Profile Image
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <Upload size={18} className="text-gray-600" />
                    <span className="text-sm text-gray-700">
                      {addUserForm.image ? addUserForm.image.name : "Choose Image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAddUserForm({ ...addUserForm, image: e.target.files[0] });
                        }
                      }}
                    />
                  </label>
                  {addUserForm.image && (
                    <button
                      onClick={() => setAddUserForm({ ...addUserForm, image: null })}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200/60 sticky bottom-0 bg-white">
              <button
                onClick={() => !isCreatingUser && setShowAddUserModal(false)}
                disabled={isCreatingUser}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={isCreatingUser || !addUserForm.name || !addUserForm.email}
                className={`flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isCreatingUser ? "animate-pulse" : ""
                }`}
              >
                {isCreatingUser ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Create User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export default Users;
