'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Calendar, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { FormatDate } from '@/utils/format';
import { useRouter } from 'next/navigation';
import { getData, getDataNoToken } from '@/libs/fetch';
import { EventCardImage } from '@/utils/getImage';

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [eventData, setEventData] = useState(null);

  const isPastEvent = () => {
    if (!eventData?.endDate) return false;
    const endDate = new Date(eventData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return endDate < today;
  };

  const isEventPast = isPastEvent();

  const fetchData = async () => {
    const res = await getDataNoToken(`events/${id}`);
    setEventData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 mt-20">
      <div
        className={`relative h-auto md:h-[600px] bg-gradient-to-r from-gray-200 to-gray-300 ${
          isEventPast ? 'opacity-80' : ''
        }`}
      >
        <div
          className={`absolute inset-0 opacity-40 ${
            isEventPast ? 'grayscale' : ''
          }`}
        >
          {eventData && (
            <div className="w-full h-full relative">
              <EventCardImage
                imageCard={eventData?.images?.imgDetail}
                eventName={eventData?.eventName}
              />
            </div>
          )}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex flex-col md:flex-row items-center justify-center h-full gap-8 py-10 md:py-0">
            <div className="bg-white rounded-3xl shadow-2xl w-72 h-72 md:w-96 md:h-96 p-4 flex-shrink-0 relative">
              <div
                className={`w-full h-full bg-gray-100 rounded-2xl overflow-hidden relative ${
                  isEventPast ? 'grayscale' : ''
                }`}
              >
                <EventCardImage
                  imageCard={eventData?.images?.imgDetail}
                  eventName={eventData?.eventName}
                />
              </div>
              {isEventPast && (
                <div className="absolute top-8 right-8 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Event Ended
                </div>
              )}
            </div>

            <div className="flex flex-col items-center space-y-6 w-full md:w-auto">
              <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 text-center w-full max-w-lg">
                <h1
                  className={`text-2xl md:text-4xl font-bold mb-4 md:mb-6 ${
                    isEventPast ? 'text-gray-600' : 'text-gray-900'
                  }`}
                >
                  {eventData?.eventName || 'null'}
                </h1>

                <div className="space-y-4 text-left">
                  <div
                    className={`flex items-center gap-3 ${
                      isEventPast ? 'text-gray-600' : 'text-gray-700'
                    }`}
                  >
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-base md:text-lg font-medium break-words">
                      {eventData?.location || 'null'}
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-3 ${
                      isEventPast ? 'text-gray-600' : 'text-gray-700'
                    }`}
                  >
                    <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-base md:text-lg font-medium">
                      {`${FormatDate(eventData?.startDate)} - ${FormatDate(
                        eventData?.endDate
                      )}` || 'null'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className={`w-full md:w-auto font-semibold px-8 md:px-32 py-4 rounded-full shadow-lg transition-all ${
                  isEventPast
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-900 hover:bg-blue-800 text-white transform hover:scale-105 active:scale-95'
                }`}
                onClick={() => {
                  if (!isEventPast) {
                    router.push(`/event/${id}/registration`);
                  }
                }}
                disabled={isEventPast}
              >
                {isEventPast ? 'Registration Closed' : 'Register Now'}
              </button>
              {isEventPast && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 w-full md:w-auto">
                  <p className="text-sm text-red-700 text-center font-medium">
                    This event has ended. Registration is no longer available.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <button
            onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Description
            </h2>
            <ChevronDown
              className={`w-6 h-6 text-gray-500 transition-transform ${
                isDescriptionOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDescriptionOpen && (
            <div
              className={`mt-6 space-y-4 text-sm md:text-base leading-relaxed ${
                isEventPast ? 'text-gray-600' : 'text-gray-700'
              }`}
            >
              <p>{eventData?.eventDesc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
