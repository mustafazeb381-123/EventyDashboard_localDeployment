import { useState, useEffect } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import SideBar from "@/components/SideBar/SideBar";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";

function MainRoutes() {
  const location = useLocation();
  const params = useParams();

  // --- Identify route contexts ---
  const isHomePage = location.pathname === "/";
  const isEventDetailsPage =
    location.pathname.startsWith("/home/") && Boolean(params.id);
  const isExpressEventEditPage =
    location.pathname.startsWith("/express-event/") && Boolean(params.id);

  // --- Check if we have eventId (param or query) ---
  const urlParams = new URLSearchParams(location.search);
  const eventIdFromQuery = urlParams.get("eventId");
  const isEventRelatedPage = Boolean(eventIdFromQuery) || Boolean(params.id);

  // --- Event-related paths that should expand sidebar ---
  const eventRelatedPaths = [
    "/regesterd_user",
    "/agenda",
    "/galleries",
    "/user/registration",
    "/print_badges",
    "/invitation",
    "/attendees/check-in",
    "/attendees/check-out",
    "/committees",
    "/communication/poll",
    "/communication/QA",
    "/TicketManagement",
    "/Onboarding",
  ];

  // --- FIXED: use startsWith() instead of includes() ---
  const isEventContextPage =
    eventRelatedPaths.some((path) => location.pathname.startsWith(path)) &&
    isEventRelatedPage;

  // --- Determine sidebar default state ---
  const getSidebarState = () => {
    if (isHomePage) {
      return false; // collapsed on home page
    } else if (
      isEventDetailsPage ||
      isExpressEventEditPage ||
      isEventContextPage
    ) {
      return true; // expanded on event-related pages
    }
    return false; // default collapsed
  };

  const [isExpanded, setIsExpanded] = useState(getSidebarState());
  const [isRTL, setIsRTL] = useState(false);

  // --- Allow toggle when in event context or edit/detail ---
  const canToggleSidebar =
    isExpressEventEditPage || isEventDetailsPage || isEventContextPage;

  // --- Update sidebar when route changes ---
  useEffect(() => {
    const newState = getSidebarState();
    console.log("Sidebar route update:", {
      pathname: location.pathname,
      eventId: params.id,
      eventIdFromQuery,
      isEventContextPage,
      newSidebarState: newState,
    });
    setIsExpanded(newState);
  }, [location.pathname, params.id]);

  // --- Handle RTL (right-to-left) direction dynamically ---
  useEffect(() => {
    const checkRTL = () => {
      const dir =
        document.documentElement.dir ||
        document.documentElement.getAttribute("dir");
      setIsRTL(dir === "rtl");
    };

    checkRTL();

    const observer = new MutationObserver(() => checkRTL());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });

    return () => observer.disconnect();
  }, []);

  // --- Layout ---
  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Sidebar */}
      <SideBar
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        isRTL={isRTL}
        canToggle={canToggleSidebar}
        currentEventId={params.id || eventIdFromQuery || undefined}
      />

      {/* Header */}
      <Header isExpanded={isExpanded} />

      {/* Main content */}
      <main
        className={`relative bg-[#F7FAFF] p-4 h-full pt-20 transition-all duration-300 ease-in-out ${
          isRTL
            ? isExpanded
              ? "mr-[280px]"
              : "mr-20"
            : isExpanded
            ? "ml-[280px]"
            : "ml-20"
        }`}
      >
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default MainRoutes;
