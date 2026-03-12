import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Clock,
  Edit,
  MapPin,
  Loader2,
  Share2,
  XCircle,
  UserX,
  ArrowUp,
  Plus,
  QrCode,
  MailCheck,
  FileText,
  Star,
  UserCheck,
  Users,
  CheckCircle,
  AlertCircle,
  Printer,
  UserCog,
  Crown,
  UserPlus,
  Send,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useWorkspaceNavigate } from "@/hooks/useWorkspaceNavigate";
import {
  getEventbyId,
  updateEventById,
  getEventMetrics,
  getEventUsers,
  getSessionAreaApi,
  getCheckOuts,
} from "@/apis/apiHelpers";
import { getRegistrationUrl } from "@/pages/Home/EventDetails/Invitation/resolveInvitationEmailLinks";
import imageCompression from "browser-image-compression";
import Assets from "@/utils/Assets";
import { useTranslation } from "react-i18next";

// ─── helpers ────────────────────────────────────────────────────────────────

const getApprovalStatus = (user: any): "approved" | "rejected" | "pending" => {
  const status = user?.attributes?.approval_status;
  const approved = user?.attributes?.approved;
  if (status === "approved" || approved === true) return "approved";
  if (status === "rejected" || approved === false) return "rejected";
  return "pending";
};

// ─── types ───────────────────────────────────────────────────────────────────

type HomeSummaryProps = {
  chartData?: Array<Record<string, any>>;
  onTimeRangeChange?: (range: string) => void;
};

// ─── sub-components ──────────────────────────────────────────────────────────

/** Stat card shown in the grid below the event header */
const StatCard = ({
  label,
  value,
  icon: Icon,
  iconColor,
  bgColor,
  onClick,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  onClick?: () => void;
}) => (
  <div
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={
      onClick
        ? (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick();
            }
          }
        : undefined
    }
    className={`bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-50 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500" : ""}`}
  >
    <div className={`${bgColor} p-2.5 rounded-xl shrink-0`}>
      <Icon size={18} className={iconColor} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-[#656C95] leading-tight line-clamp-2">{label}</p>
      <p className="text-lg font-semibold text-[#202242] mt-0.5 leading-tight">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  </div>
);

