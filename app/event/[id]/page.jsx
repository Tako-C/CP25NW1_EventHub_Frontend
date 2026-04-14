"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Calendar, ChevronDown, Tag, ArrowLeft } from "lucide-react";
import { FormatDate } from "@/utils/format";
import { getDataNoToken } from "@/libs/fetch";
import { EventCardImage } from "@/utils/getImage";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [eventData, setEventData] = useState(null);

  const isEventPast = eventData?.eventStatus === "FINISHED";

  const fetchData = async () => {
    const res = await getDataNoToken(`events/${id}`);
    setEventData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Loading skeleton ---
  if (!eventData) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="relative h-[50vh] md:h-[60vh] bg-gray-200" />
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <div className="h-8 bg-gray-200 rounded-xl w-2/3" />
          <div className="h-5 bg-gray-200 rounded-lg w-1/3" />
          <div className="h-5 bg-gray-200 rounded-lg w-1/2" />
          <div className="h-14 bg-gray-200 rounded-full w-full md:w-64 mt-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ─── Hero Banner ─── */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden bg-slate-900">

        {/* Background image — full opacity with dark overlay */}
        <div className={`absolute inset-0 ${isEventPast ? "grayscale" : ""}`}>
          <EventCardImage
            imageCard={eventData?.images?.imgDetail || eventData?.images?.imgCard}
            eventName={eventData?.eventName}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full transition-all"
        >
          <ArrowLeft size={15} />
          กลับ
        </button>

        {/* Event Ended badge */}
        {isEventPast && (
          <div className="absolute top-4 right-4 z-10 bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
            Event Ended
          </div>
        )}

        {/* Hero content — bottom aligned */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10">
          <div className="max-w-4xl mx-auto">

            {/* Event type badge */}
            {eventData?.eventTypeId?.eventTypeName && (
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                <Tag size={11} />
                {eventData.eventTypeId.eventTypeName}
              </div>
            )}

            <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight drop-shadow-md">
              {eventData?.eventName}
            </h1>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-white/85 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-purple-300 flex-shrink-0" />
                <span className="font-medium">{eventData?.location || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-purple-300 flex-shrink-0" />
                <span className="font-medium">
                  {FormatDate(eventData?.startDate)} – {FormatDate(eventData?.endDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CTA + info strip ─── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="text-center sm:text-left">
            {isEventPast ? (
              <p className="text-sm text-red-600 font-medium">
                งานนี้สิ้นสุดแล้ว ไม่สามารถลงทะเบียนได้
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                กดปุ่มเพื่อลงทะเบียนเข้าร่วมงานนี้
              </p>
            )}
          </div>

          <button
            onClick={() => {
              if (!isEventPast) router.push(`/event/${id}/registration`);
            }}
            disabled={isEventPast}
            className={`w-full sm:w-auto font-semibold px-10 py-3.5 rounded-full shadow-md transition-all text-base ${
              isEventPast
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:scale-105 active:scale-95 hover:shadow-purple-200 hover:shadow-lg"
            }`}
          >
            {isEventPast ? "Registration Closed" : "Register Now"}
          </button>
        </div>
      </div>

      {/* ─── Description ─── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
            className="flex items-center justify-between w-full px-6 py-5 hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-lg md:text-xl font-bold text-gray-900">รายละเอียดกิจกรรม</h2>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                isDescriptionOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDescriptionOpen && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <p className="text-sm md:text-base text-gray-600 leading-relaxed whitespace-pre-line pt-4">
                {eventData?.eventDesc || "ไม่มีรายละเอียดกิจกรรม"}
              </p>
            </div>
          )}
        </div>

        {/* ─── Location Map ─── */}
        {eventData?.images?.imgMap && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">แผนที่สถานที่จัดงาน</h2>
            </div>
            <div className="overflow-hidden">
              <EventCardImage
                imageCard={eventData.images.imgMap}
                eventName={`Map of ${eventData.eventName}`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}