import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChevronDown } from "lucide-react";

// --- Custom Tooltip Component ---
const CustomTooltip = ({ active, payload, label, yAxisKey, legend }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-3 text-sm shadow-lg">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        <p className="text-gray-600">
          <span className="font-medium">{legend || payload[0].name}:</span>{" "}
          <span className="font-semibold text-blue-600">
            {payload[0].value}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

// --- Custom Active Dot Component (for subtle hover effect) ---
const CustomActiveDot = (props) => {
  const { cx, cy, stroke, strokeWidth, r } = props;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r + 3}
        fill="white"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <circle cx={cx} cy={cy} r={r} fill={stroke} />
    </g>
  );
};

type RegistrationChartProps = {
  data?: Array<Record<string, any>>;
  title?: string;
  legend?: string | null;
  height?: string | number;
  timeRangeOptions?: string[];
  defaultTimeRange?: string;
  showTimeRangeSelector?: boolean;
  lineColor?: string;
  highlightColor?: string;
  backgroundColor?: string;
  highlightDataKey?: string | null;
  highlightValue?: number | string | null;
  onTimeRangeChange?: (range: string) => void;
  className?: string;
  chartMargin?: { top?: number; right?: number; left?: number; bottom?: number };
  yAxisDomain?: [number, number | string];
  yAxisTicks?: number[];
  xAxisKey?: string;
  yAxisKey?: string;
};

