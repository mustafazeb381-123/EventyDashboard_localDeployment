import { getAllEvents } from "@/apis/apiHelpers";
import Assets from "@/utils/Assets";
import { useEffect, useState, useRef } from "react";
import { Trash2, Search, Grid3X3, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

// import { useNavigate } from "react-router-dom";

interface Event {
  id: string;
  type: string;
  name: string;
  date: string;
}

interface ApiEventItem {
  id: string | number;
  uuid?: string;
  name: string;
  event_date_from: string;
  event_date_to?: string;
  event_time_from?: string;
  event_time_to?: string;
  event_type: string;
  require_approval?: boolean;
  about?: string;
  location?: string;
  primary_color?: string;
  secondary_color?: string;
  template?: string;
  print_qr?: boolean;
  display_confirmation_message?: boolean;
  display_location?: boolean;
  display_event_details?: boolean;
  logo_url?: string;
  badge_background_url?: string;
  registration_page_banner_url?: string;
  created_at?: string;
  updated_at?: string;
  // Support for nested structure if API returns it
  attributes?: {
    event_type: string;
    name: string;
    event_date_from: string;
  };
}

type ViewMode = "grid" | "list";

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className={`flex justify-end items-center gap-2 mt-4 ${className}`}>
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
      >
        Prev
      </button>

      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => goToPage(i + 1)}
          className={`px-3 py-1 rounded-md text-sm transition ${
            currentPage === i + 1
              ? "bg-blue-600 text-white"
              : "border border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
      >
        Next
      </button>
    </div>
  );
}

function AllEvents() {
  const [allEvents, setAllEvents] = useState<Event[]>([]); // all events fetched from backend
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]); // events after search filter
  const [events, setEvents] = useState<Event[]>([]); // events to display (paginated)
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15; // You can adjust this or make it user-configurable

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

  // Only one fetch useEffect (see below)

  // Debounce search input
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchQuery]);

  // Handle event click
  const handleEventClick = (eventId: string) => {
    setTimeout(() => {
      navigate(`/home/${eventId}`, {
        state: { eventId: eventId },
      });
      localStorage.setItem("edit_eventId", eventId);
    }, 300);
  };

  // Reset to first page when debouncedSearch changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Fetch all events from API (fetch all pages)
  useEffect(() => {
    const fetchAllEventsApi = async () => {
      setLoading(true);
      try {
        let allFetchedEvents: Event[] = [];
        let currentPageNum = 1;
        let hasMorePages = true;

        // Fetch all pages until we get all events
        while (hasMorePages) {
          const params: Record<string, any> = {
            page: currentPageNum,
            per_page: 100, // Fetch large page size to minimize API calls
          };
          const response = await getAllEvents(params);

          if (response.data?.data && Array.isArray(response.data.data)) {
            const mappedEvents = response.data.data.map(
              (item: ApiEventItem) => {
                // Handle both flat structure (from Swagger) and nested structure
                const eventType =
                  item.event_type || item.attributes?.event_type || "";
                const eventName = item.name || item.attributes?.name || "";
                const eventDate =
                  item.event_date_from ||
                  item.attributes?.event_date_from ||
                  "";

                return {
                  id: String(item.id),
                  type: eventType,
                  name: eventName,
                  date: eventDate
                    ? new Date(eventDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "",
                };
              }
            );
            allFetchedEvents = [...allFetchedEvents, ...mappedEvents];

            // Check if there are more pages
            const pagination = response.data?.meta?.pagination;
            console.log(`Fetched page ${currentPageNum}:`, {
              eventsOnPage: mappedEvents.length,
              totalFetched: allFetchedEvents.length,
              pagination: pagination,
              nextPage: pagination?.next_page,
              totalPages: pagination?.total_pages,
              currentPage: pagination?.current_page,
            });

            // Check multiple conditions to determine if there are more pages
            if (pagination) {
              // Use next_page if available (most reliable)
              if (
                pagination.next_page !== null &&
                pagination.next_page !== undefined
              ) {
                currentPageNum = pagination.next_page;
              }
              // Fallback to comparing current page with total pages
              else if (pagination.current_page && pagination.total_pages) {
                if (pagination.current_page < pagination.total_pages) {
                  currentPageNum = pagination.current_page + 1;
                } else {
                  hasMorePages = false;
                }
              }
              // Another fallback: compare our page number with total_pages
              else if (
                pagination.total_pages &&
                currentPageNum < pagination.total_pages
              ) {
                currentPageNum++;
              } else {
                hasMorePages = false;
              }
            } else if (mappedEvents.length === 0) {
              // If no data returned, we've reached the end
              hasMorePages = false;
            } else {
              // If no pagination info but we got data, try next page
              // But add a safety limit to prevent infinite loops
              if (currentPageNum < 100) {
                currentPageNum++;
              } else {
                console.warn("Reached safety limit of 100 pages");
                hasMorePages = false;
              }
            }
          } else {
            // No data or invalid response structure
            console.warn(`No data returned for page ${currentPageNum}`);
            hasMorePages = false;
          }
        }

        console.log(`Total events fetched: ${allFetchedEvents.length}`);

        setAllEvents(allFetchedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        setAllEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllEventsApi();
  }, []);

  // Filter events by name on frontend
  useEffect(() => {
    if (debouncedSearch.trim()) {
      // Only show events that match the search query
      const searchTerm = debouncedSearch.toLowerCase().trim();
      const filtered = allEvents.filter((e) =>
        e.name.toLowerCase().includes(searchTerm)
      );
      console.log("Search filter applied:", {
        searchTerm: debouncedSearch,
        totalEvents: allEvents.length,
        filteredCount: filtered.length,
        filteredEvents: filtered.map((e) => e.name),
      });
      setFilteredEvents(filtered);
    } else {
      // No search query - show all events
      setFilteredEvents(allEvents);
    }
  }, [allEvents, debouncedSearch]);

  // Paginate filtered events on frontend
  useEffect(() => {
    const totalFiltered = filteredEvents.length;
    const totalPagesCalc = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
    setTotalPages(totalPagesCalc);

    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    setEvents(filteredEvents.slice(startIdx, endIdx));
  }, [filteredEvents, currentPage, itemsPerPage]);

  // Use the paginated events
  const paginatedEvents = events;

  // Always show the real search input, even while loading

  return (
    <div style={{ padding: 24 }} className="bg-white w-full rounded-2xl">
      <div className="flex flex-col gap-4 mb-6">
        {/* Title and Counter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="font-poppins text-md font-medium text-neutral-900">
              All Events
            </p>
            {allEvents.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {searchQuery ? (
                  <>
                    Showing {paginatedEvents.length} of {filteredEvents.length}{" "}
                    event{filteredEvents.length !== 1 ? "s" : ""}
                    {filteredEvents.length !== allEvents.length &&
                      ` (${allEvents.length} total)`}
                  </>
                ) : (
                  <>
                    {allEvents.length} event{allEvents.length !== 1 ? "s" : ""}{" "}
                    total
                  </>
                )}
              </p>
            )}
            {loading && allEvents.length === 0 && (
              <Skeleton className="h-4 w-32 mt-1" />
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
              // input is never disabled
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                // button is never disabled
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
        {!loading || allEvents.length > 0 ? (
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
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
        ) : null}
      </div>

      {/* Events Display - Grid or List View */}
      {loading && allEvents.length === 0 ? (
        // Skeleton loader for initial load
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="flex flex-col bg-neutral-100 rounded-2xl p-6"
              >
                <div className="flex flex-row items-center justify-between mb-4">
                  <Skeleton className="h-8 w-24 rounded-2xl" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="flex flex-col gap-2 mt-6">
                  <Skeleton className="h-5 w-3/4 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 mt-6">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Skeleton className="h-10 w-24 rounded-lg" />
                  <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-5 w-3/4 rounded" />
                    <Skeleton className="h-4 w-1/2 rounded" />
                  </div>
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            ))}
          </div>
        )
      ) : viewMode === "grid" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {paginatedEvents.map((event) => {
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
                      <img
                        style={{ width: 8, height: 8 }}
                        src={icon}
                        alt="dot"
                      />
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
                        {
                          /* handleDelete(event.id); */
                        }
                      }}
                      className="p-1 rounded-full cursor-pointer bg-red-500 hover:bg-red-600"
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

          {/* Pagination for Grid View */}
          {!loading && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-6"
            />
          )}
        </>
      ) : (
        <>
          <div className="space-y-3 mt-6">
            {paginatedEvents.map((event) => {
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
                      <img
                        style={{ width: 8, height: 8 }}
                        src={icon}
                        alt="dot"
                      />
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
                      {
                        /* handleDelete(event.id); */
                      }
                    }}
                    className="p-2 rounded-full cursor-pointer shrink-0 bg-red-500 hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination for List View */}
          {!loading && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-6"
            />
          )}
        </>
      )}

      {/* Empty States - Only show when not loading and we have finished fetching */}
      {!loading && allEvents.length === 0 && (
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
        allEvents.length > 0 &&
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
