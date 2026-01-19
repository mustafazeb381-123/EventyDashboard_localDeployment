import { useState, useEffect } from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import {
  createSessionAreaApi,
  getSessionAreaApi,
  deleteSessionAreaApi,
  updateSessionAreaApi,
} from "@/apis/apiHelpers";
import { Area } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export type Area = {
  id: string;
  name: string;
  location: string;
  type: string;
  guestNumbers: number;
};

export type Badge = {
  id: string;
  attributes: {
    name: string;
    default?: boolean;
  };
};

export default function Areas({}) {
  const [data, setData] = useState<Area[]>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editData, setEditData] = useState<Area | null>(null);
  const [newArea, setNewArea] = useState({
    name: "",
    location: "",
    type: "",
    guestNumbers: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    location: "",
    type: "",
    guestNumbers: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState<string | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

  // Notification handler
  const showNotification = (message: string, type: "success" | "error" | "warning" | "info") => {
    setNotification({ message, type });
  };

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const eventId = localStorage.getItem("create_eventId");
  console.log("event id----------+++++-----------------", eventId);

  const fetchBadgeApi = async () => {
    if (!eventId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      setBadgeLoading(true);
      console.log("Fetching badges for event ID:", eventId);

      const response = await fetch(
        `https://scceventy.dev/en/api_dashboard/v1/events/${eventId}/badges`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Badges API Response:", response);

      if (!response.ok) {
        console.error("API Error:", response);
        const errorText = await response.text();
        console.log("Error response:", errorText);
        return;
      }

      const result = await response.json();
      console.log("✅ Badges fetched successfully:", result);
      console.log("✅ Badge names in API:", result?.data?.map((b: Badge) => b.attributes.name));
      
      // Only set badges that are actually in the API response
      if (result?.data && Array.isArray(result.data)) {
        setBadges(result.data);
        console.log("✅ Set badges count:", result.data.length);
      } else {
        // Clear badges if API returns empty or invalid data
        setBadges([]);
        console.log("⚠️ No badges in API response, cleared badges");
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);
    } finally {
      setBadgeLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      // Clear badges before fetching to avoid showing stale data
      setBadges([]);
      fetchBadgeApi();
    } else {
      // Clear badges if no eventId
      setBadges([]);
    }
  }, [eventId]);

  // Fetch session areas on component mount
  useEffect(() => {
    if (eventId) {
      console.log("event id---", eventId);
      fetchSessionAreas();
    }
  }, [eventId]);

  const fetchSessionAreas = async () => {
    if (!eventId) {
      console.log("No event ID found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getSessionAreaApi(eventId);
      console.log("GET API Response:", response);

      if (response?.data?.data) {
        // Transform API response to match our Area type
        const areas: Area[] = response.data.data.map((item: any) => ({
          id: item.id,
          name: item.attributes.name,
          location: item.attributes.location,
          type: item.attributes.user_type,
          guestNumbers: item.attributes.guest_number,
        }));

        setData(areas);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching session areas:", error);
      setError("Failed to fetch session areas");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const AreaData = {
    session_area: {
      name: newArea?.name,
      location: newArea?.location,
      user_type: newArea?.type,
      guest_number: newArea?.guestNumbers,
      event_id: eventId as string,
    },
  };

  const handleAdd = async () => {
    const errors = {
      name: newArea?.name ? "" : "Name is required",
      location: newArea?.location ? "" : "Location is required",
      type: newArea?.type ? "" : "Type is required",
      guestNumbers: newArea?.guestNumbers ? "" : "Guest numbers are required",
    };

    setValidationErrors(errors);
    const hasError = Object.values(errors).some((err) => err !== "");
    if (hasError) {
      console.log("Validation failed");
      showNotification("Please fill all required fields", "error");
      return;
    }

    try {
      if (
        newArea.name &&
        newArea.location &&
        newArea.type &&
        newArea.guestNumbers
      ) {
        setAddLoading(true);
        console.log("event id in areas", eventId);

        const response = await createSessionAreaApi(
          AreaData,
          eventId as string
        );
        console.log("POST API Response:", response);

        if (response?.data) {
          // Transform the new area data to match our Area type
          const newAreaData: Area = {
            id: response.data.data.id,
            name: response.data.data.attributes.name,
            location: response.data.data.attributes.location,
            type: response.data.data.attributes.user_type,
            guestNumbers: response.data.data.attributes.guest_number,
          };

          // Update local state immediately instead of refetching
          setData((prevData) => [...prevData, newAreaData]);
          setNewArea({
            name: "",
            location: "",
            type: "",
            guestNumbers: "",
          });

          showNotification("Area added successfully!", "success");
        }
      } else {
        console.log("Please fill all fields before adding area");
        showNotification("Please fill all fields before adding area", "error");
      }
    } catch (error) {
      console.log("Error in adding area:", error);
      setError("Failed to add session area");
      showNotification("Failed to add session area", "error");
      // If add fails, refresh to get actual state from server
      await fetchSessionAreas();
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!eventId || !areaToDelete) {
      setError("Event ID or Area not found");
      showNotification("Event ID or Area not found", "error");
      return;
    }

    try {
      setDeleteLoading(areaToDelete.id);

      console.log(`Deleting area ${areaToDelete.id} for event ${eventId}`);

      // Call the DELETE API
      const response = await deleteSessionAreaApi(eventId, areaToDelete.id);
      console.log("DELETE API Response:", response);
      console.log("DELETE API Status:", response.status);
      console.log("DELETE API Data:", response.data);

      // Check for success
      if (response.status === 200 || response.status === 204) {
        console.log(`Successfully deleted area with id: ${areaToDelete.id}`);

        // Refresh data to ensure UI matches server state
        await fetchSessionAreas();
        showNotification("Area deleted successfully!", "success");
        closeDeleteModal();
      } else {
        throw new Error(`Delete failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting area:", error);
      setError("Failed to delete session area");
      showNotification("Failed to delete session area", "error");

      // Refresh to get current state
      await fetchSessionAreas();
    } finally {
      setDeleteLoading(null);
    }
  };

  const openDeleteModal = (area: Area) => {
    setAreaToDelete(area);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setAreaToDelete(null);
  };

  const handleEdit = (area: Area) => {
    setEditingRow(area.id);
    setEditData({ ...area });
  };

  const handleSaveEdit = async () => {
    if (!editData || !eventId) {
      setError("Edit data or Event ID not found");
      showNotification("Edit data or Event ID not found", "error");
      return;
    }

    try {
      setSaveLoading(editData.id);

      // Optimistically update UI
      setData((prevData) =>
        prevData.map((area) => (area.id === editData.id ? editData : area))
      );

      // Prepare data for UPDATE API - REMOVE THE ID FROM THE PAYLOAD
      const updateData = {
        session_area: {
          name: editData.name,
          location: editData.location,
          user_type: editData.type,
          guest_number: editData.guestNumbers,
          event_id: eventId,
        },
      };

      console.log("UPDATE API Data:", updateData);

      // Call the UPDATE API
      const response = await updateSessionAreaApi(
        eventId,
        editData.id,
        updateData
      );
      console.log("UPDATE API Response:", response);

      if (response?.data?.data) {
        // Use the response data to ensure consistency
        const updatedArea: Area = {
          id: response.data.data.id,
          name: response.data.data.attributes.name,
          location: response.data.data.attributes.location,
          type: response.data.data.attributes.user_type,
          guestNumbers: response.data.data.attributes.guest_number,
        };

        // Update with server response
        setData((prevData) =>
          prevData.map((area) =>
            area.id === updatedArea.id ? updatedArea : area
          )
        );

        setEditingRow(null);
        setEditData(null);
        console.log(`Successfully updated area with id: ${editData.id}`);
        showNotification("Area updated successfully!", "success");
      } else {
        throw new Error("Update response format is invalid");
      }
    } catch (error) {
      console.error("Error updating area:", error);
      setError("Failed to update session area");
      showNotification("Failed to update session area", "error");

      // Rollback on error
      await fetchSessionAreas();
    } finally {
      setSaveLoading(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditData(null);
  };

  const toggleRowSelection = (id: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
  };

  const toggleAllSelection = () => {
    const currentPageData = getCurrentPageData();
    const currentPageIds = currentPageData.map((area) => area.id);
    const allCurrentSelected = currentPageIds.every((id) =>
      selectedRows.has(id)
    );

    if (allCurrentSelected) {
      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        currentPageIds.forEach((id) => newSet.delete(id));
        return newSet;
      });
    } else {
      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        currentPageIds.forEach((id) => newSet.add(id));
        return newSet;
      });
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const getCurrentPageData = () => {
    return data.slice(startIndex, endIndex);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      className="bg-white rounded-2xl"
    >
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "error"
                ? "bg-red-500 text-white"
                : notification.type === "warning"
                ? "bg-yellow-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}


      {/* Header with Add Form */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#111827",
            marginBottom: "16px",
          }}
        >
          Session Areas
        </h1>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              color: "#dc2626",
              marginBottom: "16px",
            }}
          >
            {error}
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: "10px",
                background: "none",
                border: "none",
                color: "#dc2626",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ marginBottom: "16px" }}>
            <Skeleton style={{ height: "12px", marginBottom: "8px" }} />
            <Skeleton style={{ height: "12px", width: "60%" }} />
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 200px 150px 120px",
            gap: "12px",
            marginBottom: "16px",
            alignItems: "end",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              Area Name
            </label>
            <input
              type="text"
              placeholder="text here"
              value={newArea.name}
              onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "white",
                outline: "none",
              }}
            />
            {validationErrors.name && (
              <div style={{ color: "red", fontSize: "12px" }}>
                {validationErrors.name}
              </div>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              Area Location
            </label>
            <input
              type="text"
              placeholder="text here"
              value={newArea.location}
              onChange={(e) =>
                setNewArea({ ...newArea, location: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "white",
                outline: "none",
              }}
            />
            {validationErrors.location && (
              <div style={{ color: "red", fontSize: "12px" }}>
                {validationErrors.location}
              </div>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              User Type
            </label>
            <select
              value={newArea.type}
              onChange={(e) => setNewArea({ ...newArea, type: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "white",
                outline: "none",
                color: newArea.type ? "#000" : "#9ca3af",
              }}
            >
              <option value="" disabled>
                Select User Type
              </option>
              <option value="any">Any</option>
              {badgeLoading ? (
                <option value="" disabled>
                  Loading badges...
                </option>
              ) : (
                badges.map((badge) => (
                  <option key={badge.id} value={badge.attributes.name}>
                    {badge.attributes.name}
                  </option>
                ))
              )}
            </select>
            {validationErrors.type && (
              <div style={{ color: "red", fontSize: "12px" }}>
                {validationErrors.type}
              </div>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              Guest numbers
            </label>
            <input
              type="number"
              placeholder="Type number"
              value={newArea.guestNumbers}
              onChange={(e) =>
                setNewArea({ ...newArea, guestNumbers: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "white",
                outline: "none",
              }}
            />
            {validationErrors.guestNumbers && (
              <div style={{ color: "red", fontSize: "12px" }}>
                {validationErrors.guestNumbers}
              </div>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={addLoading}
            style={{
              padding: "8px 16px",
              backgroundColor: addLoading ? "#9ca3af" : "#1f2937",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: addLoading ? "not-allowed" : "pointer",
              height: "fit-content",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseOver={(e) => {
              if (!addLoading)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#111827";
            }}
            onMouseOut={(e) => {
              if (!addLoading)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#1f2937";
            }}
          >
            {addLoading ? (
              <>
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid #f3f4f6",
                    borderTop: "2px solid #ffffff",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        {/* Table Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#f9fafb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#111827",
                margin: 0,
              }}
            >
              Areas
            </h2>
            {loading ? (
              <Skeleton style={{ height: "20px", width: "80px" }} />
            ) : (
              <span
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                {data.length} areas
              </span>
            )}
          </div>
        </div>

        {/* Table Content */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                backgroundColor: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <th
                style={{
                  padding: "12px 20px",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  width: "60px",
                  verticalAlign: "middle",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      getCurrentPageData().length > 0 &&
                      getCurrentPageData().every((area) =>
                        selectedRows.has(area.id)
                      )
                    }
                    onChange={toggleAllSelection}
                    style={{ width: "16px", height: "16px" }}
                  />
                </div>
              </th>
              <th
                style={{
                  padding: "12px 20px",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  verticalAlign: "middle",
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: "12px 20px",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  verticalAlign: "middle",
                }}
              >
                Location
              </th>
              <th
                style={{
                  padding: "12px 20px",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  verticalAlign: "middle",
                }}
              >
                Type
              </th>
              <th
                style={{
                  padding: "12px 20px",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  verticalAlign: "middle",
                }}
              >
                Guest Numbers
              </th>
              <th
                style={{
                  padding: "12px 20px",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  verticalAlign: "middle",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr
                    key={`skeleton-${index}`}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      backgroundColor: "white",
                    }}
                  >
                    <td style={{ padding: "12px 20px", textAlign: "center" }}>
                      <Skeleton style={{ height: "16px", width: "16px" }} />
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <Skeleton style={{ height: "12px" }} />
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <Skeleton style={{ height: "12px" }} />
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <Skeleton style={{ height: "12px" }} />
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <Skeleton style={{ height: "12px" }} />
                    </td>
                    <td style={{ padding: "12px 20px", textAlign: "center" }}>
                      <Skeleton style={{ height: "16px", width: "30px" }} />
                    </td>
                  </tr>
                ))
              : getCurrentPageData().map((area, index) => (
                  <tr
                    key={area.id}
                    style={{
                      borderBottom:
                        index < getCurrentPageData().length - 1
                          ? "1px solid #f3f4f6"
                          : "none",
                      backgroundColor: "white",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f9fafb")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "white")
                    }
                  >
                    <td
                      style={{
                        padding: "12px 20px",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRows.has(area.id)}
                          onChange={() => toggleRowSelection(area.id)}
                          style={{ width: "16px", height: "16px" }}
                        />
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 20px",
                        fontSize: "14px",
                        color: "#111827",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      {editingRow === area.id ? (
                        <input
                          type="text"
                          value={editData?.name || ""}
                          onChange={(e) =>
                            setEditData((prev) =>
                              prev ? { ...prev, name: e.target.value } : null
                            )
                          }
                          style={{
                            padding: "6px 8px",
                            border: "1px solid #d1d5db",
                            borderRadius: "4px",
                            fontSize: "14px",
                            width: "100%",
                            outline: "none",
                            textAlign: "center",
                          }}
                        />
                      ) : (
                        area.name
                      )}
                    </td>
                    <td
                      style={{
                        padding: "12px 20px",
                        fontSize: "14px",
                        color: "#6b7280",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      {editingRow === area.id ? (
                        <input
                          type="text"
                          value={editData?.location || ""}
                          onChange={(e) =>
                            setEditData((prev) =>
                              prev
                                ? { ...prev, location: e.target.value }
                                : null
                            )
                          }
                          style={{
                            padding: "6px 8px",
                            border: "1px solid #d1d5db",
                            borderRadius: "4px",
                            fontSize: "14px",
                            width: "100%",
                            outline: "none",
                            textAlign: "center",
                          }}
                        />
                      ) : (
                        area.location
                      )}
                    </td>
                    <td
                      style={{
                        padding: "12px 20px",
                        fontSize: "14px",
                        color: "#6b7280",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      {editingRow === area.id ? (
                        <select
                          value={editData?.type || ""}
                          onChange={(e) =>
                            setEditData((prev) =>
                              prev ? { ...prev, type: e.target.value } : null
                            )
                          }
                          style={{
                            padding: "6px 8px",
                            border: "1px solid #d1d5db",
                            borderRadius: "4px",
                            fontSize: "14px",
                            width: "100%",
                            outline: "none",
                            textAlign: "center",
                          }}
                        >
                          <option value="any">Any</option>
                          {badges.map((badge) => (
                            <option
                              key={badge.id}
                              value={badge.attributes.name}
                            >
                              {badge.attributes.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        area.type
                      )}
                    </td>
                    <td
                      style={{
                        padding: "12px 20px",
                        fontSize: "14px",
                        color: "#6b7280",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      {editingRow === area.id ? (
                        <input
                          type="number"
                          value={editData?.guestNumbers || ""}
                          onChange={(e) =>
                            setEditData((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    guestNumbers: parseInt(e.target.value) || 0,
                                  }
                                : null
                            )
                          }
                          style={{
                            padding: "6px 8px",
                            border: "1px solid #d1d5db",
                            borderRadius: "4px",
                            fontSize: "14px",
                            width: "100%",
                            outline: "none",
                            textAlign: "center",
                          }}
                        />
                      ) : (
                        area.guestNumbers
                      )}
                    </td>
                    <td
                      style={{
                        padding: "12px 20px",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {editingRow === area.id ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              disabled={saveLoading === area.id}
                              style={{
                                padding: "6px 12px",
                                backgroundColor:
                                  saveLoading === area.id
                                    ? "#9ca3af"
                                    : "#10b981",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "12px",
                                cursor:
                                  saveLoading === area.id
                                    ? "not-allowed"
                                    : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              {saveLoading === area.id ? (
                                <>
                                  <div
                                    style={{
                                      width: "12px",
                                      height: "12px",
                                      border: "2px solid #f3f4f6",
                                      borderTop: "2px solid #ffffff",
                                      borderRadius: "50%",
                                      animation: "spin 1s linear infinite",
                                    }}
                                  />
                                  Saving...
                                </>
                              ) : (
                                "Save"
                              )}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={saveLoading === area.id}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#6b7280",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "12px",
                                cursor:
                                  saveLoading === area.id
                                    ? "not-allowed"
                                    : "pointer",
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(area)}
                              style={{
                                padding: "6px",
                                backgroundColor: "transparent",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                color: "#f59e0b",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#fef3c7")
                              }
                              onMouseOut={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(area)}
                              disabled={deleteLoading === area.id}
                              style={{
                                padding: "6px",
                                backgroundColor: "transparent",
                                border: "none",
                                borderRadius: "4px",
                                cursor:
                                  deleteLoading === area.id
                                    ? "not-allowed"
                                    : "pointer",
                                color:
                                  deleteLoading === area.id
                                    ? "#9ca3af"
                                    : "#ef4444",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: deleteLoading === area.id ? 0.6 : 1,
                              }}
                              onMouseOver={(e) => {
                                if (deleteLoading !== area.id) {
                                  e.currentTarget.style.backgroundColor =
                                    "#fee2e2";
                                }
                              }}
                              onMouseOut={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              {deleteLoading === area.id ? (
                                <div
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    border: "2px solid #f3f4f6",
                                    borderTop: "2px solid #ef4444",
                                    borderRadius: "50%",
                                    animation: "spin 1s linear infinite",
                                  }}
                                />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {getCurrentPageData().length === 0 && !loading && (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            No areas found. Add your first area above.
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <div
            style={{
              padding: "16px 20px",
              borderTop: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "14px", color: "#6b7280" }}>
              Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of{" "}
              {data.length} entries
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={goToPrevious}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #d1d5db",
                  backgroundColor: currentPage === 1 ? "#f3f4f6" : "white",
                  color: currentPage === 1 ? "#9ca3af" : "#374151",
                  borderRadius: "4px",
                  fontSize: "14px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    style={{
                      padding: "6px 12px",
                      border: "1px solid #d1d5db",
                      backgroundColor:
                        page === currentPage ? "#3b82f6" : "white",
                      color: page === currentPage ? "white" : "#374151",
                      borderRadius: "4px",
                      fontSize: "14px",
                      cursor: "pointer",
                      minWidth: "40px",
                    }}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={goToNext}
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #d1d5db",
                  backgroundColor:
                    currentPage === totalPages ? "#f3f4f6" : "white",
                  color: currentPage === totalPages ? "#9ca3af" : "#374151",
                  borderRadius: "4px",
                  fontSize: "14px",
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={closeDeleteModal}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#111827",
                marginBottom: "12px",
                margin: 0,
              }}
            >
              Delete Area
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "24px",
                margin: "8px 0 24px 0",
              }}
            >
              Are you sure you want to delete{" "}
              <strong>{areaToDelete?.name}</strong>? This action cannot be
              undone.
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={closeDeleteModal}
                disabled={deleteLoading === areaToDelete?.id}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#e5e7eb",
                  color: "#111827",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor:
                    deleteLoading === areaToDelete?.id
                      ? "not-allowed"
                      : "pointer",
                  opacity: deleteLoading === areaToDelete?.id ? 0.6 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading === areaToDelete?.id}
                style={{
                  padding: "8px 16px",
                  backgroundColor:
                    deleteLoading === areaToDelete?.id ? "#fca5a5" : "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor:
                    deleteLoading === areaToDelete?.id
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {deleteLoading === areaToDelete?.id ? (
                  <>
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid #fef2f2",
                        borderTop: "2px solid #ef4444",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Button */}
      <button
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          padding: "12px 24px",
          backgroundColor: "#1f2937",
          color: "white",
          border: "none",
          borderRadius: "25px",
          fontSize: "14px",
          fontWeight: "500",
          cursor: "pointer",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#111827")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1f2937")}
      >
        Create event
        <span style={{ fontSize: "16px" }}>→</span>
      </button>

      {/* Add CSS for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
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
        `}
      </style>
    </div>
  );
}
