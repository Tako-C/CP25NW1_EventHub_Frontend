// import { useState, useMemo } from "react";
// import {
//   Calendar,
//   MapPin,
//   MessageSquare,
//   ClipboardCheck,
//   Ticket,
//   Filter,
// } from "lucide-react";
// import { FormatDate } from "@/utils/format";
// import { EventCardImage, QrCodeImage } from "@/utils/getImage";
// import { useRouter } from "next/navigation";

// export default function MyEventPage({ events }) {
//   const router = useRouter();
//   const [selectedRole, setSelectedRole] = useState("ALL");

//   const availableRoles = useMemo(() => {
//     if (!events || !Array.isArray(events)) return ["ALL"];
//     const roles = events.map(
//       (event) => event.eventRole?.toUpperCase() || "VISITOR",
//     );
//     return ["ALL", ...new Set(roles)];
//   }, [events]);

//   const filteredEvents = useMemo(() => {
//     if (selectedRole === "ALL") return events;
//     return events.filter(
//       (event) => (event.eventRole?.toUpperCase() || "VISITOR") === selectedRole,
//     );
//   }, [events, selectedRole]);

//   return (
//     <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
//       <div className="mb-6 border-b border-gray-100 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
//             ประวัติ Events
//           </h2>
//           <p className="text-gray-500 text-sm mt-1">
//             Events ที่คุณลงทะเบียนเข้าร่วม
//           </p>
//         </div>

//         <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
//           <Filter size={16} className="text-gray-400" />
//           <span className="text-xs font-bold text-gray-400 uppercase tracking-wider"></span>
//           <select
//             value={selectedRole}
//             onChange={(e) => setSelectedRole(e.target.value)}
//             className="bg-transparent text-gray-700 text-sm font-bold outline-none cursor-pointer"
//           >
//             {availableRoles.map((role) => (
//               <option key={role} value={role}>
//                 {role === "ALL" ? "ALL EVENTS" : role}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {filteredEvents.length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-64 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-4">
//           <Calendar className="w-12 h-12 text-gray-300 mb-2" />
//           <p className="text-gray-500 text-lg font-medium">ยังไม่มี Events</p>
//           <p className="text-gray-400 text-sm">
//             ลองเปลี่ยนตัวกรอง หรือลงทะเบียนเข้าร่วม Event
//           </p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {filteredEvents.map((event, index) => {
//             const isStaffOrOrganizer = ["STAFF", "ORGANIZER"].includes(
//               event.eventRole?.toUpperCase(),
//             );
//             return (
//               <div
//                 key={index}
//                 className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow duration-300 relative overflow-hidden"
//               >
//                 <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500 rounded-l-2xl"></div>

//                 <div className="flex-shrink-0 w-full sm:w-40 md:w-48 h-44 sm:h-32 md:h-36 bg-gray-100 rounded-xl overflow-hidden relative">
//                   <EventCardImage
//                     imageCard={event.imageCard}
//                     eventName={event.eventName}
//                   />
//                   {event.isEnded && (
//                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
//                       <span className="text-white font-bold uppercase border-2 border-white px-3 py-1 rounded text-xs">
//                         จบแล้ว
//                       </span>
//                     </div>
//                   )}
//                 </div>

//                 <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
//                   <div>
//                     <div className="flex items-start justify-between gap-2 mb-2">
//                       <h3
//                         className="text-base md:text-lg font-bold text-gray-900 line-clamp-2 min-w-0"
//                         title={event.eventName}
//                       >
//                         {event.eventName}
//                       </h3>
//                       <span
//                         className={`flex-shrink-0 px-2.5 py-1 text-xs font-bold uppercase rounded-full ${
//                           isStaffOrOrganizer
//                             ? "bg-indigo-100 text-indigo-700"
//                             : "bg-purple-100 text-purple-700"
//                         }`}
//                       >
//                         {event.eventRole || "Visitor"}
//                       </span>
//                     </div>

