import React, { useEffect, useState } from "react";
import Assets from "../../../../utils/Assets";
import { Clock, Edit, MapPin } from "lucide-react";
import RegistrationChart from "./components/RegsitrationChart";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { getEventbyId } from "@/apis/apiHelpers";

type HomeSummaryProps = {
  chartData?: Array<Record<string, any>>;
  onTimeRangeChange?: (range: string) => void;
};

function HomeSummary({ chartData, onTimeRangeChange }: HomeSummaryProps) {
  const [selectedMonth, setSelectedMonth] = useState("6 Month");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [eventData, setEventData] = useState<any>(null);

const navigate = useNavigate()
  const location = useLocation();
  const { id: paramId } = useParams();
  const eventId = location.state?.eventId || paramId;

  // Fetch event data
  const getEventDataById = async (id: string | number) => {
    try {
      const response = await getEventbyId(id);
      setEventData(response.data.data);
    } catch (error) {
      console.error("Error fetching event by ID:", error);
    }
  };

  useEffect(() => {
    if (eventId) getEventDataById(eventId);
  }, [eventId]);

  if (!eventData) return <div>Loading...</div>;

  const {
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
  } = eventData.attributes;

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

  const handleTimeRangeChange = (newRange: string) => {
    setSelectedMonth(newRange);
    setIsDropdownOpen(false);
    // Call parent callback if provided
    if (onTimeRangeChange) {
      onTimeRangeChange(newRange);
    }
  };

  const currentChartData = chartData || defaultChartData;

  // Format time nicely
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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

              {eventData?.attributes?.logo_url ? (
                <img
                  src={eventData.attributes.logo_url}
                  alt="Event Logo"
                  className="h-[80px] w-[74px] sm:h-[100px] sm:w-[93px] lg:h-[120px] lg:w-[111.8px] rounded-2xl"
                />
              ) : (
                <div className="h-[80px] w-[74px] sm:h-[100px] sm:w-[93px] lg:h-[120px] lg:w-[111.8px] bg-gray-300 flex items-center justify-center rounded-2xl">
                  No Logo
                </div>
              )}


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
                  {event_type}
                </p>
              </div>

              {/* event name */}
              <p className="mt-4 lg:mt-[16px] text-sm sm:text-base lg:text-lg text-slate-800 font-medium">
                {name}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 lg:mt-[16px]">
                <Clock
                  size={16}
                  className="sm:w-5 sm:h-5 lg:w-5 lg:h-5"
                  color="#525252"
                />
                <p className="text-neutral-500 text-xs sm:text-sm font-normal">
                  {event_date_from} {formatTime(event_time_from)} to {event_date_to} {formatTime(event_time_to)}

                </p>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 lg:mt-[16px]">
                <MapPin
                  size={16}
                  className="sm:w-5 sm:h-5 lg:w-5 lg:h-5"
                  color="#525252"
                />
                <p className="text-neutral-500 text-xs sm:text-sm font-normal">
                  {eventLocation}
                </p>
              </div>

              <p className="mt-4 lg:mt-[23px] text-neutral-500 text-xs sm:text-sm font-normal">
                Last edit: Before 3hr
              </p>
            </div>
          </div>

          {/* edit button  */}
          <div onClick={()=>navigate("/express-event", { 
            state: { 
              // Event type and basic info
              plan: event_type,
              eventData: eventData,
              isEditing: true,
              
              // All event attributes
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
              
              // Component props
              chartData,
              onTimeRangeChange,
              
              // Event ID for reference
              eventId,
              
              // Stats data
              stats,
              
              // Additional metadata
              lastEdit: "Before 3hr",
              currentStep: 0, // Start from first step when editing
            } 
          })} className="rounded-2xl bg-[#F2F6FF] py-2 px-4 lg:py-[10px] lg:px-[16px] flex items-center gap-2 cursor-pointer hover:bg-[#E8F1FF] transition-colors w-full sm:w-auto justify-center lg:justify-start flex-shrink-0">
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
