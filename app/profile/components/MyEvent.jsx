import { useState, useMemo } from "react";
import {
  Calendar,
  MapPin,
  MessageSquare,
  ClipboardCheck,
  Ticket,
  Filter,
} from "lucide-react";
import { FormatDate } from "@/utils/format";
import { EventCardImage, QrCodeImage } from "@/utils/getImage";
import { useRouter } from "next/navigation";

export default function MyEventPage({ events }) {
  console.log(events)
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("ALL");

  const availableRoles = useMemo(() => {
    if (!events || !Array.isArray(events)) return ["ALL"];
    const roles = events.map(
      (event) => event.eventRole?.toUpperCase() || "VISITOR",
    );
    return ["ALL", ...new Set(roles)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (selectedRole === "ALL") return events;
    return events.filter(
      (event) => (event.eventRole?.toUpperCase() || "VISITOR") === selectedRole,
    );
  }, [events, selectedRole]);

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 border-b border-gray-100 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            Events History
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Events you have registered for
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
          <Filter size={16} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider"></span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-transparent text-gray-700 text-sm font-bold outline-none cursor-pointer"
          >
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role === "ALL" ? "ALL EVENTS" : role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-4">
          <Calendar className="w-12 h-12 text-gray-300 mb-2" />
          <p className="text-gray-500 text-lg font-medium">No events found.</p>
          <p className="text-gray-400 text-sm">
            Try changing your filter or join an event.
          </p>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {filteredEvents.map((event, index) => {
            const isStaffOrOrganizer = ["STAFF", "ORGANIZER"].includes(
              event.eventRole?.toUpperCase(),
            );

            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 flex flex-col md:flex-row gap-4 md:gap-6 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500 rounded-l-2xl"></div>

                <div className="flex-shrink-0 w-full md:w-60 h-48 md:h-40 bg-gray-100 rounded-xl overflow-hidden relative shadow-inner">
                  <EventCardImage
                    imageCard={event.imageCard}
                    eventName={event.eventName}
                  />
                  {event.isEnded && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white font-bold tracking-wider uppercase border-2 border-white px-3 py-1 rounded text-sm md:text-base">
                        Event Ended
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <h3
                        className="text-lg md:text-xl font-bold text-gray-900 line-clamp-2 sm:line-clamp-1 transition-colors cursor-default"
                        title={event.eventName}
                      >
                        {event.eventName}
                      </h3>
                      <span
                        className={`self-start sm:self-auto flex-shrink-0 px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full ${
                          isStaffOrOrganizer
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {event.eventRole || "Visitor"}
                      </span>
                    </div>

                    <div className="space-y-2 mt-2 md:mt-3">
                      <p className="text-gray-600 flex items-start gap-2 text-sm">
                        <Calendar
                          size={16}
                          className="text-purple-500 mt-0.5 flex-shrink-0"
                        />
                        <span className="font-medium whitespace-nowrap">
                          Date:
                        </span>
                        <span>{FormatDate(event.dateStart)}</span>
                      </p>

                      {event.location && (
                        <p className="text-gray-600 flex items-start gap-2 text-sm">
                          <MapPin
                            size={16}
                            className="text-purple-500 mt-0.5 flex-shrink-0"
                          />
                          <span className="line-clamp-1">{event.location}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-5">
                    {isStaffOrOrganizer ? (
                      <button
                        onClick={() =>
                          router.push(
                            `/staff/event/check-in?eventId=${event.eventId}`,
                          )
                        }
                        className="w-full sm:w-auto justify-center flex items-center gap-2 bg-purple-700 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow active:scale-95"
                      >
                        <ClipboardCheck size={16} />
                        Manual Check-in
                      </button>
                    ) : !event.postSurveyCompleted && event.hasPostSurvey ? (
                      <button
                        onClick={() =>
                          router.push(`/event/${event?.eventId}/survey/post`)
                        }
                        className="w-full sm:w-auto justify-center flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow active:scale-95"
                      >
                        <MessageSquare size={16} />
                        Give Feedback
                      </button>
                    ) : event.postSurveyCompleted ? (
                      <div className="w-full sm:w-auto justify-center flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg text-sm font-medium border border-green-100">
                        <span className="text-lg">✓</span> Feedback Sent
                      </div>
                    ) : (
                      <div className="w-full sm:w-auto justify-center flex items-center gap-2 text-gray-400 bg-gray-50 px-4 py-2 rounded-lg text-sm border border-gray-100">
                        Feedback not available
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:hidden w-full h-px bg-gray-100 my-2"></div>
                <div className="hidden md:block w-px bg-gray-100 mx-2"></div>
                <div className="flex-shrink-0 flex flex-col items-center justify-center gap-3 md:gap-2 min-w-[120px] pt-2 md:pt-0">
                  <div className="flex items-center gap-2 md:hidden text-gray-500 text-sm font-medium">
                    <Ticket size={16} />
                    <span>Your Ticket</span>
                  </div>
                  <div className="p-2 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <QrCodeImage
                      qrCodeUrl={event.qrCodeUrl}
                      isEnded={event.isEnded}
                      status={event.status}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