const RegistrationChart = ({
  // Data props
  data = [],

  // Display props
  title = "Registrations Activity",
  legend = "Registered",
  height = "320px",

  // Dropdown props
  timeRangeOptions = ["1 Month", "3 Month", "6 Month", "1 Year"],
  defaultTimeRange = "6 Month",
  showTimeRangeSelector = true,

  // Chart styling props
  lineColor = "url(#colorGradient)", // Using a gradient now
  highlightColor = "#4F46E5",
  backgroundColor = "white", // Kept for consistency, but Tailwind handles bg-white

  // Highlight props
  highlightDataKey = null,
  highlightValue = null,

  // Callback props
  onTimeRangeChange,

  // Custom styling
  className = "",
  chartMargin = { top: 30, right: 30, left: 20, bottom: 5 }, // Adjusted bottom margin

  // Y-axis props
  yAxisDomain = [0, "dataMax + 50"],
  yAxisTicks = [0, 40, 80, 160, 360, 720], // Still good default ticks

  // Data keys
  xAxisKey = "month",
  yAxisKey = "registered",
}: RegistrationChartProps) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(defaultTimeRange);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const defaultData = useMemo(
    () => [
      { month: "Jan", registered: 45 },
      { month: "Feb", registered: 120 },
      { month: "Mar", registered: 155 },
      { month: "Apr", registered: 60 },
      { month: "May", registered: 85 },
      { month: "Jun", registered: 200 },
      { month: "Jul", registered: 200 },
      { month: "Aug", registered: 200 },
      { month: "Sep", registered: 200 },
    ],
    []
  );

  const chartData = useMemo(
    () => (data.length > 0 ? data : defaultData),
    [data, defaultData]
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Custom dot component for specifically highlighted points
  const HighlightDot = (props) => {
    const { cx, cy, payload } = props;
    const shouldHighlight =
      highlightDataKey && payload[xAxisKey] === highlightDataKey;

    if (shouldHighlight) {
      const displayValue = highlightValue || payload[yAxisKey];

      return (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r={6}
            fill={highlightColor}
            stroke="white"
            strokeWidth={2}
          />
          <circle
            cx={cx}
            cy={cy}
            r={10}
            fill="none"
            stroke={highlightColor}
            strokeWidth={1}
            opacity={0.3}
          />
          {/* Tooltip for highlighted point - can be removed if CustomTooltip is sufficient */}
          <rect
            x={cx - 18}
            y={cy - 28}
            width={36}
            height={20}
            rx={5}
            fill="#374151"
            className="shadow-md"
          />
          <text
            x={cx}
            y={cy - 15}
            textAnchor="middle"
            fontSize={11}
            fill="white"
            fontWeight="600"
          >
            {displayValue}
          </text>
        </g>
      );
    }
    return null;
  };

  const handleTimeRangeChange = (newRange) => {
    setSelectedTimeRange(newRange);
    setIsDropdownOpen(false);
    if (onTimeRangeChange) {
      onTimeRangeChange(newRange);
    }
  };

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div
          className="flex h-full items-center justify-center text-center text-gray-500 text-base"
          style={{ height }}
        >
          No data available for this period.
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={chartMargin}>
          {/* Define gradient for the line */}
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.8} />
            </linearGradient>
            {/* Horizontal grid lines */}
            <pattern
              id="gridPattern"
              x="0"
              y="0"
              width="100%"
              height="100%"
              patternUnits="objectBoundingBox"
            >
              <path d="M 0 0 L 1 0" stroke="#F3F4F6" strokeWidth="1" />
            </pattern>
          </defs>

          <XAxis
            dataKey={xAxisKey}
            axisLine={{ stroke: "#E5E7EB", strokeWidth: 1 }} // Visible X-axis line
            tickLine={false}
            tick={{
              fontSize: 12,
              fill: "#6B7280",
              fontWeight: 500,
            }}
            dy={8} // Offset ticks from the line
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 12,
              fill: "#6B7280",
              fontWeight: 500,
            }}
            domain={yAxisDomain}
            ticks={yAxisTicks}
            width={40}
          />
          <Tooltip
            cursor={{
              stroke: "#E0E7FF",
              strokeWidth: 2,
              strokeDasharray: "3 3",
            }} // Light dashed line on hover
            content={<CustomTooltip yAxisKey={yAxisKey} legend={legend} />}
          />
          <Line
            type="monotone"
            dataKey={yAxisKey}
            stroke={lineColor}
            strokeWidth={3}
            dot={{
              r: 4,
              fill: "white",
              stroke: "currentColor",
              strokeWidth: 2,
            }} // Subtle dots
            activeDot={
              <CustomActiveDot stroke="currentColor" strokeWidth={2} r={4} />
            } // Enhanced active dot
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {highlightDataKey && (
            <Line
              type="monotone"
              dataKey={yAxisKey}
              stroke="transparent"
              strokeWidth={0}
              dot={<HighlightDot />}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div
      className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-md ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          {legend && (
            <div className="flex items-center gap-2">
              {/* Using a small div for color legend */}
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background:
                    "linear-gradient(to right, #8884d8 5%, #82ca9d 95%)",
                }}
              ></div>
              <span className="text-sm text-gray-600 font-medium">
                {legend}
              </span>
            </div>
          )}
        </div>

        {/* Time Range Selector */}
        {showTimeRangeSelector && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
            >
              {selectedTimeRange}
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 min-w-[140px] py-2">
                {timeRangeOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleTimeRangeChange(option)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      selectedTimeRange === option
                        ? "text-blue-600 bg-blue-50 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{ height }} className="w-full">
        {renderChart()}
      </div>
    </div>
  );
};

export default RegistrationChart;

// Import RegistrationChart and other components
// import React, { useState, useMemo } from "react";
// import RegistrationChart from "./RegistrationChart"; // Assuming it's in the same directory

