import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  BarChart2,
  ArrowLeft,
  Printer,
  MapPin,
  Calendar,
  Users,
  Send,
  UserCheck,
  Percent,
  Copy,
  Info,
} from "lucide-react";

function InvitationReport() {
  const navigate = useNavigate();
  const { invitationId } = useParams<{ invitationId: string }>();
  const location = useLocation();
  const state = location.state as {
    invitationName?: string;
    type?: string;
    createdAt?: string;
  } | null;

  const invitationName = state?.invitationName ?? "Copy of Copy of Althenayan Dinner";
  const type = state?.type ?? "Public-9";
  const createdAt = state?.createdAt ?? "January 27, 2026 at 15:04";

  // Static report stats (can be replaced with API later)
  const stats = {
    totalInvitations: 2,
    sent: 0,
    registered: 0,
    conversionRate: "0.0%",
    duplicateEmails: 0,
  };

  const handleBackToList = () => {
    navigate("/invitation", { state: location.state });
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Purple gradient banner */}
      <div
        className="relative rounded-xl overflow-hidden mb-6"
        style={{
          background: "linear-gradient(90deg, #6b4b9a 0%, #9b7bb8 100%)",
        }}
      >
        <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <BarChart2 size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Invitation Report</h1>
            </div>
            <p className="text-white text-lg font-medium mb-1">{invitationName}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/90">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} />
                {type}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} />
                Created: {createdAt}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-blue-200 text-blue-800 text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to List
            </button>
            <button
              onClick={handlePrintReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-blue-200 text-blue-800 text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              <Printer size={18} />
              Print Report
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Invitations - Purple */}
        <div
          className="rounded-xl p-6 border border-transparent"
          style={{
            background: "linear-gradient(135deg, #ede9f5 0%, #e0d8ed 100%)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(107, 75, 154, 0.2)" }}
            >
              <Users size={24} className="text-purple-700" />
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-800 mb-1">{stats.totalInvitations}</p>
          <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
            Total Invitations
          </p>
        </div>

        {/* Sent - Blue */}
        <div
          className="rounded-xl p-6 border border-transparent"
          style={{
            background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Send size={24} className="text-blue-700" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-800 mb-1">{stats.sent}</p>
          <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Sent</p>
        </div>

        {/* Registered - Green */}
        <div
          className="rounded-xl p-6 border border-transparent"
          style={{
            background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <UserCheck size={24} className="text-green-700" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-800 mb-1">{stats.registered}</p>
          <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
            Registered
          </p>
        </div>

        {/* Conversion Rate - Yellow */}
        <div
          className="rounded-xl p-6 border border-transparent"
          style={{
            background: "linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Percent size={24} className="text-yellow-800" />
            </div>
          </div>
          <p className="text-3xl font-bold text-yellow-800 mb-1">{stats.conversionRate}</p>
          <p className="text-sm font-semibold text-yellow-700 uppercase tracking-wide">
            Conversion Rate
          </p>
        </div>
      </div>

      {/* Duplicate Emails - Pink/Red (second row, first column) */}
      <div className="max-w-sm">
        <div
          className="rounded-xl p-6 border border-transparent"
          style={{
            background: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex items-center justify-center">
              <Copy size={28} className="text-red-400" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                <Info size={10} className="text-white" />
              </span>
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-800 mb-1">{stats.duplicateEmails}</p>
          <p className="text-sm font-semibold text-red-600 uppercase tracking-wide">
            Duplicate Emails
          </p>
        </div>
      </div>
    </div>
  );
}

export default InvitationReport;
