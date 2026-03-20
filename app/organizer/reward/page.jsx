"use client";

import { useState, useEffect, useMemo } from "react";
import { Gift } from "lucide-react";
import { getDataNoToken } from "@/libs/fetch";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import RewardEventCard from "./components/RewardEventCard";
import Notification from "@/components/Notification/Notification";

export default function Page() {
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const showNotification = (message, isError = false) => {
    setNotification({ 
      isVisible: true, 
      isError, 
      message: message 
    });
    setTimeout(() => {
      closeNotification();
    }, 3000);
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    fetchData();
    checkUserToken();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDataNoToken("events");
      setEventData(res.data || []);
    } catch (error) {
      showNotification("ไม่สามารถดึงข้อมูลกิจกรรมได้ กรุณาลองใหม่อีกครั้ง", true);
      setEventData([]);
    } finally {
      setLoading(false);
    }
  };

  const checkUserToken = () => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = decoded.id || decoded.userId || decoded.sub;
        setUserId(id);
      } catch (error) {
        showNotification("ข้อมูลผู้ใช้งานไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่", true);
      }
    }
  };

  const myOrganizedEvents = useMemo(() => {
    if (!userId || !eventData.length) return [];
    return eventData.filter((event) => {
      if (typeof event.createdBy !== "object") return event.createdBy == userId;
      return event.createdBy?.id == userId;
    });
  }, [userId, eventData]);

  const handleEventClick = (eventId) => {
    router.push(`/organizer/reward/${eventId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Notification
        isVisible={notification.isVisible}
        onClose={closeNotification}
        isError={notification.isError}
        message={notification.message}
      />
      <section className="max-w-7xl mx-auto py-12 px-4 md:px-8 mt-20">
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 uppercase italic tracking-tight">
            My Rewards
          </h1>
          <p className="text-gray-500 text-sm">จัดการของรางวัลสำหรับกิจกรรมที่คุณเป็นผู้จัด</p>
        </div>

        {myOrganizedEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-50 rounded-full mb-4">
              <Gift className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ยังไม่มีกิจกรรม
            </h3>
            <p className="text-gray-500">
              สร้างกิจกรรมแรกของคุณเพื่อเริ่มจัดการของรางวัล
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {myOrganizedEvents.map((event) => (
              <RewardEventCard
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}