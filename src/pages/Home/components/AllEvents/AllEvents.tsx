import { getAllEvents, deleteEvent, getEventbyId } from "@/apis/apiHelpers";
import Assets from "@/utils/Assets";
import { useEffect, useState } from "react";
import { Trash2, Search, Loader2, Grid3X3, List } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// import { useNavigate } from "react-router-dom";

interface Event {
  id: string;
  type: string;
  name: string;
  date: string;
}

interface ApiEventItem {
  id: string;
  type: string;
  attributes: {
    event_type: string;
    name: string;
    event_date_from: string;
  };
}

type ViewMode = "grid" | "list";

function AllEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const navigate = useNavigate();

  const getEventStyle = (type: string) => {
    switch (type) {
      case "advance":
        return {
          icon: Assets.icons.advanceDot,
          color: "#38BDF8",
          bg: "bg-sky-50",
          backgroundImage: `url(${Assets.images.whiteBackSetting})`,
        };
      case "express":
        return {
          icon: Assets.icons.expressDot,
          color: "#10B981",
          bg: "bg-emerald-50",
          backgroundImage: `url(${Assets.images.whiteBackStar})`,
        };
      default:
        return {
          icon: "",
          color: "#6B7280",
          bg: "bg-neutral-100",
          backgroundImage: "none",
        };
    }
  };

  useEffect(() => {
    const fetchAllEventsApi = async () => {
      try {
        const response = await getAllEvents();
        console.log("All Events Response:", response.data);

        if (response.data?.data && Array.isArray(response.data.data)) {
          const mappedEvents = response.data.data.map((item: ApiEventItem) => ({
            id: item.id,
            type: item.attributes.event_type,
            name: item.attributes.name,
            date: new Date(item.attributes.event_date_from).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              }
            ),
          }));
          console.log("mappped event  data", mappedEvents);

          setEvents(mappedEvents);
        } else {
          console.log("No data or data is not an array");
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllEventsApi();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success("Event Deleted Successfully");
    } catch (error) {
      toast.error("Error deleting event");
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };
  const handleEventClick = (eventId: string) => {
    // Navigate

    setTimeout(() => {
      navigate(`/home/${eventId}`, {
        state: { eventId: eventId },
      });
    }, 300);

    console.log();
    console.log("event id for specific event:", eventId);

    // Save in localStorage
    localStorage.setItem("edit_eventId", eventId);
  };

  // Filter events based on search query
  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ padding: 24 }} className="bg-white w-full rounded-2xl">
        {/* Header with skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <p className="font-poppins text-md font-medium text-neutral-900">
              All Events
            </p>
            <div className="h-4 bg-gray-200 rounded w-24 mt-1 animate-pulse"></div>
          </div>

          {/* Search Input Skeleton */}
          <div className="w-full sm:w-64">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Loading Spinner with Message */}
        <div className="flex flex-col justify-center items-center py-12">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <p className="text-gray-500 text-sm mt-4 font-medium">
            Loading events...
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Please wait while we fetch your events
          </p>
        </div>

        {/* View Mode Toggle Skeleton */}
        <div className="flex justify-end">
          <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Event Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div
              key={index}
              className="bg-gray-100 rounded-2xl animate-pulse"
              style={{ padding: 24 }}
            >
              <div className="flex flex-row items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              </div>

              <div className="mt-10">
                <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }} className="bg-white w-full rounded-2xl">
      <div className="flex flex-col gap-4 mb-6">
        {/* Title and Counter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="font-poppins text-md font-medium text-neutral-900">
              All Events
            </p>
            {searchQuery && !loading && (
              <p className="text-sm text-gray-500 mt-1">
                {filteredEvents.length} of {events.length} events
              </p>
            )}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-end">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Events Display - Grid or List View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredEvents.map((event) => {
            const { icon, color, bg, backgroundImage } = getEventStyle(
              event.type
            );

            return (
              <div
                onClick={() => handleEventClick(event.id)}
                key={event.id}
                style={{
                  padding: 24,
                  backgroundImage,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right center",
                  backgroundSize: "auto 100%",
                  cursor: "pointer",
                }}
                className="flex flex-col bg-neutral-100 rounded-2xl hover:bg-[#ffffff] transition-all duration-300 ease-in-out hover:shadow-md"
              >
                <div className="flex flex-row items-center justify-between">
                  <div
                    className={`${bg} rounded-2xl flex flex-row items-center gap-2 px-3 py-2`}
                  >
                    <img style={{ width: 8, height: 8 }} src={icon} alt="dot" />
                    <p
                      style={{
                        color,
                        fontSize: 12,
                        fontFamily: "Poppins",
                        fontWeight: "400",
                        margin: 0,
                      }}
                    >
                      {event.type}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent parent click
                      handleDelete(event.id);
                    }}
                    disabled={deletingId === event.id}
                    className={`p-1 rounded-full cursor-pointer ${
                      deletingId === event.id
                        ? "bg-red-300"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>

                <div className="flex flex-col gap-2 mt-10">
                  <p className="text-slate-800 font-poppins font-medium text-md">
                    {event.name}
                  </p>
                  <p className="text-neutral-500 font-poppins font-normal text-xs">
                    {event.date}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3 mt-6">
          {filteredEvents.map((event) => {
            const { icon, color, bg } = getEventStyle(event.type);

            return (
              <div
                onClick={() => handleEventClick(event.id)}
                key={event.id}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-white transition-all duration-300 ease-in-out hover:shadow-md cursor-pointer border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Event Type Badge */}
                  <div
                    className={`${bg} rounded-lg flex flex-row items-center gap-2 px-3 py-2 shrink-0`}
                  >
                    <img style={{ width: 8, height: 8 }} src={icon} alt="dot" />
                    <p
                      style={{
                        color,
                        fontSize: 12,
                        fontFamily: "Poppins",
                        fontWeight: "400",
                        margin: 0,
                      }}
                    >
                      {event.type}
                    </p>
                  </div>

                  {/* Event Info */}
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <p className="text-slate-800 font-poppins font-medium text-md truncate">
                      {event.name}
                    </p>
                    <p className="text-neutral-500 font-poppins font-normal text-xs">
                      {event.date}
                    </p>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent parent click
                    handleDelete(event.id);
                  }}
                  disabled={deletingId === event.id}
                  className={`p-2 rounded-full cursor-pointer shrink-0 ${
                    deletingId === event.id
                      ? "bg-red-300"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty States */}
      {!loading && events.length === 0 && (
        <div className="w-full flex flex-col justify-center items-center py-10">
          <img
            className="h-40 w-40"
            src={Assets.images.eventEmptyCard}
            alt="No Events"
          />
          <p className="text-gray-500 mt-4 text-sm">No events found</p>
        </div>
      )}

      {!loading &&
        events.length > 0 &&
        filteredEvents.length === 0 &&
        searchQuery && (
          <div className="w-full flex flex-col justify-center items-center py-10">
            <Search className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No events found</p>
            <p className="text-gray-400 text-sm mt-2">
              No events match "{searchQuery}". Try a different search term.
            </p>
          </div>
        )}
    </div>
  );
}

export default AllEvents;
