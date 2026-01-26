import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  Settings,
  LogOut,
  CheckCircle,
  Clock,
  HomeIcon,
  Image,
  NotepadText,
  Printer,
  MessagesSquare,
  Vote,
  BarChart3,
  Ticket,
  IdCard,
  Lock,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Assets from "@/utils/Assets";
import { getEventbyId } from "@/apis/apiHelpers";

interface SideBarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  isRTL: boolean;
  canToggle?: boolean;
  currentEventId?: string;
}

const SideBar = ({
  isExpanded,
  setIsExpanded,
  isRTL,
  canToggle = true,
  currentEventId,
}: SideBarProps) => {
  // Initialize activeItem from localStorage or default
  const getInitialActiveItem = () => {
    const stored = localStorage.getItem("sidebar_active_item");
    return stored || "Registered Users";
  };

  const [activeItem, setActiveItem] = useState(getInitialActiveItem);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  );
  const [registeredUsersCount, setRegisteredUsersCount] = useState<string>("0");
  const [eventType, setEventType] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to update activeItem and persist it
  const updateActiveItem = (item: string) => {
    setActiveItem(item);
    localStorage.setItem("sidebar_active_item", item);
  };

  // Debug log to track sidebar state
  console.log("SideBar props:", {
    isExpanded,
    canToggle,
    currentEventId,
    isRTL,
  });

  // Get registered users count from localStorage
  const getRegisteredUsersCount = () => {
    if (!currentEventId) {
      setRegisteredUsersCount("0");
      return;
    }

    const storageKey = `eventUsersLength_${currentEventId}`;
    const storedCount = localStorage.getItem(storageKey);

    if (storedCount) {
      setRegisteredUsersCount(storedCount);
      // console.log(`Retrieved registered users count: ${storedCount} for event: ${currentEventId}`);
    } else {
      setRegisteredUsersCount("0");
      // console.log(`No stored count found for event: ${currentEventId}`);
    }
  };

  // Get event type from API
  const getEventType = async () => {
    if (!currentEventId) {
      setEventType(null);
      return;
    }

    try {
      const response = await getEventbyId(currentEventId);
      const eventTypeFromAPI = response.data.data.attributes.event_type;
      setEventType(eventTypeFromAPI);
      // console.log(
      //   `Retrieved event type: ${eventTypeFromAPI} for event: ${currentEventId}`
      // );
    } catch (error) {
      console.error("Error fetching event type:", error);
      setEventType(null);
    }
  };

  // Function to determine active item from current path
  const getActiveItemFromPath = (pathname: string) => {
    // Remove query parameters for matching
    const path = pathname.split("?")[0];

    // Check invitation route
    if (path.includes("/invitation")) {
      return "Invitation";
    }
    if (path.includes("/attendees/check-in")) {
      return "Check In";
    }
    if (path.includes("/attendees/check-out")) {
      return "Check Out";
    }
    if (path.includes("/communication/poll")) {
      return "Poll";
    }
    if (path.includes("/communication/QA")) {
      return "Q & A";
    }

    // Check main menu routes
    if (
      (path.startsWith("/home/") || path.startsWith("/express-event/")) &&
      currentEventId &&
      !path.includes("/galleries")
    ) {
      return "Home summary";
    }
    if (path === "/regesterd_user" || path.startsWith("/regesterd_user")) {
      return "Registered Users";
    }
    if (path === "/agenda" || path.startsWith("/agenda")) {
      return "Agenda";
    }
    if (path.includes("/galleries")) {
      return "Galleries";
    }
    if (
      path === "/user/registration" ||
      path.startsWith("/user/registration")
    ) {
      return "User Registration";
    }
    if (path === "/print_badges" || path.startsWith("/print_badges")) {
      return "Print Badges";
    }
    if (path.startsWith("/invitation")) {
      return "Inviation";
    }
    if (path.startsWith("/attendees")) {
      return "Attendees";
    }
    if (path.startsWith("/communication")) {
      return "Communications";
    }
    if (path === "/Onboarding" || path.startsWith("/Onboarding")) {
      return "Onboarding";
    }
    if (path === "/TicketManagement" || path.startsWith("/TicketManagement")) {
      return "Ticket Management";
    }

    // Default fallback
    return null;
  };

  // Set active item based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const activeItemFromPath = getActiveItemFromPath(currentPath);

    if (activeItemFromPath) {
      updateActiveItem(activeItemFromPath);
    }

    // Expand submenus based on current path
    if (currentPath.includes("/invitation")) {
      setExpandedMenus((prev) => ({ ...prev, Inviation: true }));
    }
    if (
      currentPath.includes("/attendees/check-in") ||
      currentPath.includes("/attendees/check-out")
    ) {
      setExpandedMenus((prev) => ({ ...prev, Attendees: true }));
    }
    if (
      currentPath.includes("/communication/poll") ||
      currentPath.includes("/communication/QA")
    ) {
      setExpandedMenus((prev) => ({ ...prev, Communications: true }));
    }

    // Get registered users count when route or eventId changes
    getRegisteredUsersCount();
    getEventType();
  }, [currentEventId, location.pathname]);

  // Listen for storage changes to update the count in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (currentEventId && e.key === `eventUsersLength_${currentEventId}`) {
        console.log(
          "Storage changed, updating registered users count:",
          e.newValue
        );
        setRegisteredUsersCount(e.newValue || "0");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also set up a periodic check for changes (in case same tab updates)
    const interval = setInterval(() => {
      getRegisteredUsersCount();
      getEventType();
    }, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [currentEventId]);

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const allMenuItems = [
    {
      icon: HomeIcon,
      label: "Home summary",
      path: currentEventId ? `/home/${currentEventId}` : "/",
      availableForExpress: true,
    },
    {
      icon: Users,
      label: "Registered Users",
      badge: registeredUsersCount, // Use the dynamic count from localStorage
      path: currentEventId
        ? `/regesterd_user?eventId=${currentEventId}`
        : "/regesterd_user",
      availableForExpress: true,
    },
    {
      icon: NotepadText,
      label: "Agenda",
      path: currentEventId ? `/agenda?eventId=${currentEventId}` : "/agenda",
      availableForExpress: false,
    },
    {
      icon: Image,
      label: "Galleries",
      path: currentEventId ? `/home/${currentEventId}/galleries` : "/galleries",
      availableForExpress: false,
    },
    // {
    //   icon: UserCircle,
    //   label: "User Registration",
    //   path: currentEventId
    //     ? `/user/registration?eventId=${currentEventId}`
    //     : "/user/registration",
    //   availableForExpress: true,
    // },
    {
      icon: Printer,
      label: "Print Badges",
      path: currentEventId
        ? `/print_badges?eventId=${currentEventId}`
        : "/print_badges",
      availableForExpress: true,
    },
    {
      icon: UserCheck,
      label: "Invitation",
      path: currentEventId
        ? `/invitation?eventId=${currentEventId}`
        : "/invitation",
      availableForExpress: false,
    },
    {
      icon: MessagesSquare,
      label: "Communications",
      path: currentEventId
        ? `/communication?eventId=${currentEventId}`
        : "/communication",
      availableForExpress: false,
      submenu: [
        {
          label: "Poll",
          icon: Vote,
          path: currentEventId
            ? `/communication/poll?eventId=${currentEventId}`
            : "/communication/poll",
          availableForExpress: false,
        },
        {
          label: "Q & A",
          icon: BarChart3,
          path: currentEventId
            ? `/communication/QA?eventId=${currentEventId}`
            : "/communication/QA",
          availableForExpress: false,
        },
      ],
    },
    {
      icon: CheckCircle,
      label: "Attendees",
      availableForExpress: true,
      submenu: [
        {
          label: "Check In",
          icon: CheckCircle,
          path: currentEventId
            ? `/attendees/check-in?eventId=${currentEventId}`
            : "/attendees/check-in",
          availableForExpress: true,
        },
        {
          label: "Check Out",
          icon: Clock,
          path: currentEventId
            ? `/attendees/check-out?eventId=${currentEventId}`
            : "/attendees/check-out",
          availableForExpress: true,
        },
      ],
    },
    {
      icon: IdCard,
      label: "Onboarding",
      path: currentEventId
        ? `/Onboarding?eventId=${currentEventId}`
        : "/Onboarding",
      availableForExpress: true,
    },
    {
      icon: Ticket,
      label: "Ticket Management",
      path: currentEventId
        ? `/TicketManagement?eventId=${currentEventId}`
        : "/TicketManagement",
      availableForExpress: false,
    },
  ];

  // Show all menu items, but mark unavailable ones for express events
  const menuItems = allMenuItems;

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

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await localStorage.removeItem("token");
      setShowLogoutModal(false);
      showNotification("Logout Successful", "success");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <aside
        className={`fixed ${
          isRTL ? "right-0" : "left-0"
        } top-0 h-screen bg-linear-to-b from-slate-800 via-slate-900 to-blue-900 shadow-2xl transition-all duration-300 ease-in-out z-50 ${
          isExpanded ? "w-[280px]" : "w-20"
        }`}
      >
        {isExpanded && (
          <div className="px-4 py-4 border-b">
            <div className="flex items-center">
              {canToggle && (
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className=" h-2/3  flex flex-row items-center justify-evenly cursor-pointer"
                >
                  <img src={Assets.icons.leftArrow} height={24} width={24} />
                </Button>
              )}
              <div
                onClick={() => {
                  navigate("/");
                  if (canToggle) {
                    setIsExpanded(!isExpanded);
                  }
                }}
                className="cursor-pointer"
              >
                <img
                  src={Assets.images.sidebarExpandedLogo}
                  className="w-30 h-1/2"
                  alt=""
                />
              </div>
            </div>
          </div>
        )}

        {!isExpanded && (
          <div className="px-4 py-4 border-b border-slate-700/50 flex justify-center">
            <Button
              onClick={() => canToggle && setIsExpanded(!isExpanded)}
              className="h-20 w-20"
              disabled={!canToggle}
            >
              <img
                style={{ cursor: canToggle ? "pointer" : "default" }}
                src={Assets.images.sideBarLogo}
                alt=""
              />
            </Button>
          </div>
        )}

        {isExpanded && (
          <div className="px-4 py-3 border-b border-slate-700/30">
            <span className="text-slate-400 text-sm font-medium">
              Event Details
            </span>
          </div>
        )}

        {/* Scrollable Navigation Area with Thin Scrollbar */}
        {isExpanded && (
          <div className="flex flex-col h-[calc(100vh-200px)] pb-8">
            <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto thin-scrollbar">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeItem === item.label;
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isSubmenuExpanded = expandedMenus[item.label];
                const isExpressEvent = eventType === "express";
                const isAvailableForExpress = item.availableForExpress;
                const isDisabled = isExpressEvent && !isAvailableForExpress;

                return (
                  <div key={index}>
                    <div
                      className={`flex items-center justify-start px-3 py-2.5 rounded-lg text-left transition-all duration-200 group cursor-pointer relative ${
                        isActive
                          ? "bg-blue-600/30 text-white border border-blue-500/30"
                          : isDisabled
                            ? "text-slate-500 cursor-not-allowed opacity-60"
                            : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                      }`}
                      onClick={() => {
                        if (isDisabled) {
                          return; // Prevent click for disabled items
                        }
                        if (hasSubmenu) {
                          toggleSubmenu(item.label);
                        } else {
                          updateActiveItem(item.label);
                          if (item.path) {
                            navigate(item.path);
                          }
                        }
                      }}
                      title={
                        isDisabled ? "Only available in advance events" : ""
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span
                          className={`font-medium text-sm ${
                            isDisabled ? "line-through" : ""
                          }`}
                        >
                          {item.label}
                        </span>
                        {isDisabled && (
                          <Lock className="h-3 w-3 text-slate-500 shrink-0" />
                        )}
                      </div>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {item.submenu && isSubmenuExpanded && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.submenu.map((subItem, subIndex) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = activeItem === subItem.label;
                          const isSubDisabled =
                            isExpressEvent && !subItem.availableForExpress;
                          return (
                            <div
                              key={subIndex}
                              className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                isSubActive
                                  ? "bg-blue-500/20 text-white border border-blue-400/30"
                                  : isSubDisabled
                                    ? "text-slate-500 cursor-not-allowed opacity-60"
                                    : "text-slate-400 hover:bg-slate-700/30 hover:text-slate-300"
                              }`}
                              onClick={() => {
                                if (isSubDisabled) {
                                  return; // Prevent click for disabled sub-items
                                }
                                updateActiveItem(subItem.label);
                                if (subItem.path) {
                                  navigate(subItem.path);
                                }
                              }}
                              title={
                                isSubDisabled
                                  ? "Only available in advance events"
                                  : ""
                              }
                            >
                              <SubIcon className="h-3.5 w-3.5" />
                              <span
                                className={`text-sm ${
                                  isSubDisabled ? "line-through" : ""
                                }`}
                              >
                                {subItem.label}
                              </span>
                              {isSubDisabled && (
                                <Lock className="h-3 w-3 text-slate-500 shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        )}

        {/* Fixed Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-slate-700/50 space-y-2">
          <Button
            variant="ghost"
            className={`w-full ${
              isExpanded ? "justify-start px-3" : "justify-center px-3"
            } py-2.5 text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-lg`}
          >
            <Settings className="h-4 w-4" />
            {isExpanded && (
              <span className="ml-3 text-sm font-medium">Settings</span>
            )}
          </Button>
          {/* <ToastContainer /> */}

          <Button
            onClick={handleLogoutClick}
            variant="ghost"
            className={`w-full ${
              isExpanded ? "justify-start px-3" : "justify-center px-3"
            } py-2.5 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg`}
          >
            <LogOut className="h-4 w-4" />
            {isExpanded && (
              <span className="ml-3 text-sm font-medium">Log Out</span>
            )}
          </Button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 backdrop-blur-sm bg-white/30"
            onClick={handleLogoutCancel}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-fade-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <LogOut className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to log out of your account?
              </p>
              <div className="flex gap-3 w-full">
                <Button
                  onClick={handleLogoutCancel}
                  variant="outline"
                  className="flex-1 py-2.5 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLogoutConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                >
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Add CSS for thin scrollbar */}
      <style>{`
        .thin-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
        }

        .thin-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .thin-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .thin-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(148, 163, 184, 0.3);
          border-radius: 2px;
        }

        .thin-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(148, 163, 184, 0.5);
        }
      `}</style>

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
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default SideBar;
