import React from "react";
import { Eye, Printer, Clock, User, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PrintBadgesHeaderProps {
  filteredUsersCount: number;
  selectedUsersCount: number;
  searchTerm: string;
  printCount: number;
  lastPrintedAt: Date | null;
  onPreviewSelected: () => void;
  disablePreview: boolean;
}

const formatLastPrinted = (date: Date) =>
  date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm border border-gray-100 min-w-0 flex-1">
    <div className="flex-shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-bold text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

const PrintBadgesHeader: React.FC<PrintBadgesHeaderProps> = ({
  filteredUsersCount,
  selectedUsersCount,
  searchTerm: _searchTerm,
  printCount,
  lastPrintedAt,
  onPreviewSelected,
  disablePreview,
}) => {
  const { t } = useTranslation("dashboard");

  const lastPrintedLabel = lastPrintedAt
    ? formatLastPrinted(lastPrintedAt)
    : t("printBadges.never");

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {t("printBadges.manageBadges")}
            </h1>
          </div>
          <button
            onClick={onPreviewSelected}
            disabled={disablePreview}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-lg transition-all duration-200 w-fit"
          >
            <Eye size={18} />
            {t("printBadges.previewSelected")} ({selectedUsersCount})
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={<User className="w-6 h-6 text-gray-400" />}
            label={t("printBadges.users")}
            value={filteredUsersCount}
          />
          <StatCard
            icon={
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            }
            label={t("printBadges.selected")}
            value={selectedUsersCount}
          />
          <StatCard
            icon={<Printer className="w-6 h-6 text-blue-500" />}
            label={t("printBadges.badgesPrinted")}
            value={printCount}
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-amber-500" />}
            label={t("printBadges.lastPrinted")}
            value={lastPrintedLabel}
          />
        </div>
      </div>
    </div>
  );
};

export default PrintBadgesHeader;
