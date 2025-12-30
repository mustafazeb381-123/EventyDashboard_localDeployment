import Assets from "@/utils/Assets";
import React, { useEffect, useState } from "react";
import { getAllEvents } from "@/apis/apiHelpers";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface Event {
  id: string;
  type: string;
  name: string;
  date: string;
  created_at: string;
}

interface ApiEventItem {
  id: string | number;
  name: string;
  event_date_from: string;
  event_type: string;
  created_at?: string;
  attributes?: {
    event_type: string;
    name: string;
    event_date_from: string;
    created_at?: string;
  };
}

function Recents() {
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentEvents = async () => {
      setLoading(true);
      try {
        let allFetchedEvents: Event[] = [];
        // Fetch ALL pages using pagination to find the most recent events
        let currentPage = 1;
        const perPage = 100; // Use larger page size to minimize API calls
        let hasMorePages = true;

        // Fetch all pages until we get all events
        while (hasMorePages) {
          const params: Record<string, any> = {
            page: currentPage,
            per_page: perPage,
          };
          const response = await getAllEvents(params);

          // Debug: Log the response structure
          console.log(`Recents - Page ${currentPage} response:`, {
            hasData: !!response.data,
            dataStructure: response.data ? Object.keys(response.data) : null,
            eventsArray: response.data?.data,
            pagination: response.data?.meta?.pagination,
            fullResponse: response,
          });

          // Check if data exists and is an array
          const eventsData = response.data?.data;
          if (
            eventsData &&
            Array.isArray(eventsData) &&
            eventsData.length > 0
          ) {
            console.log(
              `Recents - Page ${currentPage}: Found ${eventsData.length} events in response`
            );
            const mappedEvents = eventsData.map((item: ApiEventItem) => {
              // Based on Swagger docs, events are flat structure
              // But also handle nested structure if API returns it
              const eventType =
                item.event_type || item.attributes?.event_type || "";
              const eventName = item.name || item.attributes?.name || "";
              const eventDate =
                item.event_date_from || item.attributes?.event_date_from || "";
              const createdAt =
                item.created_at || item.attributes?.created_at || "";

              const mappedEvent = {
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
                created_at: createdAt,
              };

              // Debug: Log raw item and mapped event
              console.log("Recents - Raw item:", item);
              console.log("Recents - Mapped event:", mappedEvent);

              return mappedEvent;
            });
            allFetchedEvents = [...allFetchedEvents, ...mappedEvents];
            console.log(
              `Recents - Page ${currentPage}: Fetched ${mappedEvents.length} events, Total: ${allFetchedEvents.length}`
            );
            console.log(
              "Recents - Sample mapped events:",
              mappedEvents.slice(0, 2)
            );

            // Check pagination to see if there are more pages
            const pagination = response.data?.meta?.pagination;
            if (pagination) {
              // Use next_page if available (most reliable)
              if (
                pagination.next_page !== null &&
                pagination.next_page !== undefined
              ) {
                currentPage = pagination.next_page;
              }
              // Fallback to comparing current page with total pages
              else if (
                pagination.current_page &&
                pagination.total_pages &&
                pagination.current_page < pagination.total_pages
              ) {
                currentPage = pagination.current_page + 1;
              }
              // Another fallback: compare our page number with total_pages
              else if (
                pagination.total_pages &&
                currentPage < pagination.total_pages
              ) {
                currentPage++;
              } else {
                hasMorePages = false;
              }
            } else if (mappedEvents.length === 0) {
              // If no data returned, we've reached the end
              hasMorePages = false;
            } else {
              // If no pagination info but we got data, try next page
              // But add a safety limit to prevent infinite loops
              if (currentPage < 100) {
                currentPage++;
              } else {
                console.warn("Reached safety limit of 100 pages");
                hasMorePages = false;
              }
            }
          } else {
            // No data or invalid response structure
            console.warn(`Recents - Page ${currentPage}: No valid data found`, {
              hasResponse: !!response,
              hasData: !!response?.data,
              dataKeys: response?.data ? Object.keys(response.data) : null,
              eventsData: response?.data?.data,
              eventsDataType: typeof response?.data?.data,
              isArray: Array.isArray(response?.data?.data),
              eventsLength: Array.isArray(response?.data?.data)
                ? response.data.data.length
                : 0,
              fullResponse: response,
            });
            hasMorePages = false;
          }
        }

        // Sort by created_at date (newest first) and take only 2
        const sortedEvents = allFetchedEvents
          .filter((e) => {
            // Only include events with valid created_at date
            if (!e.created_at) return false;
            const date = new Date(e.created_at);
            return !isNaN(date.getTime()); // Check if date is valid
          })
          .sort((a, b) => {
            // Sort by created_at date (newest first)
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA; // Newest first (descending order)
          })
          .slice(0, 2); // Take only 2 most recent events

        console.log(
          "Recents - Recent events sorted by created_at:",
          sortedEvents
        );
        setRecentEvents(sortedEvents);
      } catch (error) {
        console.error("Recents - Error fetching recent events:", error);
        if (error instanceof Error) {
          console.error("Recents - Error message:", error.message);
          console.error("Recents - Error stack:", error.stack);
        }
        setRecentEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentEvents();
  }, []);

  const getEventStyle = (type: string) => {
    // Normalize the type to lowercase for comparison
    const normalizedType = type.toLowerCase();
    if (normalizedType.includes("advance")) {
      return {
        icon: Assets.icons.advanceDot,
        color: "#38BDF8", // sky-400
      };
    }
    if (normalizedType.includes("express")) {
      return {
        icon: Assets.icons.expressDot,
        color: "#10B981", // emerald-500
      };
    }
    return {
      icon: Assets.icons.defaultDot || "",
      color: "#6B7280", // neutral-500
    };
  };

  const handleEventClick = (eventId: string) => {
    setTimeout(() => {
      navigate(`/home/${eventId}`, {
        state: { eventId: eventId },
      });
      localStorage.setItem("edit_eventId", eventId);
    }, 300);
  };

  return (
    <div className="bg-white w-full rounded-2xl p-6">
      <p className="font-poppins text-md font-medium text-neutral-900 mb-4">
        Recents
      </p>

      {loading ? (
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between gap-4">
          {[...Array(2)].map((_, index) => (
            <div
              key={index}
              className="flex flex-col w-full sm:w-[48%] bg-gradient-to-br from-[#2E3166] to-[#202242] rounded-2xl p-6"
            >
              <Skeleton className="h-8 w-24 mb-10" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between gap-4">
            {recentEvents.map((event) => {
              const { icon, color } = getEventStyle(event.type);

              // Debug: Log each event being rendered
              console.log("Recents - Rendering event:", {
                id: event.id,
                type: event.type,
                name: event.name,
                date: event.date,
                created_at: event.created_at,
                icon,
                color,
              });

              return (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event.id)}
                  className="flex flex-col w-full sm:w-[48%] bg-gradient-to-br from-[#2E3166] to-[#202242] rounded-2xl p-6 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <div className="flex">
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-2xl"
                      style={{
                        backgroundColor: "#EBF7FF33",
                        width: "auto",
                      }}
                    >
                      {icon && (
                        <img
                          style={{ width: 8, height: 8 }}
                          src={icon}
                          alt="dot"
                        />
                      )}
                      <p
                        style={{
                          color: color,
                          fontSize: 12,
                          fontFamily: "Poppins",
                          fontWeight: "400",
                          margin: 0,
                        }}
                      >
                        {event.type === "advance"
                          ? "Advance Event"
                          : event.type === "express"
                          ? "Express Event"
                          : event.type || "Event"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-10">
                    <p className="text-neutral-100 font-poppins font-medium text-md">
                      {event.name || "Unnamed Event"}
                    </p>
                    <p className="text-neutral-300 font-poppins font-normal text-xs">
                      {event.date || "No date"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {recentEvents.length === 0 && !loading && (
            <div className="w-full flex justify-center items-center py-10">
              <img
                className="h-40 w-40"
                src={Assets.images.eventEmptyCard}
                alt="No Events"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Recents;