//                     <div className="space-y-1.5">
//                       <p className="text-gray-600 flex items-center gap-2 text-sm">
//                         <Calendar size={14} className="text-purple-500 flex-shrink-0" />
//                         <span>{FormatDate(event.startDate || event.dateStart, "thaiShort")}</span>
//                       </p>
//                       {event.location && (
//                         <p className="text-gray-600 flex items-start gap-2 text-sm">
//                           <MapPin size={14} className="text-purple-500 flex-shrink-0 mt-0.5" />
//                           <span className="line-clamp-1 min-w-0">{event.location}</span>
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="flex flex-wrap gap-2 mt-3">
//                     {isStaffOrOrganizer ? (
//                       <button
//                         onClick={() => router.push(`/staff/event/check-in?eventId=${event.eventId}`)}
//                         className="flex items-center gap-1.5 bg-purple-700 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-95"
//                       >
//                         <ClipboardCheck size={14} />
//                         Manual Check-in
//                       </button>
//                     // ) : !event.postSurveyCompleted && event.hasPostSurvey && (event?.statusOnPostVisitorSurvey === "active" || event?.statusOnPostExhibitorSurvey === "active") ? (
//                     ) : !event.postSurveyCompleted && event.hasPostSurvey && (
//                         ((!event.eventRole || event.eventRole.toUpperCase() === "VISITOR") && event?.statusOnPostVisitorSurvey === "active") ||
//                         (event.eventRole?.toUpperCase() === "EXHIBITOR" && event?.statusOnPostExhibitorSurvey === "active")
//                       ) ? (
//                       <button
//                         onClick={() => router.push(`/event/${event?.eventId}/survey/post`)}
//                         className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-95"
//                       >
//                         <MessageSquare size={14} />
//                         ให้คะแนน Event
//                       </button>
//                     ) : event.postSurveyCompleted ? (
//                       <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm font-medium border border-green-100">
//                         <span>✓</span> ส่งความคิดเห็นหลังเข้าร่วมงานแล้ว
//                       </div>
//                     ) : (
//                       <div className="flex items-center gap-1.5 text-gray-400 bg-gray-50 px-3 py-2 rounded-lg text-sm border border-gray-100">
//                         ยังไม่เปิดรับความคิดเห็นหลังเข้าร่วมงาน
//                       </div>
//                     )}
//                     {/* {event.hasPreSurvey && !event.preSurveyCompleted && event.statusOnPreSurvey === "active" && (!event.eventRole || ["VISITOR", "EXHIBITOR"].includes(event.eventRole.toUpperCase())) && (
//                     // {event.hasPreSurvey && !event.preSurveyCompleted && event.statusOnPreSurvey === "active" && (
//                       <button
//                         onClick={() => router.push(`/event/${event?.eventId}/registration?mode=survey-only`)}
//                         className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-95"
//                       >
//                         <MessageSquare size={14} />
//                         แบบทดสอบก่อนเข้าร่วมงาน
//                       </button>
//                     )}
//                     {event.hasPreSurvey && event.preSurveyCompleted && (!event.eventRole || ["VISITOR", "EXHIBITOR"].includes(event.eventRole.toUpperCase())) && (
//                     // {event.hasPreSurvey && event.preSurveyCompleted && (
//                       <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium border border-blue-100">
//                         <span>✓</span> ทำแบบทดสอบก่อนเข้าร่วมงานแล้ว
//                       </div>
//                     )} */}
//                     {event.hasPreSurvey && (!event.eventRole || ["VISITOR", "EXHIBITOR"].includes(event.eventRole.toUpperCase())) && (
//                       event.preSurveyCompleted ? (
//                         <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium border border-blue-100">
//                           <span>✓</span> ทำแบบทดสอบก่อนเข้าร่วมงานแล้ว
//                         </div>
//                       ) : event.statusOnPreSurvey === "active" ? (
//                         <button
//                           onClick={() => router.push(`/event/${event?.eventId}/registration?mode=survey-only`)}
//                           className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-95"
//                         >
//                           <MessageSquare size={14} />
//                           แบบทดสอบก่อนเข้าร่วมงาน
//                         </button>
//                       ) : (
//                         <div className="flex items-center gap-1.5 text-gray-400 bg-gray-50 px-3 py-2 rounded-lg text-sm border border-gray-100 cursor-not-allowed">
//                           ยังไม่เปิดรับความคิดเห็นก่อนเข้าร่วมงาน
//                         </div>
//                       )
//                     )}
//                   </div>
//                 </div>

