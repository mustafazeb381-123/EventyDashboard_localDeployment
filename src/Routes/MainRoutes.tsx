import { useState, useEffect } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import SideBar from "@/components/SideBar/SideBar";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";

function MainRoutes() {
  const location = useLocation();
  const params = useParams();

  // Determine the current page type
  const isHomePage = location.pathname === "/";
  const isEventDetailsPage =
    location.pathname.startsWith("/home/") && Boolean(params.id);
  const isExpressEventEditPage =
    location.pathname.startsWith("/express-event/") && Boolean(params.id);

  // Check if we're on an event-related page (with eventId in query params)
  const urlParams = new URLSearchParams(location.search);
  const eventIdFromQuery = urlParams.get("eventId");
  const isEventRelatedPage = Boolean(eventIdFromQuery) || Boolean(params.id);

  // Event-related pages that should have expanded sidebar
  const eventRelatedPaths = [
    "/regesterd_user",
    "/agenda",
    "/galleries",
    "/user/registration",
    "/print_badges",
    "/invitation",
    "/invitation/user",
    "/invitation/vip",
    "/attendees/check-in",
    "/attendees/check-out",
    "/committees",
    "/communication/Poll", 
    "/communication/Poll/", 
  ];
  const isEventContextPage =
    eventRelatedPaths.includes(location.pathname) && isEventRelatedPage;

  // Determine sidebar state based on current page
  const getSidebarState = () => {
    if (isHomePage) {
      return false; // Minimized on home screen
    } else if (
      isEventDetailsPage ||
      isExpressEventEditPage ||
      isEventContextPage
    ) {
      return true; // Expanded on event-related pages
    }
    return false; // Default to minimized for other pages
  };

  const [isExpanded, setIsExpanded] = useState(getSidebarState());
  const [isRTL, setIsRTL] = useState(false);

  // Update sidebar state when route changes
  useEffect(() => {
    const newState = getSidebarState();
    console.log("Route changed:", {
      pathname: location.pathname,
      eventId: params.id,
      eventIdFromQuery,
      isHomePage,
      isEventDetailsPage,
      isExpressEventEditPage,
      isEventContextPage,
      newSidebarState: newState,
      canToggle: canToggleSidebar,
    });
    setIsExpanded(newState);
  }, [location.pathname, params.id]);

  // Determine if expand/minimize functionality should be available
  // Allow toggle when in any event context (editing event or viewing event-related pages)
  const canToggleSidebar =
    isExpressEventEditPage || isEventDetailsPage || isEventContextPage;

  // Detect RTL direction and listen for changes
  useEffect(() => {
    const checkRTL = () => {
      const dir =
        document.documentElement.dir ||
        document.documentElement.getAttribute("dir");
      setIsRTL(dir === "rtl");
    };

    checkRTL();

    const observer = new MutationObserver(() => {
      checkRTL();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Pass states as props */}
      <SideBar
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        isRTL={isRTL}
        canToggle={canToggleSidebar}
        currentEventId={params.id || eventIdFromQuery || undefined}
      />
      <Header isExpanded={isExpanded} />

      {/* Main content with dynamic margin based on isRTL */}
      <main
        className={`relative bg-[#F7FAFF] p-4 h-full pt-20 transition-all duration-300 ease-in-out ${
          isRTL
            ? isExpanded
              ? "mr-[280px]"
              : "mr-[80px]" // Use margin-right for RTL
            : isExpanded
            ? "ml-[280px]"
            : "ml-[80px]" // Use margin-left for LTR
        }`}
      >
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainRoutes;






// import { useState, useEffect } from "react";
// import { Outlet, useLocation, useParams } from "react-router-dom";
// import SideBar from "@/components/SideBar/SideBar";
// import Footer from "@/components/Footer/Footer";
// import Header from "@/components/Header/Header";

// function MainRoutes() {
//   const location = useLocation();
//   const params = useParams();

//   // Simple logic: Expand sidebar for all routes except home
//   const getSidebarState = () => {
//     return location.pathname !== "/";
//   };

//   const [isExpanded, setIsExpanded] = useState(getSidebarState());
//   const [isRTL, setIsRTL] = useState(false);

//   // Update sidebar state when route changes
//   useEffect(() => {
//     const newState = getSidebarState();
//     console.log("Route changed:", {
//       pathname: location.pathname,
//       newSidebarState: newState
//     });
//     setIsExpanded(newState);
//   }, [location.pathname]);

//   // Allow toggle for all non-home pages
//   const canToggleSidebar = location.pathname !== "/";

//   // Detect RTL direction
//   useEffect(() => {
//     const checkRTL = () => {
//       const dir = document.documentElement.dir || document.documentElement.getAttribute("dir");
//       setIsRTL(dir === "rtl");
//     };
//     checkRTL();
    
//     const observer = new MutationObserver(() => checkRTL());
//     observer.observe(document.documentElement, { attributes: true, attributeFilter: ["dir"] });
    
//     return () => observer.disconnect();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50/30">
//       <SideBar
//         isExpanded={isExpanded}
//         setIsExpanded={setIsExpanded}
//         isRTL={isRTL}
//         canToggle={canToggleSidebar}
//         currentEventId={params.id || undefined}
//       />
//       <Header isExpanded={isExpanded} />

//       <main
//         className={`relative bg-[#F7FAFF] p-4 h-full pt-20 transition-all duration-300 ease-in-out ${
//           isRTL
//             ? isExpanded ? "mr-[280px]" : "mr-[80px]"
//             : isExpanded ? "ml-[280px]" : "ml-[80px]"
//         }`}
//       >
//         <Outlet />
//       </main>

//       <Footer />
//     </div>
//   );
// }

// export default MainRoutes;
