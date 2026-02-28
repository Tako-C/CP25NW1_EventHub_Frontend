import { Gift, Calendar, MapPin, ChevronRight } from "lucide-react";
import { FormatDate } from "@/utils/format";
import { EventCardImage } from "@/utils/getImage";

export default function RewardEventCard({ event, onClick }) {
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
            <Gift className="w-5 h-5" />
            View Rewards
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 min-h-[3.5rem]">
          {event.eventName}
        </h3>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 text-gray-600">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">
              {event.startDate ? FormatDate(event.startDate) : "TBA"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm line-clamp-1">
              {event.location || "Online"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100">
          <Gift className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-gray-600">
            จัดการรางวัลของ Event นี้
          </span>
        </div>
      </div>
    </div>
  );
}