'use client';
import React from 'react';
import { Plus, Calendar, MapPin, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormatDate } from '@/utils/format'; // Utility ที่มีอยู่แล้ว
import { EventCardImage } from '@/utils/getImage'; // Utility ที่มีอยู่แล้ว

export default function OrganizerEvents({ events = [] }) {
  const router = useRouter();

  return (
    <section className="max-w-7xl mx-auto py-8 px-4 md:px-8">
      <div className="text-center mb-6 md:mb-8 mt-10">
        <div className="inline-block">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Events Manager
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* --- Card 1: Create New Event (ปุ่มบวก) --- */}
        <div
          onClick={() => router.push('/organizer/event/create')}
          className="group relative flex flex-col items-center justify-center h-full min-h-[300px] bg-white border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all duration-300"
        >
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Plus className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 group-hover:text-purple-700">
            Create New Event
          </h3>
        </div>

        {/* --- Card 2+: Event Lists (Mockup) --- */}
        {events.map((event, index) => (
          <div
            key={index}
            onClick={() => router.push(`/organizer/event/${event.id}/edit`)} // ลิงก์ไปหน้า Edit
            className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full min-h-[300px]"
          >
            {/* Image Section */}
            <div className="relative h-48 bg-gray-100 overflow-hidden">
              <EventCardImage
                imageCard={event.imageCard || event.images?.imgSlideShow}
                eventName={event.eventName}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                  <Edit className="w-4 h-4" /> Manage Event
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-2 group-hover:text-purple-600 transition-colors">
                {event.eventName}
              </h3>

              <div className="space-y-2 mt-auto">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <span>
                    Date :{' '}
                    {event.startDate ? FormatDate(event.startDate) : 'TBA'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <span className="line-clamp-1">
                    Location : {event.location || 'Online'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
