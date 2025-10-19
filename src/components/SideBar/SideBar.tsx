import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  Settings,
  LogOut,
  CheckCircle,
  Clock,
  UserPlus,
  HomeIcon,
  Image,
  NotepadText,
  Printer,
  UserCircle,
  MessagesSquare,
  Vote,
  BarChart3,
  Ticket,
  IdCard,
  

} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import Assets from "@/utils/Assets";

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
  const [activeItem, setActiveItem] = useState("Registered Users");
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  );
  const naviagte = useNavigate();
  const location = useLocation();

  // Debug log to track sidebar state
  console.log("SideBar props:", {
    isExpanded,
    canToggle,
    currentEventId,
    isRTL,
  });

  // Set active item based on current route
  useEffect(() => {
    const currentPath = location.pathname;

    if (
      (currentPath.startsWith("/home/") ||
        currentPath.startsWith("/express-event/")) &&
      currentEventId
    ) {
      setActiveItem("Home summary");
    } else if (currentPath === "/regesterd_user") {
      setActiveItem("Registered Users");
    } else if (currentPath === "/agenda") {
      setActiveItem("Agenda");
    } else if (currentPath === "/galleries") {
      setActiveItem("Galleries");
    } else if (currentPath === "/user/registration") {
      setActiveItem("User Registration");
    } else if (currentPath === "/print_badges") {
      setActiveItem("Print Badges");
    } else if (currentPath.startsWith("/invitation")) {
      setActiveItem("Inviation");
      // Expand the Invitation submenu if we're on a submenu page
      if (currentPath.includes("/user") || currentPath.includes("/vip")) {
        setExpandedMenus((prev) => ({ ...prev, Inviation: true }));
      }
    } else if (currentPath.startsWith("/attendees")) {
      setActiveItem("Attendees");
      // Expand the Attendees submenu if we're on a submenu page
      if (
        currentPath.includes("/check-in") ||
        currentPath.includes("/check-out")
      ) {
        setExpandedMenus((prev) => ({ ...prev, Attendees: true }));
      }
    } else if (currentPath === "/committees") {
      setActiveItem("Committees");
    }
  }, [currentEventId, location.pathname]);

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const menuItems = [
    {
      icon: HomeIcon,
      label: "Home summary",
      path: currentEventId ? `/home/${currentEventId}` : "/",
    },
    {
      icon: Users,
      label: "Registered Users",
      badge: "20",
      path: currentEventId
        ? `/regesterd_user?eventId=${currentEventId}`
        : "/regesterd_user",
    },
    {
      icon: NotepadText,
      label: "Agenda",
      path: currentEventId ? `/agenda?eventId=${currentEventId}` : "/agenda",
    },
    {
      icon: Image,
      label: "Galleries",
      path: currentEventId
        ? `/galleries?eventId=${currentEventId}`
        : "/galleries",
    },
    {
      icon: UserCircle,
      label: "User Registration",
      path: currentEventId
        ? `/user/registration?eventId=${currentEventId}`
        : "/user/registration",
    },
    {
      icon: Printer,
      label: "Print Badges",
      path: currentEventId
        ? `/print_badges?eventId=${currentEventId}`
        : "/print_badges",
    },
    {
      icon: UserCheck,
      label: "Inviation",
      path: currentEventId
        ? `/invitation?eventId=${currentEventId}`
        : "/invitation",
      submenu: [
        {
          label: "Users",
          icon: Users,
          path: currentEventId
            ? `/invitation/user?eventId=${currentEventId}`
            : "/invitation/user",
        },
        {
          label: "VIP Users",
          icon: UserPlus,
          path: currentEventId
            ? `/invitation/VipUsers?eventId=${currentEventId}`
            : "/invitation/VipUsers",
        },
      ],
    },  
    {
      icon: MessagesSquare,
      label: "Communications",
      path: currentEventId
        ? `/communication?eventId=${currentEventId}`
        : "/communication",
      submenu: [
        {
          label: "Poll",
          icon: Vote,
          path: currentEventId
            ? `/communication/Poll?eventId=${currentEventId}`
            : "/communication/Poll",
        },
        {
          label: "Q & A",
          icon: BarChart3,
          path: currentEventId
            ? `/communication/QA?eventId=${currentEventId}`
            : "/communication/QA",
        },
      ],
    },
    
    {
      icon: CheckCircle,
      label: "Attendees",
      submenu: [
        {
          label: "Check In",
          icon: CheckCircle,
          path: currentEventId
            ? `/attendees/check-in?eventId=${currentEventId}`
            : "/attendees/check-in",
        },
        {
          label: "Check Out",
          icon: Clock,
          path: currentEventId
            ? `/attendees/check-out?eventId=${currentEventId}`
            : "/attendees/check-out",
        },
      ],
    },
    {
      icon: IdCard,
      label: "Onboarding",
      path: currentEventId
        ? `/Onboarding?eventId=${currentEventId}`
        : "/Onboarding",
    },
    
    {
      icon: Users,
      label: "Committees",
      path: currentEventId
        ? `/committees?eventId=${currentEventId}`
        : "/committees",
    },
    // {
    //   path: "TicketManagement",
    //   element: <TicketManagement />,
    // },
    {
      icon: Ticket,
      label: "Ticket Management",
      path: currentEventId
        ? `/TicketManagement?eventId=${currentEventId}`
        : "/TicketManagement",
    },
    
  ];

  const handleLogout = async () => {
    try {
      await localStorage.removeItem("token");
      toast.success("Logout Succssfuly");
      setTimeout(() => {
        naviagte("/login");
      }, 4000);
    } catch (error) {
      console.log("error", error);
    } finally {
    }
  };

  return (
    <>
      <aside
        className={`fixed ${
          isRTL ? "right-0" : "left-0"
        } top-0 h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-blue-900 shadow-2xl transition-all duration-300 ease-in-out z-50 ${
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
                  naviagte("/");
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

        {isExpanded && (
          <nav className="flex-1 px-2 py-4 space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeItem === item.label;
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isSubmenuExpanded = expandedMenus[item.label];

              return (
                <div key={index}>
                  <div
                    className={`flex items-center justify-start px-3 py-2.5 rounded-lg text-left transition-all duration-200 group cursor-pointer relative ${
                      isActive
                        ? "bg-blue-600/30 text-white border border-blue-500/30"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    }`}
                    onClick={() => {
                      if (hasSubmenu) {
                        toggleSubmenu(item.label);
                      } else {
                        setActiveItem(item.label);
                        if (item.path) {
                          naviagte(item.path);
                        }
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium text-sm">{item.label}</span>
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
                        return (
                          <div
                            key={subIndex}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                              isSubActive
                                ? "bg-blue-500/20 text-white border border-blue-400/30"
                                : "text-slate-400 hover:bg-slate-700/30 hover:text-slate-300"
                            }`}
                            onClick={() => {
                              setActiveItem(subItem.label);
                              if (subItem.path) {
                                naviagte(subItem.path);
                              }
                            }}
                          >
                            <SubIcon className="h-3.5 w-3.5" />
                            <span className="text-sm">{subItem.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-slate-700/50 space-y-2 bg-gradient-to-b from-slate-900 to-blue-900">
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
          <ToastContainer />

          <Button
            onClick={handleLogout}
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

      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};

export default SideBar;
