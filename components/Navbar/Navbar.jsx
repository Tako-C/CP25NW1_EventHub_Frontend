"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LogOut,
  UserCircle,
  ChevronDown,
  Home as HomeIcon,
  Calendar,
  ScanLine,
  LayoutDashboard,
  Shield,
  Bell,
  MessageSquare,
  X,
  Gift,
  Briefcase,
  Users,
  Search,
  User,
} from "lucide-react";
import Cookie from "js-cookie";
import { getData, getDataNoToken } from "@/libs/fetch";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default function Navbar({ token }) {
  const router = useRouter();
  const pathName = usePathname();

  // --- User & role state ---
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [activeRole, setActiveRole] = useState("default");

  // --- Dropdown state ---
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);
  const [isStaffOpen, setIsStaffOpen] = useState(false);

  // --- Mobile menu state ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileActiveDropdown, setMobileActiveDropdown] = useState(null);

  // --- Search state ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // --- Refs ---
  const profileDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);
  const adminDropdownRef = useRef(null);
  const organizerDropdownRef = useRef(null);
  const staffDropdownRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // --- Pending surveys ---
  const pendingSurveyEvents = useMemo(() => {
    if (!data?.event || !Array.isArray(data.event)) return [];
    const pendingList = [];
    data.event.forEach((event) => {
      // if (event.hasPreSurvey && !event.preSurveyCompleted && !event.isEnded && event.statusOnPreSurvey === "active") {
      if (event.hasPreSurvey && !event.preSurveyCompleted && !event.isEnded && event.statusOnPreSurvey === "active" && (!event.eventRole || ["VISITOR", "EXHIBITOR"].includes(event.eventRole.toUpperCase()))) {
        pendingList.push({ ...event, surveyType: "pre", surveyLabel: "Pre-event survey awaiting" });
      }
      const now = dayjs();
      const eventStartDate = dayjs.utc(event.startDate || event.dateStart).local();

      if (event.hasPostSurvey && !event.postSurveyCompleted && !now.isBefore(eventStartDate) && (
        ((!event.eventRole || event.eventRole.toUpperCase() === "VISITOR") && event?.statusOnPostVisitorSurvey === "active") ||
        (event.eventRole?.toUpperCase() === "EXHIBITOR" && event?.statusOnPostExhibitorSurvey === "active")
      )) {
        pendingList.push({ ...event, surveyType: "post", surveyLabel: "Post-event survey awaiting" });
      }
    });
    return pendingList;
  }, [data]);

  // --- Role calculation ---
  const calculateActiveRole = (userData, eventData) => {
    if (!userData) return "default";
    const rolePriority = { admin: 3, organizer: 2, staff: 1, default: 0 };
    let highestRole = userData.role?.toLowerCase().trim() || "default";
    if (rolePriority[highestRole] === undefined) highestRole = "default";
    if (eventData && Array.isArray(eventData)) {
      eventData.forEach((event) => {
        const eventRole = event.eventRole?.toLowerCase().trim();
        if (rolePriority[eventRole] > rolePriority[highestRole]) highestRole = eventRole;
      });
    }
    return highestRole;
  };

  // --- Fetch user ---
  useEffect(() => {
    const fetchUser = async () => {
      const tokenFromCookie = Cookie.get("token");
      if (!tokenFromCookie) {
        setUser(null);
        setData(null);
        return;
      }
      try {
        const res = await getData("users/me/profile");
        if (res?.data) {
          setUser(res.data);
          const resEventRegis = await getData("users/me/registered-events");
          let enrichedEvents = [];
          if (resEventRegis?.data && Array.isArray(resEventRegis.data)) {
            const promises = resEventRegis.data.map(async (registered) => {
              try {
                const eventRes = await getData(`events/${registered.eventId}`);
                if (eventRes?.statusCode === 200) return { ...registered, ...eventRes.data };
              } catch {}
              return registered;
            });
            enrichedEvents = await Promise.all(promises);
          }
          setData({ user: res.data, event: enrichedEvents });
        }
      } catch {
        Cookie.remove("token");
        setUser(null);
      }
    };
    fetchUser();
    window.addEventListener("user-logged-in", fetchUser);
    return () => window.removeEventListener("user-logged-in", fetchUser);
  }, []);

  // --- Fetch all events for search ---
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getDataNoToken("events");
        setAllEvents(res?.data || []);
      } catch {}
    };
    fetchEvents();
  }, []);

  // --- Update role ---
  useEffect(() => {
    if (user && data) {
      setActiveRole(calculateActiveRole(user, data.event));
    } else {
      setActiveRole("default");
    }
  }, [user, data]);

  // --- Close dropdowns on outside click ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) setIsNotifOpen(false);
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(e.target)) setIsAdminOpen(false);
      if (organizerDropdownRef.current && !organizerDropdownRef.current.contains(e.target)) setIsOrganizerOpen(false);
      if (staffDropdownRef.current && !staffDropdownRef.current.contains(e.target)) setIsStaffOpen(false);
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) setIsProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) {
        setIsMobileSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // เช็ค Token ทุกครั้งที่มีการเปลี่ยน URL
  useEffect(() => {
    const tokenFromCookie = Cookie.get("token");
    if (!tokenFromCookie && user) {
      setUser(null);
      setData(null);
      setActiveRole("default");
    }
  }, [pathName, user]);

  // --- Search logic ---
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const q = query.toLowerCase();
    const results = allEvents
      .filter((event) =>
        event.eventName?.toLowerCase().includes(q) ||
        event.location?.toLowerCase().includes(q) ||
        event.eventTypeId?.eventTypeName?.toLowerCase().includes(q)
      )
      .slice(0, 6);
    setSearchResults(results);
  }, [allEvents]);

  const handleSearchSelect = (eventId) => {
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    router.push(`/event/${eventId}`);
  };

  const openSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  // --- Navigation ---
  const handleNavigation = (path) => {
    setIsMobileMenuOpen(false);
    setIsAdminOpen(false);
    setIsOrganizerOpen(false);
    setIsStaffOpen(false);
    setMobileActiveDropdown(null);

    if (path.startsWith("#")) {
      if (pathName !== "/" && pathName !== "/home") {
        router.push("/home");
        setTimeout(() => {
          document.querySelector(path)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      } else {
        document.querySelector(path)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      router.push(path);
    }
  };

  const handleSignOut = () => {
    Cookie.remove("token");
    setUser(null);
    setIsProfileOpen(false);
    router.push("/login");
  };

  // --- Menu items by role ---
  const getMenuItems = () => {
    switch (activeRole) {
      case "admin":
        return [
          { label: "Home", path: "#home", icon: <HomeIcon size={16} /> },
          { label: "Events", path: "/organizer", icon: <Calendar size={16} />, hasDropdown: true },
          { label: "Admin", path: "/admin", icon: <Shield size={16} />, hasDropdown: true },
          { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={16} /> },
        ];
      case "organizer":
        return [
          { label: "Home", path: "#home", icon: <HomeIcon size={16} /> },
          { label: "Events", path: "/organizer", icon: <Calendar size={16} />, hasDropdown: true },
          { label: "Check-in", path: "/staff/event/check-in", icon: <ScanLine size={16} /> },
          { label: "Dashboard", path: "/organizer/dashboard", icon: <LayoutDashboard size={16} /> },
        ];
      case "staff":
        return [
          { label: "Home", path: "#home", icon: <HomeIcon size={16} /> },
          { label: "Events", path: "#events", icon: <Calendar size={16} /> },
          { label: "Check-in", path: "/staff/event/check-in", icon: <ScanLine size={16} /> },
        ];
      default:
        return [
          { label: "Home", path: "#home", icon: <HomeIcon size={16} /> },
          { label: "Events", path: "#events", icon: <Calendar size={16} /> },
          { label: "Rewards", path: "#rewards", icon: <Gift size={16} /> },
        ];
    }
  };

  const menuItems = getMenuItems();

  const staffOptions = [
    { label: "Scan QR", path: "/staff/event/scan" },
    { label: "Manual Check-in", path: "/staff/event/check-in" },
  ];
  const organizerOptions = [
    { label: "Events Manager", path: "/organizer/event" },
    { label: "User Event Manager", path: "/organizer/event-user" },
    { label: "Surveys Manager", path: "/organizer/survey" },
    { label: "Rewards Manager", path: "/organizer/reward" },
  ];
  const adminOptions = [
    { label: "Account Manager", path: "/admin/account" },
    { label: "User Event Manager", path: "/admin/event-user" },
    { label: "Event Manager", path: "/admin/event" },
    { label: "Survey Manager", path: "/admin/survey" },
    { label: "Reward Manager", path: "/admin/reward" },
  ];

  // --- Search Dropdown Component ---
  const SearchDropdown = ({ isMobile = false }) => (
    <div
      className="absolute top-full mt-2 left-0 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
      style={{ minWidth: isMobile ? "100%" : "360px" }}
    >
      {searchResults.length === 0 && searchQuery.trim() ? (
        <div className="flex flex-col items-center justify-center py-8 text-center px-4">
          <Search size={24} className="text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">ไม่พบ event ที่ค้นหา</p>
          <p className="text-xs text-gray-400 mt-0.5">ลองใช้คำค้นอื่น</p>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="py-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4 py-2">
            Events
          </p>
          {searchResults.map((event) => (
            <button
              key={event.id}
              onClick={() => handleSearchSelect(event.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition text-left group"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Calendar size={14} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{event.eventName}</p>
                {event.location && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">{event.location}</p>
                )}
              </div>
              {event.status === "FINISHED" && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                  Ended
                </span>
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );

  // --- Dropdown sub-menu renderer ---
  const renderDropdown = (label, isOpen, setOpen, options, ref, icon, basePath) => (
    <div key={label} className="relative" ref={ref}>
      <button
        onClick={() => {
          setIsAdminOpen(false);
          setIsOrganizerOpen(false);
          setIsStaffOpen(false);
          setOpen(!isOpen);
        }}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
      >
        {icon && <span className="opacity-70">{icon}</span>}
        <span>{label}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.label}
              onClick={() => handleNavigation(option.path)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition text-left"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-purple-300 flex-shrink-0" />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ─── Desktop & Tablet Navbar ─── */}
      <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md px-4 md:px-8 py-3 flex items-center justify-between border-b border-slate-200/80 shadow-[0_1px_12px_rgba(15,23,42,0.06)] z-50">

        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer flex-shrink-0"
          onClick={() => handleNavigation("/home")}
        >
          <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 tracking-tight">
            EVENT HUB
          </span>
        </div>

        {/* Desktop nav links — center */}
        <div className="hidden xl:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {menuItems.map((item) => {
            if (item.label === "Check-in" && item.hasDropdown)
              return renderDropdown("Check-in", isStaffOpen, setIsStaffOpen, staffOptions, staffDropdownRef, item.icon, item.path);
            if (item.label === "Events" && item.hasDropdown)
              return renderDropdown("Events", isOrganizerOpen, setIsOrganizerOpen, organizerOptions, organizerDropdownRef, item.icon, item.path);
            if (item.label === "Admin" && item.hasDropdown)
              return renderDropdown("Admin", isAdminOpen, setIsAdminOpen, adminOptions, adminDropdownRef, item.icon, item.path);

            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              >
                {item.icon && <span className="opacity-70">{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">

          {/* Search — desktop */}
          <div className="relative hidden xl:block" ref={searchRef}>
            {isSearchOpen ? (
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="ค้นหา event..."
                  className="w-64 pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 focus:bg-white transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                      setSearchResults([]);
                    }
                  }}
                />
                <button
                  onClick={() => { setIsSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
                {(searchResults.length > 0 || (searchQuery.trim() && searchResults.length === 0)) && (
                  <SearchDropdown />
                )}
              </div>
            ) : (
              <button
                onClick={openSearch}
                className="flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                aria-label="Search events"
              >
                <Search size={18} />
              </button>
            )}
          </div>

          {/* Notification bell */}
          {user && (
            <div className="relative hidden xl:block" ref={notifDropdownRef}>
              <button
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                className="relative flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {pendingSurveyEvents.length > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold rounded-full px-1 leading-none">
                    {pendingSurveyEvents.length}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                    <div className="flex items-center gap-2">
                      <Bell size={14} className="text-purple-600" />
                      <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                      {pendingSurveyEvents.length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {pendingSurveyEvents.length}
                        </span>
                      )}
                    </div>
                    <button onClick={() => setIsNotifOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                      <X size={15} />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {pendingSurveyEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                          <Bell size={16} className="text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">All caught up!</p>
                        <p className="text-xs text-gray-400 mt-0.5">No pending surveys</p>
                      </div>
                    ) : (
                      <div className="py-1">
                        {pendingSurveyEvents.map((event, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setIsNotifOpen(false);
                              router.push(
                                event.surveyType === "pre"
                                  ? `/event/${event.eventId}/registration?mode=survey-only`
                                  : `/event/${event.eventId}/survey/post`
                              );
                            }}
                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-purple-50 transition text-left group"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-0.5 group-hover:bg-purple-200 transition-colors">
                              <MessageSquare size={13} className="text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{event.eventName}</p>
                              <p className="text-xs text-purple-600 mt-0.5 font-medium">📋 {event.surveyLabel}</p>
                            </div>
                            <div className="flex-shrink-0 w-2 h-2 bg-red-400 rounded-full mt-2" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {pendingSurveyEvents.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                      <p className="text-xs text-gray-500 text-center">
                        You have <span className="font-bold text-purple-600">{pendingSurveyEvents.length}</span> pending survey{pendingSurveyEvents.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Profile / Login — desktop */}
          <div className="hidden xl:block">
            {!user ? (
              <button
                onClick={() => handleNavigation("/login")}
                className="px-4 py-2 text-sm font-medium text-purple-700 border border-purple-200 rounded-full hover:bg-purple-50 transition-all duration-200"
              >
                Join | Log in
              </button>
            ) : (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
                >
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 group-hover:bg-purple-200 transition-colors">
                    <User size={14} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 hidden xl:inline">
                    {user.firstName}
                  </span>
                  <ChevronDown size={14} className="text-gray-400 group-hover:text-purple-500" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { setIsProfileOpen(false); router.push("/profile"); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition text-left"
                    >
                      <UserCircle className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile: search + hamburger */}
          <div className="flex xl:hidden items-center gap-1">
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 transition"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {user && pendingSurveyEvents.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 transition"
                >
                  <Bell size={18} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 transition"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : (
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                  <rect y="0" width="18" height="2" rx="1" fill="currentColor" />
                  <rect y="6" width="13" height="2" rx="1" fill="currentColor" />
                  <rect y="12" width="18" height="2" rx="1" fill="currentColor" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Search Bar (slides down below navbar) ─── */}
      {isMobileSearchOpen && (
        <div className="xl:hidden fixed top-[57px] left-0 w-full bg-white border-b border-gray-100 shadow-md z-40 px-4 py-3" ref={mobileSearchRef}>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="ค้นหา event..."
              className="w-full pl-9 pr-8 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 focus:bg-white transition-all"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsMobileSearchOpen(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }
              }}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {(searchResults.length > 0 || (searchQuery.trim() && searchResults.length === 0)) && (
            <div className="mt-2 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
              {searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Search size={20} className="text-gray-300 mb-1.5" />
                  <p className="text-sm text-gray-500">ไม่พบ event ที่ค้นหา</p>
                </div>
              ) : (
                <div className="py-1">
                  {searchResults.map((event) => (
                    <button
                      key={event.id}
                      onMouseDown={(e) => { e.preventDefault(); handleSearchSelect(event.id); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition text-left"
                    >
                      <div className="flex-shrink-0 w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar size={13} className="text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{event.eventName}</p>
                        {event.location && (
                          <p className="text-xs text-gray-400 truncate">{event.location}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Mobile Overlay ─── */}
      {isMobileMenuOpen && (
        <div
          className="xl:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ─── Mobile Drawer ─── */}
      <div
        className={`xl:hidden fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <span className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              EVENT HUB
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Pending survey banner */}
          {user && pendingSurveyEvents.length > 0 && (
            <div className="mx-4 mt-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Bell size={13} className="text-purple-600" />
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                  Pending ({pendingSurveyEvents.length})
                </span>
              </div>
              {pendingSurveyEvents.map((event, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push(
                      event.surveyType === "pre"
                        ? `/event/${event.eventId}/registration?mode=survey-only`
                        : `/event/${event.eventId}/survey/post`
                    );
                  }}
                  className="w-full flex items-center gap-2 py-2 px-3 rounded-lg bg-white border border-purple-100 hover:bg-purple-100 transition text-left mb-1 last:mb-0"
                >
                  <MessageSquare size={12} className="text-purple-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate font-medium">{event.eventName}</span>
                </button>
              ))}
            </div>
          )}

          {/* Nav links */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {menuItems.map((item) => {
              if (item.hasDropdown) {
                const isExpanded = mobileActiveDropdown === item.label;
                const subItems =
                  item.label === "Check-in" ? staffOptions
                  : item.label === "Events" ? organizerOptions
                  : item.label === "Admin" ? adminOptions
                  : [];

                return (
                  <div key={item.label}>
                    <button
                      onClick={() => setMobileActiveDropdown(isExpanded ? null : item.label)}
                      className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition font-medium text-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-gray-400">{item.icon}</span>
                        {item.label}
                      </div>
                      <ChevronDown
                        size={15}
                        className={`transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="ml-4 mt-1 mb-1 border-l-2 border-purple-100 pl-3 space-y-0.5">
                        {subItems.map((sub) => (
                          <button
                            key={sub.label}
                            onClick={() => handleNavigation(sub.path)}
                            className="w-full text-left text-sm text-gray-600 hover:text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-50 transition"
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
                  className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm transition text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                >
                  <span className="text-gray-400">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Drawer footer — profile */}
          <div className="border-t border-gray-100 px-4 py-4 space-y-2">
            {!user ? (
              <button
                onClick={() => handleNavigation("/login")}
                className="w-full text-center bg-purple-600 text-white py-2.5 px-4 rounded-full text-sm font-semibold hover:bg-purple-700 transition"
              >
                Join | Log in
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNavigation("/profile")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition"
                >
                  <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-purple-600" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-400 capitalize">{activeRole}</p>
                  </div>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 py-2.5 rounded-full transition"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}