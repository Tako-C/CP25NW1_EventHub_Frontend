'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, MapPin, Calendar, UserCircle } from 'lucide-react'; 
import { getData } from '@/libs/fetch';
import { useRouter } from 'next/navigation';

export default function ExhibitionSummary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const itemsPerPage = 5;
  const [totalCount, setTotalCount] = useState({
    count_exhibition: 0,
    count_exhibitior: 0,
    count_visitor: 0,
  });
  const router = useRouter();

  const formatDateAndDuration = (start, end) => {
    if (!start || !end) return { dateStr: '-', days: 0 };

    const startDate = new Date(start);
    const endDate = new Date(end);

    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const startStr = startDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
    const endStr = endDate.toLocaleDateString('en-GB', options);

    return {
      dateStr: `${startStr} - ${endStr}`,
      days: diffDays,
    };
  };

  const fetchData = async () => {
    try {
      const res = await getData('users/me/registered-events');
      const organizer_event =
        res?.data.filter((event) => event?.eventRole === 'ORGANIZER') || [];

      setData(organizer_event);
      console.log(organizer_event);

      setTotalCount({
        count_exhibition: organizer_event.length,
        count_exhibitior: 0,
        count_visitor: 0,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredExhibitions = data.filter(
    (item) =>
      item.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredExhibitions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredExhibitions.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-purple-600 mb-6 md:mb-8"> 
          Summary Data
        </h1>

        <div className="bg-white rounded-lg border border-gray-200 p-2 mb-6 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search Event Name, Location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-0 focus:outline-none focus:ring-0 text-sm md:text-base"
            />
          </div>
        </div>

        <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Date ↑</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Event Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => {
                    const { dateStr } = formatDateAndDuration(item.startDate, item.endDate);
                    return (
                      <tr
                        key={item.eventId || index}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/organizer/dashboard/${item.eventId}/detail`)}
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="font-medium">{dateStr}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="font-medium">{item.eventName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1 rounded-full">
                            {item.eventRole}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.location}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:hidden space-y-4">
          {currentItems.length > 0 ? (
            currentItems.map((item, index) => {
              const { dateStr } = formatDateAndDuration(item.startDate, item.endDate);
              return (
                <div
                  key={item.eventId || index}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm active:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/organizer/dashboard/${item.eventId}/detail`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-md">
                      {item.eventRole}
                    </span>
                    <div className="flex items-center text-gray-500 text-xs gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{dateStr}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {item.eventName}
                  </h3>
                  
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                     <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                     <span>{item.location || 'No location specified'}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
              No events found.
            </div>
          )}
        </div>

        <div className="mt-6 bg-white md:bg-transparent p-4 md:p-0 rounded-lg border md:border-0 border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 order-2 md:order-1">
                Show: <span className="font-medium">{itemsPerPage}</span> 
                {' '} ({Math.min((currentPage - 1) * itemsPerPage + 1, filteredExhibitions.length)}-
                {Math.min(currentPage * itemsPerPage, filteredExhibitions.length)} of {filteredExhibitions.length})
                </div>
                
                <div className="flex items-center gap-2 order-1 md:order-2">
                <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 hover:bg-gray-100 bg-white border border-gray-300 md:border-transparent rounded disabled:opacity-50 disabled:cursor-not-allowed shadow-sm md:shadow-none"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded flex items-center justify-center text-sm transition-colors ${
                            currentPage === i + 1
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'hover:bg-gray-100 text-gray-700 bg-white border border-gray-200 md:border-transparent'
                        }`}
                        >
                        {i + 1}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 hover:bg-gray-100 bg-white border border-gray-300 md:border-transparent rounded disabled:opacity-50 disabled:cursor-not-allowed shadow-sm md:shadow-none"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}