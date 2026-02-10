import { useState, useMemo, useCallback } from "react";
import { ChevronDown, Upload, Trash2, Search, Download, X } from "lucide-react";
import * as XLSX from "xlsx";

export type ParsedInvitee = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
};

const HEADER_MAP: Record<string, keyof ParsedInvitee> = {
  id: "id",
  "first name": "first_name",
  "firstname": "first_name",
  "last name": "last_name",
  "lastname": "last_name",
  email: "email",
  "phone number": "phone_number",
  "phone": "phone_number",
  "phone_number": "phone_number",
};

function normalizeKey(key: string): keyof ParsedInvitee | null {
  const k = String(key ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  return HEADER_MAP[k] ?? null;
}

function parseCSV(text: string): ParsedInvitee[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headerLine = lines[0];
  const headers = headerLine.split(",").map((h) => h.replace(/^"|"$/g, "").trim());
  const normalized = headers.map((h) => normalizeKey(h));
  const rows: ParsedInvitee[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.replace(/^"|"$/g, "").trim());
    const row: Record<string, string> = {};
    normalized.forEach((key, idx) => {
      if (key) row[key] = values[idx] ?? "";
    });
    rows.push({
      id: row.id || `#${i}`,
      first_name: row.first_name ?? "",
      last_name: row.last_name ?? "",
      email: row.email ?? "",
      phone_number: row.phone_number ?? "",
    });
  }
  return rows;
}

function parseExcel(buffer: ArrayBuffer): ParsedInvitee[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) return [];
  const sheet = workbook.Sheets[firstSheet];
  const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 }) as string[][];
  if (!data.length || data.length < 2) return [];
  const headers = (data[0] ?? []).map((h) => String(h ?? "").trim());
  const normalized = headers.map((h) => normalizeKey(h));
  const rows: ParsedInvitee[] = [];
  for (let i = 1; i < data.length; i++) {
    const values = (data[i] ?? []).map((v) => String(v ?? "").trim());
    const row: Record<string, string> = {};
    normalized.forEach((key, idx) => {
      if (key) row[key] = values[idx] ?? "";
    });
    rows.push({
      id: row.id || `#${i}`,
      first_name: row.first_name ?? "",
      last_name: row.last_name ?? "",
      email: row.email ?? "",
      phone_number: row.phone_number ?? "",
    });
  }
  return rows;
}

const TEMPLATE_CSV = `ID,First Name,Last Name,Email,Phone Number
#1,Sample,User,sample@example.com,+1234567890`;

type InviteesTabProps = {
  inviteesFile: File | null;
  setInviteesFile: (file: File | null) => void;
  inviteesFileInputRef: React.RefObject<HTMLInputElement | null>;
  onParsedUsersChange?: (users: ParsedInvitee[]) => void;
  onPreviewClick?: () => void;
};

