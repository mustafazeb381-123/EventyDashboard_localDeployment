import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Search, Camera, X } from "lucide-react";
import { toast } from "react-toastify";
import { getUsersNeedCheckIn, checkInUser, checkOutUser, getUsersNeedCheckOut, bulkCheckInUsers } from "@/apis/apiHelpers";
import { Html5Qrcode } from "html5-qrcode";

interface GateOnboardingProps {
    gate: {
        id: string | number;
        attributes?: {
            event_id?: string | number;
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
        check_user_event_status?: string | number;
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

    // Fetch users based on active view
    useEffect(() => {
        const fetchUsers = async () => {
            if (!eventId) return;
            setLoading(true);

            try {
                let response;
                if (view === "registered_users") {
                    response = await getUsersNeedCheckIn(eventId);
                } else {
                    response = await getUsersNeedCheckOut(eventId);
                    console.log("📦 Checked-In Users (Need Checkout):", response.data);
                }

                setEnrolledUsers(response.data.data || []);
            } catch (err) {
                console.error("Error fetching users:", err);
                toast.error("Failed to fetch users.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [gate, view, eventId]);

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

    // Handle check-in
    const handleCheckinUser = async (userId: string | number, userName?: string) => {
        if (!eventId) return;
        try {
            await checkInUser(String(eventId), userId);
            toast.success(`${userName || "User"} checked in successfully!`);
            setEnrolledUsers(prev =>
                prev.filter(u => u.id !== userId)
            );
        } catch (err) {
            console.error("Check-in failed:", err);
            toast.error("Failed to check in user.");
        }
    };

    // Handle check-out
    const handleCheckOutUser = async (
        userId: string | number,
        userName?: string,
        statusId?: string | number
    ) => {
        if (!eventId || !statusId) return;

        try {
            const payload = {
                event_user_ids: [userId]
            };
            console.log("Check-Out Payload:", payload);

            const response = await checkOutUser(String(eventId), userId, statusId);
            console.log("Check-out response:", response.data);

            toast.success(`${userName || "User"} checked out successfully!`);
            setEnrolledUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            console.error("Check-out failed:", err);
            toast.error("Failed to check out user.");
        }
    };

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

    const handleBulkCheckIn = async () => {
        if (!eventId || selectedUsers.length === 0) return toast.warn("No users selected.");

        console.log("Bulk check-in payload:", selectedUsers.map(id => ({ event_user_id: id })));

        try {
            await bulkCheckInUsers(eventId, selectedUsers.map(String));
            toast.success(`Checked in ${selectedUsers.length} users successfully!`);
            setEnrolledUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
            setSelectedUsers([]);
        } catch (err) {
            console.error("Bulk check-in failed:", err);
            toast.error("Failed to check in some users.");
        }
    };

    const handleBulkCheckOut = async () => {
        if (!eventId || selectedUsers.length === 0) return toast.warn("No users selected.");

        try {
            for (const user of enrolledUsers.filter(u => selectedUsers.includes(u.id))) {
                if (!user.attributes.check_user_event_status) {
                    console.warn(`Skipping user ${user.id}: no statusId`);
                    continue;
                }

                const payload = { event_user_id: user.id };
                console.log("Check-Out Payload for user:", payload);

                const response = await checkOutUser(String(eventId), user.id, user.attributes.check_user_event_status);
                console.log(`Check-out response for user ${user.id}:`, response.data);
            }

            toast.success(`Checked out ${selectedUsers.length} users successfully!`);
            setEnrolledUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
            setSelectedUsers([]);
        } catch (err) {
            console.error("Bulk check-out failed:", err);
            toast.error("Failed to check out some users.");
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
            console.log("📷 Camera started successfully");
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
                console.log("📷 Camera stopped");
                setIsCameraActive(false);
            } catch (err) {
                console.error("Error stopping camera:", err);
            }
        }
    };

    // Handle QR Code Scan - Auto Check-In/Check-Out
    const handleQRCodeScan = async (qrData: string) => {
        // Parse QR code data (assume it contains user ID)
        // Adjust this based on your QR code format
        const userId = qrData; // Or parse JSON if needed: JSON.parse(qrData).userId

        const user = enrolledUsers.find(u => String(u.id) === String(userId));

        if (!user) {
            toast.error("User not found in the list.");
            return;
        }

        if (view === "registered_users") {
            // Auto Check-In
            await handleCheckinUser(user.id, user.attributes.name);
        } else {
            // Auto Check-Out
            await handleCheckOutUser(
                user.id,
                user.attributes.name,
                user.attributes.check_user_event_status
            );
        }
    };

    const notCheckedInUsers = enrolledUsers.filter(user => !user.attributes.check_in);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 animate-fade-in">
            <div className="mx-auto p-6">

                {/* Header */}
                <div className="flex items-center justify-between bg-white p-6 rounded-t-2xl shadow-sm">
                    <div className="flex items-center gap-2">
                        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-semibold text-gray-800">
                            Gate {gate?.id}
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
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                                onClick={() => setIsCameraActive(true)}
                            >
                                <Camera className="w-5 h-5" />
                                Open Camera
                            </button>
                        ) : (
                            <button
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
                                onClick={stopCamera}
                            >
                                <X className="w-5 h-5" />
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

                    {/* Users Table */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-800">
                                {view === "registered_users" ? `Registered Users ${notCheckedInUsers.length}` : `Checked-In Users ${enrolledUsers.length}`}
                            </h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        {selectedUsers.length > 0 && (
                            <div className="flex mb-4">
                                {view === "registered_users" ? (
                                    <button
                                        onClick={handleBulkCheckIn}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                                    >
                                        {selectedUsers.length} Bulk Check-In
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleBulkCheckOut}
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
                                            <th className="px-4 py-3 text-left">Check-in Status</th>
                                            <th className="px-4 py-3 text-left">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200">
                                        {enrolledUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                                    No users found
                                                </td>
                                            </tr>
                                        ) : (
                                            enrolledUsers.map((user) => (
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
                                                                Checked In at {user.attributes.check_in}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {view === "registered_users" ? (
                                                            <button
                                                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                                                                onClick={() => handleCheckinUser(user.id, user.attributes.name)}
                                                            >
                                                                In
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                                                                onClick={() =>
                                                                    handleCheckOutUser(
                                                                        user.id,
                                                                        user.attributes.name,
                                                                        user.attributes.check_user_event_status
                                                                    )
                                                                }
                                                            >
                                                                Out
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
                    </div>
                </div>
            </div>
        </div>
    );
}