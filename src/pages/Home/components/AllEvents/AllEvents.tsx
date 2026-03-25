import { deleteEvent, getAllEvents } from "@/apis/apiHelpers";
import Assets from "@/utils/Assets";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, Search, Grid3X3, List, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceNavigate } from "@/hooks/useWorkspaceNavigate";

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
  t,
}: PaginationProps & { t: (key: string) => string }) {
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
        {t("home.prev")}
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
        {t("home.next")}
      </button>
    </div>
  );
}

function AllEvents() {
  const { t } = useTranslation("dashboard");
  const [allEvents, setAllEvents] = useState<Event[]>([]); // all events fetched when searching
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]); // events after search filter
  const [events, setEvents] = useState<Event[]>([]); // events to display (paginated)
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false); // loading state when searching
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null); // track which event is being deleted
  const [eventToDelete, setEventToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null); // track event pending deletion confirmation
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const navigate = useNavigate();
  const navigateTo = useWorkspaceNavigate();

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

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

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
  };

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
      navigateTo(`home/${eventId}`, {
        state: { eventId: eventId },
      });
      localStorage.setItem("edit_eventId", eventId);
    }, 300);
  };

  // Reset to first page when debouncedSearch changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Fetch events from API with pagination (only when not searching)
  useEffect(() => {
    // Skip if searching - search will fetch all pages
    if (debouncedSearch.trim()) {
      return;
    }

    const fetchEventsApi = async () => {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          page: currentPage,
          per_page: itemsPerPage,
        };

        const response = await getAllEvents(params);

        if (response.data?.data && Array.isArray(response.data.data)) {
          const mappedEvents = response.data.data.map((item: ApiEventItem) => {
            // Handle both flat structure (from Swagger) and nested structure
            const eventType =
              item.event_type || item.attributes?.event_type || "";
            const eventName = item.name || item.attributes?.name || "";
            const eventDate =
              item.event_date_from || item.attributes?.event_date_from || "";

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
          });

          setEvents(mappedEvents);

          // Set pagination from API meta
          const pagination = response.data?.meta?.pagination;
          if (pagination) {
            setTotalPages(pagination.total_pages || 1);
          }
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error("AllEvents - Error fetching events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEventsApi();
  }, [currentPage, itemsPerPage, debouncedSearch]);

  // Fetch all pages when searching
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      // Clear search results when search is cleared
      setAllEvents([]);
      setFilteredEvents([]);
      setSearching(false);
      return;
    }

    const fetchAllEventsForSearch = async () => {
      setSearching(true);
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
              },
            );

            allFetchedEvents = [...allFetchedEvents, ...mappedEvents];

            // Check pagination to see if there are more pages
            const pagination = response.data?.meta?.pagination;
            if (pagination) {
              // Use next_page if available (most reliable)
              if (
                pagination.next_page !== null &&
                pagination.next_page !== undefined
              ) {
                currentPageNum = pagination.next_page;
              }
              // Fallback to comparing current page with total pages
              else if (
                pagination.current_page &&
                pagination.total_pages &&
                pagination.current_page < pagination.total_pages
              ) {
                currentPageNum = pagination.current_page + 1;
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
            hasMorePages = false;
          }
        }

        setAllEvents(allFetchedEvents);
      } catch (error) {
        console.error(
          "AllEvents - Error fetching all events for search:",
          error,
        );
        setAllEvents([]);
      } finally {
        setSearching(false);
      }
    };

    fetchAllEventsForSearch();
  }, [debouncedSearch]);

  // Filter events by name on frontend when searching
  useEffect(() => {
    if (debouncedSearch.trim() && allEvents.length > 0) {
      const searchTerm = debouncedSearch.toLowerCase().trim();
      const filtered = allEvents.filter((e) =>
        e.name.toLowerCase().includes(searchTerm),
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents([]);
    }
  }, [allEvents, debouncedSearch]);

  // Paginate filtered events on frontend when searching
  useEffect(() => {
    if (debouncedSearch.trim()) {
      const totalFiltered = filteredEvents.length;
      const totalPagesCalc = Math.max(
        1,
        Math.ceil(totalFiltered / itemsPerPage),
      );
      setTotalPages(totalPagesCalc);

      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      setEvents(filteredEvents.slice(startIdx, endIdx));
    }
  }, [filteredEvents, currentPage, itemsPerPage, debouncedSearch]);

  // Use the paginated events
  const paginatedEvents = events;

  // Show loading when searching or initial load
  const isLoading = loading || searching;

  // Always show the real search input, even while loading

  // Show confirmation modal when delete is clicked
  const handleDeleteClick = (eventId: string, eventName: string) => {
    setEventToDelete({ id: eventId, name: eventName });
  };

  // Close confirmation modal
  const handleCloseDeleteModal = () => {
    setEventToDelete(null);
  };

  // Confirm and proceed with deletion
  const handleDelete = async () => {
    if (!eventToDelete || deletingEventId) return; // Prevent multiple deletions

    const eventId = eventToDelete.id;
    console.log("eventId", eventId);
    setDeletingEventId(eventId);
    setEventToDelete(null); // Close modal
    try {
      await deleteEvent(eventId);
      showNotification(t("home.eventDeletedSuccess"), "success");

      // Refresh the events list
      if (debouncedSearch.trim()) {
        // If searching, refetch all pages
        const fetchAllEventsForSearch = async () => {
          try {
            let allFetchedEvents: Event[] = [];
            let currentPageNum = 1;
            let hasMorePages = true;

            while (hasMorePages) {
              const params: Record<string, any> = {
                page: currentPageNum,
                per_page: 100,
              };
              const response = await getAllEvents(params);

              if (response.data?.data && Array.isArray(response.data.data)) {
                const mappedEvents = response.data.data.map(
                  (item: ApiEventItem) => {
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
                  },
                );

                allFetchedEvents = [...allFetchedEvents, ...mappedEvents];

                const pagination = response.data?.meta?.pagination;
                if (pagination) {
                  if (
                    pagination.next_page !== null &&
                    pagination.next_page !== undefined
                  ) {
                    currentPageNum = pagination.next_page;
                  } else if (
                    pagination.current_page &&
                    pagination.total_pages &&
                    pagination.current_page < pagination.total_pages
                  ) {
                    currentPageNum = pagination.current_page + 1;
                  } else if (
                    pagination.total_pages &&
                    currentPageNum < pagination.total_pages
                  ) {
                    currentPageNum++;
                  } else {
                    hasMorePages = false;
                  }
                } else if (mappedEvents.length === 0) {
                  hasMorePages = false;
                } else {
                  if (currentPageNum < 100) {
                    currentPageNum++;
                  } else {
                    hasMorePages = false;
                  }
                }
              } else {
                hasMorePages = false;
              }
            }

            setAllEvents(allFetchedEvents);
          } catch (error) {
            console.error("Error refreshing events:", error);
          }
        };
        fetchAllEventsForSearch();
      } else {
        // If not searching, refetch current page
        const fetchEventsApi = async () => {
          try {
            const params: Record<string, any> = {
              page: currentPage,
              per_page: itemsPerPage,
            };

            const response = await getAllEvents(params);

            if (response.data?.data && Array.isArray(response.data.data)) {
              const mappedEvents = response.data.data.map(
                (item: ApiEventItem) => {
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
                },
              );

              setEvents(mappedEvents);

              const pagination = response.data?.meta?.pagination;
              if (pagination) {
                setTotalPages(pagination.total_pages || 1);
              }
            }
          } catch (error) {
            console.error("Error refreshing events:", error);
          }
        };
        fetchEventsApi();
      }
    } catch (error) {
      console.error("AllEvents - Error deleting event:", error);
      showNotification(t("home.eventDeleteFailed"), "error");
    } finally {
      setDeletingEventId(null);
    }
  };
  return (
    <>
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      <div
        style={{ padding: 24 }}
        className="w-full rounded-2xl border border-slate-100/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex flex-col gap-4 mb-6">
          {/* Title and Counter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="font-poppins text-md font-medium text-neutral-900 dark:text-slate-100">
                {t("home.allEvents")}
              </p>
              {!isLoading && (
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  {searchQuery ? (
                    <>
                      {t("home.showingEvents", { count: paginatedEvents.length, total: filteredEvents.length })}
                      {filteredEvents.length !== allEvents.length &&
                        ` (${allEvents.length})`}
                    </>
                  ) : (
                    <>
                      {t("home.showingEventsPage", { count: paginatedEvents.length, page: currentPage, pages: totalPages })}
                    </>
                  )}
                </p>
              )}
              {isLoading && <Skeleton className="h-4 w-32 mt-1" />}
              {searching && (
                <p className="mt-1 text-sm text-blue-500 dark:text-blue-400">
                  {t("home.searchingAllPages")}
                </p>
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 dark:text-slate-500" />
              </div>
              <input
                type="text"
                placeholder={t("home.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white py-2 pr-10 pl-10 text-sm leading-5 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none focus:placeholder-gray-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                // input is never disabled
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
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
          {!isLoading || events.length > 0 ? (
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-slate-400">
                {t("home.pageOfPages", { page: currentPage, pages: totalPages })}
              </div>
              <div className="flex items-center rounded-lg bg-gray-100 p-1 dark:bg-slate-800">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                  title={t("home.gridView")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                  title={t("home.listView")}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Events Display - Grid or List View */}
        {isLoading && events.length === 0 ? (
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
                  event.type,
                );

                const isDeleting = deletingEventId === event.id;

                return (
                  <div
                    onClick={() => {
                      if (isDeleting) return;
                      handleEventClick(event.id);
                    }}
                    key={event.id}
                    style={{
                      padding: 24,
                      backgroundImage,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right center",
                      backgroundSize: "auto 100%",
                      cursor: isDeleting ? "wait" : "pointer",
                    }}
                    className={`group relative flex flex-col overflow-hidden rounded-2xl border border-transparent bg-neutral-100 transition-all duration-300 ease-out dark:border-slate-700 dark:bg-slate-900 ${
                      isDeleting
                        ? "pointer-events-none"
                        : "hover:bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.99] dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:shadow-slate-950/50"
                    }`}
                  >
                    {/* Deleting overlay – blocks navigation and shows loading state */}
                    {isDeleting && (
                      <div
                          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/80 backdrop-blur-sm dark:bg-slate-950/80"
                        aria-live="polite"
                        aria-busy="true"
                      >
                        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                        <div className="text-center px-2">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t("home.deleting")}</p>
                          <p className="mt-0.5 max-w-[180px] truncate text-xs text-slate-500 dark:text-slate-400" title={event.name}>
                            {event.name}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-row items-center justify-between">
                      <div
                        className={`${bg} rounded-2xl flex flex-row items-center gap-2 px-3 py-2 transition-shadow duration-300 group-hover:shadow-sm`}
                      >
                        <img
                          style={{ width: 8, height: 8 }}
                          src={icon}
                          alt="dot"
                          className="transition-transform duration-300 group-hover:scale-110"
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
                          handleDeleteClick(event.id, event.name);
                        }}
                        disabled={isDeleting}
                        title="Delete event"
                        className="flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer bg-rose-50 text-rose-500 border border-rose-200/80 hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:shadow-md hover:shadow-rose-200/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-rose-50 disabled:hover:text-rose-500 disabled:hover:border-rose-200/80 disabled:hover:shadow-none transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" strokeWidth={2} />
                        )}
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 mt-10">
                      <p className="text-md font-poppins font-medium text-slate-800 transition-colors duration-300 group-hover:text-slate-900 dark:text-slate-100 dark:group-hover:text-white">
                        {event.name}
                      </p>
                      <p className="font-poppins text-xs font-normal text-neutral-500 dark:text-slate-400">
                        {event.date}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination for Grid View */}
            {!isLoading && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="mt-6"
                t={t}
              />
            )}
          </>
        ) : (
          <>
            <div className="space-y-3 mt-6">
              {paginatedEvents.map((event) => {
                const { icon, color, bg } = getEventStyle(event.type);
                const isDeleting = deletingEventId === event.id;

                return (
                  <div
                    onClick={() => {
                      if (isDeleting) return;
                      handleEventClick(event.id);
                    }}
                    key={event.id}
                    className={`group relative flex items-center justify-between overflow-hidden rounded-xl border border-transparent p-4 dark:border-slate-700 ${
                      isDeleting
                        ? "pointer-events-none cursor-wait bg-neutral-100 dark:bg-slate-900"
                        : "cursor-pointer bg-neutral-50 transition-all duration-300 ease-out hover:border-slate-200 hover:bg-white hover:shadow-md hover:shadow-slate-200/40 hover:scale-[1.01] dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:shadow-slate-950/50"
                    }`}
                  >
                    {/* Deleting overlay – blocks navigation and shows loading state */}
                    {isDeleting && (
                      <div
                        className="absolute inset-0 z-10 flex flex-row items-center justify-center gap-3 rounded-xl bg-white/80 backdrop-blur-sm dark:bg-slate-950/80"
                        aria-live="polite"
                        aria-busy="true"
                      >
                        <Loader2 className="w-6 h-6 text-rose-500 animate-spin shrink-0" />
                        <div className="text-center min-w-0">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t("home.deleting")}</p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400" title={event.name}>
                            {event.name}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4 flex-1">
                      {/* Event Type Badge */}
                      <div
                        className={`${bg} rounded-lg flex flex-row items-center gap-2 px-3 py-2 shrink-0 transition-shadow duration-300 group-hover:shadow-sm`}
                      >
                        <img
                          style={{ width: 8, height: 8 }}
                          src={icon}
                          alt="dot"
                          className="transition-transform duration-300 group-hover:scale-110"
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
                        <p className="text-md font-poppins font-medium truncate text-slate-800 transition-colors duration-300 group-hover:text-slate-900 dark:text-slate-100 dark:group-hover:text-white">
                          {event.name}
                        </p>
                        <p className="font-poppins text-xs font-normal text-neutral-500 dark:text-slate-400">
                          {event.date}
                        </p>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent parent click
                        handleDeleteClick(event.id, event.name);
                      }}
                      disabled={isDeleting}
                      title="Delete event"
                      className="flex items-center justify-center gap-1.5 shrink-0 min-w-9 h-9 px-3 rounded-xl cursor-pointer bg-rose-50 text-rose-500 border border-rose-200/80 hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:shadow-md hover:shadow-rose-200/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-rose-50 disabled:hover:text-rose-500 disabled:hover:border-rose-200/80 disabled:hover:shadow-none transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {deletingEventId === event.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" strokeWidth={2} />
                          <span className="text-xs font-medium hidden sm:inline">{t("home.delete")}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Pagination for List View */}
            {!isLoading && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="mt-6"
                t={t}
              />
            )}
          </>
        )}

        {/* Empty States */}
        {!isLoading && events.length === 0 && !searchQuery && (
          <div className="w-full flex flex-col justify-center items-center py-10">
            <img
              className="h-40 w-40"
              src={Assets.images.eventEmptyCard}
              alt="No Events"
            />
            <p className="text-gray-500 mt-4 text-sm">{t("home.noEventsFound")}</p>
          </div>
        )}

        {!isLoading && !searching && events.length === 0 && searchQuery && (
          <div className="w-full flex flex-col justify-center items-center py-10">
            <Search className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">{t("home.noEventsFound")}</p>
            <p className="text-gray-400 text-sm mt-2">
              {t("home.noEventsMatch", { search: searchQuery })}
            </p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {eventToDelete && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
            onClick={handleCloseDeleteModal}
          >
            <div
              className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
            >
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>

              <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                {t("home.deleteEvent")}
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                {t("home.deleteEventConfirm", { name: eventToDelete.name || t("home.thisEvent") })}
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={handleCloseDeleteModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                >
                  {t("home.cancel")}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deletingEventId === eventToDelete.id}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingEventId === eventToDelete.id
                    ? t("home.deleting")
                    : t("home.delete")}
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
      </div>
    </>
  );
}

export default AllEvents;