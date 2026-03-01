import { useState, useEffect, useRef } from "react";
import { ChevronLeft, FileDown, FileSpreadsheet } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import * as XLSX from "xlsx";
import Search from "@/components/Search";
import Pagination from "@/components/Pagination";
import {
    getCheckIns,
    getCheckOuts,
    getCheckedOut,
    getEventUsers,
    postCheckIns,
    postCheckOuts,
    QRCheckIn,
    QRCheckOut,
} from "@/apis/apiHelpers";


interface GateOnboardingProps {
    gate: {
        id: string | number;
        attributes?: {
            event_id?: string | number;
            gate_token: string;
            [key: string]: any;
        };
    };
    onBack: () => void;
}

interface EnrolledUser {
    id: string | number;
    attributes: {
        name?: string;
        email?: string;
        user_type?: string;
        check_in?: string | null;
        check_user_area_statuses?: {
            session_area_id?: string | number;
            check_in?: string | null;
            check_out?: string | null;
        }[];
    };
}

export default function GateOnboarding({ gate, onBack }: GateOnboardingProps) {

    const [enrolledUsers, setEnrolledUsers] = useState<EnrolledUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"registered_users" | "checked_in" | "checked_out">("registered_users");
    const [selectedUsers, setSelectedUsers] = useState<(string | number)[]>([]);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [scannedData, setScannedData] = useState<string | null>(null);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const eventId = gate?.attributes?.event_id;
    const sessionAreaId = gate?.id;

    const [showInput, setShowInput] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [exportingCsv, setExportingCsv] = useState(false);
    const [exportingExcel, setExportingExcel] = useState(false);
    const [notification, setNotification] = useState<{
        message: string;
        type: "success" | "error" | "warning" | "info";
    } | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10; // 👈 change if you want larger/smaller pages

    // Filter users by search term
    const filteredUsers = enrolledUsers.filter((user) => {
        const search = (searchTerm || "").toLowerCase();
        const { name, email, user_type } = user.attributes;

        return (
            (name?.toLowerCase() || "").includes(search) ||
            (email?.toLowerCase() || "").includes(search) ||
            (user_type?.toLowerCase() || "").includes(search)
        );
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const showNotification = (message: string, type: "success" | "error" | "warning" | "info") => {
        setNotification({ message, type });
    };

    useEffect(() => {
        const fetchUsers = async () => {
            if (!eventId || !sessionAreaId) return;
            setLoading(true);

            try {
                let list: EnrolledUser[] = [];

                if (view === "registered_users") {
                    // Fetch all users: not checked in + checked in + checked out, then merge by id
                    const [notCheckedInRes, checkedInRes] = await Promise.all([
                        getCheckIns(eventId, sessionAreaId),
                        getCheckOuts(eventId, sessionAreaId),
                    ]);
                    let checkedOutList: EnrolledUser[] = [];
                    try {
                        const checkedOutRes = await getCheckedOut(eventId, sessionAreaId);
                        checkedOutList = checkedOutRes?.data?.data || [];
                    } catch (err: any) {
                        if (err?.response?.status === 404) {
                            const all: any[] = [];
                            let page = 1;
                            let hasMore = true;
                            while (hasMore) {
                                const res = await getEventUsers(String(eventId), { page, per_page: 100 });
                                const data = res?.data?.data || res?.data;
                                const items = Array.isArray(data) ? data : data?.data || [];
                                if (items.length === 0) break;
                                all.push(...items);
                                const meta = res?.data?.meta?.pagination || res?.data?.pagination;
                                hasMore = meta?.next_page != null && items.length === 100;
                                page++;
                            }
                            checkedOutList = all.filter((u: any) => {
                                const statuses = u?.attributes?.check_user_area_statuses;
                                if (!Array.isArray(statuses)) return false;
                                return statuses.some(
                                    (s: any) =>
                                        String(s?.session_area_id ?? "") === String(sessionAreaId) && s?.check_out
                                );
                            });
                        } else throw err;
                    }
                    const notCheckedIn = notCheckedInRes?.data?.data || [];
                    const checkedIn = checkedInRes?.data?.data || [];
                    const byId = new Map<string | number, EnrolledUser>();
                    [...notCheckedIn, ...checkedIn, ...checkedOutList].forEach((u) => byId.set(u.id, u));
                    list = Array.from(byId.values());
                } else if (view === "checked_in") {
                    const response = await getCheckOuts(eventId, sessionAreaId);
                    list = response?.data?.data || [];
                } else {
                    // checked_out: users who have already checked out
                    try {
                        const response = await getCheckedOut(eventId, sessionAreaId);
                        list = response?.data?.data || [];
                    } catch (err: any) {
                        if (err?.response?.status === 404) {
                            const all: any[] = [];
                            let page = 1;
                            let hasMore = true;
                            while (hasMore) {
                                const res = await getEventUsers(String(eventId), { page, per_page: 100 });
                                const data = res?.data?.data || res?.data;
                                const items = Array.isArray(data) ? data : data?.data || [];
                                if (items.length === 0) break;
                                all.push(...items);
                                const meta = res?.data?.meta?.pagination || res?.data?.pagination;
                                hasMore = meta?.next_page != null && items.length === 100;
                                page++;
                            }
                            list = all.filter((u: any) => {
                                const statuses = u?.attributes?.check_user_area_statuses;
                                if (!Array.isArray(statuses)) return false;
                                return statuses.some(
                                    (s: any) =>
                                        String(s?.session_area_id ?? "") === String(sessionAreaId) && s?.check_out
                                );
                            });
                        } else throw err;
                    }
                }

                setEnrolledUsers(list);
            } catch (err) {
                console.error("Error fetching users:", err);
                showNotification("Failed to fetch users.", "error");
                setEnrolledUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [view, eventId, sessionAreaId]);

    const handleAreaCheckIn = async (userIds: (string | number)[], userName?: string) => {
        if (!eventId || !sessionAreaId) {
            showNotification("Missing event or session area ID.", "error");
            return;
        }

        if (userIds.length === 0) {
            showNotification("No users selected.", "warning");
            return;
        }

        console.log("🚀 Area check-in payload:", userIds);

        try {
            showNotification(`Checking in ${userIds.length} user${userIds.length > 1 ? "s" : ""}...`, "info");

            // Run all check-ins concurrently
            await Promise.all(
                userIds.map((userId) =>
                    postCheckIns(eventId, sessionAreaId, userId)
                )
            );

            showNotification(
                userIds.length > 1
                    ? `✅ Checked in ${userIds.length} users successfully!`
                    : `✅ ${userName || "User"} checked in successfully!`,
                "success"
            );

            // ✅ Remove checked-in users
            setEnrolledUsers((prev) => prev.filter((u) => !userIds.includes(u.id)));
            setSelectedUsers([]);
        } catch (err) {
            console.error("❌ Area check-in failed:", err);
            showNotification("Failed to check in some users.", "error");
        }
    };

    const handleQRCodeScan = async (qrData: string) => {
        if (!eventId || !sessionAreaId) {
            showNotification("Missing event or session area ID.", "error");
            return;
        }

        try {
            if (view === "registered_users") {
                // ✅ Area Token Check-In
                await QRCheckIn(eventId, sessionAreaId, qrData);
                showNotification("User checked in to area successfully!", "success");

                // 🔄 Refresh users after check-in
                const updatedUsers = await getCheckIns(eventId, sessionAreaId);
                setEnrolledUsers(updatedUsers.data.data || []);
            } else {
                // ✅ Area Token Check-Out
                try {
                    await QRCheckOut(eventId, sessionAreaId, qrData);
                    console.log("✅ Area check-out completed");
                } catch (checkoutError: any) {
                    console.warn("⚠️ Area check-out error, verifying...");
                }

                // 🔄 Refresh users after check-out
                const updatedUsers = await getCheckOuts(eventId, sessionAreaId);
                console.log("📋 Updated users after area checkout:", updatedUsers.data);

                // Check if user was actually removed
                const userStillExists = updatedUsers.data.data?.some(
                    (u: any) =>
                        u.attributes?.token === qrData || String(u.id) === String(qrData)
                );

                if (!userStillExists) {
                    showNotification("User checked out from area successfully!", "success");
                } else {
                    showNotification("Failed to check out user from area.", "error");
                }

                setEnrolledUsers(updatedUsers.data.data || []);
            }
        } catch (error: any) {
            console.error("❌ Token operation failed:", error);

            const errorMessage =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                `Failed to ${view === "registered_users" ? "check in" : "check out"} user.`;
            showNotification(errorMessage, "error");
        }
    };

    const handleAreaCheckOut = async (userIds: (string | number)[], userName?: string) => {
        if (!eventId || !sessionAreaId) {
            showNotification("Missing event or session area ID.", "error");
            return;
        }

        if (userIds.length === 0) {
            showNotification("No users selected.", "warning");
            return;
        }

        console.log("🚀 Area check-out payload:", userIds);

        try {
            showNotification(`Checking out ${userIds.length} user${userIds.length > 1 ? "s" : ""}...`, "info");

            // Run all check-outs concurrently
            await Promise.all(
                userIds.map((userId) =>
                    postCheckOuts(eventId, sessionAreaId, userId)
                )
            );

            showNotification(
                userIds.length > 1
                    ? `✅ Checked out ${userIds.length} users successfully!`
                    : `✅ ${userName || "User"} checked out successfully!`,
                "success"
            );

            // ✅ Remove checked-out users from the list
            setEnrolledUsers((prev) => prev.filter((u) => !userIds.includes(u.id)));
            setSelectedUsers([]);
        } catch (err) {
            console.error("❌ Area check-out failed:", err);
            showNotification("Failed to check out some users.", "error");
        }
    };

    // keep selectedUsers only for currently loaded users (remove stale ids)
    useEffect(() => {
        if (selectedUsers.length === 0) return;
        const currentIds = new Set(enrolledUsers.map(u => u.id));
        setSelectedUsers(prev => prev.filter(id => currentIds.has(id)));
    }, [enrolledUsers]);

    // clear selection when view changes (optional, improves clarity)
    useEffect(() => {
        setSelectedUsers([]);
    }, [view]);

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const toggleUserSelection = (userId: string | number) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const toggleSelectAll = () => {
        const idsToToggle = view === "registered_users" ? notCheckedInUserIds : enrolledUsers.map((u) => u.id);
        if (selectedUsers.length === idsToToggle.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(idsToToggle);
        }
    };

    // 📷 Start Camera and QR Scanner
    const startCamera = async () => {
        const cameraElement = document.getElementById("camera-container");
        if (!cameraElement) {
            showNotification("Camera container not rendered yet.", "error");
            return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showNotification("Camera not supported by this browser.", "error");
            return;
        }

        if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
            showNotification("Camera requires HTTPS or localhost.", "error");
            return;
        }

        const html5QrCode = new Html5Qrcode("camera-container");
        scannerRef.current = html5QrCode;

        try {
            await html5QrCode.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
                (decodedText) => {
                    console.log("✅ QR Code scanned:", decodedText);
                    setScannedData(decodedText);
                    showNotification(`Scanned: ${decodedText}`, "success");
                    handleQRCodeScan(decodedText);
                    stopCamera();
                },
                (errorMessage) => {
                    if (!errorMessage.includes("NotFoundException")) {
                        console.warn("QR scan error:", errorMessage);
                    }
                }
            );

            setIsCameraActive(true);
            console.log("📷 Camera Open");
        } catch (err: any) {
            console.error("❌ Camera start failed:", err);
            showNotification("Failed to start camera.", "error");
            setIsCameraActive(false);
        }
    };

    useEffect(() => {
        if (isCameraActive) {
            startCamera();
        }
    }, [isCameraActive]);

    // 📷 Stop Camera
    const stopCamera = async () => {
        if (scannerRef.current && isCameraActive) {
            try {
                await scannerRef.current.stop();
                console.log("📷 Camera Closed");
                setIsCameraActive(false);
            } catch (err) {
                console.error("Error stopping camera:", err);
            }
        }
    };

    useEffect(() => {
        if (showInput && inputRef.current) {
            inputRef.current.focus(); // 👈 auto focus when shown
        }
    }, [showInput]);

    const formatDateTime = (dateString: string) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hours = date.getHours();
        const mins = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const h12 = hours % 12 || 12;
        const m = mins < 10 ? `0${mins}` : mins;
        return `${day}/${month}/${year}, ${h12}:${m} ${ampm}`;
    };

    const getCheckOutTime = (user: EnrolledUser) => {
        const statuses = user?.attributes?.check_user_area_statuses;
        if (!Array.isArray(statuses) || !sessionAreaId) return null;
        const forArea = statuses.find(
            (s: any) => String(s?.session_area_id ?? "") === String(sessionAreaId)
        );
        return forArea?.check_out ?? null;
    };

    const getCheckInTime = (user: EnrolledUser) => {
        const statuses = user?.attributes?.check_user_area_statuses;
        if (!Array.isArray(statuses) || !sessionAreaId) return null;
        const forArea = statuses.find(
            (s: any) => String(s?.session_area_id ?? "") === String(sessionAreaId)
        );
        return forArea?.check_in ?? null;
    };

    /** Status for Registered Users tab: "Not Checked-In" | "Checked-In" | "Checked Out" */
    const getRegisteredUserStatus = (user: EnrolledUser) => {
        const checkOut = getCheckOutTime(user);
        if (checkOut) return "Checked Out";
        const checkIn = getCheckInTime(user);
        if (checkIn) return "Checked-In";
        return "Not Checked-In";
    };

    /** In Registered Users tab, only these users can be selected for bulk check-in */
    const notCheckedInUserIds =
        view === "registered_users"
            ? enrolledUsers.filter((u) => getRegisteredUserStatus(u) === "Not Checked-In").map((u) => u.id)
            : [];

    const getFilteredUsersForExport = () => filteredUsers;

    const escapeCsvCell = (val: string | number): string => {
        const s = String(val ?? "").replace(/"/g, '""');
        return s.includes(",") || s.includes("\n") || s.includes('"') ? `"${s}"` : s;
    };

    const handleExportCsv = () => {
        if (!eventId || !sessionAreaId) {
            showNotification("Missing event or session area.", "error");
            return;
        }
        setExportingCsv(true);
        try {
            const users = getFilteredUsersForExport();
            const suffix =
                view === "registered_users"
                    ? "need_check_in"
                    : view === "checked_in"
                    ? "need_check_out"
                    : "checked_out";
            const baseHeaders = [
                "ID",
                "Name",
                "Email",
                "User Type",
                "Status",
                "Check-In Time",
                "Check-Out Time",
            ];
            const rows = users.map((user: EnrolledUser) => {
                const status =
                    view === "registered_users"
                        ? "Not Checked In"
                        : view === "checked_in"
                        ? "Checked In"
                        : "Checked Out";
                const checkIn = getCheckInTime(user);
                const checkOut = getCheckOutTime(user);
                return [
                    user.id,
                    user.attributes?.name ?? "",
                    user.attributes?.email ?? "",
                    user.attributes?.user_type ?? "",
                    status,
                    checkIn ? formatDateTime(checkIn) : "",
                    checkOut ? formatDateTime(checkOut) : "",
                ].map(escapeCsvCell);
            });
            const csv = [baseHeaders.join(","), ...rows.map((r) => r.join(","))].join("\n");
            const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `gate_${suffix}_${eventId}_${sessionAreaId}_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            showNotification(`Exported ${users.length} users (CSV).`, "success");
        } catch (e) {
            console.error(e);
            showNotification("Export failed.", "error");
        } finally {
            setExportingCsv(false);
        }
    };

    const handleExportExcel = () => {
        if (!eventId || !sessionAreaId) {
            showNotification("Missing event or session area.", "error");
            return;
        }
        setExportingExcel(true);
        try {
            const users = getFilteredUsersForExport();
            const suffix =
                view === "registered_users"
                    ? "need_check_in"
                    : view === "checked_in"
                    ? "need_check_out"
                    : "checked_out";
            const baseHeaders = [
                "ID",
                "Name",
                "Email",
                "User Type",
                "Status",
                "Check-In Time",
                "Check-Out Time",
            ];
            const rowArrays = users.map((user: EnrolledUser) => {
                const status =
                    view === "registered_users"
                        ? "Not Checked In"
                        : view === "checked_in"
                        ? "Checked In"
                        : "Checked Out";
                const checkIn = getCheckInTime(user);
                const checkOut = getCheckOutTime(user);
                return [
                    user.id,
                    user.attributes?.name ?? "",
                    user.attributes?.email ?? "",
                    user.attributes?.user_type ?? "",
                    status,
                    checkIn ? formatDateTime(checkIn) : "",
                    checkOut ? formatDateTime(checkOut) : "",
                ];
            });
            const sheetData: (string | number)[][] = [baseHeaders, ...rowArrays];
            const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Gate");
            const wbout = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            }) as number[];
            const blob = new Blob([new Uint8Array(wbout)], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `gate_${suffix}_${eventId}_${sessionAreaId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
            showNotification(`Exported ${users.length} users (Excel).`, "success");
        } catch (e) {
            console.error(e);
            showNotification("Export failed.", "error");
        } finally {
            setExportingExcel(false);
        }
    };

    return (
        <div className="min-h-screen  from-gray-50 to-gray-100 animate-fade-in relative">
            {/* Toast Notification - Top Right */}
            {notification && (
                <div
                    className={`fixed top-4 right-4 z-[9999] min-w-[320px] max-w-md p-4 rounded-lg shadow-2xl transform transition-all duration-300 ease-in-out border-2 ${
                        notification.type === "success"
                            ? "bg-green-500 text-white border-green-600"
                            : notification.type === "error"
                            ? "bg-red-500 text-white border-red-600"
                            : notification.type === "warning"
                            ? "bg-yellow-500 text-white border-yellow-600"
                            : "bg-blue-500 text-white border-blue-600"
                    }`}
                    style={{
                        animation: "slideInRight 0.3s ease-out",
                    }}
                >
                    <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-sm flex-1">{notification.message}</p>
                        <button
                            onClick={() => setNotification(null)}
                            className="text-white hover:text-gray-200 transition text-xl font-bold leading-none ml-2 flex-shrink-0"
                            aria-label="Close notification"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>

            <div className="mx-auto p-6">

                {/* Header */}
                <div className="flex items-center justify-between bg-white p-6 rounded-t-2xl shadow-sm">
                    <div className="flex items-center gap-2">
                        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-semibold text-gray-800">
                            {gate?.attributes?.type}
                        </h1>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white p-6 shadow-sm rounded-b-2xl mt-1">

                    {/* Export CSV / Excel - on top */}
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <p className="text-sm text-gray-600 mb-3">
                            Export respects current tab and search filter.
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={handleExportCsv}
                                disabled={exportingCsv || loading}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm"
                            >
                                <FileDown className="w-4 h-4" />
                                {exportingCsv ? "Exporting…" : "Export CSV"}
                            </button>
                            <button
                                onClick={handleExportExcel}
                                disabled={exportingExcel || loading}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                {exportingExcel ? "Exporting…" : "Export Excel"}
                            </button>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex gap-2 mb-4">
                        <button
                            className={`px-4 py-2 rounded-lg ${view === "registered_users" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                            onClick={() => setView("registered_users")}
                        >
                            Registered Users
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg ${view === "checked_in" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                            onClick={() => setView("checked_in")}
                        >
                            Checked-In
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg ${view === "checked_out" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                            onClick={() => setView("checked_out")}
                        >
                            Checked Out
                        </button>
                    </div>

                    {/* Camera Controls */}
                    <div className="flex gap-2 mb-4">
                        {!isCameraActive ? (
                            <button
                                className="px-4 py-2 bg-[#EAF1FF]  text-[#202242] rounded-lg flex items-center gap-2"
                                onClick={() => setIsCameraActive(true)}
                            >
                                Camera
                            </button>
                        ) : (
                            <button
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
                                onClick={stopCamera}
                            >
                                Close Camera
                            </button>
                        )}
                    </div>

                    {/* Camera Container */}
                    {isCameraActive && (
                        <div className="mb-6">
                            <div
                                id="camera-container"
                                className="w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-lg"
                            ></div>
                            <p className="text-center mt-2 text-sm text-gray-600">
                                📷 Point camera at QR code to scan
                            </p>
                        </div>
                    )}

                    {/* Scanned Data Display */}
                    {scannedData && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800">
                                <strong>Last Scanned:</strong> {scannedData}
                            </p>
                        </div>
                    )}


                    {/* 🔍 Manual / Scanner Token Input */}
                    <div className="flex flex-col mt-4">
                        <div>
                            <button
                                onClick={() => setShowInput((prev) => !prev)}
                                className="px-4 py-2 bg-[#EAF1FF] text-[#202242] rounded-lg transition"
                            >
                                {showInput ? "Close Scanner" : "Open Scanner Input"}
                            </button>
                        </div>

                        {showInput && (
                            <div className="my-2 flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Scanner Token"
                                    className="flex p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EAF1FF] outline-none"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            const token = (e.target as HTMLInputElement).value.trim();
                                            if (token) {
                                                handleQRCodeScan(token);
                                                (e.target as HTMLInputElement).value = "";
                                            }
                                        }
                                    }}
                                />
                                <button
                                    className="px-4 py-2 bg-[#EAF1FF] text-[#202242] rounded-lg"
                                    onClick={() => {
                                        const token = inputRef.current?.value.trim();
                                        if (token) {
                                            handleQRCodeScan(token);
                                            inputRef.current!.value = "";
                                        } else {
                                            showNotification("Please enter a token first.", "warning");
                                        }
                                    }}
                                >
                                    Submit
                                </button>
                            </div>
                        )}
                    </div>


                    {/* Users Table */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-800">
                                {view === "registered_users"
                                    ? `Registered Users ${enrolledUsers.length}`
                                    : view === "checked_in"
                                    ? `Checked-In Users ${enrolledUsers.length}`
                                    : `Checked Out Users ${enrolledUsers.length}`}
                            </h3>
                            <Search
                                value={searchTerm}
                                onChange={(val) => {
                                    setSearchTerm(val);
                                    setCurrentPage(1); // reset to first page when searching
                                }}
                                placeholder="Search users..."
                            />
                        </div>

                        {selectedUsers.length > 0 && view !== "checked_out" && (
                            <div className="flex mb-4">
                                {view === "registered_users" ? (
                                    <button
                                        onClick={() => handleAreaCheckIn(selectedUsers)}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                                    >
                                        {selectedUsers.length} Bulk Check-In
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleAreaCheckOut(selectedUsers)}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                    >
                                        {selectedUsers.length} Bulk Check-Out
                                    </button>
                                )}
                            </div>
                        )}

                        {loading ? (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            {view !== "checked_out" && (
                                                <th className="px-4 py-3">
                                                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                                                </th>
                                            )}
                                            <th className="px-4 py-3 text-left">ID</th>
                                            <th className="px-4 py-3 text-left">Name</th>
                                            <th className="px-4 py-3 text-left">Email</th>
                                            <th className="px-4 py-3 text-left">User type</th>
                                            {view === "registered_users" && (
                                                <th className="px-4 py-3 text-left">Status</th>
                                            )}
                                            {view === "checked_out" && (
                                                <th className="px-4 py-3 text-left">Check-Out Time</th>
                                            )}
                                            {view !== "checked_out" && (
                                                <th className="px-4 py-3 text-left">Action</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {[1, 2, 3, 4, 5].map((index) => (
                                            <tr key={index} className="animate-pulse">
                                                {view !== "checked_out" && (
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="h-4 w-4 bg-gray-200 rounded"></div>
                                                    </td>
                                                )}
                                                <td className="px-4 py-3">
                                                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                                </td>
                                                {view === "registered_users" && (
                                                    <td className="px-4 py-3">
                                                        <div className="h-6 bg-gray-200 rounded-full w-28"></div>
                                                    </td>
                                                )}
                                                {view === "checked_out" && (
                                                    <td className="px-4 py-3">
                                                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                                                    </td>
                                                )}
                                                {view !== "checked_out" && (
                                                    <td className="px-4 py-3">
                                                        <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            {view !== "checked_out" && (
                                                <th className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            view === "registered_users"
                                                                ? notCheckedInUserIds.length > 0 && selectedUsers.length === notCheckedInUserIds.length
                                                                : enrolledUsers.length > 0 && selectedUsers.length === enrolledUsers.length
                                                        }
                                                        onChange={toggleSelectAll}
                                                    />
                                                </th>
                                            )}
                                            <th className="px-4 py-3 text-left">ID</th>
                                            <th className="px-4 py-3 text-left">Name</th>
                                            <th className="px-4 py-3 text-left">Email</th>
                                            <th className="px-4 py-3 text-left">User type</th>
                                            {view === "registered_users" && (
                                                <th className="px-4 py-3 text-left">Status</th>
                                            )}
                                            {view === "checked_out" && (
                                                <th className="px-4 py-3 text-left">Check-Out Time</th>
                                            )}
                                            {view !== "checked_out" && (
                                                <th className="px-4 py-3 text-left">Action</th>
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200">
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={
                                                        view === "registered_users" ? 7 :
                                                        view === "checked_in" ? 6 : 5
                                                    }
                                                    className="px-4 py-8 text-center text-gray-500"
                                                >
                                                    No users found
                                                </td>
                                            </tr>
                                        ) : (
                                            currentUsers.map((user) => {
                                                const checkOutTime = getCheckOutTime(user);
                                                return (
                                                    <tr key={user.id} className="hover:bg-gray-50 transition">
                                                        {view !== "checked_out" && (
                                                            <td className="px-4 py-3 text-center">
                                                                {view === "registered_users" ? (
                                                                    getRegisteredUserStatus(user) === "Not Checked-In" ? (
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedUsers.includes(user.id)}
                                                                            onChange={() => toggleUserSelection(user.id)}
                                                                        />
                                                                    ) : (
                                                                        <span className="inline-block w-4 h-4" aria-hidden />
                                                                    )
                                                                ) : (
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedUsers.includes(user.id)}
                                                                        onChange={() => toggleUserSelection(user.id)}
                                                                    />
                                                                )}
                                                            </td>
                                                        )}
                                                        <td className="px-4 py-3 text-sm text-gray-600">{user.id}</td>
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{user.attributes.name}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{user.attributes.email}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{user.attributes.user_type}</td>
                                                        {view === "registered_users" && (() => {
                                                            const status = getRegisteredUserStatus(user);
                                                            return (
                                                                <td className="px-4 py-3 text-sm">
                                                                    {status === "Not Checked-In" && (
                                                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                                                                            Not Checked-In
                                                                        </span>
                                                                    )}
                                                                    {status === "Checked-In" && (
                                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                                                            Checked-In
                                                                        </span>
                                                                    )}
                                                                    {status === "Checked Out" && (
                                                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                                                            Checked Out
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            );
                                                        })()}
                                                        {view === "checked_out" && (
                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                {checkOutTime ? formatDateTime(checkOutTime) : "—"}
                                                            </td>
                                                        )}
                                                        {view !== "checked_out" && (
                                                            <td className="px-4 py-3">
                                                                {view === "registered_users" ? (
                                                                    <button
                                                                        className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                                                                        onClick={() => handleAreaCheckIn([user.id], user.attributes.name)}
                                                                    >
                                                                        Check-In
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                                                                        onClick={() =>
                                                                            handleAreaCheckOut(
                                                                                [user.id],
                                                                                user.attributes.name
                                                                            )
                                                                        }
                                                                    >
                                                                        Check-Out
                                                                    </button>
                                                                )}
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />

                    </div>
                </div>
            </div>
        </div>
    );
}