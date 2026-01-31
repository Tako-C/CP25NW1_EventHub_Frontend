"use client";
import { useRouter } from "next/navigation";
import { FormatDate } from "@/utils/format";
import { EventCardImage } from "@/utils/getImage";

export default function EventCard({ event }) {
  const router = useRouter();

  const isEventPast = event.status === "FINISHED";

  return (
    <div 
      onClick={() => router.push(`/event/${event.id}`)}
      className={`group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full min-h-[300px] cursor-pointer overflow-hidden ${
        isEventPast ? 'opacity-70' : ''
      }`}
    >
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <div className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${isEventPast ? 'grayscale' : ''}`}>
          <EventCardImage
            imageCard={event?.images?.imgCard || event?.imageCard}
            eventName={event.eventName}
          />
        </div>
        
        {isEventPast && (
          <div className="absolute top-3 right-3 bg-red-600 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
            Event Ended
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className={`text-lg font-bold mb-3 line-clamp-1 transition-colors ${
          isEventPast ? 'text-gray-500' : 'text-gray-900 group-hover:text-blue-600'
        }`}>
          {event.eventName || "Untitled Event"}
        </h3>

        <div className="space-y-3 mt-auto">
          <div className="flex flex-col gap-1">
            <p className={`text-xs font-medium uppercase tracking-wider ${isEventPast ? 'text-gray-400' : 'text-blue-500'}`}>
              Date & Location
            </p>
            <p className="text-sm text-gray-600 font-medium">
              {event.startDate ? FormatDate(event.startDate) : 'TBA'}
            </p>
            <p className="text-sm text-gray-500 line-clamp-1">
              {event.location || "Online Event"}
            </p>
          </div>
          
          <div className="pt-2">
            <button 
              className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                isEventPast 
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white shadow-md shadow-blue-100 group-hover:bg-blue-700 group-hover:shadow-blue-200 active:scale-[0.98]'
              }`}
            >
              {isEventPast ? 'VIEW DETAIL' : 'READ MORE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}