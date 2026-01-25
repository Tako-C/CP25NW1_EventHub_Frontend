import {
  ClipboardList,
  Calendar,
  MapPin,
  FileText,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { FormatDate } from "@/utils/format"; 
import { EventCardImage } from "@/utils/getImage"; 

export default function SurveyEventCard({ event, onClick }) {
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