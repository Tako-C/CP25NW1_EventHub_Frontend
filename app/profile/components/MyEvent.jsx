import { Calendar, MapPin, MessageSquare, ClipboardCheck } from 'lucide-react';
import { FormatDate } from '@/utils/format';
import { EventCardImage, QrCodeImage } from '@/utils/getImage';
import { useRouter } from 'next/navigation';

export default function MyEventPage({ events }) {
  const router = useRouter();
  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          My Events
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Events you have registered for
        </p>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mb-2" />
          <p className="text-gray-500 text-lg font-medium">
            No registered events found.
          </p>
          <p className="text-gray-400 text-sm">Join an event to see it here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((event, index) => {
            const isStaffOrOrganizer = ['STAFF', 'ORGANIZER'].includes(
              event.eventRole?.toUpperCase()
            );

            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500 rounded-l-2xl"></div>
                <div className="flex-shrink-0 w-full md:w-60 h-40 bg-gray-100 rounded-xl overflow-hidden relative shadow-inner">
                  <EventCardImage
                    imageCard={event.imageCard}
                    eventName={event.eventName}
                  />
                  {event.isEnded && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white font-bold tracking-wider uppercase border-2 border-white px-3 py-1 rounded">
                        Event Ended
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3
                        className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 transition-colors cursor-default"
                        title={event.eventName}
                      >
                        {event.eventName}
                      </h3>
                      <span
                        className={`flex-shrink-0 px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full ${
                          isStaffOrOrganizer
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {event.eventRole || 'Visitor'}
                      </span>
                    </div>

                    <div className="space-y-2 mt-2">
                      <p className="text-gray-600 flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-purple-500" />
                        <span className="font-medium">Date:</span>
                        <span>{FormatDate(event.dateStart)}</span>
                      </p>

                      {event.location && (
                        <p className="text-gray-600 flex items-center gap-2 text-sm">
                          <MapPin size={16} className="text-purple-500" />
                          <span>{event.location}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions (แก้ไข Logic ตรงนี้) */}
                  <div className="flex items-center gap-4 mt-5">
                    {isStaffOrOrganizer ? (
                      // ปุ่มสำหรับ Staff/Organizer
                      <button
                        onClick={() =>
                          router.push(
                            `/staff/event/check-in?eventId=${event.eventId}`
                          )
                        }
                        className="flex items-center gap-2 bg-purple-700 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow active:scale-95"
                      >
                        <ClipboardCheck size={16} />
                        Manual Check-in
                      </button>
                    ) : // Logic เดิมสำหรับ Visitor (Feedback)
                    event.isEnded && !event.feedbackSubmitted ? (
                      <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow active:scale-95">
                        <MessageSquare size={16} />
                        Give Feedback
                      </button>
                    ) : event.feedbackSubmitted ? (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg text-sm font-medium border border-green-100">
                        <span className="text-lg">✓</span> Feedback Sent
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-4 py-2 rounded-lg text-sm border border-gray-100">
                        Feedback not available now
                      </div>
                    )}
                  </div>
                </div>

                {/* QR Section */}
                <div className="hidden md:block w-px bg-gray-100 mx-2"></div>
                <div className="flex-shrink-0 flex flex-col items-center justify-center gap-2 min-w-[120px]">
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
