"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormatDate } from "@/utils/format";
import { getData } from "@/libs/fetch";

// Test data
const mockEventData = {
  title: "FOODS AND BEVERAGES\nASIA EXPO",
  location: "BANGKOK, THAILAND",
  date: "26 - 30 May 2025",
  images: [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop", 
    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200&h=600&fit=crop", 
    "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1200&h=600&fit=crop", 
  ],
};

const mockFeedbackData = [
  {
    title: "Food & Beverage Innovation Expo 2025",
    description: "Share your experience at the latest F&B innovation showcase",
    category: "Foods",
  },
  {
    title: "Thailand Coffee Festival",
    description: "Tell us about your coffee tasting journey",
    category: "Foods",
  },
  {
    title: "Asian Street Food Summit",
    description: "Rate your favorite street food discoveries",
    category: "Foods",
  },
];

export default function Page() {
  const [currentEventIndex, setCurrentEventIndex] = useState(0); 
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Foods");
  const [feedbackData, setFeedbackData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []); 

  const nextEvent = () => {
    if (eventData.length === 0) return;
    setCurrentEventIndex((prev) => (prev + 1) % eventData.length);
    setCurrentImageIndex(0);
  };

  const prevEvent = () => {
    if (eventData.length === 0) return;
    setCurrentEventIndex(
      (prev) => (prev - 1 + eventData.length) % eventData.length
    );
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (mockEventData.images.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % mockEventData.images.length);
  };

  const prevImage = () => {
    if (mockEventData.images.length === 0) return;
    setCurrentImageIndex(
      (prev) =>
        (prev - 1 + mockEventData.images.length) % mockEventData.images.length
    );
  };

  const filteredFeedback = feedbackData.filter(
    (feedback) => feedback.category === selectedCategory
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getData("events");
      const fetchedEvents = res.data || [];
      console.log(fetchedEvents)
      setEventData(fetchedEvents);
      setFeedbackData(mockFeedbackData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setEventData([]);
      setFeedbackData([]);
    } finally {
      setLoading(false);
    }
  };

  const currentImageUrl =
    mockEventData.images.length > 0
      ? mockEventData.images[currentImageIndex]
      : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        id="home"
        className="bg-gradient-to-br from-teal-100 to-teal-200 py-8 md:py-16 px-4 md:px-8"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 mt-18">
          <div className="w-full md:flex-1 text-center">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 md:h-12 bg-gray-300 rounded mb-4 mx-auto w-3/4"></div>
                <div className="h-4 md:h-6 bg-gray-300 rounded mx-auto w-1/2"></div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 whitespace-pre-line">
                  {eventData[currentEventIndex]?.eventName || "Event Title"}
                </h1>
                <div className="flex items-center justify-center gap-2 md:gap-4 mb-2">
                  <div className="h-0.5 w-12 md:w-24 bg-gray-800"></div>
                  <p className="text-base md:text-xl font-semibold text-gray-800">
                    {eventData[currentEventIndex]?.location || "Event Location"}
                  </p>
                  <div className="h-0.5 w-12 md:w-24 bg-gray-800"></div>
                </div>
                <p className="text-lg md:text-2xl text-gray-700 mt-4">
                  {eventData[currentEventIndex]
                    ? `${FormatDate(
                        eventData[currentEventIndex]?.startDate
                      )} - ${FormatDate(eventData[currentEventIndex]?.endDate)}`
                    : "Date Unavailable"}
                </p>
              </>
            )}
          </div>

          <div className="w-full md:flex-1 relative">
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              {loading ? (
                <div className="w-full h-64 md:h-80 bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-base md:text-lg">
                    Loading...
                  </span>
                </div>
              ) : currentImageUrl ? (
                <>
                  <img
                    src={currentImageUrl}
                    alt="Expo event"
                    className="w-full h-64 md:h-80 object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="w-full h-64 md:h-80 bg-gray-300 hidden items-center justify-center">
                    <span className="text-gray-500 text-base md:text-lg">
                      Image Error
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-64 md:h-80 bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-base md:text-lg">
                    No Image Available
                  </span>
                </div>
              )}

              {mockEventData.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-blue-900 hover:bg-blue-800 text-white rounded-full p-2 md:p-3 shadow-lg transition"
                  >
                    ◀
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-blue-900 hover:bg-blue-800 text-white rounded-full p-2 md:p-3 shadow-lg transition"
                  >
                    ▶
                  </button>

                  <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {mockEventData.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition ${
                          idx === currentImageIndex
                            ? "bg-white w-6"
                            : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {eventData.length > 1 && (
          <div className="max-w-7xl mx-auto flex justify-between mt-8">
            <button
              onClick={prevEvent}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
            >
              Previous Event
            </button>
            <button
              onClick={nextEvent}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
            >
              Next Event
            </button>
          </div>
        )}
      </section>

      <section
        id="events"
        className="max-w-7xl mx-auto py-8 md:py-16 px-4 md:px-8"
      >
        <div className="text-center mb-6 md:mb-8 mt-10">
          <div className="inline-block">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Events & Upcoming Events
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12">
          <button className="px-4 md:px-6 py-2 bg-blue-900 text-white rounded-full hover:bg-blue-800 transition text-sm md:text-base">
            Foods
          </button>
          <button className="px-4 md:px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition text-sm md:text-base">
            Entertainment
          </button>
          <button className="px-4 md:px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition text-sm md:text-base">
            Electronics
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {eventData?.length > 0 ? (
            eventData?.map((event, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition flex flex-col"
              >
                <img
                  src={
                    "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1200&h=600&fit-crop"
                  }
                  alt={event.eventName || "Event"}
                  className="h-48 w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="p-4 md:p-5 flex flex-col flex-1">
                  <p className="text-xs md:text-sm text-gray-600 mb-1">
                    {`${FormatDate(event.startDate)} - ${FormatDate(
                      event.endDate
                    )}` || "null"}
                  </p>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3 line-clamp-2">
                    {event.eventName || "null"}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-auto">
                    <p className="text-xs md:text-sm text-gray-600 line-clamp-1">
                      Location : {event.location || "No Location"}
                    </p>
                    <button
                      className="bg-blue-400 hover:bg-blue-500 text-white px-4 md:px-5 py-1.5 rounded-full text-xs md:text-sm font-medium transition whitespace-nowrap"
                      onClick={() => router.push(`/event/${event.id}`)}
                    >
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
              <p className="text-gray-500 text-base md:text-lg">
                No events available
              </p>
            </div>
          )}
        </div>
      </section>

      <section id="feedback" className="bg-white py-8 md:py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
            Event Feedback
          </h2>

          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12">
            <button
              onClick={() => setSelectedCategory("Foods")}
              className={`px-4 md:px-6 py-2 rounded-full transition text-sm md:text-base ${
                selectedCategory === "Foods"
                  ? "bg-blue-900 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Foods
            </button>
            <button
              onClick={() => setSelectedCategory("Entertainment")}
              className={`px-4 md:px-6 py-2 rounded-full transition text-sm md:text-base ${
                selectedCategory === "Entertainment"
                  ? "bg-blue-900 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Entertainment
            </button>
            <button
              onClick={() => setSelectedCategory("Electronics")}
              className={`px-4 md:px-6 py-2 rounded-full transition text-sm md:text-base ${
                selectedCategory === "Electronics"
                  ? "bg-blue-900 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Electronics
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredFeedback.length > 0 ? (
              filteredFeedback.map((feedback, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4">
                      <svg
                        className="w-16 h-16"
                        viewBox="0 0 64 64"
                        fill="none"
                      >
                        <rect
                          x="8"
                          y="20"
                          width="32"
                          height="24"
                          rx="2"
                          fill="#60A5FA"
                        />
                        <path
                          d="M12 24h24M12 28h20M12 32h16"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M44 30l8 8-8 8"
                          stroke="#10B981"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path d="M48 44c4 0 8-4 8-8s-4-8-8-8" fill="#10B981" />
                        <path
                          d="M54 38l4-4-4-4"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feedback.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {feedback.description}
                    </p>
                    <button className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-full text-sm font-medium transition">
                      Start
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
                <p className="text-gray-500 text-base md:text-lg">
                  No feedback forms available
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
