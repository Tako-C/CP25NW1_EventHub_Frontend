"use client";

import { useState, useEffect, useMemo } from "react";
import { ClipboardList } from "lucide-react";
import { getData, getDataNoToken } from "@/libs/fetch"; // เพิ่ม getData สำหรับดึงข้อมูลส่วนตัว
import { useRouter } from "next/navigation";
import SurveyEventCard from "./components/SurveyEventCard";
import Notification from "@/components/Notification/Notification";

export default function Page() {
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const showNotification = (message, isError = false) => {
    setNotification({
      isVisible: true,
      isError: isError,
      message: message,
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
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // ดึงข้อมูลทั้งกิจกรรมทั้งหมด และกิจกรรมที่ยูสเซอร์ลงทะเบียนไว้พร้อมกัน
      const [allEventsRes, registeredRes] = await Promise.all([
        getDataNoToken("events"),
        getData("users/me/registered-events"),
      ]);

      const allEvents = allEventsRes.data || [];
      const registeredData = registeredRes.data || [];

      // กรองหาเฉพาะ Event ID ที่เราเป็น ORGANIZER
      const organizerEventIds = registeredData
        .filter((item) => item.eventRole === "ORGANIZER")
        .map((item) => item.eventId);

      // กรองข้อมูลกิจกรรมหลักให้เหลือเฉพาะกิจกรรมที่เราเป็นผู้จัด
      const myEvents = allEvents.filter((event) =>
        organizerEventIds.includes(event.id)
      );

      setEventData(myEvents);
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("ไม่สามารถดึงข้อมูลกิจกรรมได้ กรุณาลองใหม่อีกครั้ง", true);
      setEventData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (eventId) => {
    router.push(`/organizer/survey/${eventId}`);
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
      <section className="max-w-7xl mx-auto py-12 px-4 md:px-8">
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 uppercase italic tracking-tight">
            My Surveys
          </h1>
          <p className="text-gray-500 text-sm">จัดการแบบสำรวจสำหรับกิจกรรมที่คุณเป็นผู้จัด</p>
        </div>

        {eventData.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-50 rounded-full mb-4">
              <ClipboardList className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ยังไม่มีกิจกรรม
            </h3>
            <p className="text-gray-500 font-medium">
              คุณยังไม่มีกิจกรรมที่เป็นผู้จัดในขณะนี้
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {eventData.map((event) => (
              <SurveyEventCard
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