export function InviteesTab({
  inviteesFile,
  setInviteesFile,
  inviteesFileInputRef,
  onParsedUsersChange,
  onPreviewClick,
}: InviteesTabProps) {
  const [parsedUsers, setParsedUsers] = useState<ParsedInvitee[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleParsedUsers = useCallback(
    (users: ParsedInvitee[]) => {
      setParsedUsers(users);
      onParsedUsersChange?.(users);
    },
    [onParsedUsersChange]
  );

  const handleUploadAndPreview = useCallback(() => {
    if (!inviteesFile) {
      setUploadError("Please choose a file first.");
      return;
    }
    setUploadError(null);
    setIsUploading(true);

    const ext = (inviteesFile.name.split(".").pop() ?? "").toLowerCase();

    if (ext === "csv") {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result ?? "");
          const users = parseCSV(text);
          handleParsedUsers(users);
          setCurrentPage(1);
          setSelectedIds(new Set());
        } catch {
          setUploadError(
            "Failed to parse CSV. Check format (ID, First Name, Last Name, Email, Phone Number)."
          );
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        setUploadError("Failed to read file.");
        setIsUploading(false);
      };
      reader.readAsText(inviteesFile, "UTF-8");
      return;
    }

    if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const buffer = reader.result as ArrayBuffer;
          const users = parseExcel(buffer);
          handleParsedUsers(users);
          setCurrentPage(1);
          setSelectedIds(new Set());
        } catch {
          setUploadError(
            "Failed to parse Excel. Ensure columns: ID, First Name, Last Name, Email, Phone Number."
          );
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        setUploadError("Failed to read file.");
        setIsUploading(false);
      };
      reader.readAsArrayBuffer(inviteesFile);
      return;
    }

    setUploadError("Unsupported format. Use .csv, .xlsx, or .xls");
    setIsUploading(false);
  }, [inviteesFile, handleParsedUsers]);

  const handleDownloadTemplate = useCallback(() => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invitees_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const removeUser = useCallback(
    (id: string) => {
      setParsedUsers((prev: ParsedInvitee[]) => {
        const next = prev.filter((u: ParsedInvitee) => u.id !== id);
        onParsedUsersChange?.(next);
        return next;
      });
      setSelectedIds((prev: Set<string>) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [onParsedUsersChange]
  );

  const removeSelectedUsers = useCallback(() => {
    if (selectedIds.size === 0) return;
    setParsedUsers((prev: ParsedInvitee[]) => {
      const next = prev.filter((u: ParsedInvitee) => !selectedIds.has(u.id));
      onParsedUsersChange?.(next);
      return next;
    });
    setSelectedIds(new Set());
    setCurrentPage(1);
  }, [selectedIds, onParsedUsersChange]);

  const removeAllUsers = useCallback(() => {
    setParsedUsers([]);
    onParsedUsersChange?.([]);
    setSelectedIds(new Set());
    setCurrentPage(1);
  }, [onParsedUsersChange]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return parsedUsers;
    const q = searchTerm.toLowerCase().trim();
    return parsedUsers.filter(
      (u: ParsedInvitee) =>
        u.first_name.toLowerCase().includes(q) ||
        u.last_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone_number.includes(q) ||
        u.id.toLowerCase().includes(q)
    );
  }, [parsedUsers, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const allSelected =
    paginatedUsers.length > 0 &&
    paginatedUsers.every((u) => selectedIds.has(u.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedUsers.map((u) => u.id)));
    }
  };

  const showingFrom =
    filteredUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(
    currentPage * itemsPerPage,
    filteredUsers.length
  );

  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-gray-800">Send to</h3>

      {/* ── Upload Controls ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Import from Excel dropdown-style input */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Import From Excel"
            readOnly
            className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl text-sm bg-white text-gray-900 placeholder:text-gray-400 cursor-default"
          />
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            aria-hidden
          />
        </div>

        <input
          ref={inviteesFileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setInviteesFile(file);
            setUploadError(null);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          onClick={() => inviteesFileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-200 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Choose file
        </button>

        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download template
        </button>
      </div>

      {/* ── Selected File Info ── */}
      {inviteesFile && (
        <div className="flex items-center justify-between gap-4 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-800">
              {inviteesFile.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {inviteesFile.size < 1024
                ? `${inviteesFile.size} B`
                : inviteesFile.size < 1024 * 1024
                ? `${(inviteesFile.size / 1024).toFixed(1)} KB`
                : `${(inviteesFile.size / (1024 * 1024)).toFixed(1)} MB`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setInviteesFile(null);
              setUploadError(null);
            }}
            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Remove file"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Error ── */}
      {uploadError && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
          {uploadError}
        </p>
      )}

      {/* ── Upload Button ── */}
      <button
        type="button"
        onClick={handleUploadAndPreview}
        disabled={!inviteesFile || isUploading}
        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Uploading…
          </span>
        ) : (
          "Upload Users and Preview"
        )}
      </button>

      {/* ── Users Table (shown after upload) ── */}
      {parsedUsers.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">

          {/* Selected users action bar */}
          {selectedIds.size > 0 && (
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-200 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-blue-800">
                {selectedIds.size} user{selectedIds.size !== 1 ? "s" : ""} selected
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={removeSelectedUsers}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove selected
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear selection
                </button>
              </div>
            </div>
          )}

          {/* Toolbar: Users label + Remove all | Show X + Search */}
          <div className="px-4 py-3 border-b border-gray-200 bg-white flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h4 className="text-sm font-semibold text-gray-800">Users</h4>
              <button
                type="button"
                onClick={removeAllUsers}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove all
              </button>
            </div>
            <div className="flex items-center gap-3">
              {/* Show per page */}
              <div className="relative">
                <select
                  value={itemsPerPage}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value={5}>Show 5</option>
                  <option value={10}>Show 10</option>
                  <option value={25}>Show 25</option>
                  <option value={50}>Show 50</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-44 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Table — horizontal scroll shows native progress bar */}
          <div className="overflow-x-auto" style={{ overflowX: "scroll" }}>
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-[#1b3a5c]">
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-400 accent-white cursor-pointer"
                    />
                  </th>
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
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedUsers.map((user) => {
                  const isSelected = selectedIds.has(user.id);
                  return (
                    <tr
                      key={user.id}
                      className={`transition-colors ${
                        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(user.id)}
                          className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap">
                        {user.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {user.first_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {user.last_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {user.phone_number}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeUser(user.id)}
                          className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Remove user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Footer ── */}
          <div className="border-t border-gray-200 px-4 py-3 bg-white">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {showingFrom} to {showingTo} of {filteredUsers.length} users
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    currentPage > 1 && setCurrentPage(currentPage - 1)
                  }
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                {Array.from(
                  { length: Math.min(totalPages, 5) },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                      page === currentPage
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() =>
                    currentPage < totalPages &&
                    setCurrentPage(currentPage + 1)
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview Button (bottom) ── */}
      {parsedUsers.length > 0 && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onPreviewClick}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Preview
          </button>
        </div>
      )}
    </div>
  );
}