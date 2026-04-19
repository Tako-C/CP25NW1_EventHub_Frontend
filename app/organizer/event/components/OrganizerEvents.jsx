'use client';
import React, { useState, useMemo } from 'react';
import { Plus, Calendar, MapPin, Edit2, Search, X, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormatDate } from '@/utils/format';
import { EventCardImage } from '@/utils/getImage';

export default function OrganizerEvents({ events = [] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    const types = events.map((e) => e.eventTypeId?.eventTypeName).filter(Boolean);
    return ['All', ...new Set(types)];
  }, [events]);

  const filtered = useMemo(() => {
    let list = events;
    if (selectedCategory !== 'All') {
      list = list.filter((e) => e.eventTypeId?.eventTypeName === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.eventName?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [events, search, selectedCategory]);

  return (
    <section className="max-w-7xl mx-auto py-6 px-4 md:px-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 mt-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-purple-500 mb-1">
            Organizer Portal
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">My Events</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {filtered.length} / {events.length} event{events.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ Event..."
            className="w-full pl-9 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
              }`}
            >
              {cat !== 'All' && <Tag className="w-3 h-3" />}
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* Create new event */}
        <div
          onClick={() => router.push('/organizer/event/create')}
          className="group flex flex-col items-center justify-center min-h-[260px] bg-white border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-purple-200 transition-all duration-300">
            <Plus className="w-7 h-7 text-purple-600" />
          </div>
          <p className="text-base font-semibold text-gray-500 group-hover:text-purple-700 transition-colors">
            Create New Event
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="sm:col-span-1 lg:col-span-2 flex items-center justify-center min-h-[260px] bg-white rounded-2xl border border-gray-100">
            <div className="text-center px-6">
              <Search className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">ไม่พบ Event ที่ตรงกับเงื่อนไข</p>
            </div>
          </div>
        ) : (
          filtered.map((event, index) => (
            <div
              key={event.id || index}
              onClick={() => router.push(`/organizer/event/${event.id}/edit`)}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
            >
              <div className="relative h-48 bg-gray-100 overflow-hidden flex-shrink-0">
                <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
                  <EventCardImage
                    imageCard={event.imageCard || event.images?.imgCard || event.images?.imgSlideShow}
                    eventName={event.eventName}
                  />
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5">
                    <Edit2 className="w-4 h-4" /> Manage Event
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col gap-2.5">
                <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-purple-600 transition-colors">
                  {event.eventName}
                </h3>
                <div className="space-y-1.5 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0 text-gray-400" />
                    <span>{event.startDate ? FormatDate(event.startDate) : 'TBA'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400 mt-0.5" />
                    <span>{event.location || 'Online'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}