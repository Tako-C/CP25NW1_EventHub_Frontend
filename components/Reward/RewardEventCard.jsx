import { Gift, Calendar, MapPin, ChevronRight } from "lucide-react";
import { FormatDate } from "@/utils/format";
import { EventCardImage } from "@/utils/getImage";

export default function RewardEventCard({ event, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
    >
      <div className="relative h-40 overflow-hidden flex-shrink-0">
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
          <EventCardImage imageCard={event?.images?.imgCard} eventName={event.eventName} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-1.5 shadow-lg">
            <Gift className="w-4 h-4" />
            View Rewards
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-1 group-hover:text-amber-600 transition-colors">
          {event.eventName}
        </h3>

        <div className="space-y-1 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <span className="truncate">{event.startDate ? FormatDate(event.startDate) : "TBA"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <span className="truncate">{event.location || "Online"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <Gift className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-500">จัดการรางวัลของ Event นี้</span>
        </div>
      </div>
    </div>
  );
}