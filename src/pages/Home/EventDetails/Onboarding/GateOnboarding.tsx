import { useState, useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { toast } from "react-toastify";
import { Html5Qrcode } from "html5-qrcode";
import Search from "@/components/Search";
import Pagination from "@/components/Pagination";
import {
    getCheckIns,
    getCheckOuts,
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
        name: string;
        email: string;
        user_type: string;
        check_in?: string | null;
        check_user_area_statuses?: {
            check_in?: string | null;
            check_out?: string | null;
        }[];
    };
}

export default function GateOnboarding({ gate, onBack }: GateOnboardingProps) {

    const [enrolledUsers, setEnrolledUsers] = useState<EnrolledUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"registered_users" | "checked_in">("registered_users");
    const [selectedUsers, setSelectedUsers] = useState<(string | number)[]>([]);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [scannedData, setScannedData] = useState<string | null>(null);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const eventId = gate?.attributes?.event_id;
    const sessionAreaId = gate?.id;

    const [showInput, setShowInput] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const notCheckedInUsers = enrolledUsers.filter(user => !user.attributes.check_in);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5; // 👈 change if you want larger/smaller pages

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
        const fetchUsers = async () => {
            if (!eventId || !sessionAreaId) return;
            setLoading(true);

            try {
                let response;

                if (view === "registered_users") {
                    // ✅ Get users who need check-in for this session area
                    response = await getCheckIns(eventId, sessionAreaId);
                } else {
                    // ✅ Get users who need check-out for this session area
                    response = await getCheckOuts(eventId, sessionAreaId);
                }

                setEnrolledUsers(response?.data?.data || []);
                console.log("📦 Users fetched:", response?.data);
            } catch (err) {
                console.error("Error fetching users:", err);
                toast.error("Failed to fetch users.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [view, eventId, sessionAreaId]);

    const handleAreaCheckIn = async (userIds: (string | number)[], userName?: string) => {
        if (!eventId || !sessionAreaId) {
            toast.error("Missing event or session area ID.");
            return;
        }

        if (userIds.length === 0) {
            toast.warn("No users selected.");
            return;
        }

        console.log("🚀 Area check-in payload:", userIds);

        try {
            toast.info(`Checking in ${userIds.length} user${userIds.length > 1 ? "s" : ""}...`);

            // Run all check-ins concurrently
            await Promise.all(
                userIds.map((userId) =>
                    postCheckIns(eventId, sessionAreaId, userId)
                )
            );

            toast.success(
                userIds.length > 1
                    ? `✅ Checked in ${userIds.length} users successfully!`
                    : `✅ ${userName || "User"} checked in successfully!`
            );

            // ✅ Remove checked-in users
            setEnrolledUsers((prev) => prev.filter((u) => !userIds.includes(u.id)));
            setSelectedUsers([]);
        } catch (err) {
            console.error("❌ Area check-in failed:", err);
            toast.error("Failed to check in some users.");
        }
    };

    const handleQRCodeScan = async (qrData: string) => {
        if (!eventId || !sessionAreaId) {
            toast.error("Missing event or session area ID.");
            return;
        }

        try {
            if (view === "registered_users") {
                // ✅ Area Token Check-In
                await QRCheckIn(eventId, sessionAreaId, qrData);
                toast.success("User checked in to area successfully!");

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
                    toast.success("User checked out from area successfully!");
                } else {
                    toast.error("Failed to check out user from area.");
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
            toast.error(errorMessage);
        }
    };

    const handleAreaCheckOut = async (userIds: (string | number)[], userName?: string) => {
        if (!eventId || !sessionAreaId) {
            toast.error("Missing event or session area ID.");
            return;
        }

        if (userIds.length === 0) {
            toast.warn("No users selected.");
            return;
        }

        console.log("🚀 Area check-out payload:", userIds);

        try {
            toast.info(`Checking out ${userIds.length} user${userIds.length > 1 ? "s" : ""}...`);

            // Run all check-outs concurrently
            await Promise.all(
                userIds.map((userId) =>
                    postCheckOuts(eventId, sessionAreaId, userId)
                )
            );

            toast.success(
                userIds.length > 1
                    ? `✅ Checked out ${userIds.length} users successfully!`
                    : `✅ ${userName || "User"} checked out successfully!`
            );

            // ✅ Remove checked-out users from the list
            setEnrolledUsers((prev) => prev.filter((u) => !userIds.includes(u.id)));
            setSelectedUsers([]);
        } catch (err) {
            console.error("❌ Area check-out failed:", err);
            toast.error("Failed to check out some users.");
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
        if (selectedUsers.length === enrolledUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(enrolledUsers.map(u => u.id));
        }
    };

    // 📷 Start Camera and QR Scanner
    const startCamera = async () => {
        const cameraElement = document.getElementById("camera-container");
        if (!cameraElement) {
            toast.error("Camera container not rendered yet.");
            return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            toast.error("Camera not supported by this browser.");
            return;
        }

        if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
            toast.error("Camera requires HTTPS or localhost.");
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
                    toast.success(`Scanned: ${decodedText}`);
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
            toast.error("Failed to start camera.");
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

    const formatCheckIn = (checkIn?: string | null) => {
        if (!checkIn) return "N/A";

        const date = new Date(checkIn);

        // Format as: day short-month year, 12-hour time
        const day = date.getDate(); // 1-31
        const month = date.toLocaleString("en-US", { month: "short" }); // Jan, Feb, etc.
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'

        return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    };

    return (
        <div className="min-h-screen  from-gray-50 to-gray-100 animate-fade-in">
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
                                            toast.warn("Please enter a token first.");
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
                                {view === "registered_users" ? `Registered Users ${notCheckedInUsers.length}` : `Checked-In Users ${enrolledUsers.length}`}
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

                        {selectedUsers.length > 0 && (
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
                            <div className="text-center py-8 text-gray-500">Loading users...</div>
                        ) : (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={enrolledUsers.length > 0 && selectedUsers.length === enrolledUsers.length}
                                                    onChange={toggleSelectAll}
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-left">ID</th>
                                            <th className="px-4 py-3 text-left">Name</th>
                                            <th className="px-4 py-3 text-left">Email</th>
                                            <th className="px-4 py-3 text-left">User type</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                            <th className="px-4 py-3 text-left">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200">
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                                    No users found
                                                </td>
                                            </tr>
                                        ) : (
                                            currentUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedUsers.includes(user.id)}
                                                            onChange={() => toggleUserSelection(user.id)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{user.id}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{user.attributes.name}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{user.attributes.email}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{user.attributes.user_type}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {view === "registered_users" ? (
                                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                                                                Not Checked In
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                                                {formatCheckIn(user.attributes?.check_user_area_statuses?.[0]?.check_in)}
                                                            </span>
                                                        )}
                                                    </td>
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
                                                </tr>
                                            ))
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