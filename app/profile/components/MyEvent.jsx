import { FormatDate } from "@/utils/format";
import { EventCardImage, QrCodeImage } from "@/utils/getImage";

export default function MyEventPage({ events }) {
  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
      {events.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 text-xl">No registered events.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((event, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 flex gap-6">
              <div className="flex-shrink-0 w-64 h-48 bg-white rounded-lg flex items-center justify-center border-2 border-gray-200">
                <EventCardImage
                  imageCard={event.imageCard}
                  eventName={event.eventName}
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-3">{event.eventName}</h3>
                  <p className="text-lg mb-4">
                    <span className="font-semibold">Event Date Start : </span>
                    <span
                      className={
                        event.isEnded ? "text-red-600 font-semibold" : ""
                      }
                    >
                      {event.isEnded
                        ? "Event Ended"
                        : FormatDate(event.dateStart)}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    disabled={event.feedbackSubmitted}
                    className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                      event.feedbackSubmitted
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-blue-900 text-white hover:bg-blue-800"
                    }`}
                  >
                    Feedback
                  </button>
                  <span className="text-gray-500">
                    {event.feedbackSubmitted
                      ? "Form has been Submitted!"
                      : "Tell us what you think here!"}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 w-32 flex flex-col items-center justify-center">
                <QrCodeImage
                  qrCodeUrl={event.qrCodeUrl}
                  isEnded={event.isEnded}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
