"use client";

import { useState, useEffect } from "react";
import { Search, RotateCcw, Loader2, Calendar, Zap, QrCode, CheckCircle2, Clock, User } from "lucide-react";
import { getListUser, getData, postUserCheckIn } from "@/libs/fetch";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Notification from "@/components/Notification/Notification";

export default function CheckInStaff() {
  const [searchQuery, setSearchQuery] = useState("");
  const [visitors, setVisitors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [userId, setUserId] = useState("");
  const [notification, setNotification] = useState({ isVisible: false, isError: false, message: "" });

  const showNotification = (msg, isError = false) => {
    setNotification({ isVisible: true, isError, message: msg });
    setTimeout(() => setNotification((prev) => ({ ...prev, isVisible: false })), 3000);
  };
  const closeNotification = () => setNotification((prev) => ({ ...prev, isVisible: false }));

  const searchParams = useSearchParams();
  const paramEventId = searchParams.get("eventId");

  const handleCheckIn = async (visitorData) => {
    if (visitorData.status === "check_in") return;
    if (!selectedEventId) { showNotification("กรุณาเลือกกิจกรรมก่อนทำการ Check-in", true); return; }
    setIsUpdating(true);
    try {
      const result = await postUserCheckIn("manual/check-in", selectedEventId, visitorData.userId);
      if (result?.statusCode === 200) {
        setVisitors((prev) => prev.map((v) => v.userId === visitorData.userId ? { ...v, status: "check_in" } : v));
        showNotification("Check-in สำเร็จเรียบร้อยแล้ว");
      } else {
        showNotification("Check-in ไม่สำเร็จ", true);
      }
    } catch {
      showNotification("เกิดข้อผิดพลาดในการ Check-in กรุณาลองใหม่อีกครั้ง", true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedEventId) { showNotification("กรุณาเลือกกิจกรรมที่ต้องการค้นหา", true); return; }
    if (!searchQuery.trim()) { showNotification("กรุณากรอกข้อมูลเพื่อค้นหา", true); return; }
    setIsLoading(true);
    setHasSearched(true);
    setVisitors([]);
    try {
      const result = await getListUser("manual/search", { query: searchQuery.trim(), eventId: selectedEventId });
      if (result) {
        if (Array.isArray(result)) setVisitors(result);
        else if (result.userId) { setVisitors([result]); setUserId(result.userId); }
      } else {
        showNotification("ไม่พบข้อมูลผู้เข้าร่วมงาน", true);
      }
    } catch {
      showNotification("เกิดข้อผิดพลาดในการค้นหาข้อมูล", true);
      setVisitors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => { setSearchQuery(""); setVisitors([]); setHasSearched(false); };
  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };

  const fetchData = async () => {
    try {
      const res = await getData("users/me/registered-events");
      if (res?.data && Array.isArray(res.data)) setEvents(res.data);
    } catch { console.error("Failed to fetch events"); }
  };

  const handleEventChange = (e) => {
    setSelectedEventId(e.target.value);
    setVisitors([]);
    setHasSearched(false);
  };

  const selectedEventObj = events.find((e) => e.eventId.toString() === selectedEventId.toString());

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (events.length > 0 && paramEventId) {
      const targetEvent = events.find((e) => e.eventId.toString() === paramEventId);
      if (targetEvent) setSelectedEventId(paramEventId);
    }
  }, [events, paramEventId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Notification isVisible={notification.isVisible} isError={notification.isError} message={notification.message} onClose={closeNotification} />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={15} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">Expo Hub</span>
              <p className="text-xs text-gray-400 leading-none">Staff Portal</p>
            </div>
          </div>
          <Link href="/staff/event/scan"
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-100 hover:bg-purple-100 transition-colors">
            <QrCode size={13} />
            QR Scanner
          </Link>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* Page title */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">บันทึกการเข้างาน</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {selectedEventObj
                ? <span>กิจกรรม: <span className="text-purple-600 font-semibold">{selectedEventObj.eventName}</span></span>
                : "กรุณาเลือกกิจกรรมเพื่อเริ่มต้น"}
            </p>
          </div>

          {/* Event selector */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Calendar size={15} className="text-purple-500" />
              เลือกกิจกรรม
            </label>
            <div className="relative">
              <select
                value={selectedEventId}
                onChange={handleEventChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 appearance-none transition-all text-gray-700"
              >
                <option value="" disabled>— กรุณาเลือกกิจกรรม —</option>
                {events.map((event) => (
                  <option key={event.eventId} value={event.eventId}>
                    {event.eventName} ({new Date(event.startDate).toLocaleDateString("th-TH")})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Search size={15} className="text-purple-500" />
              ค้นหาผู้เข้าร่วม
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="ชื่อ, อีเมล หรือเบอร์โทรศัพท์..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!selectedEventId}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isLoading || !selectedEventId}
                className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm shadow-purple-200"
              >
                {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                <span className="hidden sm:inline">ค้นหา</span>
              </button>
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="px-4 py-3 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all"
              >
                <RotateCcw size={15} />
              </button>
            </div>
            {!selectedEventId && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <span>⚠</span> กรุณาเลือกกิจกรรมด้านบนก่อนเริ่มค้นหา
              </p>
            )}
          </div>

          {/* Results */}
          {(visitors.length > 0 || hasSearched) && (
            <div className="space-y-3">
              {isLoading ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                  <Loader2 size={24} className="animate-spin text-purple-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">กำลังค้นหา...</p>
                </div>
              ) : visitors.length > 0 ? (
                <>
                  <p className="text-xs text-gray-400 font-medium px-1">พบ {visitors.length} รายการ</p>
                  {visitors.map((visitor, index) => {
                    const isCheckedIn = visitor.status === "check_in" || visitor.status === "CHECK_IN";
                    return (
                      <div key={visitor.userId || index}
                        className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${isCheckedIn ? "border-emerald-100" : "border-gray-100"}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isCheckedIn ? "bg-emerald-50" : "bg-purple-50"}`}>
                              {isCheckedIn
                                ? <CheckCircle2 size={20} className="text-emerald-500" />
                                : <User size={20} className="text-purple-500" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm">{visitor.name}</p>
                              <p className="text-xs text-gray-500 truncate">{visitor.email}</p>
                              {visitor.phone && <p className="text-xs text-gray-400">{visitor.phone}</p>}
                              <p className="text-xs text-gray-300 mt-1 font-mono">ID: {visitor.userId}</p>
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            {isCheckedIn ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                                <CheckCircle2 size={12} /> เข้างานแล้ว
                              </span>
                            ) : (
                              <button
                                onClick={() => handleCheckIn(visitor)}
                                disabled={isUpdating}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                              >
                                {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <Clock size={13} />}
                                Check-in
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Search size={20} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">ไม่พบข้อมูล</p>
                  <p className="text-xs text-gray-400 mt-1">ลองค้นหาด้วยชื่อ, อีเมล หรือเบอร์โทรศัพท์</p>
                </div>
              )}
            </div>
          )}

          {!hasSearched && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-purple-300" />
              </div>
              <p className="text-sm font-semibold text-gray-500">ค้นหาผู้เข้าร่วมงาน</p>
              <p className="text-xs text-gray-400 mt-1">เลือกกิจกรรมแล้วกรอกข้อมูลเพื่อค้นหา</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}