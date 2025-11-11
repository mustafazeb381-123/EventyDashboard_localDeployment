import React, { useState } from "react";
import {
  ChevronLeft,
  Check,
  Trash2,
  Edit,
  Plus,
  X,
} from "lucide-react";

interface AdminManagementProps {
  onNext: (eventId?: string | number) => void;
  onPrevious?: () => void;
  eventId?: string | number;
  currentStep: number;
  totalSteps: number;
}

interface Admin {
  id: number;
  email: string;
}

export default function AdminManagement({
  onNext,
  onPrevious,
  eventId,
  currentStep,
  totalSteps,
}: AdminManagementProps) {
  const [admins, setAdmins] = useState<Admin[]>([
    { id: 1, email: "merom8703@gmail.com" },
    { id: 2, email: "contact@techinnovations.org" },
    { id: 3, email: "support@ecommercehub.com" },
    { id: 4, email: "luna_star99@yahoo.com" },
    { id: 5, email: "info@creativedesigns.net" },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [selectedAdmins, setSelectedAdmins] = useState<number[]>([]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(admins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAdmins = admins.slice(startIndex, endIndex);

  const handleAddAdmin = () => {
    if (newAdminEmail.trim()) {
      const newAdmin: Admin = {
        id: admins.length + 1,
        email: newAdminEmail.trim(),
      };
      setAdmins([...admins, newAdmin]);
      setNewAdminEmail("");
      setShowAddModal(false);
    }
  };

  const handleDeleteAdmin = (id: number) => {
    setAdmins(admins.filter((admin) => admin.id !== id));
    setSelectedAdmins(selectedAdmins.filter((adminId) => adminId !== id));
  };

  const handleSelectAdmin = (id: number) => {
    if (selectedAdmins.includes(id)) {
      setSelectedAdmins(selectedAdmins.filter((adminId) => adminId !== id));
    } else {
      setSelectedAdmins([...selectedAdmins, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedAdmins.length === currentAdmins.length) {
      setSelectedAdmins([]);
    } else {
      setSelectedAdmins(currentAdmins.map((admin) => admin.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Step Indicator */}
      <div className="bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ChevronLeft
              className="text-gray-500 cursor-pointer hover:text-gray-700"
              size={20}
              onClick={onPrevious}
            />
            <h1 className="text-2xl font-semibold text-gray-800">
              Admin Management
            </h1>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, index) => index).map(
              (step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      step === currentStep
                        ? "border-pink-500 bg-white text-pink-500"
                        : step < currentStep
                        ? "bg-pink-500 border-pink-500 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {step < currentStep ? (
                      <Check size={16} />
                    ) : (
                      <span className="text-sm font-medium">{step + 1}</span>
                    )}
                  </div>
                  {step < totalSteps - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-1 ${
                        step < currentStep ? "bg-pink-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              )
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Home</span>
          <span>›</span>
          <span className="text-gray-700">Admin Management</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="bg-white rounded-t-lg border-b">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-3">
                  Assigned Users
                </button>
                <span className="text-sm text-gray-500 font-medium">
                  {admins.length} Admins
                </span>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Plus size={16} />
                Add Admin
              </button>
            </div>
          </div>

          {/* Admin Table */}
          <div className="bg-white rounded-b-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedAdmins.length === currentAdmins.length &&
                          currentAdmins.length > 0
                        }
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedAdmins.includes(admin.id)}
                          onChange={() => handleSelectAdmin(admin.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {String(admin.id).padStart(2, "0")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-700 transition-colors">
                            <Edit size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Next Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => onNext(eventId)}
              className="px-8 py-3 bg-indigo-950 text-white rounded-lg font-medium hover:bg-indigo-900 transition-colors flex items-center gap-2"
            >
              Next
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Add New Admin
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewAdminEmail("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewAdminEmail("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAdmin}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}