export const ChartExamples = () => {
  // Full 12-month dataset
  const registrationDataFull = useMemo(
    () => [
      { month: "Jan", registered: 45 },
      { month: "Feb", registered: 120 },
      { month: "Mar", registered: 155 },
      { month: "Apr", registered: 60 },
      { month: "May", registered: 85 },
      { month: "Jun", registered: 200 },
      { month: "Jul", registered: 200 },
      { month: "Aug", registered: 200 },
      { month: "Sep", registered: 200 },
      { month: "Oct", registered: 300 },
      { month: "Nov", registered: 700 },
      { month: "Dec", registered: 10 },
    ],
    []
  );

  // New data sets
  const websiteTrafficData = useMemo(
    () => [
      { day: "Mon", visitors: 520 },
      { day: "Tue", visitors: 650 },
      { day: "Wed", visitors: 810 },
      { day: "Thu", visitors: 730 },
      { day: "Fri", visitors: 950 },
      { day: "Sat", visitors: 1100 },
      { day: "Sun", visitors: 880 },
    ],
    []
  );

  const revenueData = useMemo(
    () => [
      { quarter: "Q1", revenue: 25000 },
      { quarter: "Q2", revenue: 32000 },
      { quarter: "Q3", revenue: 41000 },
      { quarter: "Q4", revenue: 35000 },
    ],
    []
  );

  const appDownloadsData = useMemo(
    () => [
      { month: "Jan", downloads: 1500 },
      { month: "Feb", downloads: 2200 },
      { month: "Mar", downloads: 3500 },
      { month: "Apr", downloads: 4100 },
      { month: "May", downloads: 5500 },
      { month: "Jun", downloads: 6800 },
    ],
    []
  );

  const [currentRegistrationData, setCurrentRegistrationData] = useState(
    registrationDataFull.slice(-6)
  );

  const [timeRange, setTimeRange] = useState("6 months");

  const handleRegistrationTimeRangeChange = (range) => {
    setTimeRange(range);
    switch (range) {
      case "1 Month":
        setCurrentRegistrationData([...registrationDataFull.slice(-1)]);
        break;
      case "3 Month":
        setCurrentRegistrationData([...registrationDataFull.slice(-3)]);
        break;
      case "6 Month":
        setCurrentRegistrationData([...registrationDataFull.slice(-6)]);
        break;
      case "1 Year":
        setCurrentRegistrationData([...registrationDataFull]);
        break;
      default:
        setCurrentRegistrationData([...registrationDataFull.slice(-6)]);
    }
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
        Chart Showcase
      </h2>

      {/* Existing Registrations Chart */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Registrations Over Time
        </h3>
        <RegistrationChart
          data={currentRegistrationData}
          highlightDataKey="Nov"
          highlightValue={700}
          onTimeRangeChange={handleRegistrationTimeRangeChange}
        />
      </div>

      {/* New: Website Traffic Chart */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Website Traffic
        </h3>
        <RegistrationChart
          data={websiteTrafficData}
          title="Website Traffic"
          legend="Visitors"
          xAxisKey="day"
          yAxisKey="visitors"
          lineColor="#EF4444" // Red line
          highlightColor="#DC2626"
          showTimeRangeSelector={false}
          height="280px"
        />
      </div>

      {/* New: Quarterly Revenue Chart */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Quarterly Revenue
        </h3>
        <RegistrationChart
          data={revenueData}
          title="Quarterly Revenue"
          legend="Revenue"
          xAxisKey="quarter"
          yAxisKey="revenue"
          lineColor="#22C55E" // Green line
          highlightColor="#16A34A"
          highlightDataKey="Q3"
          highlightValue="41K"
          timeRangeOptions={["This Year", "Last Year"]}
          defaultTimeRange="This Year"
          yAxisTicks={[0, 10000, 20000, 30000, 40000]}
          height="300px"
        />
      </div>

      {/* New: App Downloads Chart */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          App Downloads
        </h3>
        <RegistrationChart
          data={appDownloadsData}
          title="App Downloads"
          legend="Downloads"
          selectedTimeRange={timeRange} // ✅ parent controls this
          xAxisKey="month"
          yAxisKey="downloads"
          lineColor="#F97316" // Orange line
          highlightColor="#EA580C"
          highlightDataKey="Jun"
          highlightValue="6.8K"
          showTimeRangeSelector={false}
          yAxisDomain={[0, "dataMax + 1000"]}
          yAxisTicks={[0, 2000, 4000, 6000, 8000]}
          height="280px"
        />
      </div>
    </div>
  );
};
