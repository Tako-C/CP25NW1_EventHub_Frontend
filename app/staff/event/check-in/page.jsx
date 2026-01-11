"use client";

import { useState, useEffect } from "react";
import { Search, RotateCcw, Loader2, Calendar } from "lucide-react";
import { getListUser, getData, postUserCheckIn } from "@/libs/fetch";
import { useSearchParams } from "next/navigation";
import Notification from "@/components/Notification/Notification";

export default function CheckInStaff() {
  const [searchEmail, setSearchEmail] = useState("");
  const [visitors, setVisitors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [userId, setUserId] = useState("");
  const [errors, setErrors] = useState({});

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  const searchParams = useSearchParams();
  const paramEventId = searchParams.get("eventId");

  const handleCheckIn = async (visitorData) => {
    if (visitorData.status === "check_in") return;

    if (!selectedEventId) {
      setNotification({
        isVisible: true,
        isError: true,
        message: "กรุณาเลือก Event ก่อนทำการ Check-in",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const result = await postUserCheckIn(
        "manual/check-in",
        selectedEventId,
        userId
      );

      if (result?.statusCode === 200) {
        setVisitors((prevVisitors) =>
          prevVisitors.map((v) => {
            if (v.email === visitorData.email) {
              return { ...v, status: "check_in" };
            }
            return v;
          })
        );
      } else {
        setNotification({
          isVisible: true,
          isError: true,
          message: result?.message,
        });
      }
    } catch (error) {
      console.error("Check-in failed:", error);
      setNotification({
        isVisible: true,
        isError: true,
        message: "เกิดข้อผิดพลาดในการ Check-in",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSearch = async () => {
    if (!validateForm()) {
      return;
    }

    if (!selectedEventId) {
      setNotification({
        isVisible: true,
        isError: true,
        message: "กรุณาเลือก Event ที่ต้องการค้นหา",
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setVisitors([]);

    try {
      const result = await getListUser("manual/search", {
        email: searchEmail,
        eventId: selectedEventId,
      });

      console.log(result);
      if (result?.userId) {
        if (Array.isArray(result)) {
          setVisitors(result);
        } else if (result) {
          setVisitors([result]);
        }
        setUserId(result?.userId);
      } else {
        setNotification({
          isVisible: true,
          isError: true,
          message: result?.message,
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setVisitors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateField = (field, value) => {
    switch (field) {
      case "email":
        if (!value.trim()) return "* กรุณากรอกอีเมล";
        if (!value.includes("@") || !value.endsWith(".com"))
          return "* อีเมลไม่ถูกต้อง (ต้องมี @ และ .com)";
        return "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailErr = validateField("email", searchEmail);
    if (emailErr) {
      newErrors.email = emailErr;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    setSearchEmail("");
    setVisitors([]);
    setHasSearched(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const fetchData = async () => {
    try {
      const res = await getData("users/me/registered-events");
      console.log("Events loaded:", res?.data);
      if (res?.data && Array.isArray(res.data)) {
        setEvents(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch events", error);
    }
  };

  const handleEventChange = (e) => {
    const newId = e.target.value;
    setSelectedEventId(newId);

    setVisitors([]);
    setHasSearched(false);
  };

  const selectedEventObj = events.find(
    (e) => e.eventId.toString() === selectedEventId.toString()
  );

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (events.length > 0 && paramEventId) {
      const targetEvent = events.find(
        (e) => e.eventId.toString() === paramEventId
      );
      if (targetEvent) {
        setSelectedEventId(paramEventId);
      }
    }
  }, [events, paramEventId]);

  return (
    <div className="min-h-screen pb-10 mt-20">
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={closeNotification}
      />
      <div className="py-3 px-4"></div>

      <div className="max-w-4xl mx-auto mt-4 md:mt-8 px-6 md:px-4">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-center mb-2">
            Check-in
          </h3>

          <p className="text-center text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
            Event :{" "}
            <span className="font-medium text-purple-600 block md:inline mt-1 md:mt-0">
              {selectedEventObj
                ? selectedEventObj.eventName
                : "Please select an event"}
            </span>
          </p>

          <div className="mb-6">
            <label className="flex text-gray-700 font-medium mb-2 items-center gap-2">
              <Calendar className="w-4 h-4" /> Select Event
            </label>
            <select
              value={selectedEventId}
              onChange={handleEventChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-sm md:text-base"
            >
              <option value="" disabled>
                -- กรุณาเลือกงานกิจกรรม (Select Event) --
              </option>
              {events.map((event) => (
                <option key={event.eventId} value={event.eventId}>
                  {event.eventName} (
                  {new Date(event.startDate).toLocaleDateString("th-TH")})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Visitors Search
            </label>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Search by email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!selectedEventId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              <div className="flex gap-2 md:gap-3 flex-row">
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !selectedEventId}
                  className="flex-1 md:flex-none justify-center flex items-center gap-2 px-6 py-2 bg-green-200 hover:bg-green-300 disabled:bg-gray-300 disabled:text-gray-500 text-gray-700 rounded-md transition-colors whitespace-nowrap"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </button>
                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="flex-1 md:flex-none justify-center flex items-center gap-2 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
            {!selectedEventId && (
              <p className="text-red-500 text-sm mt-2">
                * กรุณาเลือก Event ด้านบนก่อนเริ่มค้นหา
              </p>
            )}
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-4 max-h-[60vh] md:max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                กำลังค้นหาข้อมูล...
              </div>
            ) : (
              <>
                {visitors.length > 0 ? (
                  visitors.map((visitor, index) => {
                    const isCheckedIn = visitor.status === "CHECK_IN";
                    return (
                      <div
                        key={index}
                        className="bg-gray-100 rounded-lg p-4 md:p-6"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="space-y-2 w-full text-sm md:text-base">
                            <div className="flex flex-col sm:flex-row sm:items-baseline">
                              <span className="text-gray-600 w-24 md:w-32 font-semibold sm:font-normal">
                                Visitor ID:
                              </span>
                              <span className="text-gray-900 break-all">
                                {visitor.userId}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-baseline">
                              <span className="text-gray-600 w-24 md:w-32 font-semibold sm:font-normal">
                                Full name :
                              </span>
                              <span className="text-gray-900 break-words">
                                {visitor.name}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-baseline">
                              <span className="text-gray-600 w-24 md:w-32 font-semibold sm:font-normal">
                                Email :
                              </span>
                              <span className="text-gray-900 break-all">
                                {visitor.email}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-baseline">
                              <span className="text-gray-600 w-24 md:w-32 font-semibold sm:font-normal">
                                Phone :
                              </span>
                              <span className="text-gray-900">
                                {visitor.phone || "-"}
                              </span>
                            </div>
                          </div>

                          <div className="w-full md:w-auto mt-2 md:mt-0">
                            {!isCheckedIn ? (
                              <button
                                onClick={() => handleCheckIn(visitor)}
                                disabled={isUpdating}
                                className="w-full md:w-auto bg-green-400 hover:bg-green-500 disabled:bg-green-200 text-white font-medium px-8 py-3 rounded-md transition-colors"
                              >
                                {isUpdating ? "Saving..." : "Check-in"}
                              </button>
                            ) : (
                              <div className="text-center w-full md:w-auto">
                                <div className="text-green-600 font-medium mb-1 hidden md:block">
                                  ✓ Checked in
                                </div>
                                <button
                                  disabled
                                  className="w-full md:w-auto bg-gray-300 text-gray-500 font-medium px-8 py-3 rounded-md cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                  <span className="md:hidden">✓</span> Check-in
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    {hasSearched
                      ? "ไม่พบข้อมูลผู้เข้าร่วมงาน (User Not Found)"
                      : "กรุณากรอกข้อมูลเพื่อค้นหา"}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
