"use client";

import { useState, useEffect, useMemo } from "react";
import { Gift, Search, X, Tag } from "lucide-react";
import { getData, getDataNoToken } from "@/libs/fetch";
import { useRouter } from "next/navigation";
import RewardEventCard from "@/components/Reward/RewardEventCard";
import Notification from "@/components/Notification/Notification";

export default function Page() {
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const router = useRouter();

  const [notification, setNotification] = useState({ isVisible: false, isError: false, message: "" });
  const showNotification = (message, isError = false) => {
    setNotification({ isVisible: true, isError, message });
    setTimeout(() => setNotification((p) => ({ ...p, isVisible: false })), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allEventsRes, registeredRes] = await Promise.all([
          getDataNoToken("events"),
          getData("users/me/registered-events"),
        ]);
        const allEvents = allEventsRes.data || [];
        const organizerEventIds = (registeredRes.data || [])
          .filter((item) => item.eventRole === "ORGANIZER")
          .map((item) => item.eventId);
        setEventData(allEvents.filter((e) => organizerEventIds.includes(e.id)));
      } catch {
        showNotification("ไม่สามารถดึงข้อมูลกิจกรรมได้ กรุณาลองใหม่อีกครั้ง", true);
        setEventData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = useMemo(() => {
    const types = eventData.map((e) => e.eventTypeId?.eventTypeName).filter(Boolean);
    return ["All", ...new Set(types)];
  }, [eventData]);

  const filtered = useMemo(() => {
    let list = eventData;
    if (selectedCategory !== "All") {
      list = list.filter((e) => e.eventTypeId?.eventTypeName === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.eventName?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [eventData, search, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Notification
        isVisible={notification.isVisible}
        onClose={() => setNotification((p) => ({ ...p, isVisible: false }))}
        isError={notification.isError}
        message={notification.message}
      />

      <section className="max-w-7xl mx-auto py-6 px-4 md:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 mt-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1">
              Organizer Portal
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Rewards</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              จัดการของรางวัลสำหรับกิจกรรมที่คุณเป็นผู้จัด
            </p>
          </div>

          {eventData.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อ Event..."
                className="w-full pl-9 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Category filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-amber-300 hover:text-amber-600"
                }`}
              >
                {cat !== "All" && <Tag className="w-3 h-3" />}
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {eventData.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
              <Gift className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">ยังไม่มีกิจกรรม</h3>
            <p className="text-gray-400 text-sm">คุณยังไม่มีกิจกรรมที่เป็นผู้จัดในขณะนี้</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Search className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">ไม่พบ Event ที่ตรงกับเงื่อนไข</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((event) => (
              <RewardEventCard
                key={event.id}
                event={event}
                onClick={() => router.push(`/organizer/reward/${event.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}