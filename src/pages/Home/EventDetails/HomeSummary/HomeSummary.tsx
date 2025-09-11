import React, { useState } from "react";
import Assets from "../../../../utils/Assets";
import { Clock, Edit, MapPin, ChevronDown } from "lucide-react";
import ExpressEvent from "../../ExpressEvent/ExpressEvent";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import RegistrationChart from "./components/RegsitrationChart";

function HomeSummary({ chartData, onTimeRangeChange }) {
  const [selectedMonth, setSelectedMonth] = useState("6 Month");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Define stats config (label + icon + key)
  const stats = [
    {
      label: "Total Registrations",
      value: 1256892,
      icon: Assets.icons.totalRegistration,
    },
    {
      label: "Today Registrations",
      value: 56789,
      icon: Assets.icons.todayRegistration,
    },
    {
      label: "Invitation Registrations",
      value: 12456,
      icon: Assets.icons.invitationRegistration,
    },
    {
      label: "Pending Users",
      value: 88888,
      icon: Assets.icons.pendingUsers,
    },
    {
      label: "Approved Registrations",
      value: 15667,
      icon: Assets.icons.approvedRegistration,
    },
  ];

  // Default chart data if none provided
  const defaultChartData = [
    { month: "Jan", registered: 45 },
    { month: "Feb", registered: 120 },
    { month: "Mar", registered: 155 },
    { month: "Apr", registered: 60 },
    { month: "May", registered: 85 },
    { month: "Jun", registered: 200 },
  ];

  const monthOptions = ["1 Month", "3 Month", "6 Month", "1 Year"];

  // Custom dot component for the highlighted point
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.month === "Mar") {
      return (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r={6}
            fill="#4F46E5"
            stroke="white"
            strokeWidth={2}
          />
          <circle
            cx={cx}
            cy={cy}
            r={10}
            fill="none"
            stroke="#4F46E5"
            strokeWidth={1}
            opacity={0.3}
          />
          <rect
            x={cx - 15}
            y={cy - 25}
            width={30}
            height={18}
            rx={4}
            fill="#374151"
          />
          <text
            x={cx}
            y={cy - 12}
            textAnchor="middle"
            fontSize={10}
            fill="white"
            fontWeight="500"
          >
            155
          </text>
        </g>
      );
    }
    return null;
  };

  const handleTimeRangeChange = (newRange) => {
    setSelectedMonth(newRange);
    setIsDropdownOpen(false);
    // Call parent callback if provided
    if (onTimeRangeChange) {
      onTimeRangeChange(newRange);
    }
  };

  const currentChartData = chartData || defaultChartData;

  return (
    <>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* edit event details */}
        <div className="p-4 sm:p-6 lg:p-[24px] bg-white rounded-2xl flex flex-col lg:flex-row items-start justify-between gap-4 lg:gap-0">
          {/* logo and event name */}
          <div className="gap-3 flex flex-col sm:flex-row items-center w-full lg:w-auto">
            <div className="relative h-[150px] w-[150px] sm:h-[180px] sm:w-[180px] lg:h-[200px] lg:w-[200px] bg-neutral-50 items-center justify-center flex rounded-2xl flex-shrink-0">
              <div className="h-[36px] w-[36px] sm:h-[40px] sm:w-[40px] lg:h-[44px] lg:w-[44px] flex items-center justify-center absolute top-2 right-2 rounded-xl bg-white cursor-pointer drop-shadow-2xl">
                <Edit size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
              <img
                src={Assets.images.sccLogo}
                className="h-[80px] w-[74px] sm:h-[100px] sm:w-[93px] lg:h-[120px] lg:w-[111.8px]"
                alt="SCC Logo"
              />
            </div>

            {/* text detail part */}
            <div className="items-center text-center sm:text-left w-full sm:w-auto">
              {/* express or advance event */}
              <div className="p-3 lg:p-[12px] bg-emerald-50 rounded-3xl items-center flex gap-2 justify-center sm:justify-start w-fit mx-auto sm:mx-0">
                <img
                  src={Assets.icons.expressDot}
                  className="h-[8px] w-[8px]"
                  alt=""
                />
                <p className="text-emerald-500 text-xs sm:text-sm">
                  Express Event
                </p>
              </div>

              {/* event name */}
              <p className="mt-4 lg:mt-[16px] text-sm sm:text-base lg:text-lg text-slate-800 font-medium">
                SCC Summit
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 lg:mt-[16px]">
                <Clock
                  size={16}
                  className="sm:w-5 sm:h-5 lg:w-5 lg:h-5"
                  color="#525252"
                />
                <p className="text-neutral-500 text-xs sm:text-sm font-normal">
                  June 07, 2025 - June 09, 2025
                </p>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 lg:mt-[16px]">
                <MapPin
                  size={16}
                  className="sm:w-5 sm:h-5 lg:w-5 lg:h-5"
                  color="#525252"
                />
                <p className="text-neutral-500 text-xs sm:text-sm font-normal">
                  Riyadh, Saudi Arabia
                </p>
              </div>

              <p className="mt-4 lg:mt-[23px] text-neutral-500 text-xs sm:text-sm font-normal">
                Last edit: Before 3hr
              </p>
            </div>
          </div>

          {/* edit button  */}
          <div className="rounded-2xl bg-[#F2F6FF] py-2 px-4 lg:py-[10px] lg:px-[16px] flex items-center gap-2 cursor-pointer hover:bg-[#E8F1FF] transition-colors w-full sm:w-auto justify-center lg:justify-start flex-shrink-0">
            <Edit size={16} className="lg:w-5 lg:h-5" />
            <p className="text-[#202242] text-xs sm:text-sm font-normal">
              Edit Event
            </p>
          </div>
        </div>

        {/* registration and user counters - Responsive Grid */}
        <div className="mt-6 lg:mt-[24px] gap-3 sm:gap-4 lg:gap-3 grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {stats.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="bg-white flex items-center gap-3 p-4 lg:p-[16px] rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-3 lg:p-4 bg-neutral-50 rounded-xl flex-shrink-0">
                <img
                  src={item.icon}
                  alt={item.label}
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              </div>
              <div className="justify-between flex flex-col min-w-0 flex-1">
                <p className="text-xs font-normal sm:text-sm text-[#656C95] line-clamp-2">
                  {item.label}
                </p>
                <p className="mt-1 text-sm sm:text-base lg:text-lg font-medium text-[#202242]">
                  {item.value.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Registrations Activity Chart */}
        <div className="mt-6 lg:mt-[24px]">
          <RegistrationChart
            data={chartData || defaultChartData}
            title="Registrations Activity"
            legend="Registered"
            highlightDataKey="Mar"
            highlightValue={155}
            onTimeRangeChange={onTimeRangeChange}
            height="320px"
            className="shadow-sm hover:shadow-md transition-shadow"
          />
        </div>
      </div>
    </>
  );
}

export default HomeSummary;
