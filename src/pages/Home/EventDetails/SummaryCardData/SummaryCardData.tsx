import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  FileDown,
  FileSpreadsheet,
} from "lucide-react";
import { getEventUsers } from "@/apis/apiHelpers";
import Pagination from "@/components/Pagination";
import Search from "@/components/Search";

const getApprovalStatus = (user: any): "approved" | "rejected" | "pending" => {
  const status = user?.attributes?.approval_status;
  const approved = user?.attributes?.approved;
  if (status === "approved" || approved === true) return "approved";
  if (status === "rejected" || approved === false) return "rejected";
  return "pending";
};

function SummaryCardData() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state =
    (location.state as {
      cardLabel?: string;
      filterKey?: string;
      userTypeKey?: string;
    }) || {};
  const { cardLabel = "Data", filterKey = "all", userTypeKey } = state;

  const [eventUsers, setEventUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUserType, setFilterUserType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const perPage = 10;

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    const perPage = 100;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const first = await getEventUsers(eventId, {
          page: 1,
          per_page: perPage,
        });
        const data = first.data?.data || first.data;
        const list = Array.isArray(data) ? data : data?.data || [];
        const pagination =
          first.data?.meta?.pagination || first.data?.pagination;
        const totalPages = pagination?.total_pages || 1;
        const all: any[] = [...list];
        if (totalPages > 1) {
          for (let p = 2; p <= totalPages; p++) {
            const res = await getEventUsers(eventId, {
              page: p,
              per_page: perPage,
            });
            const d = res.data?.data || res.data;
            const users = Array.isArray(d) ? d : d?.data || [];
            all.push(...users);
          }
        }
        if (!cancelled) setEventUsers(all);
      } catch (e) {
        if (!cancelled)
          setNotification({ message: "Failed to load users.", type: "error" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(eventUsers)) return [];
    const key = filterKey;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    return eventUsers.filter((user: any) => {
      if (key === "all") return true;
      if (key === "today") {
        const created = user?.attributes?.created_at;
        if (!created) return false;
        const t = new Date(created).getTime();
        return t >= todayStart.getTime() && t <= todayEnd.getTime();
      }
      if (key === "pending" || key === "approved" || key === "rejected")
        return getApprovalStatus(user) === key;
      if (key === "printed") return !!user?.attributes?.printed;
      if (key === "user_type" && userTypeKey) {
        const type = (user?.attributes?.user_type ?? "")
          .toString()
          .toLowerCase()
          .trim();
        return type === userTypeKey.toLowerCase().trim();
      }
      return false;
    });
  }, [eventUsers, filterKey, userTypeKey]);

  // Unique user types in current card data (for filter dropdown)
  const uniqueUserTypesFromFiltered = useMemo(() => {
    const set = new Set<string>();
    filteredUsers.forEach((user: any) => {
      const type = user?.attributes?.user_type;
      if (type != null && String(type).trim() !== "") {
        set.add(String(type).trim().toLowerCase());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [filteredUsers]);

  // Apply Status + User type filters
  const filteredByFilters = useMemo(() => {
    return filteredUsers.filter((user: any) => {
      if (filterStatus !== "all") {
        if (getApprovalStatus(user) !== filterStatus) return false;
      }
      if (filterUserType !== "all") {
        const type = (user?.attributes?.user_type ?? "")
          .toString()
          .toLowerCase()
          .trim();
        if (type !== filterUserType.toLowerCase().trim()) return false;
      }
      return true;
    });
  }, [filteredUsers, filterStatus, filterUserType]);

  // Search: filter by name, email, phone, organization, type, id
  const searchedUsers = useMemo(() => {
    if (!searchTerm.trim()) return filteredByFilters;
    const q = searchTerm.toLowerCase().trim();
    return filteredByFilters.filter((user: any) => {
      const name = (user?.attributes?.name ?? "").toString().toLowerCase();
      const email = (user?.attributes?.email ?? "").toString().toLowerCase();
      const phone = (user?.attributes?.phone_number ?? "")
        .toString()
        .toLowerCase();
      const org = (
        user?.attributes?.custom_fields?.title ??
        user?.attributes?.organization ??
        ""
      )
        .toString()
        .toLowerCase();
      const type = (user?.attributes?.user_type ?? "").toString().toLowerCase();
      const id = (user?.id ?? "").toString().toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        org.includes(q) ||
        type.includes(q) ||
        id.includes(q)
      );
    });
  }, [filteredByFilters, searchTerm]);

  // Pagination: slice searched users for current page
  const totalPages = Math.max(1, Math.ceil(searchedUsers.length / perPage));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return searchedUsers.slice(start, start + perPage);
  }, [searchedUsers, currentPage, perPage]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterUserType]);

  const escapeCsvCell = (val: string): string => {
    const s = String(val ?? "").replace(/"/g, '""');
    return s.includes(",") || s.includes("\n") || s.includes('"')
      ? `"${s}"`
      : s;
  };

  const handleExportCsv = () => {
    setExportingCsv(true);
    try {
      const headers = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Organization",
        "Type",
        "Status",
        "Created",
      ];
      const rows = searchedUsers.map((user: any) => {
        const status = getApprovalStatus(user);
        const org =
          user?.attributes?.custom_fields?.title ||
          user?.attributes?.organization ||
          "";
        return [
          user.id,
          user?.attributes?.name ?? "",
          user?.attributes?.email ?? "",
          user?.attributes?.phone_number ?? "",
          org,
          user?.attributes?.user_type ?? "",
          status,
          user?.attributes?.created_at ?? "",
        ].map(escapeCsvCell);
      });
      const csv = [
        headers.join(","),
        ...rows.map((r: string[]) => r.join(",")),
      ].join("\n");
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cardLabel.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setNotification({
        message: `Exported ${searchedUsers.length} rows (CSV).`,
        type: "success",
      });
    } catch (e) {
      setNotification({ message: "Export failed.", type: "error" });
    } finally {
      setExportingCsv(false);
    }
  };

  const handleExportExcel = () => {
    setExportingExcel(true);
    try {
      const headers = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Organization",
        "Type",
        "Status",
        "Created",
      ];
      const rows = searchedUsers.map((user: any) => {
        const status = getApprovalStatus(user);
        const org =
          user?.attributes?.custom_fields?.title ||
          user?.attributes?.organization ||
          "";
        return [
          user.id,
          user?.attributes?.name ?? "",
          user?.attributes?.email ?? "",
          user?.attributes?.phone_number ?? "",
          org,
          user?.attributes?.user_type ?? "",
          status,
          user?.attributes?.created_at ?? "",
        ].join("\t");
      });
      const tsv = [headers.join("\t"), ...rows].join("\n");
      const blob = new Blob(["\uFEFF" + tsv], {
        type: "application/vnd.ms-excel;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cardLabel.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xls`;
      a.click();
      URL.revokeObjectURL(url);
      setNotification({
        message: `Exported ${searchedUsers.length} rows (Excel).`,
        type: "success",
      });
    } catch (e) {
      setNotification({ message: "Export failed.", type: "error" });
    } finally {
      setExportingExcel(false);
    }
  };

  const goBack = () => {
    if (eventId) navigate(`/home/${eventId}`);
    else navigate(-1);
  };

  if (!eventId) {
    return (
      <div className="bg-white min-h-screen p-6">
        <p className="text-gray-500">Event ID missing.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  // Skeleton loader for card data page
  const SkeletonLoader = () => (
    <div className="bg-white min-h-screen p-6 animate-pulse">
      <div className="max-w-6xl mx-auto">
        {/* Header skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-24 bg-gray-200 rounded-lg" />
            <div className="h-8 w-48 sm:w-64 bg-gray-200 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-28 bg-gray-200 rounded-lg" />
            <div className="h-10 w-28 bg-gray-200 rounded-lg" />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div className="bg-gray-50/80 border-b border-gray-200/60 px-6 py-3">
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="h-4 bg-gray-200 rounded flex-1 min-w-0 max-w-[80px]"
                />
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-200/60">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
              <div key={row} className="px-6 py-4 flex gap-4 items-center">
                <div className="h-4 w-12 bg-gray-200 rounded shrink-0" />
                <div className="h-4 flex-1 max-w-[120px] bg-gray-200 rounded" />
                <div className="h-4 flex-1 max-w-[160px] bg-gray-200 rounded" />
                <div className="h-4 flex-1 max-w-[100px] bg-gray-200 rounded" />
                <div className="h-4 flex-1 max-w-[100px] bg-gray-200 rounded" />
                <div className="h-4 flex-1 max-w-[80px] bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded shrink-0" />
                <div className="h-4 w-20 bg-gray-200 rounded shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Go back + title */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={20} />
              Go back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {cardLabel}{" "}
              <span className="text-gray-500 font-normal">
                ({searchedUsers.length}
                {searchTerm.trim() ? " matching search" : ""})
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={loading || searchedUsers.length === 0 || exportingCsv}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm"
            >
              <FileDown size={18} />
              {exportingCsv ? "Exporting…" : "Export CSV"}
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={loading || searchedUsers.length === 0 || exportingExcel}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm"
            >
              <FileSpreadsheet size={18} />
              {exportingExcel ? "Exporting…" : "Export Excel"}
            </button>
          </div>
        </div>

        {/* Filters + Search */}
        {filteredUsers.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-40">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white pr-10 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={20}
              />
            </div>
            <div className="relative w-full sm:w-40">
              <select
                value={filterUserType}
                onChange={(e) => {
                  setFilterUserType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white pr-10 text-sm"
              >
                <option value="all">All Types</option>
                {uniqueUserTypesFromFiltered.map((typeKey) => (
                  <option key={typeKey} value={typeKey}>
                    {typeKey.charAt(0).toUpperCase() + typeKey.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={20}
              />
            </div>
            <div className="flex-1 min-w-[200px] max-w-md">
              <Search
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by name, email, phone, organization, type..."
              />
            </div>
          </div>
        )}

        {/* Table (same style as Registered Users) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No data for this category.
            </div>
          ) : searchedUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No users match your filters or search.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/80 border-b border-gray-200/60">
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
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/60">
                    {paginatedUsers.map((user: any) => {
                      const status = getApprovalStatus(user);
                      const org =
                        user?.attributes?.custom_fields?.title ||
                        user?.attributes?.organization ||
                        "";
                      const created = user?.attributes?.created_at
                        ? new Date(
                            user.attributes.created_at,
                          ).toLocaleDateString()
                        : "-";
                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 font-mono">
                            {user.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {user?.attributes?.name ?? "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {user?.attributes?.email ?? "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {user?.attributes?.phone_number ?? "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {org || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {user?.attributes?.user_type ?? "-"}
                          </td>
                          <td className="px-6 py-4 text-sm capitalize">
                            {status}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {created}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200/60 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * perPage + 1}–
                  {Math.min(currentPage * perPage, searchedUsers.length)} of{" "}
                  {searchedUsers.length}
                </p>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm ${
            notification.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default SummaryCardData;
