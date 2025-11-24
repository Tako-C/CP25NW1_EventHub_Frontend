"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MapPin, Calendar, ChevronDown } from "lucide-react";
import Link from "next/link";
import { FormatDate } from "@/utils/format";
import { useRouter } from "next/navigation";
import { getData, getDataNoToken } from "@/libs/fetch";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [eventData, setEventData] = useState(null);

  const fetchData = async () => {
    const res = await getDataNoToken(`events/${id}`);
    setEventData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-[600px] bg-gradient-to-r from-gray-200 to-gray-300">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200')",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-center h-full gap-8">
            <div className="bg-white rounded-3xl shadow-2xl w-96 h-96 p-8">
              <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                <span className="text-sm">Image Placeholder</span>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-lg">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                  {eventData?.eventName || "null"}
                </h1>

                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-lg font-medium">
                      {eventData?.location || "null"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-lg font-medium">
                      {`${FormatDate(eventData?.startDate)} - ${FormatDate(
                        eventData?.endDate
                      )}` || "null"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="bg-blue-900 hover:bg-blue-800 text-white font-semibold px-32 py-4 rounded-full shadow-lg transition-all transform hover:scale-105"
                onClick={() => router.push(`/event/${id}/registration`)}
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <button
            onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-2xl font-bold text-gray-900">Description</h2>
            <ChevronDown
              className={`w-6 h-6 text-gray-500 transition-transform ${
                isDescriptionOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDescriptionOpen && (
            <div className="mt-6 text-gray-700 space-y-4">
              <p>{eventData?.eventDesc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
