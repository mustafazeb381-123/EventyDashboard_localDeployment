import React, { useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import { createAreaSessionApi } from "@/apis/apiHelpers";
import { Area } from "recharts";

export type Area = {
  id: string;
  name: string;
  location: string;
  type: string;
  guestNumbers: number;
};

const initialData: Area[] = [
  {
    id: "area-01",
    name: "Area 01",
    location: "Location here",
    type: "Type 01",
    guestNumbers: 50,
  },
  {
    id: "area-02",
    name: "Area 02",
    location: "Location here",
    type: "Type 01",
    guestNumbers: 75,
  },
  {
    id: "area-03",
    name: "Area 03",
    location: "Location here",
    type: "Type 01",
    guestNumbers: 100,
  },
];

export default function Areas({}) {
  const [data, setData] = useState<Area[]>(initialData);
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
  const eventId = localStorage.getItem("create_eventId");
  console.log("event id in areas", eventId);
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    location: "",
    type: "",
    guestNumbers: "",
  });

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
      return;
    }

    try {
      if (
        newArea.name &&
        newArea.location &&
        newArea.type &&
        newArea.guestNumbers
      ) {
        console.log("event id in areas", eventId);

        const response = await createAreaSessionApi(
          AreaData,
          eventId as string
        );
        console.log("response in areas", response);

        if (response?.data) {
          setData((prevData) => [...prevData, response.data]);
          setNewArea({
            name: "",
            location: "",
            type: "",
            guestNumbers: "",
          });
        }
      } else {
        console.log("Please fill all fields before adding area");
      }
    } catch (error) {
      console.log("error in areas", error);
    }
  };

  // const handleAdd = () => {
  //   if (
  //     newArea.name &&
  //     newArea.location &&
  //     newArea.type &&
  //     newArea.guestNumbers
  //   ) {
  //     const newId = `area-${Date.now()}`;
  //     setData([
  //       ...data,
  //       {
  //         id: newId,
  //         name: newArea.name,
  //         location: newArea.location,
  //         type: newArea.type,
  //         guestNumbers: parseInt(newArea.guestNumbers),
  //       },
  //     ]);
  //     setNewArea({ name: "", location: "", type: "", guestNumbers: "" });
  //   }
  // };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this area?")) {
      setData(data.filter((area) => area.id !== id));
      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleEdit = (area: Area) => {
    setEditingRow(area.id);
    setEditData({ ...area });
  };

  const handleSaveEdit = () => {
    if (editData) {
      setData(data.map((area) => (area.id === editData.id ? editData : area)));
      setEditingRow(null);
      setEditData(null);
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
      {/* Header with Add Form */}
      <div style={{ marginBottom: "32px" }}>
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
              <option value="Type 01">Type 01</option>
              <option value="Type 02">Type 02</option>
              <option value="Type 03">Type 03</option>
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
              type="text"
              placeholder="text here"
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
            style={{
              padding: "8px 16px",
              backgroundColor: "#1f2937",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              height: "fit-content",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#111827")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#1f2937")}
          >
            + Add
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
            <span
              style={{
                fontSize: "14px",
                color: "#6b7280",
              }}
            >
              {data.length} areas
            </span>
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
            {getCurrentPageData().map((area, index) => (
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
                          prev ? { ...prev, location: e.target.value } : null
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
                      <option value="Type 01">Type 01</option>
                      <option value="Type 02">Type 02</option>
                      <option value="Type 03">Type 03</option>
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
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#10b981",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#6b7280",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "12px",
                            cursor: "pointer",
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
                            (e.currentTarget.style.backgroundColor = "#fef3c7")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(area.id)}
                          style={{
                            padding: "6px",
                            backgroundColor: "transparent",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            color: "#ef4444",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.backgroundColor = "#fee2e2")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {getCurrentPageData().length === 0 && (
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

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #d1d5db",
                  backgroundColor: page === currentPage ? "#3b82f6" : "white",
                  color: page === currentPage ? "white" : "#374151",
                  borderRadius: "4px",
                  fontSize: "14px",
                  cursor: "pointer",
                  minWidth: "40px",
                }}
              >
                {page}
              </button>
            ))}

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
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

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
    </div>
  );
}
