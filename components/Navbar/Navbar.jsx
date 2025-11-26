'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  User,
  LogOut,
  UserCircle,
  Users,
  Briefcase,
} from 'lucide-react';
import Cookies from 'js-cookie';
import { getData } from '@/libs/fetch';

export default function Navbar({ token }) {
  const router = useRouter();
  const pathName = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isStaffOpen, setIsStaffOpen] = useState(false);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);
  const [user, setUser] = useState();
  const [data, setData] = useState();
  const [activeRole, setActiveRole] = useState('default');

  const profileDropdownRef = useRef(null);
  const staffDropdownRef = useRef(null);
  const organizerDropdownRef = useRef(null);

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
      return 'default';
    }

    const rolePriority = {
      admin: 4,
      organizer: 3,
      staff: 2,
      // visitor: 1,
      user: 1,
      default: 0,
    };

    let highestRole = userData.role.roleName.toLowerCase().trim();
    if (rolePriority[highestRole] === undefined) {
      highestRole = 'default';
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

  const fetchData = async () => {
    if (token) {
      const resUser = await getData('users/me/profile');
      const resEventRegis = await getData('users/me/registered-events');

      setUser(resUser?.data);
      let mergeData = { user: resUser?.data, event: resEventRegis?.data };
      // console.log(mergeData);
      setData(mergeData);
    }
  };

  useEffect(() => {
    fetchData();

    function handleClickOutside(event) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
      if (
        staffDropdownRef.current &&
        !staffDropdownRef.current.contains(event.target)
      ) {
        setIsStaffOpen(false);
      }
      if (
        organizerDropdownRef.current &&
        !organizerDropdownRef.current.contains(event.target)
      ) {
        setIsOrganizerOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (user && data) {
      const calculatedRole = calculateActiveRole(user, data.event);
      setActiveRole(calculatedRole);
      // console.log("Calculated Active Role:", calculatedRole);
    } else {
      setActiveRole('default');
    }
  }, [user, data]);

  const handleProfileClick = () => {
    setIsProfileOpen(false);
    handleNavigation('/profile');
  };

  const handleSignOut = () => {
    Cookies.remove('token');
    setIsProfileOpen(false);
    window.location.href = '/login';
  };

  const handleNavigation = (path) => {
    setIsMenuOpen(false);
    setIsStaffOpen(false);
    setIsOrganizerOpen(false);

    if (path.startsWith('#')) {
      if (pathName !== '/' && pathName !== '/home') {
        router.push(`/home`);
        setTimeout(() => {
          const element = document.querySelector(path);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        const element = document.querySelector(path);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } else {
      // console.log(path);
      router.push(path);
    }
  };

  const getMenuItems = () => {
    if (activeRole === 'default') {
      return [
        { label: 'Home', path: '#home' },
        { label: 'Events', path: '#events' },
      ];
    }

    switch (activeRole) {
      case 'admin':
        return [
          { label: 'Home', path: '#home' },
          { label: 'Events', path: '#events' },
          { label: 'Admin', path: '/admin' },
        ];
      case 'organizer':
        return [
          { label: 'Home', path: '#home' },
          { label: 'Events', path: '#events' },
          { label: 'Staff', path: '/staff', hasDropdown: true },
          { label: 'Organizer', path: '/organizer', hasDropdown: true },
        ];
      case 'staff':
        return [
          { label: 'Home', path: '#home' },
          { label: 'Events', path: '#events' },
          { label: 'Staff', path: '/staff', hasDropdown: true },
        ];
      case 'user':
        return [
          { label: 'Home', path: '#home' },
          { label: 'Events', path: '#events' },
          // { label: "Reward", path: "/reward" },
        ];
      // case "visitor":
      //   return [
      //     { label: "Home", path: "#home" },
      //     { label: "Events", path: "#events" },
      //     { label: "Reward", path: "/reward" },
      //   ];
      default:
        return [
          { label: 'Home', path: '#home' },
          { label: 'Events', path: '#events' },
        ];
    }
  };

  const menuItems = getMenuItems();

  const staffOptions = [
    { label: 'Scan QR', path: '/staff/event/scan' },
    { label: 'Check-in List', path: '/staff/event/check-in' },
  ];

  const organizerOptions = [
    { label: 'Dashboard', path: '/organizer/dashboard' },
    // { label: 'My Events', path: '/organizer/create' },
    // { label: 'My Feedback', path: '/organizer/events' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white px-4 md:px-8 py-4 flex items-center justify-between border-b shadow-md z-50">
        <div
          className="flex items-center gap-2 cursor-pointer z-50"
          onClick={() => handleNavigation('/login')}
        >
          <span className="text-xl md:text-2xl font-bold text-purple-600">
            EXPO HUB
          </span>
        </div>

        <div className="hidden md:flex items-center gap-4 flex-1 justify-center max-w-md mx-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          {menuItems.map((item) => {
            // Staff dropdown
            if (item.label === 'Staff' && item.hasDropdown) {
              return (
                <div
                  key={item.label}
                  className="relative"
                  ref={staffDropdownRef}
                >
                  <button
                    onClick={() => setIsStaffOpen(!isStaffOpen)}
                    className="text-gray-700 hover:text-purple-600 transition"
                  >
                    {item.label}
                  </button>

                  {isStaffOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      {staffOptions.map((option) => (
                        <button
                          key={option.label}
                          onClick={() => handleNavigation(option.path)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition text-left"
                        >
                          <Users className="w-5 h-5" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Organizer dropdown
            if (item.label === 'Organizer' && item.hasDropdown) {
              return (
                <div
                  key={item.label}
                  className="relative"
                  ref={organizerDropdownRef}
                >
                  <button
                    onClick={() => setIsOrganizerOpen(!isOrganizerOpen)}
                    className="text-gray-700 hover:text-purple-600 transition"
                  >
                    {item.label}
                  </button>

                  {isOrganizerOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      {organizerOptions.map((option) => (
                        <button
                          key={option.label}
                          onClick={() => handleNavigation(option.path)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition text-left"
                        >
                          <Briefcase className="w-5 h-5" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Regular menu item
            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                className="text-gray-700 hover:text-purple-600 transition"
              >
                {item.label}
              </button>
            );
          })}

          {!user ? (
            <button
              onClick={() => handleNavigation('/login')}
              className="text-gray-700 hover:text-purple-600 transition whitespace-nowrap"
            >
              Join | Log in
            </button>
          ) : (
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition"
              >
                <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <User />
                </span>
                <span className="hidden xl:inline">{user.firstName}</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition text-left"
                  >
                    <UserCircle className="w-5 h-5" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => handleSignOut()}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition text-left"
                  >
                    <LogOut className="w-5 h-5" />
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
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col p-6 pt-20 gap-4">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.path)}
              className="text-left text-gray-700 hover:text-purple-600 py-2 px-4 hover:bg-purple-50 rounded-lg transition"
            >
              {item.label}
            </button>
          ))}

          <div className="mt-4 pt-4 border-t border-gray-200">
            {!user ? (
              <button
                onClick={() => handleNavigation('/login')}
                className="w-full text-center bg-purple-600 text-white py-2 px-4 rounded-full hover:bg-purple-700 transition"
              >
                Join | Log in
              </button>
            ) : (
              <button
                onClick={() => handleNavigation('/profile')}
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
