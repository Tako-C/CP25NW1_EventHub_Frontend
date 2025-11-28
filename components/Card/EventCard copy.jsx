"use client";
import { useRouter } from "next/navigation";
import { FormatDate } from "@/utils/format";
import { EventCardImage } from "@/utils/getImage";

export default function EventCard({ event }) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition flex flex-col h-full">
      <div className="relative">
        <EventCardImage
          imageCard={event?.images?.imgCard}
          eventName={event.eventName}
        />
        <div className="hidden h-48 w-full bg-gray-200 items-center justify-center text-gray-500">
          No Image
        </div>
      </div>

      <div className="p-4 md:p-5 flex flex-col flex-1">
        <p className="text-xs md:text-sm text-gray-600 mb-1">
          {`${FormatDate(event.startDate)} - ${FormatDate(event.endDate)}` ||
            "Date Unavailable"}
        </p>
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3 line-clamp-2">
          {event.eventName || "Event Title"}
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-auto">
          <p className="text-xs md:text-sm text-gray-600 line-clamp-1">
            Location : {event.location || "No Location"}
          </p>
          <button
            className="bg-blue-400 hover:bg-blue-500 text-white px-4 md:px-5 py-1.5 rounded-full text-xs md:text-sm font-medium transition whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/event/${event.id}`);
            }}
          >
            Read More
          </button>
        </div>
      </div>
    </div>
  );
}
