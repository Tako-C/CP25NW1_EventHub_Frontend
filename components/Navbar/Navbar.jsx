"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, User, LogOut, UserCircle } from "lucide-react";
import Cookies from "js-cookie";

export default function Navbar({ user, onLogout }) {
  const router = useRouter();
  const pathName = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleProfileClick = () => {
    setIsProfileOpen(false);
    handleNavigation("/profile");
  };
  const handleSignOut = () => {
    Cookies.remove("token");
    setIsProfileOpen(false);
    handleNavigation("/login");
  };

  const handleNavigation = (path) => {
    // router.push(path);
    setIsMenuOpen(false);

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
      console.log(path);
      router.push(path);
    }
  };

  const getMenuItems = () => {
    if (!user) {
      return [
        { label: "Home", path: "#home" },
        { label: "Events", path: "#events" },
      ];
    }

    switch (user.role) {
      case "visitor":
        return [
          { label: "Home", path: "#home" },
          { label: "Events", path: "#events" },
          { label: "Reward", path: "/reward" },
        ];
      case "organizer":
        return [
          { label: "Home", path: "#home" },
          { label: "Events", path: "#events" },
          { label: "Staff", path: "/staff" },
          { label: "Organizer", path: "/organizer" },
        ];
      case "staff":
        return [
          { label: "Home", path: "#home" },
          { label: "Events", path: "#events" },
          { label: "Staff", path: "/staff" },
        ];
      case "admin":
        return [
          { label: "Home", path: "#home" },
          { label: "Events", path: "#events" },
          { label: "Admin", path: "/admin" },
        ];
      default:
        return [
          { label: "Home", path: "#home" },
          { label: "Events", path: "#events" },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white px-4 md:px-8 py-4 flex items-center justify-between border-b shadow-md z-50">
        <div
          className="flex items-center gap-2 cursor-pointer z-50"
          onClick={() => handleNavigation("/login")}
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
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.path)}
              className="text-gray-700 hover:text-purple-600 transition"
            >
              {item.label}
            </button>
          ))}

          {!user ? (
            <button
              onClick={() => handleNavigation("/login")}
              className="text-gray-700 hover:text-purple-600 transition whitespace-nowrap"
            >
              Join | Log in
            </button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition"
              >
                <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <User />
                </span>
                <span className="hidden xl:inline">{user.name}</span>
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
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col p-6 pt-20 gap-4">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                onClick={() => handleNavigation("/login")}
                className="w-full text-center bg-purple-600 text-white py-2 px-4 rounded-full hover:bg-purple-700 transition"
              >
                Join | Log in
              </button>
            ) : (
              <button
                onClick={() => handleNavigation("/")}
                className="w-full flex items-center gap-3 text-gray-700 hover:text-purple-600 py-2 px-4 hover:bg-purple-50 rounded-lg transition"
              >
                <span className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <User />
                </span>
                <div className="text-left">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role}
                  </p>
                </div>
              </button>
            )}
          </div>
          <button
            onClick={() => handleNavigation("/login")}
            className="w-full text-center bg-red-600 text-white py-2 px-4 rounded-full hover:bg-red-700 transition"
          >
            Log out
          </button>
        </div>
      </div>
    </>
  );
}
