import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getEventUsers } from "@/apis/apiHelpers";
import { deleteEventUser } from "@/apis/apiHelpers";
import { updateEventUser } from "@/apis/apiHelpers";

import { Trash2, Mail, Eye, EyeOff, Plus } from "lucide-react";

function RegisterdUser() {

  const location = useLocation();
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventUsers, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
  });

  const handleUpdateUser = async () => {
    if (!eventId || !editingUser) return;

    try {
      console.log("Updating user payload:", {
        eventId,
        userId: editingUser.id,
        data: editForm,
      });

      await updateEventUser(eventId, editingUser.id, editForm);

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
              ...u,
              attributes: {
                ...u.attributes,
                name: editForm.name, // update the name you edited
                updated_at: new Date().toISOString(), // update the updated_at timestamp
              },
            }
            : u
        )
      );


      alert("User updated successfully!");
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please try again.");
    }
  };


  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const idFromQuery = searchParams.get("eventId");
    setEventId(idFromQuery);

    if (idFromQuery) {
      fetchUsers(idFromQuery);
    }
  }, [location.search]);

  const fetchUsers = async (id: string) => {
    try {
      setLoading(true);
      const response = await getEventUsers(id);
      console.log("Fetched users:", response.data);

      // adjust depending on backend shape
      const users = response.data.data || response.data || [];
      setUsers(users);
    } catch (error) {
      console.error("Error fetching event users:", error);
    } finally {
      setLoading(false);
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
        apiCall: `/events/${eventId}/event_users/${user.id}`
      });

      await deleteEventUser(eventId, user.id);

      // Remove user from local state
      setUsers((prev) => prev.filter((u) => u.id !== user.id));

      alert("User deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting user:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        requestUrl: error.config?.url
      });

      alert(`Failed to delete user: ${error.response?.data?.error || error.message}`);
    }
  };


  const [users] = useState([
    {
      id: "01",
      name: "Ethan",
      email: "merom870...",
      password: "************",
      organization: "",
      createdAt: "06/04/2025",
      type: "Type 01",
      avatar: null,
    },
  ]);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showPasswords, setShowPasswords] = useState({});

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map((user) => user.id));
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

  const togglePasswordVisibility = (userId) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
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


  return (
    <div className="bg-white min-h-screen p-6">

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Registered Users</h1>

        {eventId && <p>Event ID: {eventId}</p>}

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <>
            {/* <pre className="bg-gray-100 p-3 rounded mt-3 overflow-x-auto">
              {JSON.stringify(eventUsers, null, 1)}
            </pre> */}
          </>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">Total</h1>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
              {eventUsers.length} Users
            </span>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Import attendance
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">

            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    onChange={handleSelectAll}
                    checked={selectedUsers.length === users.length}
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
                  Password
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {eventUsers.map((user, index) => (
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {showPasswords[user.id] ? "password123" : user.password}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(user.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {showPasswords[user.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user?.attributes?.organization}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(user?.attributes?.created_at)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(user?.attributes?.updated_at)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">

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
                          });
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        Edit
                      </button>

                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Mail className="w-4 h-4" />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {editingUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-xl font-bold mb-4">Edit User</h2>

                <input
                  type="text"
                  placeholder="Name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full mb-2 p-2 border rounded"
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full mb-2 p-2 border rounded"
                />

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default RegisterdUser;
