"use client";
import { useRouter } from "next/navigation";
import { FormatDate } from "@/utils/format";
import { EventCardImage } from "@/utils/getImage";

export default function EventCard({ event }) {
  const router = useRouter();

  const isPastEvent = () => {
    if (!event.endDate) return false;
    const endDate = new Date(event.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    return endDate < today;
  };

  const isEventPast = isPastEvent();

  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition flex flex-col h-full ${
        isEventPast ? 'opacity-60' : ''
      }`}
    >
      <div className="relative">
        <div className={isEventPast ? 'grayscale' : ''}>
          <EventCardImage
            imageCard={event?.images?.imgCard}
            eventName={event.eventName}
          />
        </div>
        {isEventPast && (
          <div className="absolute top-3 right-3 bg-red-700 text-white px-3 py-1 rounded-full text-xs font-medium">
            Event Ended
          </div>
        )}
        <div className="hidden h-48 w-full bg-gray-200 items-center justify-center text-gray-500">
          No Image
        </div>
      </div>

      <div className="p-4 md:p-5 flex flex-col flex-1">
        <p className={`text-xs md:text-sm mb-1 ${
          isEventPast ? 'text-gray-500' : 'text-gray-600'
        }`}>
          {`${FormatDate(event.startDate)} - ${FormatDate(event.endDate)}` ||
            "Date Unavailable"}
        </p>
        <h3 className={`text-base md:text-lg font-semibold mb-2 md:mb-3 line-clamp-2 ${
          isEventPast ? 'text-gray-500' : 'text-gray-900'
        }`}>
          {event.eventName || "Event Title"}
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-auto">
          <p className={`text-xs md:text-sm line-clamp-1 ${
            isEventPast ? 'text-gray-500' : 'text-gray-600'
          }`}>
            Location : {event.location || "No Location"}
          </p>
          <button
            className={`px-4 md:px-5 py-1.5 rounded-full text-xs md:text-sm font-medium transition whitespace-nowrap ${
              isEventPast 
                ? 'bg-gray-400 hover:bg-gray-500 text-white' 
                : 'bg-blue-400 hover:bg-blue-500 text-white'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/event/${event.id}`);
            }}
          >
            {isEventPast ? 'View Details' : 'Read More'}
          </button>
        </div>
      </div>
    </div>
  );
}