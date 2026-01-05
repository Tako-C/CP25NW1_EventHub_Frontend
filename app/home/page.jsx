"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Pause,
  Play,
} from "lucide-react";

import { FormatDate } from "@/utils/format";
import { getDataNoToken } from "@/libs/fetch";
import EventCard from "@/components/Card/EventCard";
import { EventCardImage } from "@/utils/getImage";
import "./animations.css";

const mockFeedbackData = [];

export default function Page() {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [feedbackData, setFeedbackData] = useState([]);

  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!isAutoPlay || isHovered || eventData.length === 0) return;

    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % eventData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, isHovered, eventData.length]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDataNoToken("events");
      const fetchedEvents = res.data || [];
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

  const categories = useMemo(() => {
    const types = eventData
      .map((event) => event.eventTypeId?.eventTypeName)
      .filter((type) => type);

    return ["All", ...new Set(types)];
  }, [eventData]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === "All") return eventData;

    return eventData.filter(
      (event) => event.eventTypeId?.eventTypeName === selectedCategory
    );
  }, [selectedCategory, eventData]);

  const nextEvent = () => {
    if (eventData.length === 0) return;
    setCurrentEventIndex((prev) => (prev + 1) % eventData.length);
  };

  const prevEvent = () => {
    if (eventData.length === 0) return;
    setCurrentEventIndex(
      (prev) => (prev - 1 + eventData.length) % eventData.length
    );
  };

  const goToSlide = (index) => {
    setCurrentEventIndex(index);
  };

  const currentEvent = eventData[currentEventIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        id="home"
        className="relative h-[80vh] md:h-screen overflow-hidden bg-slate-900"
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <>
            <div className="absolute inset-0">
              {eventData.map((event, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                    index === currentEventIndex
                      ? "opacity-100 z-0"
                      : "opacity-0 -z-10"
                  }`}
                >
                  <EventCardImage
                    imageCard={event?.images?.imgSlideShow}
                    eventName={event?.eventName}
                  />
                </div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
            </div>

            <div
              className="relative h-full flex items-center justify-center px-4"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="max-w-5xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6 animate-fade-in">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-white/90 text-sm font-medium">
                    Featured Event
                  </span>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-slide-up leading-tight drop-shadow-lg">
                  {currentEvent?.eventName || "Event Title"}
                </h1>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8 text-white/90 animate-slide-up animation-delay-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    <span className="text-base md:text-lg">
                      {currentEvent?.location || "Location"}
                    </span>
                  </div>
                  <div className="hidden md:block w-1 h-1 bg-white/40 rounded-full" />
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    <span className="text-base md:text-lg">
                      {currentEvent
                        ? `${FormatDate(currentEvent.startDate)} - ${FormatDate(
                            currentEvent.endDate
                          )}`
                        : "Date Unavailable"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    currentEvent?.id && router.push(`/event/${currentEvent.id}`)
                  }
                  className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl animate-slide-up animation-delay-300"
                >
                  <span className="flex items-center gap-2">
                    Explore Event
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>

              <button
                onClick={prevEvent}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all duration-300 group z-10"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
              </button>

              <button
                onClick={nextEvent}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all duration-300 group z-10"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
                <div className="flex items-center gap-2 px-4 py-3 bg-black/30 backdrop-blur-md rounded-full">
                  {eventData.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className="group relative"
                      aria-label={`Go to slide ${index + 1}`}
                    >
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentEventIndex
                            ? "w-8 bg-emerald-400"
                            : "w-2 bg-white/40 group-hover:bg-white/60"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* <button
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className="p-3 bg-black/30 hover:bg-black/40 backdrop-blur-md rounded-full transition-all duration-300"
                  aria-label={isAutoPlay ? "Pause autoplay" : "Play autoplay"}
                >
                  {isAutoPlay ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white" />
                  )}
                </button> */}
              </div>

              <div className="absolute top-24 right-4 md:top-8 md:right-8 px-4 py-2 bg-black/30 backdrop-blur-md rounded-full z-10">
                <span className="text-white font-medium">
                  {eventData.length > 0
                    ? `${currentEventIndex + 1} / ${eventData.length}`
                    : "0 / 0"}
                </span>
              </div>
            </div>

            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
              <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
          </>
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
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 md:px-6 py-2 rounded-full transition text-sm md:text-base ${
                selectedCategory === category
                  ? "bg-blue-900 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredEvents?.length > 0 ? (
            filteredEvents.map((event, idx) => (
              <EventCard key={idx} event={event} />
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
              <p className="text-gray-500 text-base md:text-lg">
                No events available for this category
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
