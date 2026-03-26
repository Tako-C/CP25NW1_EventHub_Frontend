'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, MapPin, Calendar, LayoutGrid, List, TrendingUp } from 'lucide-react';
import { getData } from '@/libs/fetch';
import { useRouter } from 'next/navigation';

export default function OrganizerDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const itemsPerPage = 6;
  const router = useRouter();

  const formatDateAndDuration = (start, end) => {
    if (!start || !end) return { dateStr: '-', days: 0 };
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const startStr = startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const endStr = endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return { dateStr: `${startStr} – ${endStr}`, days: diffDays };
  };

  const fetchData = async () => {
    try {
      const res = await getData('users/me/registered-events');
      const organizer_event = res?.data.filter((event) => event?.eventRole === 'ORGANIZER') || [];
      setData(organizer_event);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredExhibitions = data.filter(
    (item) =>
      item.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredExhibitions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredExhibitions.slice(startIndex, startIndex + itemsPerPage);

  const handleRowClick = (eventId) => router.push(`/organizer/dashboard/${eventId}/detail`);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-purple-500 mb-1">Organizer Portal</p>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
              Summary Data
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {data.length} อีเว้นท์ที่คุณเป็น Organizer
            </p>
          </div>

          {/* Stats pills */}
          <div className="flex gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> {data.length} Events
            </span>
          </div>
        </div>

        {/* ─── Search + View Toggle ─── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 px-4 py-2.5">
            <Search className="text-gray-400 w-4 h-4 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search Event Name, Location..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full text-sm text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none"
            />
          </div>

          {/* View toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── Desktop Table View ─── */}
        {viewMode === 'table' && (
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Event Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => {
                    const { dateStr } = formatDateAndDuration(item.startDate, item.endDate);
                    return (
                      <tr
                        key={item.eventId || index}
                        className="hover:bg-purple-50/50 cursor-pointer transition-colors group"
                        onClick={() => handleRowClick(item.eventId)}
                      >
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            {dateStr}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{item.eventName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                            {item.eventRole}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            {item.location || '—'}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-gray-400 text-sm">
                      No events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Desktop Grid View ─── */}
        {viewMode === 'grid' && (
          <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-4">
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => {
                const { dateStr, days } = formatDateAndDuration(item.startDate, item.endDate);
                return (
                  <div
                    key={item.eventId || index}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300 cursor-pointer transition-all group p-5"
                    onClick={() => handleRowClick(item.eventId)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {item.eventRole}
                      </span>
                      {days > 0 && (
                        <span className="text-xs text-gray-400 font-medium">{days} days</span>
                      )}
                    </div>
                    <h3 className="font-black text-gray-900 text-base mb-3 line-clamp-2 group-hover:text-purple-700 transition-colors leading-snug">
                      {item.eventName}
                    </h3>
                    <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>{dateStr}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="line-clamp-1">{item.location || 'No location specified'}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 py-16 text-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-200">
                No events found.
              </div>
            )}
          </div>
        )}

        {/* ─── Mobile Cards (always card view on mobile) ─── */}
        <div className="md:hidden space-y-3">
          {currentItems.length > 0 ? (
            currentItems.map((item, index) => {
              const { dateStr } = formatDateAndDuration(item.startDate, item.endDate);
              return (
                <div
                  key={item.eventId || index}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm active:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(item.eventId)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      {item.eventRole}
                    </span>
                    <div className="flex items-center text-gray-400 text-xs gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{dateStr}</span>
                    </div>
                  </div>
                  <h3 className="text-base font-black text-gray-900 mb-2 line-clamp-2">{item.eventName}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="line-clamp-1">{item.location || 'No location specified'}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white p-10 rounded-xl border border-gray-200 text-center text-gray-400 text-sm">
              No events found.
            </div>
          )}
        </div>

        {/* ─── Pagination ─── */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="text-sm text-gray-500 order-2 sm:order-1">
              Showing{' '}
              <span className="font-semibold text-gray-800">
                {Math.min(startIndex + 1, filteredExhibitions.length)}–{Math.min(startIndex + itemsPerPage, filteredExhibitions.length)}
              </span>{' '}
              of <span className="font-semibold text-gray-800">{filteredExhibitions.length}</span>
            </div>

            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                      currentPage === i + 1
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}