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
  Gift,
  Tag,
  Clock,
} from "lucide-react";
import Cookies from "js-cookie"; 
import { jwtDecode } from "jwt-decode"; 

import { FormatDate } from "@/utils/format";
import { getDataNoToken } from "@/libs/fetch";
import EventCard from "@/components/Card/EventCard";
import { EventCardImage, RewardImage } from "@/utils/getImage";
import OrganizerEvents from "../organizer/event/components/OrganizerEvents";
import "./animations.css";

const REQUIREMENT_LABELS = {
  NONE: "ไม่มีเงื่อนไข",
  PRE_SURVEY_DONE: "ทำ Pre-Survey",
  POST_SURVEY_DONE: "ทำ Post-Survey",
  CHECK_IN: "Check-in แล้ว",
};

export default function Page() {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [userRole, setUserRole] = useState("GUEST");
  const [userId, setUserId] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [feedbackData, setFeedbackData] = useState([]);

  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const [rewardsData, setRewardsData] = useState([]);
  const [rewardsLoading, setRewardsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const handleScrollToHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    handleScrollToHash();
    const timer1 = setTimeout(handleScrollToHash, 500);
    const timer2 = setTimeout(handleScrollToHash, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    fetchData();
    fetchRewards();
    checkUserToken();
  }, []);

   const fetchRewards = async () => {
    setRewardsLoading(true);
    try {
      const res = await getDataNoToken("events/rewards");
      setRewardsData(res?.data || []);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      setRewardsData([]);
    } finally {
      setRewardsLoading(false);
    }
  };

  const checkUserToken = () => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const rawRole =
          decoded.role || decoded.auth || decoded.authorities || "guest";
        const role = String(rawRole).toUpperCase();
        const id = decoded.id || decoded.userId || decoded.sub;

        setUserRole(role);
        setUserId(id);

      } catch (error) {
        console.error("Token decode error", error);
      }
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDataNoToken("events");
      const fetchedEvents = res.data || [];
      setEventData(fetchedEvents);
      setFeedbackData([]);
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

  const slideShowEvents = useMemo(() => {
    return eventData.filter((event) => event.status !== "FINISHED");
  }, [eventData]);

  const currentEvent = slideShowEvents[currentEventIndex];

  const filteredEvents = useMemo(() => {
    let list = eventData;

    if (selectedCategory !== "All") {
      list = list.filter(
        (event) => event.eventTypeId?.eventTypeName === selectedCategory,
      );
    }

    return [...list].sort((a, b) => {
      if (a.status !== "FINISHED" && b.status === "FINISHED") return -1;
      if (a.status === "FINISHED" && b.status !== "FINISHED") return 1;
      return 0;
    });
  }, [selectedCategory, eventData]);

const nextEvent = () => {
  if (slideShowEvents.length === 0) return;
  setCurrentEventIndex((prev) => (prev + 1) % slideShowEvents.length);
};

const prevEvent = () => {
  if (slideShowEvents.length === 0) return;
  setCurrentEventIndex(
    (prev) => (prev - 1 + slideShowEvents.length) % slideShowEvents.length,
  );
};

  const goToSlide = (index) => {
    setCurrentEventIndex(index);
  };

  useEffect(() => {
    if (!isAutoPlay || isHovered || slideShowEvents.length === 0) return;

    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % slideShowEvents.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, isHovered, slideShowEvents.length]);

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
        ) : slideShowEvents.length > 0 ? (
          <>
            <div className="absolute inset-0">
              {slideShowEvents.map((event, index) => (
                <div
                  key={event.id || index} 
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
                            currentEvent.endDate,
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
                  {slideShowEvents.map((_, index) => (
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
                  {slideShowEvents.length > 0
                    ? `${currentEventIndex + 1} / ${slideShowEvents.length}`
                    : "0 / 0"}
                </span>
              </div>
            </div>

            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
              <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-white">
            No active events featured.
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

      {/* Rewards Section */}
      <section id="rewards" className="bg-gradient-to-b from-gray-50 to-white py-8 md:py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full mb-4">
              <Gift className="w-4 h-4 text-amber-500" />
              <span className="text-amber-700 text-sm font-medium">Rewards & Gifts</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              รางวัลจาก Events
            </h2>
            <p className="text-gray-500 text-sm md:text-base">
              เข้าร่วมกิจกรรมและรับรางวัลพิเศษที่รอคุณอยู่
            </p>
          </div>

          {rewardsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-40 bg-gray-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : rewardsData.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Gift className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p>ยังไม่มีรางวัลในขณะนี้</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewardsData.map((reward) => {
              const reqLabel = REQUIREMENT_LABELS[reward.requirementType] || "ไม่มีเงื่อนไข";
              const endDate = new Date(reward.endRedeemAt);
              const isExpired = endDate < new Date();
              const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={reward.id}
                  onClick={() => router.push(`/reward/${reward.id}`)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col"
                >
                  {/* Image — fixed height */}
                  <div className="h-44 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                    <RewardImage imagePath={reward.imagePath} rewardName={reward.name} />
                    {isExpired ? (
                      <span className="absolute top-3 right-3 bg-gray-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">หมดเวลา</span>
                    ) : daysLeft <= 3 ? (
                      <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full animate-pulse">เหลือ {daysLeft} วัน!</span>
                    ) : (
                      <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">รับได้เลย</span>
                    )}
                  </div>

                  {/* Content — flex-1 ทำให้การ์ดสูงเท่ากัน */}
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-xs text-amber-600 font-medium mb-1 line-clamp-1">{reward.eventName}</p>
                    <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{reward.name}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">{reward.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                        <Tag className="w-3 h-3" />{reqLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                        <Gift className="w-3 h-3" />เหลือ {reward.quantity}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 border-t border-gray-100 pt-3 mt-auto">
                      <Clock className="w-3 h-3" />
                      หมดเขต {endDate.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </section>
    </div>
  );
}