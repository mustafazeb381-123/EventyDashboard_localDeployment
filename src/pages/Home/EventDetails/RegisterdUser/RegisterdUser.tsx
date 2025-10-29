import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { deleteEventUser } from "@/apis/apiHelpers";
import { updateEventUser } from "@/apis/apiHelpers";
import { sendCredentials } from "@/apis/apiHelpers";
import { downloadEventUserTemplate } from "@/apis/apiHelpers";
import { uploadEventUserTemplate } from "@/apis/apiHelpers";
import { getEventUsers } from "@/apis/apiHelpers";
import { Trash2, Mail, Plus, Edit, Search } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function RegisterdUser() {
  const location = useLocation();
  const [eventId, setEventId] = useState<string | null>(null);
  console.log("event id-----++++++++-------", eventId);
  const [eventUsers, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // adjust as needed

  const filteredUsers = eventUsers.filter((user) =>
    user.attributes.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sendingCredentials, setSendingCredentials] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);

  // Store event user length in localStorage whenever eventUsers changes
  useEffect(() => {
    if (eventId) {
      const storageKey = `eventUsersLength_${eventId}`;
      localStorage.setItem(storageKey, eventUsers.length?.toString());
    }
  }, [eventUsers, eventId]);

  const getPaginationNumbers = () => {
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const [editForm, setEditForm] = useState({
    image: "",
    name: "",
    email: "",
    organization: "",
    user_type: "",
  });

  const handleDownloadTemplate = async () => {
    if (!eventId) return;

    setDownloadingTemplate(true); // start loader

    try {
      const response = await downloadEventUserTemplate(eventId);
      console.log("Template response:", response);

      const blob = response.data;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "event_users_template.xlsx");
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Template downloaded successfully!");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template.");
    } finally {
      setDownloadingTemplate(false); // stop loader
    }
  };

  const handleUploadTemplate = async () => {
    if (!uploadFile) return toast.error("Please select a file!");
    if (!eventId) return toast.error("Event ID is required!");

    setUploadingTemplate(true); // start loader

    try {
      const response = await uploadEventUserTemplate(eventId, uploadFile);
      console.log("Import response:", response.data);
      toast.success("Users imported successfully!");

      fetchUsers(eventId); // refresh user list

      // Reset uploadFile so the submit button disappears
      setUploadFile(null);

      // Close modal
      setIsImportModalOpen(false);
    } catch (err: any) {
      console.error("Error importing users:", err);

      if (err.response) {
        console.error("Server response data:", err.response.data);
        toast.error(
          `Import failed: ${err.response.data?.message || "Validation error"}`
        );
      } else {
        toast.error("Failed to import users. Check the file and try again.");
      }
    } finally {
      setUploadingTemplate(false); // stop loader
    }
  };

  const handleSendCredentials = async (userIds?: string[]) => {
    const idsToSend = userIds || selectedUsers;

    if (!eventId || idsToSend.length === 0) return;

    setSendingCredentials(true);

    try {
      const response = await sendCredentials(eventId, idsToSend);
      console.log("API response:", response.data);
      toast.success("Credentials sent successfully!");
      setSelectedUsers([]);
    } catch (err) {
      console.error("Error sending credentials:", err);
      toast.error("Failed to send credentials. Please try again.");
    } finally {
      setSendingCredentials(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!eventId || !editingUser) return;

    setIsUpdating(true); // start loading

    try {
      const formData = new FormData();

      // Append user fields
      if (editForm.name) formData.append("event_user[name]", editForm.name);
      if (editForm.phone_number)
        formData.append("event_user[phone_number]", editForm.phone_number);
      if (editForm.email) formData.append("event_user[email]", editForm.email);
      if (editForm.position)
        formData.append("event_user[position]", editForm.position);
      if (editForm.organization)
        formData.append("event_user[organization]", editForm.organization);

      // Append image if provided
      if (selectedImageFile)
        formData.append("event_user[image]", selectedImageFile);

      const response = await updateEventUser(eventId, editingUser.id, formData);

      // Get updated user from API if returned
      const updatedUser = response?.data?.data;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                attributes: {
                  ...u.attributes,
                  ...editForm, // only text fields
                  image: updatedUser?.attributes?.image
                    ? `${updatedUser.attributes.image}?t=${Date.now()}`
                    : u.attributes.image, // only update for this user
                  updated_at: new Date().toISOString(),
                },
              }
            : u
        )
      );

      toast.success("User updated successfully!");
      setEditingUser(null);
      setSelectedImageFile(null); // reset file input
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user. Please try again.");
    } finally {
      setIsUpdating(false); // stop loading
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const idFromQuery = searchParams.get("eventId");
    setEventId(idFromQuery);

    if (idFromQuery) {
      console.log("id from-------", idFromQuery);
      fetchUsers(idFromQuery);
    }
  }, [location.search]);

  const fetchUsers = async (id: string) => {
    console.log("idddddddd", id);
    setLoadingUsers(true); // start loader
    try {
      setLoadingUsers(true);
      const response = await getEventUsers(id);
      console.log("get event users:", response.data);

      // adjust depending on backend shape
      const users = response.data.data || response.data || [];
      setUsers(users);
    } catch (error) {
      console.error("Error fetching event users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    const formattedDate = date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return (
      <>
        {formattedDate}
        <br />
        {formattedTime}
      </>
    );
  };

  const handleDeleteUser = async (user: any) => {
    // Add detailed logging to debug
    console.log("Current eventId:", eventId);
    console.log("User to delete:", user);

    if (!eventId) {
      alert("Error: Event ID is missing. Cannot delete user.");
      console.error("Event ID is null or undefined");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      console.log("Deleting user with:", {
        eventId,
        userId: user.id,
        apiCall: `/events/${eventId}/event_users/${user.id}`,
      });

      await deleteEventUser(eventId, user.id);

      // Remove user from local state
      setUsers((prev) => prev.filter((u) => u.id !== user.id));

      toast.success("User deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting user:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        requestUrl: error.config?.url,
      });

      toast.error(
        `Failed to delete user: ${error.response?.data?.error || error.message}`
      );
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(eventUsers.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const UserAvatar = ({ user }: { user: any }) => {
    const imageUrl = user?.attributes?.image; // use image from attributes

    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={user?.attributes?.name || "User Avatar"}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }

    return (
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-blue-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  };

  const handleResetCheckInOut = async (userId: string) => {
    if (!eventId) return toast.error("Event ID is missing.");

    if (
      !window.confirm(
        "Are you sure you want to reset this user's check-in/out status?"
      )
    )
      return;

    try {
      const response = await resetCheckInOutStatus(eventId, userId);
      console.log("Reset response:", response.data);

      toast.success("Check-in/out status reset successfully!");
    } catch (error: any) {
      console.error("Error resetting status:", error);
      toast.error("Failed to reset check-in/out status.");
    }
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="max-w-8xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Registered Users</h1>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">Total</h1>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
              {eventUsers.length} Users
            </span>
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Import Attendees
          </button>

          {isImportModalOpen && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
              onClick={() => setIsImportModalOpen(false)} // Close on outside click
            >
              <div
                className="bg-white p-6 rounded-lg w-96"
                onClick={(e) => e.stopPropagation()} // Prevent modal content clicks from closing
              >
                <h2 className="text-xl font-bold mb-4 text-center">
                  Import Attendees
                </h2>

                {/* Download Template */}
                <button
                  onClick={handleDownloadTemplate}
                  className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full flex justify-center items-center gap-2 disabled:opacity-50"
                  disabled={downloadingTemplate}
                >
                  {downloadingTemplate ? "...Downloading" : "Download Template"}
                </button>

                {/* File Upload */}
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-sm border border-gray-300 rounded-lg py-2 px-3 transition-colors text-gray-500 bg-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer mb-4"
                />

                {/* Submit Button (only show if file is selected) */}

                <button
                  onClick={handleUploadTemplate}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={uploadingTemplate} // disable while uploading
                >
                  {uploadingTemplate ? "...Uploading" : "Submit"}
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedUsers.length > 0 && (
          <div className="flex items-center justify-between mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-700 font-medium">
              {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""}{" "}
              selected
            </p>

            <button
              onClick={() => handleSendCredentials()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              disabled={sendingCredentials} // disable while sending
            >
              <Mail className="w-4 h-4" />
              {sendingCredentials ? "...Sending" : "Send Credentials"}
            </button>
          </div>
        )}

        <div className="flex justify-between mb-4">
          <div className="relative w-1/3">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <span className="text-gray-600 text-sm">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          {loadingUsers ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm">Loading users...</p>
            </div>
          ) : (
            <>
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        onChange={handleSelectAll}
                        checked={
                          eventUsers.length > 0 &&
                          selectedUsers.length === eventUsers.length
                        }
                      />
                    </th>
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
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {paginatedUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {user.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} />
                          <span className="text-sm font-medium text-gray-900">
                            {user?.attributes?.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user?.attributes?.email}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user?.attributes?.organization}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user?.attributes?.user_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(user?.attributes?.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(user?.attributes?.updated_at)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResetCheckInOut(user.id)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setEditForm({
                                name: user?.attributes?.name || "",
                                email: user?.attributes?.email || "",
                                organization:
                                  user?.attributes?.organization || "",
                                image: user?.attributes?.image || "",
                                user_type: user?.attributes?.user_type || "",
                              });
                            }}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleSendCredentials([user.id])}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Previous
                  </button>
                  {getPaginationNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        page === currentPage
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}

          {editingUser && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
              onClick={() => setEditingUser(null)} // Click outside closes
            >
              <div
                className="bg-white p-6 rounded-lg w-96"
                onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing
              >
                <h2 className="text-xl font-bold mb-4">Edit User</h2>

                <div className="relative w-24 h-24 mb-4 mx-auto">
                  {/* Avatar */}
                  {selectedImageFile ? (
                    <img
                      src={URL.createObjectURL(selectedImageFile)}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover mx-auto"
                    />
                  ) : editingUser.attributes.image ? (
                    <img
                      src={editingUser.attributes.image}
                      alt="Current"
                      className="w-24 h-24 rounded-full object-cover mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                      <svg
                        className="w-12 h-12 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Edit Icon */}
                  <label
                    htmlFor="imageUpload"
                    className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 text-yellow-500" />
                  </label>

                  {/* Hidden File Input */}
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedImageFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>

                {/* Inputs */}
                <input
                  type="text"
                  placeholder="Name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full mb-2 p-2 border rounded"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full mb-2 p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Organization"
                  value={editForm.organization}
                  onChange={(e) =>
                    setEditForm({ ...editForm, organization: e.target.value })
                  }
                  className="w-full mb-2 p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="User Type"
                  value={editForm.user_type}
                  onChange={(e) =>
                    setEditForm({ ...editForm, user_type: e.target.value })
                  }
                  className="w-full mb-4 p-2 border rounded"
                />

                <button
                  onClick={handleUpdateUser}
                  disabled={isUpdating}
                  className={`w-full px-4 py-2 rounded text-white ${
                    isUpdating
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isUpdating ? "...Updating" : "Update"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegisterdUser;
