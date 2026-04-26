import { Calendar, MapPin, FileText, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { FormatDate } from "@/utils/format";
import { EventCardImage } from "@/utils/getImage";

export default function SurveyEventCard({ event, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* Image — h-48 same as Event & Reward cards */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
          <EventCardImage imageCard={event?.images?.imgCard} eventName={event.eventName} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-1.5 shadow-lg">
            <FileText className="w-4 h-4" />
            View Surveys
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Content — p-5 same as Event & Reward cards */}
      <div className="p-5 flex flex-col gap-2.5">
        <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors">
          {event.eventName}
        </h3>

        <div className="space-y-1.5 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <span>{event.startDate ? FormatDate(event.startDate) : "TBA"}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400 mt-0.5" />
            <span>{event.location || "Online"}</span>
          </div>
        </div>

        {/* Survey badges */}
        <div className="flex gap-3 pt-3 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-1.5 flex-1">
            {event.hasPreSurvey && event.statusOnPreSurvey === "active"
              ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              : <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />}
            <span className={`text-sm font-medium ${event.hasPreSurvey ? "text-gray-700" : "text-gray-400"}`}>
              Pre-Survey
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-1">
            {event.hasPostSurvey && (event?.statusOnPostVisitorSurvey === "active" || event?.statusOnPostExhibitorSurvey === "active")
              ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              : <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />}
            <span className={`text-sm font-medium ${event.hasPostSurvey ? "text-gray-700" : "text-gray-400"}`}>
              Post-Survey
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}