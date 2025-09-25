import { getAllEvents, deleteEvent, getEventbyId } from "@/apis/apiHelpers";
import Assets from "@/utils/Assets";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

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

function AllEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

        if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
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



  const handleDelete = async (id: any) => {
    console.log("idddddddddddddddd", id);
    try {
      setDeletingId(id);
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success("Event Deleted Successfully");
    } catch (error) {
      toast.error("Error deleting event:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24 }} className="bg-white w-full rounded-2xl">
        <p className="font-poppins text-md font-medium text-neutral-900">
          All Events
        </p>
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }} className="bg-white w-full rounded-2xl">
      <p className="font-poppins text-md font-medium text-neutral-900">
        All Events
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {events.map((event) => {
          const { icon, color, bg, backgroundImage } = getEventStyle(
            event.type
          );

          return (
            <div
              onClick={() =>
                navigate(`/home/${event.id}`, {
                  state: { eventId: event.id }, // 👈 pass event object
                })
              }
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
                  onClick={() => handleDelete(event.id)}
                  disabled={deletingId === event.id}
                  className={`p-1 rounded-full cursor-pointer ${deletingId === event.id
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
      {events.length === 0 && !loading && (
        <div className="w-full flex justify-center items-center py-10">
          <img
            className="h-40 w-40"
            src={Assets.images.eventEmptyCard}
            alt="No Events"
          />
        </div>
      )}
    </div>
  );
}

export default AllEvents;
