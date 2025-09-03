import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  UserCheck,
  Settings,
  LogOut,
  Menu,
  CheckCircle,
  Clock,
  UserPlus,
  Bell,
  User,
  HomeIcon,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Assets from "@/utils/Assets";

const SideBar = ({ isExpanded, setIsExpanded, isRTL }) => {
  // const [isExpanded, setIsExpanded] = useState(false)
  const [activeItem, setActiveItem] = useState("Registered Users");
  const [expandedMenus, setExpandedMenus] = useState({});
  // const [isRTL, setIsRTL] = useState(false)

  const naviagte = useNavigate();

  // Detect RTL direction and listen for changes
  // useEffect(() => {
  //   const checkRTL = () => {
  //     const dir = document.documentElement.dir || document.documentElement.getAttribute('dir')
  //     setIsRTL(dir === 'rtl')
  //   }

  //   // Check initially
  //   checkRTL()

  //   // Create observer to watch for direction changes
  //   const observer = new MutationObserver(() => {
  //     checkRTL()
  //   })

  //   // Watch for changes to the dir attribute
  //   observer.observe(document.documentElement, {
  //     attributes: true,
  //     attributeFilter: ['dir']
  //   })

  //   // Cleanup
  //   return () => {
  //     observer.disconnect()
  //   }
  // }, [])

  const toggleSubmenu = (label) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const menuItems = [
    {
      icon: HomeIcon,
      label: "Home summary",
      path: "/home",
    },
    {
      icon: Users,
      label: "Registered Users",
      badge: "20",
      path: "/regester_user",
    },
    {
      icon: UserCheck,
      label: "Participants",
      submenu: [
        { label: "Users", icon: Users },
        { label: "VIP Users", icon: UserPlus },
      ],
    },
    {
      icon: CheckCircle,
      label: "Attendees",
      submenu: [
        { label: "Check In", icon: CheckCircle },
        { label: "Check Out", icon: Clock },
      ],
    },
    {
      icon: Users,
      label: "Committees",
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
      {/* Sidebar */}
      <aside
        className={`fixed ${
          isRTL ? "right-0" : "left-0"
        } top-0 h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-blue-900 shadow-2xl transition-all duration-300 ease-in-out z-50 ${
          isExpanded ? "w-[280px]" : "w-20"
        }`}
      >
        {/* Sidebar Header */}
        {isExpanded && (
          <div className="px-4 py-4 border-b">
            <div className="flex items-center">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                className=" h-2/3  flex flex-row items-center justify-evenly cursor-pointer"
              >
                <img src={Assets.icons.leftArrow} height={24} width={24} />
              </Button>
              <div
                onClick={() => {
                  naviagte("/");
                  setIsExpanded(!isExpanded);
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

        {/* Collapsed Header - Just Logo */}
        {!isExpanded && (
          <div className="px-4 py-4 border-b border-slate-700/50 flex justify-center">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-20 w-20"
            >
              <img src={Assets.images.sideBarLogo} alt="" />
            </Button>
          </div>
        )}

        {/* Event Details Label */}
        {isExpanded && (
          <div className="px-4 py-3 border-b border-slate-700/30">
            <span className="text-slate-400 text-sm font-medium">
              Event Details
            </span>
          </div>
        )}

        {/* Navigation Menu - Only show when expanded */}
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

                  {/* Submenu - Only show when expanded and submenu is toggled */}
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
                            onClick={() => setActiveItem(subItem.label)}
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

        {/* Footer */}
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

      {/* Overlay for mobile when expanded */}
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
