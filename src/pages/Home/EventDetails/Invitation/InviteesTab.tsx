import { useState, useMemo, useCallback } from "react";
import { ChevronDown, Upload, Trash2, Search, Download, X } from "lucide-react";
import * as XLSX from "xlsx";
import Pagination from "@/components/Pagination";

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
};

export function InviteesTab({
  inviteesFile,
  setInviteesFile,
  inviteesFileInputRef,
  onParsedUsersChange,
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
    [onParsedUsersChange],
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
        } catch (e) {
          setUploadError("Failed to parse CSV. Check format (ID, First Name, Last Name, Email, Phone Number).");
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
        } catch (e) {
          setUploadError("Failed to parse Excel. Ensure columns: ID, First Name, Last Name, Email, Phone Number.");
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
    [onParsedUsersChange],
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
        u.id.toLowerCase().includes(q),
    );
  }, [parsedUsers, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedUsers.map((u) => u.id)));
    }
  };

  const allSelected =
    paginatedUsers.length > 0 && selectedIds.size === paginatedUsers.length;

  return (
    <div className="space-y-6">
      <h3 className="text-base font-semibold text-slate-800">Send to</h3>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Import From Excel"
            readOnly
            className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 placeholder:text-slate-400"
          />
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
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
          <Upload className="w-5 h-5" />
          Choose file
        </button>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Download className="w-5 h-5" />
          Download template
        </button>
      </div>

      {inviteesFile && (
        <div className="flex items-center justify-between gap-4 py-3 px-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <p className="text-sm font-medium text-slate-800">{inviteesFile.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
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
            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Remove file"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {uploadError && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          {uploadError}
        </p>
      )}

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

      {parsedUsers.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
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
                  className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear selection
                </button>
              </div>
            </div>
          )}
          <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h4 className="text-sm font-semibold text-slate-800">Users</h4>
              <button
                type="button"
                onClick={removeAllUsers}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remove all
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={itemsPerPage}
onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700"
              >
                <option value={5}>Show 5</option>
                <option value={10}>Show 10</option>
                <option value={25}>Show 25</option>
                <option value={50}>Show 50</option>
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    First Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Last Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">{user.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {user.first_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {user.last_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {user.phone_number}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => removeUser(user.id)}
                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {parsedUsers.length > 0 && (
        <div className="flex justify-end pt-4">
          <button
            type="button"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Preview
          </button>
        </div>
      )}
    </div>
  );
}
