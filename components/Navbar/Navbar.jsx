"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  User,
  LogOut,
  UserCircle,
  Users,
  Briefcase,
  ChevronDown,
  Home as HomeIcon,
  Calendar,
  ScanLine,
  LayoutDashboard,
  Shield,
  Bell,
  MessageSquare,
  X,
} from "lucide-react";
import Cookie from "js-cookie";
import { getData } from "@/libs/fetch";

export default function Navbar({ token }) {
  const iconMap = {
    Home: <HomeIcon size={18} />,
    Events: <Calendar size={18} />,
    "Check-in": <ScanLine size={18} />,
    Admin: <Shield size={18} />,
    Organizer: <Briefcase size={18} />,
    Staff: <Users size={18} />,
    Dashboard: <LayoutDashboard size={18} />,
  };
  const router = useRouter();
  const pathName = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isStaffOpen, setIsStaffOpen] = useState(false);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);

  // เพิ่ม state สำหรับจัดการ dropdown ในมือถือ
  const [mobileActiveDropdown, setMobileActiveDropdown] = useState(null);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifDropdownRef = useRef(null);
  const [user, setUser] = useState();
  const [data, setData] = useState();
  const [activeRole, setActiveRole] = useState("default");

  const profileDropdownRef = useRef(null);
  const staffDropdownRef = useRef(null);
  const organizerDropdownRef = useRef(null);

  // Events ที่ยังไม่ได้ทำ post survey
  const pendingSurveyEvents = useMemo(() => {
    if (!data?.event || !Array.isArray(data.event)) return [];
    return data.event.filter(
      (event) =>
        event.hasPostSurvey && !event.postSurveyCompleted && event.isEnded,
    );
  }, [data]);

  // const MOCK_TODAY = new Date("2025-12-10T10:00:00");

  const isEventActiveToday = (event) => {
    // const today = new Date(MOCK_TODAY);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(event.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(event.endDate);
    endDate.setHours(23, 59, 59, 999);

    return today >= startDate && today <= endDate;
  };

  const calculateActiveRole = (userData, eventData) => {
    if (!userData) {
      return "default";
    }

    const rolePriority = {
      admin: 3,
      organizer: 2,
      staff: 1,
      default: 0,
    };

    let highestRole = userData.role.toLowerCase().trim();
    if (rolePriority[highestRole] === undefined) {
      highestRole = "default";
    }

    if (eventData && Array.isArray(eventData)) {
      eventData.forEach((event) => {
        const eventRole = event.eventRole.toLowerCase().trim();

        if (rolePriority[eventRole] > rolePriority[highestRole]) {
          highestRole = eventRole;
        }

        // if (isEventActiveToday(event)) {
        //   // console.log(
        //   //   `Event: ${event.eventName} is ACTIVE today. Role: ${eventRole}`
        //   // );

        // } else {
        //   // console.log(`Event: ${event.eventName} is INACTIVE today.`);
        // }
      });
    }

    return highestRole;
  };

  useEffect(() => {
    const fetchUser = async () => {
      const tokenFromCookie = Cookie.get("token");

      if (tokenFromCookie) {
        try {
          const res = await getData("users/me/profile");
          if (res?.data) {
            setUser(res.data);
            const resEventRegis = await getData("users/me/registered-events");
            console.log(resEventRegis?.data);
            setData({ user: res.data, event: resEventRegis?.data });
          }
        } catch (err) {
          Cookie.remove("token");
          setUser(null);
          router.push("/home");
        }
      }
    };

    fetchUser();

    // ดักฟัง Event จากหน้า Login
    const handleLoginSuccess = () => {
      fetchUser(); // รันใหม่ทันทีเมื่อมีการ Login
    };

    window.addEventListener("user-logged-in", handleLoginSuccess);
    return () =>
      window.removeEventListener("user-logged-in", handleLoginSuccess);
  }, []);

  useEffect(() => {
    if (user && data) {
      const calculatedRole = calculateActiveRole(user, data.event);
      setActiveRole(calculatedRole);
      // console.log("Calculated Active Role:", calculatedRole);
    } else {
      setActiveRole("default");
    }
  }, [user, data]);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(e.target)
      ) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsProfileOpen(false);
    handleNavigation("/profile");
  };

  const handleSignOut = () => {
    Cookie.remove("token");
    router.push("/login");
    setIsProfileOpen(false);
    setUser(null);
  };

  const handleNavigation = (path) => {
    setIsMenuOpen(false);
    setIsStaffOpen(false);
    setIsOrganizerOpen(false);
    setMobileActiveDropdown(null);

    if (path.startsWith("#")) {
      if (pathName !== "/" && pathName !== "/home") {
        router.push(`/home`);
        setTimeout(() => {
          const element = document.querySelector(path);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      } else {
        const element = document.querySelector(path);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    } else {
      router.push(path);
    }
  };

  const getMenuItems = () => {
    switch (activeRole) {
      case "admin":
        return [
          { label: "Home", path: "#home" },
          { label: "Events", path: "#events" },
          { label: "Admin", path: "/admin" },
        ];
      case "organizer":
        return [
          { label: "Home", path: "#home" },
          { label: "Events", path: "/organizer", hasDropdown: true },
          { label: "Check-in", path: "/staff", hasDropdown: true },
          { label: "Dashboard", path: "/organizer/dashboard" },
        ];
      case "staff":
        return [
          { label: "Home", path: "#home" },
          { label: "Events", path: "#events" },
          { label: "Check-in", path: "/staff", hasDropdown: true },
        ];
      default:
        return [
          { label: "Home", path: "#home" },
          { label: "Events", path: "#events" },
          // { label: "Reward", path: "/reward" },
        ];
    }
  };

  const menuItems = getMenuItems();

  const staffOptions = [
    { label: "Scan QR", path: "/staff/event/scan" },
    { label: "Manual Check-in", path: "/staff/event/check-in" },
  ];

  const organizerOptions = [
    // { label: 'Dashboard', path: '/organizer/dashboard' },
    { label: "Events Manager", path: "/organizer/event" },
    { label: "Surveys Manager", path: "/organizer/survey" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white px-4 md:px-8 py-4 flex items-center justify-between border-b shadow-md z-50">
        <div
          className="flex items-center gap-2 cursor-pointer z-50"
          onClick={() => handleNavigation("/home")}
        >
          <div
            className="flex items-center gap-4 cursor-pointer z-50 group"
            onClick={() => handleNavigation("/home")}
          >
            <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 tracking-tight">
              EXPO HUB
            </span>
          </div>
        </div>

        <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4">
          {/* <div className="relative flex-1 group transition-all duration-300 focus-within:scale-105">
            <input
              type="text"
              placeholder="Search for events..."
              className="w-full pl-5 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-300 focus:bg-white transition-all shadow-sm group-hover:shadow-md"
            />
            <button className="absolute right-1.5 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors shadow-sm">
              <Search size={16} />
            </button>
          </div> */}
        </div>

        <div className="hidden lg:flex items-center gap-6">
          {menuItems.map((item) => {
            // 1. dropdown staff
            if (item.label === "Check-in" && item.hasDropdown) {
              return (
                <div
                  key={item.label}
                  className="relative"
                  ref={staffDropdownRef}
                >
                  <button
                    onClick={() => {
                      setIsStaffOpen(!isStaffOpen);
                      setIsOrganizerOpen(false);
                    }}
                    className="flex items-center gap-2 px-2 py-2 rounded-full text-gray-600 font-medium hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 group"
                  >
                    <span className="opacity-70 group-hover:opacity-100">
                      {iconMap[item.label]}
                    </span>
                    <span>{item.label}</span>
                  </button>

                  {isStaffOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden animate-fade-in">
                      {staffOptions.map((option) => (
                        <button
                          key={option.label}
                          onClick={() => handleNavigation(option.path)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition text-left"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-300"></div>
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // 2. dropdown organizer
            if (item.label === "Events" && item.hasDropdown) {
              return (
                <div
                  key={item.label}
                  className="relative"
                  ref={organizerDropdownRef}
                >
                  <button
                    onClick={() => {
                      setIsOrganizerOpen(!isOrganizerOpen);
                      setIsStaffOpen(false);
                    }}
                    className="flex items-center gap-2 px-2 py-2 rounded-full text-gray-600 font-medium hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 group"
                  >
                    <span className="opacity-70 group-hover:opacity-100">
                      {iconMap[item.label]}
                    </span>
                    <span>{item.label}</span>
                  </button>

                  {isOrganizerOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden animate-fade-in">
                      {organizerOptions.map((option) => (
                        <button
                          key={option.label}
                          onClick={() => handleNavigation(option.path)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition text-left"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-300"></div>
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // 3. visitor
            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                className="flex items-center gap-2 px-2 py-2 rounded-full text-gray-600 font-medium hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 group"
              >
                <span className="opacity-70 group-hover:opacity-100">
                  {iconMap[item.label]}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}

          {user && (
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setIsProfileOpen(false);
                }}
                className="relative flex items-center justify-center w-9 h-9 rounded-full text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {pendingSurveyEvents.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full px-1 leading-none shadow-sm animate-pulse">
                    {pendingSurveyEvents.length}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-purple-600" />
                      <span className="font-semibold text-gray-800 text-sm">
                        Notifications
                      </span>
                      {pendingSurveyEvents.length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {pendingSurveyEvents.length}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {pendingSurveyEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                          <Bell size={18} className="text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                          All caught up!
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          No pending surveys
                        </p>
                      </div>
                    ) : (
                      <div className="py-1">
                        {pendingSurveyEvents.map((event, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setIsNotifOpen(false);
                              router.push(
                                `/event/${event.eventId}/survey/post`,
                              );
                            }}
                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-purple-50 transition text-left group"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-0.5 group-hover:bg-purple-200 transition-colors">
                              <MessageSquare
                                size={14}
                                className="text-purple-600"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">
                                {event.eventName}
                              </p>
                              <p className="text-xs text-purple-600 mt-0.5 font-medium">
                                📋 Post-event survey awaiting
                              </p>
                            </div>
                            <div className="flex-shrink-0 w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {pendingSurveyEvents.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                      <p className="text-xs text-gray-500 text-center">
                        You have{" "}
                        <span className="font-bold text-purple-600">
                          {pendingSurveyEvents.length}
                        </span>{" "}
                        pending survey
                        {pendingSurveyEvents.length > 1 ? "s" : ""} — share your
                        feedback!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!user ? (
            <button
              onClick={() => handleNavigation("/login")}
              className="text-gray-700 hover:text-purple-600 transition whitespace-nowrap"
            >
              Join | Log in
            </button>
          ) : (
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
              >
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 group-hover:bg-purple-200 transition-colors">
                  <User size={15} />
                </div>

                <span className="hidden xl:inline text-sm font-medium text-gray-700 group-hover:text-purple-700">
                  {user.firstName}
                </span>

                <ChevronDown
                  size={16}
                  className="text-gray-400 group-hover:text-purple-500"
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden animation-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100 mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>

                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition text-left"
                  >
                    <UserCircle className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => handleSignOut()}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden z-50 p-2"
        >
          {isMenuOpen ? (
            <span className="text-2xl">✕</span>
          ) : (
            <span className="text-2xl">☰</span>
          )}
        </button>
      </nav>

      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col p-6 pt-20 gap-4">
          <div className="mb-4">
            {/* <input
              type="text"
              placeholder="Search"
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            /> */}
          </div>

          {user && pendingSurveyEvents.length > 0 && (
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Bell size={14} className="text-purple-600" />
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                  Pending Surveys ({pendingSurveyEvents.length})
                </span>
              </div>
              {pendingSurveyEvents.map((event, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push(`/event/${event.eventId}/survey/post`);
                  }}
                  className="w-full flex items-center gap-2 py-2 px-3 rounded-lg bg-white border border-purple-100 hover:bg-purple-100 transition text-left mb-1 last:mb-0"
                >
                  <MessageSquare
                    size={13}
                    className="text-purple-500 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700 truncate font-medium">
                    {event.eventName}
                  </span>
                </button>
              ))}
            </div>
          )}

          {menuItems.map((item) => {
            if (item.hasDropdown) {
              const isExpanded = mobileActiveDropdown === item.label;
              const subItems =
                item.label === "Check-in"
                  ? staffOptions
                  : item.label === "Events"
                    ? organizerOptions
                    : [];

              return (
                <div key={item.label} className="flex flex-col">
                  <button
                    onClick={() =>
                      setMobileActiveDropdown(isExpanded ? null : item.label)
                    }
                    className="flex items-center justify-between w-full text-left text-gray-700 hover:text-purple-600 py-2 px-4 hover:bg-purple-50 rounded-lg transition"
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      size={16}
                      className={`transform transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="flex flex-col bg-gray-50 rounded-lg ml-4 mt-1 border-l-2 border-purple-200">
                      {subItems.map((sub) => (
                        <button
                          key={sub.label}
                          onClick={() => handleNavigation(sub.path)}
                          className="w-full text-left text-sm text-gray-600 hover:text-purple-600 py-2 px-4 hover:bg-purple-100 rounded-r-lg transition"
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                className="text-left text-gray-700 hover:text-purple-600 py-2 px-4 hover:bg-purple-50 rounded-lg transition"
              >
                {item.label}
              </button>
            );
          })}

          <div className="mt-4 pt-4 border-t border-gray-200">
            {!user ? (
              <button
                onClick={() => handleNavigation("/login")}
                className="w-full text-center bg-purple-600 text-white py-2 px-4 rounded-full hover:bg-purple-700 transition"
              >
                Join | Log in
              </button>
            ) : (
              <button
                onClick={() => handleNavigation("/profile")}
                className="w-full flex items-center gap-3 text-gray-700 hover:text-purple-600 py-2 px-4 hover:bg-purple-50 rounded-lg transition"
              >
                <span className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <User />
                </span>
                <div className="text-left">
                  <p className="font-semibold">{user.firstName}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {activeRole}
                  </p>
                </div>
              </button>
            )}
          </div>
          {user && (
            <button
              onClick={() => handleSignOut()}
              className="w-full text-center bg-red-600 text-white py-2 px-4 rounded-full hover:bg-red-700 transition"
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </>
  );
}