//                 {event.eventRole?.toUpperCase() !== "ORGANIZER" && event.eventRole?.toUpperCase() !== "STAFF"  && (
//                   <>
//                     <div className="sm:hidden w-full h-px bg-gray-100"></div>
//                     <div className="hidden sm:block w-px bg-gray-100 self-stretch"></div>
//                     <div className="flex-shrink-0 flex flex-col items-center justify-center gap-2 sm:pl-2">
//                       <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
//                         <Ticket size={12} />
//                         ตั๋วของคุณ
//                       </p>
//                       <div className="p-1.5 bg-white border border-gray-100 rounded-xl shadow-sm">
//                         <QrCodeImage
//                           qrCodeUrl={event.qrCodeUrl}
//                           isEnded={event.isEnded}
//                           status={event.status}
//                         />
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }




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

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default function MyEventPage({ events }) {
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
            ประวัติ Events
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Events ที่คุณลงทะเบียนเข้าร่วม
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
          <p className="text-gray-500 text-lg font-medium">ยังไม่มี Events</p>
          <p className="text-gray-400 text-sm">
            ลองเปลี่ยนตัวกรอง หรือลงทะเบียนเข้าร่วม Event
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event, index) => {
            const isStaffOrOrganizer = ["STAFF", "ORGANIZER"].includes(
              event.eventRole?.toUpperCase(),
            );
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow duration-300 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500 rounded-l-2xl"></div>

                <div className="flex-shrink-0 w-full sm:w-40 md:w-48 h-44 sm:h-32 md:h-36 bg-gray-100 rounded-xl overflow-hidden relative">
                  <EventCardImage
                    imageCard={event.imageCard}
                    eventName={event.eventName}
                  />
                  {event.isEnded && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white font-bold uppercase border-2 border-white px-3 py-1 rounded text-xs">
                        จบแล้ว
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3
                        className="text-base md:text-lg font-bold text-gray-900 line-clamp-2 min-w-0"
                        title={event.eventName}
                      >
                        {event.eventName}
                      </h3>
                      <span
                        className={`flex-shrink-0 px-2.5 py-1 text-xs font-bold uppercase rounded-full ${
                          isStaffOrOrganizer
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {event.eventRole || "Visitor"}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-gray-600 flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-purple-500 flex-shrink-0" />
                        <span>{FormatDate(event.startDate || event.dateStart, "thaiShort")}</span>
                      </p>
                      {event.location && (
                        <p className="text-gray-600 flex items-start gap-2 text-sm">
                          <MapPin size={14} className="text-purple-500 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1 min-w-0">{event.location}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {isStaffOrOrganizer ? (
                      <button
                        onClick={() => router.push(`/staff/event/check-in?eventId=${event.eventId}`)}
                        className="flex items-center gap-1.5 bg-purple-700 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-95"
                      >
                        <ClipboardCheck size={14} />
                        Manual Check-in
                      </button>
                    ) : (() => {
                      const role = event.eventRole?.toUpperCase() || "VISITOR";
                      const statusForRole = role === "EXHIBITOR" ? event.statusOnPostExhibitorSurvey : event.statusOnPostVisitorSurvey;
                      
                      // ถ้าไม่มีการสร้าง survey สำหรับ role นี้ ให้ซ่อนปุ่ม
                      // if (!event.hasPostSurvey || !statusForRole) return null;

                      const now = dayjs();
                      const eventStartDate = dayjs.utc(event.startDate || event.dateStart).local();
                      
                      // ถ้าเวลายังไม่ถึงเวลาเริ่มงาน หรือไม่มีการสร้าง survey สำหรับ role นี้ ให้ซ่อนปุ่ม
                      if (now.isBefore(eventStartDate) || !event.hasPostSurvey || !statusForRole) return null;
                      
                      if (event.postSurveyCompleted) {
                        return (
                          <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm font-medium border border-green-100">
                            <span>✓</span> ส่งความคิดเห็นหลังเข้าร่วมงานแล้ว
                          </div>
                        );
                      }

                      if (statusForRole === "active") {
                        return (
                          <button
                            onClick={() => router.push(`/event/${event?.eventId}/survey/post`)}
                            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-95"
                          >
                            <MessageSquare size={14} />
                            ให้คะแนน Event
                          </button>
                        );
                      }

                      return (
                        <div className="flex items-center gap-1.5 text-gray-400 bg-gray-50 px-3 py-2 rounded-lg text-sm border border-gray-100 cursor-not-allowed">
                          ยังไม่เปิดรับความคิดเห็นหลังเข้าร่วมงาน
                        </div>
                      );
                    })()}

                    {(() => {
                      const role = event.eventRole?.toUpperCase() || "VISITOR";
                      
                      // ถ้าไม่ใช่ visitor/exhibitor หรือไม่มีการตั้งค่า Pre-Survey ให้ซ่อน
                      if (!event.hasPreSurvey || !["VISITOR", "EXHIBITOR"].includes(role) || !event.statusOnPreSurvey) return null;

                      if (event.preSurveyCompleted) {
                        return (
                          <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium border border-blue-100">
                            <span>✓</span> ทำแบบทดสอบก่อนเข้าร่วมงานแล้ว
                          </div>
                        );
                      }

                      if (event.statusOnPreSurvey === "active") {
                        return (
                          <button
                            onClick={() => router.push(`/event/${event?.eventId}/registration?mode=survey-only`)}
                            className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-95"
                          >
                            <MessageSquare size={14} />
                            แบบทดสอบก่อนเข้าร่วมงาน
                          </button>
                        );
                      }

                      return (
                        <div className="flex items-center gap-1.5 text-gray-400 bg-gray-50 px-3 py-2 rounded-lg text-sm border border-gray-100 cursor-not-allowed">
                          ยังไม่เปิดรับความคิดเห็นก่อนเข้าร่วมงาน
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {event.eventRole?.toUpperCase() !== "ORGANIZER" && event.eventRole?.toUpperCase() !== "STAFF"  && (
                  <>
                    <div className="sm:hidden w-full h-px bg-gray-100"></div>
                    <div className="hidden sm:block w-px bg-gray-100 self-stretch"></div>
                    <div className="flex-shrink-0 flex flex-col items-center justify-center gap-2 sm:pl-2">
                      <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Ticket size={12} />
                        ตั๋วของคุณ
                      </p>
                      <div className="p-1.5 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <QrCodeImage
                          qrCodeUrl={event.qrCodeUrl}
                          isEnded={event.isEnded}
                          status={event.status}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}