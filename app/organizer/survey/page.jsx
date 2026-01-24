"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ClipboardList,
  Calendar,
  MapPin,
  FileText,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getDataNoToken } from "@/libs/fetch";
import Cookies from "js-cookie"; 
import { jwtDecode } from "jwt-decode"; 
import { FormatDate } from "@/utils/format"; 
import { EventCardImage } from "@/utils/getImage"; 
import { useRouter } from "next/navigation";

function SurveyEventCard({ event, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
    >
      <div className="relative h-64 overflow-hidden">
        <EventCardImage
          imageCard={event?.images?.imgCard}
          eventName={event.eventName}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-white text-gray-900 px-6 py-3 rounded-full font-semibold text-base flex items-center gap-2 shadow-xl transform scale-95 group-hover:scale-100 transition-transform">
            <FileText className="w-5 h-5" />
            View Surveys
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 min-h-[3.5rem]">
          {event.eventName}
        </h3>

        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-3 text-gray-600">
            <span className="text-sm">
              Date : {event.startDate ? FormatDate(event.startDate) : "TBA"}
            </span>
          </div>
          <div className="flex items-start gap-3 text-gray-600">
            <span className="text-sm line-clamp-1">
              Location : {event.location || "Online"}
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 flex-1">
            {event.hasPreSurvey ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">Pre-Survey</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-400">Pre-Survey</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 flex-1">
            {event.hasPostSurvey ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">Post-Survey</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-400">Post-Survey</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("GUEST");
  const [userId, setUserId] = useState(null); 
  const mockFeedbackData = [];
  const router = useRouter();

  useEffect(() => {
    fetchData();
    checkUserToken();
    // setTimeout(() => {
    //   setEventData(mockFeedbackData);
    //   setLoading(false);
    // }, 500);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDataNoToken("events");
      const fetchedEvents = res.data || [];
      setEventData(fetchedEvents);
      // setFeedbackData(mockFeedbackData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setEventData([]);
      // setFeedbackData([]);
    } finally {
      setLoading(false);
    }
  };

  const checkUserToken = () => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const rawRole =
          decoded.role || decoded.auth || decoded.authorities || "guest";
        const role = String(rawRole).toUpperCase();
        const id = decoded.id || decoded.userId || decoded.sub;

        setUserRole(role);
        setUserId(id);

      } catch (error) {
        console.error("Token decode error", error);
      }
    }
  };

  const myOrganizedEvents = useMemo(() => {
    if (!userId || !eventData.length) return [];

    const myEvents = eventData.filter((event) => {
      if (typeof event.createdBy !== "object") {
        return event.createdBy == userId;
      }
      return event.createdBy?.id == userId;
    });

    console.log(
      `📋 Found ${myEvents.length} events for Organizer ID ${userId}`,
    );
    return myEvents;
  }, [userId, eventData]);

  const handleEventClick = (eventId) => {
    router.push(`/organizer/survey/${eventId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="max-w-7xl mx-auto py-12 px-4 md:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            My Surveys
          </h1>
        </div>

        {myOrganizedEvents.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-4">
              <ClipboardList className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ยังไม่มี Event
            </h3>
            <p className="text-gray-600">
              สร้าง Event แรกของคุณเพื่อเริ่มเก็บข้อมูล Survey
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {myOrganizedEvents.map((event) => (
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