/** Registration capacity semi-circle gauge card — matches screenshot exactly */
const CapacityCard = ({
  percent,
  used,
  total,
  remaining,
  onUpgrade,
}: {
  percent: number;
  used: number;
  total: number;
  remaining: number;
  onUpgrade: () => void;
}) => {
  const { t } = useTranslation("dashboard");
  // SVG half-circle gauge
  // viewBox 160×100: cx=80, cy=90, r=70
  // The arc goes from left (10,90) to right (150,90)
  // Total arc length = π * r = π * 70 ≈ 219.9
  const r = 70;
  const cx = 80;
  const cy = 90;
  const totalArc = Math.PI * r; // ≈ 219.9
  const filled = (Math.min(100, Math.max(0, percent)) / 100) * totalArc;

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col shadow-sm border border-gray-50">
      {/* Title */}
      <p className="text-sm font-medium text-[#656C95] mb-3">{t("homeSummary.registrationCapacity")}</p>

      {/* Gauge — centered */}
      <div className="relative mx-auto" style={{ width: 160, height: 92 }}>
        <svg viewBox="0 0 160 100" width="160" height="92">
          {/* Track (grey) */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Filled (dark navy) */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="#202242"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${totalArc}`}
          />
        </svg>
        {/* Percent label centered inside arc */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-2xl font-bold text-[#202242] leading-none">
            {total > 0 ? `${percent}%` : "0%"}
          </span>
        </div>
      </div>

      {/* used / total */}
      <p className="text-center text-sm font-semibold text-[#202242] mt-1">
        {used.toLocaleString()} / {total > 0 ? total.toLocaleString() : "—"}
      </p>

      {/* dots row */}
      {total > 0 && (
        <p className="text-center text-xs text-[#656C95] mt-1.5 flex items-center justify-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#202242] inline-block" />
            {remaining.toLocaleString()} {t("homeSummary.spotsRemaining")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
            {used.toLocaleString()} {t("homeSummary.spotsUsed")}
          </span>
        </p>
      )}

      {/* Upgrade link */}
      <button
        type="button"
        onClick={onUpgrade}
        className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
      >
        <ArrowUp size={12} />
        {t("homeSummary.upgradePlan")}
      </button>
    </div>
  );
};

/** Registrations Activity chart — background bars + smooth dark line + peak pill badge */
const RegistrationsActivityChart = ({
  data,
  onRangeChange,
}: {
  data: Array<{ label: string; registered: number }>;
  onRangeChange?: (r: string) => void;
}) => {
  const [range, setRange] = useState("6 Month");
  const { t } = useTranslation("dashboard");

  const peak = useMemo(
    () =>
      data.reduce(
        (best, d) => (d.registered > best.registered ? d : best),
        data[0] ?? { label: "", registered: 0 },
      ),
    [data],
  );

  // Custom bar + line combo using SVG rendered inside a ResponsiveContainer via a custom chart
  // We use ComposedChart from recharts with Bar (light lavender) + Line (dark)
  // Import Bar, Line, ComposedChart at the top — we'll use inline recharts primitives here

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-[#202242]">{t("homeSummary.registrationsActivity")}</h3>
          <span className="flex items-center gap-1.5 text-xs text-[#656C95]">
            <span className="w-2 h-2 rounded-full bg-[#202242] inline-block" />
            {t("homeSummary.registered")}
          </span>
        </div>
        <select
          value={range}
          onChange={(e) => {
            setRange(e.target.value);
            onRangeChange?.(e.target.value);
          }}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-[#656C95] bg-white focus:outline-none"
        >
          <option value="6 Month">{t("homeSummary.sixMonth")}</option>
          <option value="3 Month">{t("homeSummary.threeMonth")}</option>
          <option value="1 Year">{t("homeSummary.oneYear")}</option>
        </select>
      </div>

      {/* Chart */}
      <_ActivityChart data={data} peak={peak} />
    </div>
  );
};

/** Inner chart rendered with recharts ComposedChart */
const _ActivityChart = ({
  data,
  peak,
}: {
  data: Array<{ label: string; registered: number }>;
  peak: { label: string; registered: number };
}) => {
  const [activeBar, setActiveBar] = useState<string | null>(null);
  const { t } = useTranslation("dashboard");

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.label !== peak.label) return null;
    const labelText = peak.registered.toLocaleString();
    const pillW = Math.max(44, labelText.length * 8 + 16);
    return (
      <g>
        {/* Dark pill badge */}
        <rect x={cx - pillW / 2} y={cy - 34} width={pillW} height={24} rx={12} fill="#202242" />
        <text x={cx} y={cy - 17} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={700}>
          {labelText}
        </text>
        {/* White circle with dark border */}
        <circle cx={cx} cy={cy} r={7} fill="#fff" stroke="#202242" strokeWidth={2.5} />
      </g>
    );
  };

  const BarShape = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!height || height <= 0) return null;
    const isActive = activeBar === payload.label;
    // Narrower bars: ~55% of cell width, centered
    const barW = width * 0.7;
    const barX = x + (width - barW) / 2;
    return (
      <rect
        x={barX}
        y={y}
        width={barW}
        height={height}
        rx={8}
        ry={8}
        fill={isActive ? "#B8C4F0" : "#E8EEFF"}
      />
    );
  };

  return (
    <ResponsiveContainer width="100%" height={290}>
      <ComposedChart
        data={data}
        margin={{ top: 40, right: 10, left: -16, bottom: 0 }}
        barCategoryGap="30%"
        onMouseLeave={() => setActiveBar(null)}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F8" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#9CA3AF", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
          width={36}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ stroke: "#C4C9E8", strokeWidth: 1, fill: "transparent" }}
          contentStyle={{
            background: "#fff",
            border: "none",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            fontSize: 13,
            padding: "10px 16px",
          }}
          labelStyle={{ fontWeight: 600, color: "#202242", marginBottom: 4 }}
          formatter={(v: unknown) => [
            `${typeof v === "number" ? v.toLocaleString() : v}`,
            t("homeSummary.registered"),
          ]}
          separator=" : "
        />
        {/* Background bars — narrower columns */}
        <Bar
          dataKey="registered"
          shape={<BarShape />}
          isAnimationActive={false}
          onMouseEnter={(data: any) => setActiveBar(data.label)}
        />
        {/* Dark smooth line on top */}
        <Line
          type="monotone"
          dataKey="registered"
          stroke="#202242"
          strokeWidth={2.5}
          dot={<CustomDot />}
          activeDot={{ r: 5, fill: "#202242", strokeWidth: 0 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

/** Donut chart helper for Sources & Status */
const DonutChart = ({
  data,
  totalLabel,
  totalValue,
  legendItems,
}: {
  data: Array<{ name: string; value: number; color: string }>;
  totalLabel: string;
  totalValue: number | string;
  legendItems: Array<{ label: string; value?: number | string; percent?: string; color: string }>;
}) => {
  const { t } = useTranslation("dashboard");
  const hasData = data.some((d) => d.value > 0);
  const noDataLabel = t("homeSummary.noData");
  const displayData = hasData ? data : [{ name: noDataLabel, value: 1, color: "#E5E7EB" }];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full" style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={hasData ? 2 : 0}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {displayData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "none",
                borderRadius: 8,
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                fontSize: 12,
              }}
              formatter={(v: unknown, name: unknown) =>
                name === noDataLabel ? [] : [typeof v === "number" ? v.toLocaleString() : v, String(name ?? "")]
              }
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-[#202242]">
            {typeof totalValue === "number" ? totalValue.toLocaleString() : totalValue}
          </span>
          <span className="text-[10px] text-[#656C95] text-center leading-tight max-w-[72px]">
            {totalLabel}
          </span>
        </div>
      </div>
      {/* Legend */}
      <div className="w-full mt-1 space-y-1.5">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-[#656C95]">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
              {item.label}
            </span>
            <span className="font-semibold" style={{ color: item.color }}>
              {item.percent ?? (item.value !== undefined ? item.value : "")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

const SkeletonLoader = () => (
  <div className="w-full px-4 sm:px-6 lg:px-8 animate-pulse space-y-6">
    <div className="h-8 w-40 bg-gray-200 rounded-lg" />
    <div className="bg-white rounded-2xl p-6 h-40 w-full" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl h-20" />
      ))}
    </div>
    <div className="bg-white rounded-2xl h-72 w-full" />
  </div>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

function HomeSummary({ chartData, onTimeRangeChange }: HomeSummaryProps) {
  const [eventData, setEventData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [eventUsers, setEventUsers] = useState<any[]>([]);
  const [attendingCountFromApi, setAttendingCountFromApi] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation("dashboard");

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  useEffect(() => {
    if (!quickActionsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target as Node)) {
        setQuickActionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [quickActionsOpen]);

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning" | "info",
  ) => setNotification({ message, type });

  // ── chart data (moved below derivedCounts so we can use counts for default chart)

  // ── routing ─────────────────────────────────────────────────────────────

  const navigate = useNavigate();
  const navigateTo = useWorkspaceNavigate();
  const location = useLocation();
  const { id: paramId } = useParams();
  const [eventId, setEventId] = useState<string | undefined>(
    (location.state as any)?.eventId || paramId,
  );

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const fromQuery = sp.get("eventId");
    const fromState = (location.state as any)?.eventId;
    if (fromQuery && fromQuery !== eventId) { setEventId(fromQuery); return; }
    if (fromState && fromState !== eventId) { setEventId(fromState); return; }
    if (!fromQuery && !fromState && !eventId) {
      const stored = localStorage.getItem("create_eventId") || localStorage.getItem("edit_eventId");
      if (stored) setEventId(stored);
    }
  }, [location.search, location.state, paramId, eventId]);

  // ── data fetchers ───────────────────────────────────────────────────────

  const getEventDataById = async (id: string | number) => {
    try { setEventData((await getEventbyId(id)).data.data); }
    catch (e) { console.error(e); }
  };

  const fetchEventMetrics = async (id: string | number) => {
    try { setMetrics((await getEventMetrics(id))?.data?.metrics ?? null); }
    catch { setMetrics(null); }
  };

  const fetchEventUsersForSummary = async (id: string) => {
    try {
      const pp = 100;
      const first = await getEventUsers(id, { page: 1, per_page: pp });
      const d = first?.data?.data || first?.data;
      const list = Array.isArray(d) ? d : d?.data || [];
      const pagination = first?.data?.meta?.pagination || first?.data?.pagination;
      const totalPages = pagination?.total_pages ?? 1;
      const all: any[] = [...list];
      for (let p = 2; p <= totalPages; p++) {
        const res = await getEventUsers(id, { page: p, per_page: pp });
        const rd = res?.data?.data || res?.data;
        all.push(...(Array.isArray(rd) ? rd : rd?.data || []));
      }
      setEventUsers(all);
    } catch { setEventUsers([]); }
  };

  const fetchAttendingCount = async (id: string) => {
    try {
      const areas = (await getSessionAreaApi(id))?.data?.data || [];
      if (!areas.length) { setAttendingCountFromApi(0); return; }
      const responses = await Promise.all(areas.map((a: any) => getCheckOuts(id, a.id)));
      const ids = new Set<string | number>();
      responses.forEach((r: any) => (r?.data?.data || []).forEach((u: any) => ids.add(u.id)));
      setAttendingCountFromApi(ids.size);
    } catch { setAttendingCountFromApi(null); }
  };

  useEffect(() => {
    if (eventId) {
      getEventDataById(eventId);
      fetchEventMetrics(eventId);
      fetchEventUsersForSummary(eventId);
      fetchAttendingCount(eventId);
    }
  }, [eventId]);

  // ── derived counts ──────────────────────────────────────────────────────

  const derivedCounts = useMemo(() => {
    const list = Array.isArray(eventUsers) ? eventUsers : [];
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    let total = list.length, today = 0, pending = 0, approved = 0, rejected = 0, printed = 0;
    list.forEach((u: any) => {
      const t = u?.attributes?.created_at ? new Date(u.attributes.created_at).getTime() : 0;
      if (t >= todayStart.getTime() && t <= todayEnd.getTime()) today++;
      const s = getApprovalStatus(u);
      if (s === "pending") pending++;
      else if (s === "approved") approved++;
      else if (s === "rejected") rejected++;
      if (u?.attributes?.printed) printed++;
    });
    return { total, today, pending, approved, rejected, printed };
  }, [eventUsers]);

  const derivedChartData = useMemo(() => {
    const normalize = (item: any, idx: number) => {
      const rawLabel =
        item?.label ?? item?.date ?? item?.day ?? item?.month ?? item?.period ?? item?.name ?? `Day ${idx + 1}`;
      let label = rawLabel;
      if (typeof rawLabel === "string" && /\d{4}-\d{2}-\d{2}/.test(rawLabel)) {
        label = new Date(rawLabel).toLocaleDateString("en-US", { month: "short" }).toUpperCase();
      }
      const value = item?.registered ?? item?.count ?? item?.total ?? item?.value ?? item?.registrations ?? 0;
      return { label: String(label), registered: Number(value) || 0 };
    };

    const series =
      metrics?.registrations_by_day ??
      metrics?.registration_chart ??
      metrics?.registration_trend ??
      metrics?.daily_registration ??
      metrics?.chart ??
      metrics?.data ??
      (Array.isArray(metrics) ? metrics : null);

    if (Array.isArray(series) && series.length) return series.map(normalize);
    if (chartData?.length) return chartData.map(normalize);
    return [
      { label: "Today registration", registered: derivedCounts.today },
      { label: "Total registration", registered: derivedCounts.total },
      { label: "Pending", registered: derivedCounts.pending },
      { label: "Approved user", registered: derivedCounts.approved },
    ];
  }, [metrics, chartData, derivedCounts]);

  const userTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    eventUsers.forEach((u: any) => {
      const type = u?.attributes?.user_type;
      if (type != null && String(type).trim()) {
        const k = String(type).toLowerCase().trim();
        counts[k] = (counts[k] ?? 0) + 1;
      }
    });
    return counts;
  }, [eventUsers]);

  const uniqueUserTypes = useMemo(() =>
    Object.keys(userTypeCounts).sort((a, b) => a.localeCompare(b)),
    [userTypeCounts],
  );

  const printedCountFromUsers = useMemo(
    () => eventUsers.filter((u: any) => u?.attributes?.printed === true).length,
    [eventUsers],
  );

  const attendingCountFromUsers = useMemo(
    () => eventUsers.filter((u: any) => {
      const ss = u?.attributes?.check_user_area_statuses;
      if (Array.isArray(ss)) return ss.some((s: any) => s?.check_in && !s?.check_out);
      return u?.attributes?.check_in != null && u?.attributes?.check_in !== "";
    }).length,
    [eventUsers],
  );

  const attendedCountFromUsers = useMemo(
    () => eventUsers.filter((u: any) => {
      const ss = u?.attributes?.check_user_area_statuses;
      if (Array.isArray(ss)) return ss.some((s: any) => s?.check_out);
      return u?.attributes?.check_out != null && u?.attributes?.check_out !== "";
    }).length,
    [eventUsers],
  );

  const capacity = useMemo(() => {
    const total = metrics?.total_user_capacity ?? 0;
    const used = metrics?.registration_count ?? derivedCounts.total;
    const remaining = Math.max(0, total - used);
    const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
    return { total, used, remaining, percent };
  }, [metrics, derivedCounts.total]);

  // ── stats grid items ────────────────────────────────────────────────────

  const formatLabel = (k: string) => k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();

  const statItems = useMemo(() => {
    const totalRegistrations = metrics?.registration_count ?? derivedCounts.total;
    const base = [
      { label: t("homeSummary.totalRegistrations"), value: totalRegistrations, icon: Users, iconColor: "text-blue-600", bgColor: "bg-blue-50", filterKey: "all" },
      { label: t("homeSummary.todayRegistration"), value: derivedCounts.today, icon: UserCheck, iconColor: "text-emerald-600", bgColor: "bg-emerald-50", filterKey: "today" },
      { label: t("homeSummary.pendingUsers"), value: derivedCounts.pending, icon: AlertCircle, iconColor: "text-amber-500", bgColor: "bg-amber-50", filterKey: "pending" },
      { label: t("homeSummary.approvedUsers"), value: derivedCounts.approved, icon: CheckCircle, iconColor: "text-teal-600", bgColor: "bg-teal-50", filterKey: "approved" },
      { label: t("homeSummary.registeredUsers"), value: derivedCounts.total, icon: Users, iconColor: "text-slate-600", bgColor: "bg-slate-50", filterKey: "all" },
      { label: t("homeSummary.printedUsers"), value: printedCountFromUsers || derivedCounts.printed, icon: Printer, iconColor: "text-violet-600", bgColor: "bg-violet-50", filterKey: "printed" },
      {
        label: t("homeSummary.attending"),
        value: attendingCountFromApi ?? metrics?.attending_count ?? metrics?.checked_in_count ?? attendingCountFromUsers,
        icon: UserCog, iconColor: "text-cyan-600", bgColor: "bg-cyan-50", filterKey: "attending",
      },
      {
        label: t("homeSummary.attended"),
        value: metrics?.attended_count ?? metrics?.checked_out_count ?? attendedCountFromUsers,
        icon: CheckCircle, iconColor: "text-green-600", bgColor: "bg-green-50", filterKey: "attended",
      },
      { label: t("homeSummary.attendeeCount"), value: userTypeCounts["attendee"] ?? 0, icon: Users, iconColor: "text-indigo-600", bgColor: "bg-indigo-50", filterKey: "user_type", userTypeKey: "attendee" },
      { label: t("homeSummary.vipCount"), value: userTypeCounts["vip"] ?? 0, icon: Crown, iconColor: "text-amber-600", bgColor: "bg-amber-50", filterKey: "user_type", userTypeKey: "vip" },
    ] as any[];

    const extraColors = [
      { ic: "text-rose-600", bg: "bg-rose-50" },
      { ic: "text-purple-600", bg: "bg-purple-50" },
      { ic: "text-sky-600", bg: "bg-sky-50" },
    ];
    uniqueUserTypes
      .filter((t) => t !== "attendee" && t !== "vip")
      .forEach((typeKey, i) => {
        const c = extraColors[i % extraColors.length];
        base.push({
          label: `${formatLabel(typeKey)} Count`,
          value: userTypeCounts[typeKey] ?? 0,
          icon: Users,
          iconColor: c.ic,
          bgColor: c.bg,
          filterKey: "user_type",
          userTypeKey: typeKey,
        });
      });

    return base;
  }, [derivedCounts, uniqueUserTypes, userTypeCounts, metrics, attendingCountFromApi, attendingCountFromUsers, attendedCountFromUsers, printedCountFromUsers, t]);

  // ── image crop state ────────────────────────────────────────────────────

  const [isCropping, setIsCropping] = useState(false);
  const [originalImageSrc, setOriginalImageSrc] = useState("");
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !eventId) return;
    const allowed = ["image/svg+xml", "image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(file.type)) {
      showNotification(t("homeSummary.invalidFileType"), "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.type === "image/svg+xml") { handleSvgUpload(file); return; }
    setOriginalImageSrc(URL.createObjectURL(file));
    setIsCropping(true);
  };

  const handleSvgUpload = async (file: File) => {
    if (!eventId) return;
    setIsUploading(true);
    try {
      if (file.size > 2 * 1024 * 1024) {
        showNotification(t("homeSummary.svgTooLarge"), "error");
        return;
      }
      const fd = new FormData();
      fd.append("event[logo]", file);
      const res = await updateEventById(eventId, fd);
      setEventData((prev: any) => ({
        ...prev,
        attributes: { ...prev.attributes, logo_url: res?.data?.data?.attributes?.logo_url },
      }));
      showNotification(t("homeSummary.logoUpdatedSuccess"), "success");
    } catch (e: any) {
      showNotification(e?.response?.data?.message || t("homeSummary.errorUpdatingLogo"), "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({ width: img.width, height: img.height });
    const size = Math.min(img.width, img.height) * 0.8;
    setCropArea({ x: (img.width - size) / 2, y: (img.height - size) / 2, width: size, height: size });
  };

  const handleCropStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isResizing) return;
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;
    const handles: Record<string, { x: number; y: number; width: number; height: number }> = {
      topLeft: { x: cropArea.x - 10, y: cropArea.y - 10, width: 20, height: 20 },
      topRight: { x: cropArea.x + cropArea.width - 10, y: cropArea.y - 10, width: 20, height: 20 },
      bottomLeft: { x: cropArea.x - 10, y: cropArea.y + cropArea.height - 10, width: 20, height: 20 },
      bottomRight: { x: cropArea.x + cropArea.width - 10, y: cropArea.y + cropArea.height - 10, width: 20, height: 20 },
    };
    for (const [corner, area] of Object.entries(handles)) {
      if (clickX >= area.x && clickX <= area.x + area.width && clickY >= area.y && clickY <= area.y + area.height) {
        setIsResizing(true); setResizeCorner(corner); setDragStart({ x: clickX, y: clickY }); return;
      }
    }
    setIsDragging(true);
    setDragStart({ x: clientX - rect.left - cropArea.x, y: clientY - rect.top - cropArea.y });
  };

  const handleCropMove = (e: React.MouseEvent | React.TouchEvent) => {
    if ((!isDragging && !isResizing) || !imageDimensions.width) return;
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const curX = clientX - rect.left;
    const curY = clientY - rect.top;
    if (isDragging && !isResizing) {
      setCropArea((p) => ({
        ...p,
        x: Math.max(0, Math.min(curX - dragStart.x, imageDimensions.width - p.width)),
        y: Math.max(0, Math.min(curY - dragStart.y, imageDimensions.height - p.height)),
      }));
    } else if (isResizing && resizeCorner) {
      const dX = curX - dragStart.x;
      const dY = curY - dragStart.y;
      setCropArea((prev) => {
        let n = { ...prev };
        const min = 50;
        const delta = Math.abs(dX) > Math.abs(dY) ? dX : dY;
        switch (resizeCorner) {
          case "topLeft": { const s = Math.max(min, prev.width - delta); n.x = prev.x + prev.width - s; n.y = prev.y + prev.height - s; n.width = s; n.height = s; break; }
          case "topRight": { const s = Math.max(min, prev.width + delta); n.y = prev.y + prev.height - s; n.width = s; n.height = s; break; }
          case "bottomLeft": { const s = Math.max(min, prev.width - delta); n.x = prev.x + prev.width - s; n.width = s; n.height = s; break; }
          case "bottomRight": { const s = Math.max(min, prev.width + delta); n.width = s; n.height = s; break; }
        }
        if (n.x < 0) { n.width += n.x; n.x = 0; n.height = n.width; }
        if (n.y < 0) { n.height += n.y; n.y = 0; n.width = n.height; }
        if (n.x + n.width > imageDimensions.width) { n.width = imageDimensions.width - n.x; n.height = n.width; }
        if (n.y + n.height > imageDimensions.height) { n.height = imageDimensions.height - n.y; n.width = n.height; }
        return n;
      });
      setDragStart({ x: curX, y: curY });
    }
  };

  const handleCropEnd = () => { setIsDragging(false); setIsResizing(false); setResizeCorner(null); };

  const cancelCrop = () => {
    setIsCropping(false);
    if (originalImageSrc) URL.revokeObjectURL(originalImageSrc);
    setOriginalImageSrc("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !canvasRef.current || !eventId) return;
    setIsUploading(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = imgRef.current;
      if (!ctx || !img) throw new Error("No context");
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;
      canvas.width = 400; canvas.height = 400;
      ctx.drawImage(img, cropArea.x * scaleX, cropArea.y * scaleY, cropArea.width * scaleX, cropArea.height * scaleY, 0, 0, 400, 400);
      canvas.toBlob(async (blob) => {
        if (!blob) { showNotification(t("homeSummary.failedToCrop"), "error"); setIsUploading(false); return; }
        try {
          let final: File = new File([blob], "cropped-logo.jpg", { type: "image/jpeg", lastModified: Date.now() });
          if (final.size > 500 * 1024) {
            final = await imageCompression(final, { maxSizeMB: 0.5, maxWidthOrHeight: 400, useWebWorker: true, fileType: "image/jpeg" });
          }
          const fd = new FormData();
          fd.append("event[logo]", final);
          const res = await updateEventById(eventId, fd);
          setEventData((prev: any) => ({
            ...prev,
            attributes: { ...prev.attributes, logo_url: res?.data?.data?.attributes?.logo_url },
          }));
          showNotification(t("homeSummary.logoUpdatedSuccess"), "success");
          setIsCropping(false);
          if (originalImageSrc) URL.revokeObjectURL(originalImageSrc);
          setOriginalImageSrc("");
        } catch (e: any) {
          showNotification(e?.response?.data?.message || t("homeSummary.errorUpdatingLogo"), "error");
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      }, "image/jpeg", 0.9);
    } catch {
      showNotification(t("homeSummary.failedToCrop"), "error");
      setIsUploading(false);
    }
  };

  // ── render guard ────────────────────────────────────────────────────────

  if (!eventData) return <SkeletonLoader />;

  const {
    name, event_type, event_date_from, event_date_to,
    event_time_from, event_time_to, about,
    location: eventLocation, logo_url, primary_color, secondary_color,
    registration_page_banner, require_approval,
  } = eventData.attributes;

  const formatTime = (s: string) =>
    new Date(s).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const totalRegistrations = metrics?.registration_count ?? derivedCounts.total;

  // ── JSX ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-10 space-y-6">

        {/* Page title */}

        {/* ── Event header card ── */}
        <div className="p-4 sm:p-6 lg:p-6 bg-white rounded-2xl flex flex-col lg:flex-row items-start justify-between gap-4 lg:gap-0">
          {/* logo and event name */}
          <div className="gap-3 flex flex-col sm:flex-row items-center w-full lg:w-auto">
            <div className="relative h-[150px] w-[150px] sm:h-[180px] sm:w-[180px] lg:h-[200px] lg:w-[200px] bg-neutral-50 items-center justify-center flex rounded-2xl shrink-0">
              {/* Upload Loading Overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10">
                  <div className="relative">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <div className="absolute inset-0 h-8 w-8 border-2 border-blue-100 rounded-full"></div>
                  </div>
                  <p className="text-blue-600 text-xs font-medium mt-3">
                    {t("homeSummary.uploading")}
                  </p>
                </div>
              )}

              {/* Edit button - directly triggers file selection */}
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 flex items-center justify-center absolute top-2 right-2 rounded-xl bg-white drop-shadow-2xl transition-all duration-200 z-20 ${
                  isUploading
                    ? "cursor-not-allowed opacity-75"
                    : "cursor-pointer hover:bg-gray-50 hover:scale-105"
                }`}
              >
                {isUploading ? (
                  <div className="relative">
                    <Loader2
                      size={16}
                      className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 animate-spin text-blue-600"
                    />
                    <div className="absolute inset-0 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border border-blue-100 rounded-full"></div>
                  </div>
                ) : (
                  <Edit
                    size={16}
                    className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600"
                  />
                )}
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".svg,.png,.jpg,.jpeg"
                disabled={isUploading}
              />

              {/* Current logo display */}
              {eventData?.attributes?.logo_url ? (
                <img
                  src={eventData.attributes.logo_url}
                  alt="Event Logo"
                  className={`h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 rounded-2xl transition-opacity duration-200 ${
                    isUploading ? "opacity-50" : "opacity-100"
                  }`}
                />
              ) : (
                <div
                  className={`h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 bg-gray-300 flex items-center justify-center rounded-2xl text-gray-500 text-xs font-medium transition-opacity duration-200 ${
                    isUploading ? "opacity-50" : "opacity-100"
                  }`}
                >
                  {t("homeSummary.noLogo")}
                </div>
              )}
            </div>

            {/* text detail part */}
            <div className="items-center text-center sm:text-left w-full sm:w-auto">
              {/* express or advance event */}
              <div className="p-3 lg:p-3 bg-emerald-50 rounded-3xl items-center flex gap-2 justify-center sm:justify-start w-fit mx-auto sm:mx-0">
                <img src={Assets.icons.expressDot} className="h-2 w-2" alt="" />
                <p className="text-emerald-500 text-xs sm:text-sm">
                  {event_type}
                </p>
              </div>

              {/* event name */}
              <p className="mt-4 lg:mt-4 text-sm sm:text-base lg:text-lg text-slate-800 font-medium">
                {name}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 lg:mt-4">
                <Clock
                  size={16}
                  className="sm:w-5 sm:h-5 lg:w-5 lg:h-5"
                  color="#525252"
                />
                <p className="text-neutral-500 text-xs sm:text-sm font-normal">
                  {event_date_from} {formatTime(event_time_from)} to{" "}
                  {event_date_to} {formatTime(event_time_to)}
                </p>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 lg:mt-4">
                <MapPin
                  size={16}
                  className="sm:w-5 sm:h-5 lg:w-5 lg:h-5"
                  color="#525252"
                />
                <p className="text-neutral-500 text-xs sm:text-sm font-normal">
                  {eventLocation}
                </p>
              </div>

              <p className="mt-4 lg:mt-6 text-neutral-500 text-xs sm:text-sm font-normal">
                {t("homeSummary.lastEdit", { time: "3hr" })}
              </p>
            </div>
          </div>

          {/* edit button and share button */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                const eventUuid =
                  eventData?.attributes?.uuid ?? eventData?.uuid ?? null;
                const tenantUuid =
                  typeof window !== "undefined"
                    ? localStorage.getItem("tenant_uuid")
                    : null;
                const registrationUrl = getRegistrationUrl(
                  eventUuid,
                  tenantUuid,
                  eventId ?? undefined
                );
                if (!registrationUrl) {
                  showNotification(
                    t("homeSummary.registrationLinkNotAvailable"),
                    "warning"
                  );
                  return;
                }
                navigator.clipboard
                  .writeText(registrationUrl)
                  .then(() => {
                    showNotification(
                      t("homeSummary.registrationLinkCopied"),
                      "success"
                    );
                  })
                  .catch(() => {
                    showNotification(t("homeSummary.failedToCopyLink"), "error");
                  });
              }}
              className="rounded-2xl bg-green-50 py-2 px-4 lg:py-2.5 lg:px-4 flex items-center gap-2 cursor-pointer hover:bg-green-100 transition-colors justify-center shrink-0 border-0 text-left"
            >
              <Share2 size={16} className="lg:w-5 lg:h-5 text-green-600 shrink-0" />
              <span className="text-green-700 text-xs sm:text-sm font-normal">
                {t("homeSummary.copyRegistrationLink")}
              </span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const idToUse = eventId ?? paramId;
                if (!idToUse) {
                  showNotification(t("homeSummary.eventIdMissing"), "warning");
                  return;
                }
                // Only pass serializable state (no functions, no React components) — History API cannot clone them
                const statsSerializable = statItems.map(({ icon: _icon, ...rest }) => rest);
                // Navigate without id in path so layout keeps sidebar collapsed (icon-only), like previous behavior
                navigateTo("express-event", {
                  state: {
                    plan: event_type,
                    eventData: eventData,
                    isEditing: true,
                    eventAttributes: {
                      name,
                      event_type,
                      event_date_from,
                      event_date_to,
                      event_time_from,
                      event_time_to,
                      about,
                      location: eventLocation,
                      logo_url,
                      primary_color,
                      secondary_color,
                      registration_page_banner,
                      require_approval,
                    },
                    chartData,
                    eventId: idToUse,
                    stats: statsSerializable,
                    lastEdit: "Before 3hr",
                    currentStep: 0,
                  },
                });
              }}
              className="rounded-2xl bg-[#F2F6FF] py-2 px-4 lg:py-2.5 lg:px-4 flex items-center gap-2 cursor-pointer hover:bg-[#E8F1FF] transition-colors justify-center shrink-0 border-0 text-left"
            >
              <Edit size={16} className="lg:w-5 lg:h-5 shrink-0 pointer-events-none" aria-hidden />
              <span className="text-[#202242] text-xs sm:text-sm font-normal">
                {t("homeSummary.editEvent")}
              </span>
            </button>
          </div>
        </div>

        {/* ── Stats section: Capacity card left + stats grid right ── */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch">
          {/* Capacity card — fixed width on large screens */}
          <div className="w-full lg:w-[210px] xl:w-[220px] shrink-0">
            <CapacityCard
              percent={capacity.percent}
              used={capacity.used}
              total={capacity.total}
              remaining={capacity.remaining}
              onUpgrade={() => navigateTo(`home/${eventId ?? paramId}/upgrade-plan`)}
            />
          </div>

          {/* Stat cards grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {statItems.map((item, i) => (
              <StatCard
                key={`${item.label}-${i}`}
                label={item.label}
                value={item.value}
                icon={item.icon}
                iconColor={item.iconColor}
                bgColor={item.bgColor}
                onClick={() =>
                  navigateTo(`home/${eventId}/summary-card`, {
                    state: { cardLabel: item.label, filterKey: item.filterKey ?? "all", userTypeKey: item.userTypeKey },
                  })
                }
              />
            ))}
          </div>
        </div>

        {/* ── Activity chart + Registration Sources ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <RegistrationsActivityChart data={derivedChartData} onRangeChange={onTimeRangeChange} />
          </div>

          {/* Registration Sources donut */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-[#202242]">{t("homeSummary.registrationSources")}</h3>
              <select className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-[#656C95] bg-white focus:outline-none">
                <option>2 Month</option>
                <option>6 Month</option>
              </select>
            </div>
            <DonutChart
              data={[
                { name: t("homeSummary.website"), value: 45, color: "#1e293b" },
                { name: t("homeSummary.invitationLink"), value: 30, color: "#22c55e" },
                { name: t("homeSummary.qrCode"), value: 15, color: "#a855f7" },
                { name: t("homeSummary.manual"), value: 10, color: "#f97316" },
              ]}
              totalLabel={t("homeSummary.totalRegistrations")}
              totalValue={totalRegistrations}
              legendItems={[
                { label: t("homeSummary.website"), percent: "45%", color: "#1e293b" },
                { label: t("homeSummary.invitationLink"), percent: "30%", color: "#22c55e" },
                { label: t("homeSummary.qrCode"), percent: "15%", color: "#a855f7" },
                { label: t("homeSummary.manual"), percent: "10%", color: "#f97316" },
              ]}
            />
          </div>
        </div>

        {/* ── Registration Status + Recent Activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Registration Status */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-50 relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-[#202242]">{t("homeSummary.registrationStatus")}</h3>
              <select className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-[#656C95] bg-white focus:outline-none">
                <option>2 Month</option>
                <option>6 Month</option>
              </select>
            </div>

            {/* FAB + Quick Actions Menu dropdown - fixed in main content area (right of sidebar), aligned with content */}
            <div ref={quickActionsRef} className="fixed bottom-6 z-50 left-[calc(280px+3rem)]">
              {quickActionsOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 min-w-[200px]">
                  <p className="px-4 py-2 text-sm font-medium text-gray-500 border-b border-gray-100">
                    {t("homeSummary.quickActionsMenu")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setQuickActionsOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-50">
                      <UserPlus className="h-4 w-4 text-blue-600" />
                    </div>
                    {t("homeSummary.addUser")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickActionsOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-50">
                      <Send className="h-4 w-4 text-emerald-600" />
                    </div>
                    {t("homeSummary.sendInvitation")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickActionsOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-violet-50">
                      <Printer className="h-4 w-4 text-violet-600" />
                    </div>
                    {t("homeSummary.printBadge")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickActionsOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-red-50">
                      <FileText className="h-4 w-4 text-red-600" />
                    </div>
                    {t("homeSummary.viewReport")}
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setQuickActionsOpen((prev) => !prev)}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 shadow-lg"
                aria-expanded={quickActionsOpen}
                aria-haspopup="true"
                aria-label="Quick actions"
              >
                <Plus size={20} strokeWidth={2.5} />
              </button>
            </div>

            <DonutChart
              data={[
                { name: t("homeSummary.approved"), value: derivedCounts.approved, color: "#202242" },
                { name: t("homeSummary.pending"), value: derivedCounts.pending, color: "#f97316" },
                { name: t("homeSummary.rejected"), value: derivedCounts.rejected, color: "#a855f7" },
              ]}
              totalLabel={t("homeSummary.total")}
              totalValue={derivedCounts.approved + derivedCounts.pending + derivedCounts.rejected}
              legendItems={[
                { label: t("homeSummary.approved"), value: derivedCounts.approved, color: "#202242" },
                { label: t("homeSummary.pending"), value: derivedCounts.pending, color: "#f97316" },
                { label: t("homeSummary.rejected"), value: derivedCounts.rejected, color: "#a855f7" },
              ]}
            />
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#202242]">{t("homeSummary.recentActivity")}</h3>
              <button type="button" className="text-sm font-medium text-blue-500 hover:text-blue-600">{t("homeSummary.viewAll")}</button>
            </div>
            <ul className="space-y-4">
              {[
                { Icon: UserCheck, text: "Ahmed Hassan registered", time: "2 min ago", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
                { Icon: MailCheck, text: "Fatima Ali accepted invitation", time: "10 min ago", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
                { Icon: Star, text: "VIP user added", time: "1 hour ago", iconBg: "bg-amber-50", iconColor: "text-amber-500" },
                { Icon: FileText, text: "Event details updated", time: "3 hours ago", iconBg: "bg-slate-50", iconColor: "text-slate-500" },
                { Icon: QrCode, text: "Ahmed Hassan checked in using QR code", time: "3 hours ago", iconBg: "bg-red-50", iconColor: "text-red-500" },
                { Icon: UserCheck, text: "Sara Mohamed was approved for registration", time: "4 hours ago", iconBg: "bg-teal-50", iconColor: "text-teal-600" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg ${item.iconBg} shrink-0`}>
                    <item.Icon className={`h-4 w-4 ${item.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                    <p className="text-sm text-[#202242] leading-snug">{item.text}</p>
                    <p className="text-xs text-[#9CA3AF] shrink-0 whitespace-nowrap">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Crop Modal ── */}
      {isCropping && originalImageSrc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t("homeSummary.cropImage")}</h3>
              <button onClick={cancelCrop} disabled={isUploading} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>
            <div
              className="relative mx-auto border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center"
              style={{ maxWidth: 600, maxHeight: 400 }}
              onMouseDown={handleCropStart} onMouseMove={handleCropMove} onMouseUp={handleCropEnd} onMouseLeave={handleCropEnd}
              onTouchStart={handleCropStart} onTouchMove={handleCropMove} onTouchEnd={handleCropEnd}
            >
              <img ref={imgRef} src={originalImageSrc} alt="Crop" className="max-w-full max-h-full object-contain" onLoad={handleImageLoad} draggable={false} />
              {imageDimensions.width > 0 && (
                <>
                  <div className="absolute inset-0 bg-black/40" style={{ clipPath: `polygon(0% 0%,0% 100%,${cropArea.x}px 100%,${cropArea.x}px ${cropArea.y}px,${cropArea.x + cropArea.width}px ${cropArea.y}px,${cropArea.x + cropArea.width}px ${cropArea.y + cropArea.height}px,${cropArea.x}px ${cropArea.y + cropArea.height}px,${cropArea.x}px 100%,100% 100%,100% 0%)` }} />
                  <div className="absolute border-2 border-white border-dashed" style={{ left: cropArea.x, top: cropArea.y, width: cropArea.width, height: cropArea.height, cursor: isDragging ? "grabbing" : "grab" }}>
                    {["top-left", "top-right", "bottom-left", "bottom-right"].map((pos) => (
                      <div key={pos} className={`absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full ${pos.includes("top") ? "-top-2.5" : "-bottom-2.5"} ${pos.includes("left") ? "-left-2.5" : "-right-2.5"} cursor-${pos.includes("top") ? (pos.includes("left") ? "nwse" : "nesw") : pos.includes("left") ? "nesw" : "nwse"}-resize`} />
                    ))}
                    <div className="absolute inset-0 cursor-move" />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={cancelCrop} disabled={isUploading} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-sm">{t("homeSummary.cancel")}</button>
              <button onClick={handleCropComplete} disabled={isUploading} className="px-4 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                {isUploading ? <><Loader2 className="h-4 w-4 animate-spin" />{t("homeSummary.processing")}</> : t("homeSummary.cropAndUpload")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for crop */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Toast notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in">
          <div className={`px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
            notification.type === "success" ? "bg-green-500" :
            notification.type === "error" ? "bg-red-500" :
            notification.type === "warning" ? "bg-amber-500" : "bg-blue-500"
          }`}>
            {notification.message}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </>
  );
}

export default HomeSummary;