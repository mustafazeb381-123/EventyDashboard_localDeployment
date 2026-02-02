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
  Eye,
  MoreVertical,
  FileText,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  UserCheck,
  Bold,
  Italic,
  Undo,
  Redo,
  Link,
  Image as ImageIcon,
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
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-semibold text-base">
      {getUserInitial(user)}
    </div>
  );
};

// Email Templates
const templates = [
  {
    id: 1,
    name: "Professional",
    preview: "Template 1",
    backgroundColor: "#ffffff",
  },
  {
    id: 2,
    name: "Colorful",
    preview: "Template 2",
    backgroundColor: "#f0f9ff",
  },
  {
    id: 3,
    name: "Elegant",
    preview: "Template 3",
    backgroundColor: "#fef3c7",
  },
];

function Invitations() {
  const location = useLocation();
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
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
  const [sendingCredentialsUserId, setSendingCredentialsUserId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Invitation Form State
  const [invitationForm, setInvitationForm] = useState({
    invitationName: "",
    communicationType: "Email",
    invitationCategory: "",
    event: "",
    language: "Arabic (العربية)",
    scheduleSendAt: "",
    emailSubject: "",
    backgroundColor: "#ffffff",
  });

  const [headerImagePreview, setHeaderImagePreview] = useState<string | null>(null);
  const [footerImagePreview, setFooterImagePreview] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [footerImage, setFooterImage] = useState<File | null>(null);
  const [isCreatingInvitation, setIsCreatingInvitation] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  
  // Rich text editor state
  const [editorContent, setEditorContent] = useState({
    title: "Join us for our upcoming event!",
    body: "We're excited to invite you to our upcoming event full requirement from 2024-05-12 - 2024-05-20 at 09:01:00 - 18:01:00.",
  });

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
        if (badgeName) {
          defaultNames.add(badgeName);
        }
      }
    });
    return defaultNames;
  }, [badges]);

  // Filter users by type, badge, and search term
  const filteredUsers = users.filter((user: any) => {
    const userType = (user?.attributes?.user_type || "").toLowerCase();

    if (defaultBadgeNames.has(userType)) {
      return false;
    }

    if (filterType !== "all") {
      if (userType !== filterType.toLowerCase()) {
        return false;
      }
    }

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

  // Calculate statistics
  const stats = useMemo(() => {
    const total = users.length;
    const completed = users.filter((u: any) => u?.attributes?.invitation_status === "completed").length;
    const inProgress = users.filter((u: any) => u?.attributes?.invitation_status === "in_progress").length;
    const pending = users.filter((u: any) => !u?.attributes?.invitation_status || u?.attributes?.invitation_status === "pending").length;

    return {
      total,
      completed,
      inProgress,
      pending,
    };
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

    const idsToSend: string[] = userIds || Array.from(selectedUsers).map(id => String(id));
    if (idsToSend.length === 0) {
      showNotification("Please select at least one user to send invitation.", "error");
      return;
    }

    const isSingleUser = userIds && userIds.length === 1;
    if (isSingleUser) {
      setSendingCredentialsUserId(userIds[0]);
    }

    try {
      const response = await sendCredentials(String(idToUse), idsToSend);

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

  const handleCreateInvitation = async () => {
    const idToUse = actualEventId || eventId;
    
    if (!idToUse) {
      showNotification("Event ID is missing. Cannot create invitation.", "error");
      return;
    }

    if (!invitationForm.invitationName || !invitationForm.emailSubject) {
      showNotification("Invitation Name and Email Subject are required", "error");
      return;
    }

    setIsCreatingInvitation(true);

    try {
      const formData = new FormData();

      const tenantUuid = localStorage.getItem("tenant_uuid");
      if (tenantUuid) {
        formData.append("tenant_uuid", tenantUuid);
      }

      // Append invitation fields
      formData.append("invitation[name]", invitationForm.invitationName);
      formData.append("invitation[communication_type]", invitationForm.communicationType);
      formData.append("invitation[category]", invitationForm.invitationCategory);
      formData.append("invitation[language]", invitationForm.language);
      formData.append("invitation[subject]", invitationForm.emailSubject);
      formData.append("invitation[title]", editorContent.title);
      formData.append("invitation[body]", editorContent.body);
      formData.append("invitation[background_color]", invitationForm.backgroundColor);

      if (invitationForm.scheduleSendAt) {
        formData.append("invitation[schedule_send_at]", invitationForm.scheduleSendAt);
      }

      if (bannerImage) {
        formData.append("invitation[banner_image]", bannerImage);
      }

      if (footerImage) {
        formData.append("invitation[footer_image]", footerImage);
      }

      // Replace with your actual API endpoint
      // const response = await createInvitation(validEventId, formData);
      
      console.log("Creating invitation with data:", {
        ...invitationForm,
        editorContent,
        bannerImage: bannerImage?.name,
        footerImage: footerImage?.name,
      });

      showNotification("Invitation preview ready!", "success");
      
      // Don't close modal, just show preview
      // You can add preview logic here
      
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.message || 
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create invitation. Please try again.";

      showNotification(errorMessage, "error");
    } finally {
      setIsCreatingInvitation(false);
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
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((user: any) => user.id)));
    }
  };

  const handleHeaderImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFooterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFooterImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFooterImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const insertVariable = (variable: string) => {
    setEditorContent({
      ...editorContent,
      body: editorContent.body + ` ${variable} `,
    });
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

      <div className="min-h-screen bg-white">
        <div className="px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Invitation Users</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Download size={16} />
                Export CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <FileText size={16} />
                Event Report
              </button>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
              >
                <Plus size={16} />
                Creat New Invitations
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Invitations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-10 disabled:opacity-50 min-w-[150px]"
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
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">USER</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">CHANNEL</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">STATUS</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">TYPE</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">CREATED</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loadingUsers ? (
                    Array.from({ length: 10 }).map((_, index) => (
                      <tr key={index}>
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
                          <Skeleton className="h-6 w-8" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Skeleton className="w-8 h-8 rounded" />
                            <Skeleton className="w-8 h-8 rounded" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
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
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
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
                              <div className="text-sm font-medium text-gray-900">
                                {user?.attributes?.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user?.attributes?.email || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                            <Mail size={16} className="text-blue-600" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></div>
                            Done
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 capitalize">
                            {user?.attributes?.user_type || "Public-9"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(user?.attributes?.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors">
                              <Eye size={16} className="text-gray-600" />
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors">
                              <MoreVertical size={16} className="text-gray-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing 1 to 10 of {pagination?.total_count || filteredUsers.length} invitations
                </div>
                {pagination && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.total_pages || 1}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Invitation Modal */}
      {showAddUserModal && (
        <div
          onClick={() => !isCreatingInvitation && setShowAddUserModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">New Invitation</h2>
            </div>

            <div className="p-8">
              <div className="flex gap-8">
                {/* Main Form */}
                <div className="flex-1 space-y-6">
                  {/* Row 1: Invitation Name & Communication Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Invitation Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Annual Conference 2025"
                        value={invitationForm.invitationName}
                        onChange={(e) =>
                          setInvitationForm({ ...invitationForm, invitationName: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Communication Type
                      </label>
                      <select
                        value={invitationForm.communicationType}
                        onChange={(e) =>
                          setInvitationForm({ ...invitationForm, communicationType: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option>Email</option>
                        <option>SMS</option>
                        <option>WhatsApp</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Invitation Category & Event */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Invitation Category
                      </label>
                      <select
                        value={invitationForm.invitationCategory}
                        onChange={(e) =>
                          setInvitationForm({ ...invitationForm, invitationCategory: e.target.value })
                        }
                        disabled={loadingBadges}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white disabled:opacity-50"
                      >
                        <option value="">Public-9</option>
                        {badges.length > 0 &&
                          badges.map((badge: any) => (
                            <option key={badge.id} value={badge?.attributes?.name || ""}>
                              {badge?.attributes?.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Event
                      </label>
                      <select
                        value={invitationForm.event}
                        onChange={(e) =>
                          setInvitationForm({ ...invitationForm, event: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option>Budget Forum 2026 (ID: 3)</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Invitation Language & Schedule Send At */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Invitation Language
                      </label>
                      <select
                        value={invitationForm.language}
                        onChange={(e) =>
                          setInvitationForm({ ...invitationForm, language: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option>Arabic (العربية)</option>
                        <option>English</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Select the language for invitation links and email content
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Schedule Send At (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={invitationForm.scheduleSendAt}
                        onChange={(e) =>
                          setInvitationForm({ ...invitationForm, scheduleSendAt: e.target.value })
                        }
                        placeholder="mm/dd/yyyy --:--"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty to send immediately
                      </p>
                    </div>
                  </div>

                  {/* Email Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Subject"
                      value={invitationForm.emailSubject}
                      onChange={(e) =>
                        setInvitationForm({ ...invitationForm, emailSubject: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Email Body */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-900">
                        Email Body
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">set template background color</span>
                        <input
                          type="color"
                          value={invitationForm.backgroundColor}
                          onChange={(e) =>
                            setInvitationForm({ ...invitationForm, backgroundColor: e.target.value })
                          }
                          className="w-8 h-8 rounded border border-gray-400 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Email Editor */}
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      {/* Toolbar */}
                      <div className="bg-gray-50 border-b border-gray-300 px-3 py-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                          <button className="hover:text-gray-900">File</button>
                          <button className="hover:text-gray-900">Edit</button>
                          <button className="hover:text-gray-900">View</button>
                          <button className="hover:text-gray-900">Insert</button>
                          <button className="hover:text-gray-900">Format</button>
                          <button className="hover:text-gray-900">Tools</button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => insertVariable("{{first_name}}")}
                            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Add_First_name
                          </button>
                          <button
                            onClick={() => insertVariable("{{last_name}}")}
                            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Add_Last_name
                          </button>
                          <div className="w-px h-4 bg-gray-300"></div>
                          <label className="p-1 hover:bg-gray-200 rounded cursor-pointer">
                            <ImageIcon size={14} />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleHeaderImageChange}
                            />
                          </label>
                          <button className="p-1 hover:bg-gray-200 rounded font-bold">B</button>
                          <button className="p-1 hover:bg-gray-200 rounded italic">I</button>
                          <button className="p-1 hover:bg-gray-200 rounded"><Undo size={14} /></button>
                          <button className="p-1 hover:bg-gray-200 rounded"><Redo size={14} /></button>
                          <button className="p-1 hover:bg-gray-200 rounded bg-blue-500 text-white text-xs px-2">
                            T
                          </button>
                          <button className="p-1 hover:bg-gray-200 rounded">¶</button>
                          <button className="p-1 hover:bg-gray-200 rounded">⚙</button>
                          <button className="p-1 hover:bg-gray-200 rounded">📋</button>
                          <button className="p-1 hover:bg-gray-200 rounded"><Link size={14} /></button>
                        </div>
                      </div>

                      {/* Editor Content */}
                      <div 
                        className="bg-white p-8 min-h-[450px]"
                        style={{ backgroundColor: invitationForm.backgroundColor }}
                      >
                        {/* Header Image */}
                        <div className="w-full max-w-3xl mx-auto mb-6">
                          {headerImagePreview ? (
                            <div className="relative">
                              <img
                                src={headerImagePreview}
                                alt="Header"
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => {
                                  setHeaderImagePreview(null);
                                  setBannerImage(null);
                                }}
                                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <label className="w-full bg-gray-200 rounded-lg flex items-center justify-center py-20 cursor-pointer hover:bg-gray-300 transition-colors">
                              <span className="text-gray-500 text-sm">Change Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleHeaderImageChange}
                              />
                            </label>
                          )}
                        </div>

                        {/* Email Content - Editable */}
                        <div className="w-full max-w-3xl mx-auto space-y-4">
                          <input
                            type="text"
                            value={editorContent.title}
                            onChange={(e) =>
                              setEditorContent({ ...editorContent, title: e.target.value })
                            }
                            className="w-full text-xl font-bold text-center text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                            placeholder="Enter title..."
                          />
                          <textarea
                            value={editorContent.body}
                            onChange={(e) =>
                              setEditorContent({ ...editorContent, body: e.target.value })
                            }
                            className="w-full text-sm text-gray-700 text-center bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 min-h-[100px] resize-none"
                            placeholder="Enter email body..."
                          />
                        </div>

                        {/* Footer Image */}
                        <div className="w-full max-w-3xl mx-auto mt-6">
                          {footerImagePreview ? (
                            <div className="relative">
                              <img
                                src={footerImagePreview}
                                alt="Footer"
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => {
                                  setFooterImagePreview(null);
                                  setFooterImage(null);
                                }}
                                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <label className="w-full bg-gray-200 rounded-lg flex items-center justify-center py-20 cursor-pointer hover:bg-gray-300 transition-colors">
                              <span className="text-gray-500 text-sm">Add Footer Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFooterImageChange}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* File Attachments */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Banner Attachment
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                          Choose File
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setBannerImage(file);
                            }}
                          />
                        </label>
                        <span className="text-sm text-gray-500">
                          {bannerImage ? bannerImage.name : "No file chosen"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Footer Attachment
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                          Choose File
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setFooterImage(file);
                            }}
                          />
                        </label>
                        <span className="text-sm text-gray-500">
                          {footerImage ? footerImage.name : "No file chosen"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Templates Sidebar */}
                <div className="w-32 space-y-3">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Templates:</div>
                  {templates.map((template, index) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplate(index);
                        setInvitationForm({
                          ...invitationForm,
                          backgroundColor: template.backgroundColor,
                        });
                      }}
                      className={`w-full h-20 rounded-lg border-2 transition-all ${
                        selectedTemplate === index
                          ? "border-blue-500 shadow-lg"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: template.backgroundColor }}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-xs text-gray-600">{template.preview}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with Preview Button */}
            <div className="flex items-center justify-end p-6 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={handleCreateInvitation}
                disabled={isCreatingInvitation}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingInvitation ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  "Preview"
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
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export default Invitations;